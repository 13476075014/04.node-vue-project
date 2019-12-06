var webpack = require('webpack')
var path =require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
module.exports = {
entry:{
   app:path.join(__dirname,'src','index.js')
},
output:{
   filename:'bundle.js',
   path:path.join(__dirname,'dist'),
   publicPath: '/',
  },
devServer:{
    contentBase: path.join(__dirname, "dist")
},
module: {
    loaders: [
        {test: /\.css$/, loader: 'style-loader!css-loader'}
    ]
},
plugins:[
     // copy custom static assets
    //  new CopyWebpackPlugin([
    //     {
    //       from: path.resolve(__dirname, '/src'),
    //       to: 'src',
    //       ignore: ['.*']
    //     }
    //   ])
]
}