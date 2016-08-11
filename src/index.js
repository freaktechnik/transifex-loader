import readRC from './lib/read-transifexrc';
import { getResources, readTXConfig } from './lib/read-txconfig';
import { createLoadFile } from './lib/utils';
import findFile from './lib/find-file';
import TransifexAPI from 'transifex-api-es6';
import loaderUtils from 'loader-utils';

//TODO handle lang map
//TODO handle trans.
//TODO handle other placeholders than <lang>
//TODO add dependency to the .tx/config and .transifexrc
//TODO handle non-main project resources

const load = async (scope) => {
    let lang;
    const options = loaderUtils.parseQuery(scope.query),
        loadFile = findFile(createLoadFile(scope.resolve.bind(scope)), scope.context),
        resources = await getResources(loadFile),
        { main } = await readTXConfig(loadFile),
        config = await readRC(loadFile),
        resource = resources.find((r) => {
            const rmatch = scope.resourcePath.match(new RegExp(r.file_filter.replace(/<lang>/g, "([a-zA-Z-]+)")));
            if(rmatch && rmatch.length) {
                lang = rmatch[1];
            }
            return rmatch !== null;
        }),
        transifex = new TransifexAPI({
            user: config[main.host].username,
            password: config[main.host].password,
            projectName: resource.project,
            resourceName: resource.name
        }),
        output = await transifex.getResourceTranslation(lang);

    //TODO? Write it to the output (should be another loader's job IMO)

    if(options.store === undefined || options.store) {
        scope.emitFile(scope.resourcePath, output);
    }

    return output;
};

module.exports = function(contents) {
    const callback = this.async();
    this.cacheable(true);
    if(!callback) {
        return contents;
    }

    load(this).then((output) => {
        callback(null, output);
    }).catch((e) => {
        callback(e);
    });
};
