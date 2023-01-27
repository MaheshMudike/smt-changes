const merge = require('webpack-merge');
const common = require('./webpack.common.js');
var webpack = require('webpack');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge(common, {
  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",
  
  output: {    
    path: __dirname + "/www",    
  },

  plugins: [
    new webpack.DefinePlugin({
        __SMT_ENV__: JSON.stringify("full")
    }),
    //new BundleAnalyzerPlugin()
  ],

  mode: 'development',

  devServer: {
    contentBase: './www',
    port: 8000
  }
});