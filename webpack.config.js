const nodeExternals = require("webpack-node-externals");
const path = require("path");

module.exports = {
    entry: [ './src/index.js' ],
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist/'),
        filename: 'transifex-loader.js',
        libraryTarget: 'commonjs2'
    },
    externals: [ nodeExternals() ]
};
