import readRC from './lib/read-transifexrc';
import { getResources, readTXConfig } from './lib/read-txconfig';
import { createLoadFile, writeFile } from './lib/utils';
import findFile from './lib/find-file';
import TransifexAPI from 'transifex-api-es6';
import loaderUtils from 'loader-utils';

//TODO handle lang map
//TODO handle trans.
//TODO handle other placeholders than <lang>
//TODO add dependency to the .tx/config and .transifexrc
//TODO handle non-main project resources

const getResource = async (path, loadFile) => {
        let lang;
        const resources = await getResources(loadFile),
            resource = resources.find((r) => {
                const rmatch = path.match(new RegExp(r.file_filter.replace(/<lang>/g, "([a-zA-Z-]+)")));
                if(rmatch && rmatch.length) {
                    lang = rmatch[1];
                }
                return rmatch !== null;
            });
        resource.lang = lang;
        return resource;
    },
    load = async (scope, cached) => {
        const options = loaderUtils.parseQuery(scope.query),
            loadFile = findFile(createLoadFile(scope.resolve.bind(scope), undefined, scope.addDependency.bind(scope)), scope.context),
            resource = await getResource(scope.resourcePath, loadFile);

        if(resource.lang == resource.source_lang && !options.disableCache) {
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
                }),
                output = await transifex.getResourceTranslation(resource.lang);

            if(options.store === undefined || options.store) {
                writeFile(scope.resourcePath, output);
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
