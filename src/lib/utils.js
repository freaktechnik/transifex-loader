export const createLoadFile = (loadFile, basePath) => {
    return (file, base = basePath) => {
        return new Promise((resolve, reject) => {
            loadFile(base, file, (error, data) => {
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
