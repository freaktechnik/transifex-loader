import path from 'path';

const find = (loadFile, file, start = './') => {
    const dir = path.resolve(start);
    return loadFile(file, dir).catch(() => {
        const nextDir = path.resolve(dir, '..');
        if(nextDir == dir) {
            throw "Could not find " + file;
        }
        else {
            return find(loadFile, file, nextDir);
        }
    });
};

export default (loadFile, basePath) => {
    return (file, base = basePath) => find(loadFile, file, base);
};
