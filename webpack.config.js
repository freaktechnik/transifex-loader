var nodeExternals = require("webpack-node-externals");

var nodeModules = {};

module.exports = {
    entry: ['./src/index.js'],
    target: 'node',
    output: {
        path: 'dist/',
        filename: 'transifex-loader.js',
        libraryTarget: 'commonjs2'
    },
    module: {
        loaders: [
            {
                exclude: /node_modules/,
                test: /\.js$/,
                loader: 'babel',
                query: {
                    presets: ["es2015", "stage-2"],
                    plugins: [
                        "transform-es2015-modules-commonjs",
                        "transform-runtime"
                    ],
                    babelrc: false
                }
            }
        ]
    },
    externals: [nodeExternals()]
};
