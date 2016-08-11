import readRC from './lib/read-transifexrc';
import { getResources } from './lib/read-txconfig';
import { createLoadFile } from './lib/utils';
import path from 'path';
import TransifexAPI from 'transifex-api-es6';
import loaderUtils from 'loader-utils';

//TODO handle lang map
//TODO handle trans.
//TODO handle other placeholders than <lang>

module.exports = async function() {
    this.cacheable(true);

    let lang;
    try {
        const callback = this.async(),
            options = loaderUtils.parseQuery(this.query),
            basePath = options.root || path.dirname(require.main.filename),
            loadFile = createLoadFile(this.resolve.bind(this), basePath),
            resources = await getResources(loadFile),
            config = await readRC(loadFile),
            resource = resources.find((r) => {
                const rmatch = this.resourcePath.match(new RegExp(r.file_filter.replace(/<path>/g, "([a-zA-Z-]+)")));
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

        callback(output);
    }
    catch(e) {
        this.emitError(e);
    }

    //TODO? Write it to the output (should be another loader's job IMO)
};
