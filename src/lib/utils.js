export const createLoadFile = (loadFile, basePath) => {
    return (file) => {
        return new Promise((resolve, reject) => {
            loadFile(basePath, file, (error, data) => {
                if(error) {
                    reject(error);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
};
