var path = require("path");
module.exports = {
    entry: path.resolve(__dirname, 'public/js/bundle/1.js'),
    output: {
        path: path.join(__dirname, "dist"),
        filename: "js/[name].js",
        chunkFilename: '[chunkhash:8].chunk.js',
        publicPath: './'
    },
    module: {
        loaders: [
            {
                // 把es6转换成es5
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    }
}
