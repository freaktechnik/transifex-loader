module.exports = (originalPath) => {
    if(originalPath == "transifex-api-es6") {
        return '../test/_mock-transifex';
    }
    return originalPath;
};
