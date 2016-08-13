var fs = require("fs");

var nodeModules = {};

// This is to filter out node_modules as they shouldn't be part of the output.
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
});

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
    externals: nodeModules
};
