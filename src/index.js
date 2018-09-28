import {
    NoMatchingResourceError,
    MatchesSourceError
} from 'transifex-config/lib/errors';
import TransifexConfig from 'transifex-config';
import {
    TRANSIFEXRC,
    TXCONFIG
} from 'transifex-config/lib/load-config';
import findFile from './lib/find-file';
import TransifexAPI from 'transifex-api-es6';
import loaderUtils from 'loader-utils';
import path from 'path';
import fs from 'mz/fs';

const load = async (scope, cached) => {
    const options = Object.assign({
            disableCache: false,
            store: true
        }, loaderUtils.getOptions(scope)),
        gracefulError = (e) => {
            scope.emitWarning(e);
        },
        [
            txrcBase,
            txcBase
        ] = await Promise.all([
            findFile(scope.context, TRANSIFEXRC).catch(gracefulError),
            findFile(scope.context, TXCONFIG).catch(gracefulError)
        ]);
    if(!txcBase || !txrcBase) {
        return cached;
    }

    let txc,
        resource;

    try {
        txc = new TransifexConfig(txcBase);
    }
    catch(e) {
        scope.emitWarning(`Did not find required transifex config files`);
        return cached;
    }

    scope.addDependency(path.join(txcBase, TXCONFIG));
    if(txcBase !== txrcBase) {
        // Depend on .transifexrc in the project directory, even if it doesn't exist.
        scope.addDependency(path.join(txcBase, TRANSIFEXRC));
    }
    scope.addDependency(path.join(txrcBase, TRANSIFEXRC));

    try {
        resource = await txc.getResource(scope.resourcePath, options.disableCache);
    }
    catch(e) {
        if(e instanceof NoMatchingResourceError) {
            scope.emitWarning(`Could not find any transifex resource for ${scope.resourcePath}.`);
            return cached;
        }
        else if(e instanceof MatchesSourceError) {
            return cached;
        }

        throw e;
    }

    const { main } = await txc.getConfig(),
        config = await txc.getRC(main.host),
        transifex = new TransifexAPI({
            user: config[main.host].username,
            password: config[main.host].password,
            projectName: resource.project,
            resourceName: resource.name
        }),
        mappedLang = await txc.getMappedLang(resource.lang, resource);
    resource.lang = mappedLang;
    try {
        const output = await transifex.getResourceTranslation(resource.lang, resource.name);

        if(options.store) {
            await fs.writeFile(scope.resourcePath, output, 'utf-8');
        }

        return output;
    }
    catch(e) {
        // Handle network errors by returning the cached version.
        return cached;
    }
};

/**
 * @param {string} contents - Contents of the loaded file.
 * @this external:Loader
 * @returns {Promise.<string>|string} Updated translation file.
 */
export default function(contents) {
    const callback = this.async();
    this.cacheable(true);
    if(!callback) {
        return contents;
    }

    load(this, contents)
        .then((output) => {
            callback(null, output);
        })
        .catch((e) => {
            this.emitError(e);
            callback(null, contents);
        });
}
