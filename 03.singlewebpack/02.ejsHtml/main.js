// var http = require('http');
var express = require('express');
var path = require('path');
var webpack = require('webpack')
var webpackMiddleware = require('webpack-dev-middleware'); //webpack的热加载
var webpackHotMiddleware = require('webpack-hot-middleware');//webpack的热加载
var webpackConfig = require('./webpack.config')
var app = express();
var compiler = webpack(webpackConfig);
var middleware = webpackMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath
});
app.use('/public', express.static(path.join(__dirname + '/dist')));
app.use(middleware);
app.use(webpackHotMiddleware(compiler));

app.get('/:appName', function (req, res) {
    var result = '';
    //地址Mac 的话 /，window 是\
    var htmlPath = webpackConfig.output.path + '\/'+ req.params.appName +'.html';
    try {
      result = middleware.fileSystem
        .readFileSync(htmlPath);
    } catch (err) {
      result = err.toString();
    }
    res.write(result);
    res.end();
  });

  app.listen('8800', function (err) {
    if (err) {
          console.log('Server startup failed:' + err);
    } else {
          console.log('server start', '8800');
    }
});
