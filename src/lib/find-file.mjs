import path from 'node:path';
import { promises as fs } from 'node:fs';

const find = async (start, file) => {
    const directory = path.resolve(start);
    try {
        await fs.stat(path.join(directory, file));
        return directory;
    }
    catch{
        const nextDirectory = path.resolve(directory, '..');
        if(nextDirectory == directory) {
            throw new Error(`Could not find ${file}`);
        }
        else {
            return find(nextDirectory, file);
        }
    }
};

export default find;
