import readRC from './lib/read-transifexrc';
import { getResources } from './lib/read-txconfig';
import { createLoadFile } from './lib/utils';
import TransifexAPI from 'transifex-api-es6';
import loaderUtils from 'loader-utils';

//TODO handle lang map
//TODO handle trans.
//TODO handle other placeholders than <lang>

const load = async (scope) => {

    let lang;
    const options = loaderUtils.parseQuery(scope.query),
        basePath = options.root || process.cwd(),
        loadFile = createLoadFile(scope.resolve.bind(scope), basePath),
        resources = await getResources(loadFile),
        config = await readRC(loadFile),
        resource = resources.find((r) => {
            const rmatch = scope.resourcePath.match(new RegExp(r.file_filter.replace(/<path>/g, "([a-zA-Z-]+)")));
            if(rmatch.length) {
                lang = rmatch[1];
            }
            return rmatch.length;
        }),
        transifex = new TransifexAPI({
            user: config.username,
            password: config.password,
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
