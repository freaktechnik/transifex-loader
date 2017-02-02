const nodeExternals = require("webpack-node-externals");

module.exports = {
    entry: [ './src/index.js' ],
    target: 'node',
    output: {
        path: 'dist/',
        filename: 'transifex-loader.js',
        libraryTarget: 'commonjs2'
    },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: [ "es2017" ],
                    plugins: [
                        "transform-es2015-modules-commonjs",
                        "transform-runtime"
                    ],
                    babelrc: false
                }
            }
        ]
    },
    externals: [ nodeExternals() ]
};
