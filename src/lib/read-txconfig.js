import parseRC from './parse-rc';

let txconfig;

const TXCONFIG = './.tx/config',
    readTXConfig = (resolve) => {
        if(!txconfig) {
            return resolve(TXCONFIG).then(parseRC).then((c) => {
                txconfig = c;
                return c;
            });
        }
        else {
            return Promise.resolve(txconfig);
        }
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
