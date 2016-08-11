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
    promisedFs = (path) => {
        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf-8', (error, data) => {
                if(error) {
                    reject(error);
                }
                else {
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
    createLoadFile = (loadFile, basePath) => {
        return (file, base = basePath) => {
            return promisedLoadFile(loadFile, base, file).then(promisedFs);
        };
    };

export { createLoadFile, writeFile };
