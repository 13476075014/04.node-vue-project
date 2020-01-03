'use strict';

var webpack = require("webpack");
var path = require("path");
var glob = require('glob') //获取全部文件的插件
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

//路径定义
var publicDir = path.resolve(__dirname, './public'); //获取所有静态资源文件绝对路径
var viewDir = path.resolve(__dirname, './views'); //获取所有html文件绝对路径
// var pathMap = require('./src/pathmap.json');
var publicPath = '/public/'; //设置的打包后的静态资源引入的前缀地址，因为打包后的静态文件是放到dist下面的js,然后在node中设置了静态访问地址dist,所以这里直接 /js/..就可以访问到这些文件
//插件定义
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin; //提取公共插件到打包到一个文件的包
var HtmlWebpackPlugin = require('html-webpack-plugin'); //
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin

//入口文件定义
var entries = function () {
    var jsDir = path.resolve(publicDir, 'js/bundle') //获取js目录下的所有文件
    var entryFiles = glob.sync(jsDir + '/*.js') //获取所有.js文件
    var map = {};

    for (var i = 0; i < entryFiles.length; i++) {
        var filePath = entryFiles[i]; //.js文件的地址
        var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.')); //。js的文件名称
        map[filename] = filePath;
    }
    return map; //所有js文件的对应的webpack入口文件的格式 {filename:filePath,} 
}
//html_webpack_plugins 定义
var html_plugins = function () {
    var entryHtml = glob.sync(viewDir + '/1.ejs')
    var r = []
    var entriesFiles = entries()
    for (var i = 0; i < entryHtml.length; i++) {
        var filePath = entryHtml[i];
        var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
        var conf = {
            template: filePath, //模板所在的文件路径
            filename: filename + '.html', //要生成的文件名
            // minify: { // 压缩HTML文件
            //     removeComments: true, // 移除HTML中的注释
            //     collapseWhitespace: true, // 删除空白符与换行符
            //     minifyCSS: true// 压缩内联css
            // }
        }
        //如果和入口js文件同名
        if (filename in entriesFiles) {
            conf.inject = 'head' //注入的script在html文件的body底部
            conf.chunks = [filename] //选择需要注入的上面入口文件打包的文件
        }
        //跨页面引用，如pageA,pageB 共同引用了common-a-b.js，那么可以在这单独处理
        //if(pageA|pageB.test(filename)) conf.chunks.splice(1,0,'common-a-b')
        r.push(new HtmlWebpackPlugin(conf))
    }
   
    return r
}

module.exports = webpackConfig();

function webpackConfig(options){
    options = options || {}
    // var debug = options.debug !==undefined ? options.debug :true;
    // var debug = false
    var debug = process.env.NODE_ENV == "development" ? true :false

    var plugins = [];

    var extractCSS;
    var cssLoader;
    var sassLoader;

    // plugins.push(new CommonsChunkPlugin({
    //     name: 'vendor',
    //     minChunks: Infinity
    // }));
   

    if(debug){
        // extractCSS = new ExtractTextPlugin('css/[name].css?[contenthash]')
        // cssLoader = extractCSS.extract(['css'])
        // sassLoader = extractCSS.extract(['css', 'sass'])

        // plugins.push(extractCSS)
    }else{
        // extractCSS = new ExtractTextPlugin('css/[contenthash:8].[name].min.css', {
        //     // 当allChunks指定为false时，css loader必须指定怎么处理
        //     allChunks: false
        // })
        // cssLoader = extractCSS.extract(['css?minimize'])
        // sassLoader = extractCSS.extract(['css?minimize', 'sass'])

        plugins.push(
            // extractCSS,
            // new webpack.optimize.DedupePlugin(), //报错已经没有这个插件了，去重用的
            // new webpack.NoEmitOnErrorsPlugin()
        )
    }

    //config
    var config = {
        entry: Object.assign(entries(), {
            // 用到什么公共lib（例如jquery.js），就把它加进vendor去，目的是将公用库单独提取打包
            // 'vendor': ['zepto']
        }),
        output: {
            path: path.join(__dirname, "dist"),
            // filename: "js/[name].[hash].js",
            filename: "js/[name].js",
            chunkFilename: '[chunkhash:8].chunk.js',
            publicPath: publicPath
        },
        module: {
            loaders: [
                {
                    // 把es6转换成es5
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/
                },
                {
                    test: /\.((woff2?|svg)(\?v=[0-9]\.[0-9]\.[0-9]))|(woff2?|svg|jpe?g|png|gif|ico)$/,
                    loaders: [
                        'url?limit=10000&name=img/[hash:8].[name].[ext]',
                        'image?{bypassOnDebug:true, progressive:true,optimizationLevel:3,pngquant:{quality:"65-80",speed:4}}'
                    ]
                },
                {
                    test: /\.((ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9]))|(ttf|eot)$/,
                    loader: 'url?limit=10000&name=fonts/[hash:8].[name].[ext]'
                },
                {test: /\.css$/, loader: 'style-loader!css-loader'},
                {test: /\.html$/, 
                    loader: 'html-loader',
                    options:{
                        interpolate: true,
                        minimize: false
                    }
                },
                {test: /\.ejs$/, loader: 'ejs-loader'},
                // {test: /\.scss$/, loader: sassLoader}
            ]
        },
        resolve: {
            //直接解释就是，数组内填入什么后缀，引入该后缀时可以文件名可以不带后缀
            extensions: ['.js', '.css', '.scss', '.tpl', '.png', '.jpg','.ejs'],
            // root: [srcDir, nodeModPath],
            alias: {
                '@': path.resolve(__dirname,'public'),
                '_common': path.resolve(__dirname,'common'),
            },
            // publicPath: '/'
        },
        plugins: plugins.concat(html_plugins())
    }

    if(debug){
        config.devtool = 'cheap-module-eval-source-map'
    } else{
        config.plugins.push(new CleanWebpackPlugin())
    }
    return config;
}