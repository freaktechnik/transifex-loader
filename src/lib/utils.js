import fs from 'fs';
import promisify from 'promisify-call';

const promisedFs = (path, addDependency) => {
        return promisify(fs, fs.readFile, path, 'utf-8').then((data) => {
            if(addDependency) {
                addDependency(path);
            }
            return data;
        });
    },
    writeFile = (path, content) => {
        return promisify(fs, fs.writeFile, path, content, 'utf-8');
    },
    createLoadFile = (loadFile, basePath, addDependency) => {
        return (file, base = basePath) => {
            return promisify(null, loadFile, base, file).then((path) => promisedFs(path, addDependency));
        };
    };

export { createLoadFile, writeFile };
