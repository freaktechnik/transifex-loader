const nodeExternals = require("webpack-node-externals");
const path = require("path");

module.exports = {
    entry: './src/index.mjs',
    target: 'node',
    output: {
        filename: 'transifex-loader.js',
        libraryTarget: 'commonjs2'
    },
    externals: [ nodeExternals() ],
    mode: 'production'
};
