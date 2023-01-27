const merge = require('webpack-merge');
const common = require('./webpack.common.js');
var webpack = require('webpack');

module.exports = merge(common, {
  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",
  
  output: {    
    path: __dirname + "/www",    
  },

  plugins: [
    new webpack.DefinePlugin({
        __SMT_ENV__: JSON.stringify("dev")
    })
  ],

  mode: 'development'

  /*
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist'
  }
  */
});