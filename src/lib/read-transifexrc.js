import parseRC from './parse-rc';

const TRANSIFEXRC = './.transifexrc',
    getTransifexConfig = (resolve) => {
        return resolve(TRANSIFEXRC).then(parseRC);
    };

export default getTransifexConfig;

