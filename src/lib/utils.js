import fs from 'fs';

const promisedLoadFile = (loadFile, base, file) => {
        return new Promise((resolve, reject) => {
            loadFile(base, file, (error, path) => {
                if(error) {
                    reject(error);
                }
                else {
                    resolve(path);
                }
            });
        });
    },
    promisedFs = (path, addDependency) => {
        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf-8', (error, data) => {
                if(error) {
                    reject(error);
                }
                else {
                    if(addDependency) {
                        addDependency(path);
                    }
                    resolve(data);
                }
            });
        });
    },
    writeFile = (path, content) => {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, content, 'utf-8', (error) => {
                if(error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    },
    createLoadFile = (loadFile, basePath, addDependency) => {
        return (file, base = basePath) => {
            return promisedLoadFile(loadFile, base, file).then((path) => promisedFs(path, addDependency));
        };
    };

export { createLoadFile, writeFile };
