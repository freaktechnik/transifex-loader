import parseRC from './parse-rc';

const TXCONFIG = './.tx/config',
    readTXConfig = (resolve) => {
        return resolve(TXCONFIG).then(parseRC);
    },
    getResources = (resolve) => {
        return readTXConfig(resolve).then((config) => {
            const resources = [];
            for(const c in config) {
                if(c != "main") {
                    const [ project, name ] = c.split("."),
                        resource = { project, name };
                    Object.assign(resource, config[c]);
                    resources.push(resource);
                }
            }
            return resources;
        });
    };

export { readTXConfig, getResources };
