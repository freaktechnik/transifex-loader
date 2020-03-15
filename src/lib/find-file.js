import path from 'path';
import fs from 'mz/fs';

const find = (start, file) => {
    const directory = path.resolve(start);
    return fs.stat(path.join(directory, file))
        .then(() => directory)
        .catch(() => {
            const nextDirectory = path.resolve(directory, '..');
            if(nextDirectory == directory) {
                throw new Error(`Could not find ${file}`);
            }
            else {
                return find(nextDirectory, file);
            }
        });
};

export default find;
