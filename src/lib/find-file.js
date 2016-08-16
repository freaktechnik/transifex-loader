import path from 'path';
import fs from 'mz/fs';

const find = (start, file) => {
    const dir = path.resolve(start);
    return fs.stat(path.join(dir, file)).then(() => {
        return dir;
    }).catch(() => {
        const nextDir = path.resolve(dir, '..');
        if(nextDir == dir) {
            throw "Could not find " + file;
        }
        else {
            return find(nextDir, file);
        }
    });
};

export default find;
