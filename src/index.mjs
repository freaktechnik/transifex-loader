import {
    NoMatchingResourceError,
    MatchesSourceError
} from 'transifex-config/lib/errors.js';
import TransifexConfig from 'transifex-config';
import {
    TRANSIFEXRC,
    TXCONFIG
} from 'transifex-config/lib/load-config.js';
import findFile from './lib/find-file.mjs';
import { getResource } from './lib/api.mjs';
import path from 'node:path';
import { promises as fs } from 'node:fs';

/**
 * @param {WebpackLoaderContext} scope - Webpack loader context.
 * @param {string} cached - Current file contents.
 * @returns {string|Buffer} File contents.
 */
const load = async (scope, cached) => {
    const options = Object.assign({
            disableCache: false,
            store: true
        }, scope.getOptions()),
        gracefulError = (error) => {
            scope.emitWarning(error);
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
    catch(error) {
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
    catch(error) {
        if(error instanceof NoMatchingResourceError) {
            scope.emitWarning(`Could not find any transifex resource for ${scope.resourcePath}.`);
            return cached;
        }
        else if(error instanceof MatchesSourceError) {
            return cached;
        }

        throw error;
    }

    const { main } = await txc.getConfig(),
        config = await txc.getRC(main.host),
        mappedLang = await txc.getMappedLang(resource.lang, resource);
    resource.lang = mappedLang;
    try {
        const output = await getResource({
            user: config[main.host].username,
            password: config[main.host].password,
            project: resource.project,
            resource: resource.name,
            language: resource.lang,
            organization: resource.organization
        });

        if(options.store) {
            await fs.writeFile(scope.resourcePath, output, 'utf-8');
        }

        return output;
    }
    catch(error) {
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
    this.cacheable(false);
    if(!callback) {
        return contents;
    }

    load(this, contents)
        .then((output) => {
            callback(null, output);
        })
        .catch((error) => {
            this.emitError(error);
            callback(null, contents);
        });
}
