import readRC from './lib/read-transifexrc';
import { readTXConfig } from './lib/read-txconfig';
import { getResource, getMappedLang } from './lib/tx-parser';
import { createLoadFile, writeFile } from './lib/utils';
import findFile from './lib/find-file';
import TransifexAPI from 'transifex-api-es6';
import loaderUtils from 'loader-utils';

const load = async (scope, cached) => {
    const options = loaderUtils.parseQuery(scope.query),
        loadFile = findFile(createLoadFile(scope.resolve.bind(scope), undefined, scope.addDependency.bind(scope)), scope.context),
        resource = await getResource(scope.resourcePath, loadFile, options.disableCache);

    if(resource.source && !options.disableCache) {
        return cached;
    }
    else {
        const { main } = await readTXConfig(loadFile),
            config = await readRC(loadFile),
            transifex = new TransifexAPI({
                user: config[main.host].username,
                password: config[main.host].password,
                projectName: resource.project,
                resourceName: resource.name
            });

        resource.lang = getMappedLang(resource.lang, resource.lang_map, main.lang_map);
        let output = await transifex._send(`/resource/${transifex.resourceName}/translation/${resource.lang}`);

        if(options.store === undefined || options.store) {
            await writeFile(scope.resourcePath, output);
        }

        return output;
    }
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
        callback(e);
    });
};
