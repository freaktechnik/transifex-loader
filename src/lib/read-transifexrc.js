import parseRC from './parse-rc';

let rc;
const TRANSIFEXRC = './.transifexrc',
    getTransifexConfig = (resolve) => {
        if(!rc) {
            return resolve(TRANSIFEXRC).then(parseRC).then((r) => {
                rc = r;
                return r;
            });
        }
        else {
            return Promise.resolve(rc);
        }
    };

export default getTransifexConfig;

