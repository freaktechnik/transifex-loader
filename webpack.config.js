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
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: [
                        [
                            "@babel/preset-env",
                            {
                                targets: {
                                    node: "8.9.4"
                                },
                                modules: false
                            }
                        ]
                    ],
                    plugins: [
                        '@babel/plugin-transform-runtime',
                    ],
                    babelrc: false
                }
            }
        ]
    },
    externals: [ nodeExternals() ]
};
