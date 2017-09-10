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
                            "env",
                            {
                                targets: {
                                    node: "6.11.3",
                                    uglify: false
                                },
                                modules: false
                            }
                        ]
                    ],
                    plugins: [
                        'transform-runtime'
                    ],
                    babelrc: false
                }
            }
        ]
    },
    externals: [ nodeExternals() ]
};
