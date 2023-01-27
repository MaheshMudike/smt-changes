const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');
var webpack = require('webpack');

module.exports = merge(common, {
  output: {
    path: __dirname + "/www",    
  },

  plugins: [  
    new UglifyJSPlugin()
  ],

  plugins: [
    new webpack.DefinePlugin({
        __SMT_ENV__: JSON.stringify("prod")
    })
  ],
  
  mode: 'production'

});