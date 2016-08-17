import { NoMatchingResourceError, MatchesSourceError } from 'transifex-config/lib/errors';
import TransifexConfig from 'transifex-config';
import { TRANSIFEXRC, TXCONFIG } from 'transifex-config/lib/load-config';
import findFile from './lib/find-file';
import TransifexAPI from 'transifex-api-es6';
import loaderUtils from 'loader-utils';
import path from 'path';
import fs from 'mz/fs';

const load = async (scope, cached) => {
    const options = loaderUtils.parseQuery(scope.query),
        basePath = await findFile(scope.context, TRANSIFEXRC),
        txc = new TransifexConfig(basePath);
    let resource;

    scope.addDependency(path.join(basePath, TXCONFIG));
    scope.addDependency(path.join(basePath, TRANSIFEXRC));

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
        else {
            throw e;
        }
    }

    const { main } = await txc.getConfig(),
        config = await txc.getRC(),
        transifex = new TransifexAPI({
            user: config[main.host].username,
            password: config[main.host].password,
            projectName: resource.project,
            resourceName: resource.name
        });

    resource.lang = await txc.getMappedLang(resource.lang, resource);
    const output = await transifex.getResourceTranslation(resource.lang, resource.name);

    if(options.store === undefined || options.store) {
        await fs.writeFile(scope.resourcePath, output, 'utf-8');
    }

    return output;
};

module.exports = function(contents) {
    const callback = this.async();
    this.cacheable(true);
    if(!callback) {
        return contents;
    }

    load(this, contents).then((output) => {
        callback(null, output);
    }).catch((e) => {
        this.emitError(e);
        callback(null, contents);
    });
};
