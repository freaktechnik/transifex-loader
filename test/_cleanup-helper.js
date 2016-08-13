import fs from 'fs';
import promisify from 'promisify-call';

export const deleteFile = (path) => {
    return promisify(fs, fs.unlink, path);
};
