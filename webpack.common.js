const path = require('path')
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');
var webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
    
    entry: { 
        main: ["./src/index.tsx", "./src/scss/index.scss"]
    },
    output: {
        filename: "[name].bundle.js",
        chunkFilename: "[name].chunk.js",
        path: __dirname + "/dist",
        publicPath: ''
    },

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
        ,     
        
        plugins: [
            new TsConfigPathsPlugin(
                {
                    tsconfig: __dirname + '/tsconfig.json',
                    compiler: 'typescript'
                }
            )
        ]
        /*
        alias: {
            config: path.join(__dirname, 'src/config/devConfig.ts'),
        },
        */
    },
    
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            //{ test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            { test: /\.tsx?$/, loader: "ts-loader" },
            
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },

            {
                test: /\.s?[ac]ss$/,
                use: [
                  //devMode ? 'style-loader' : 
                  MiniCssExtractPlugin.loader,
                  'css-loader',
                  'postcss-loader',
                  'sass-loader',
                ],
            },
            //copy index html (and potentially other files)
            { 
                test: /\.(html)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]',
                        context: './src',
                        outputPath: '/',
                        publicPath: ''
                    }
                }]
            },
            {
                test: /\.(eot|ttf|woff|woff2)$/,
                use: [
                    {
                        loader: 'file-loader?name=[name].[ext]&outputPath=fonts/&publicPath=fonts/',                        
                        /*
                        options: {
                            //name: 'fonts/[hash].[ext]'
                            name: 'fonts/[name].[ext]'
                        } 
                        */                         
                    }
                ]
            },
            {
                test: /\.(png|jp(e*)g|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 99999999999, // Convert images < 1Mb to base64 strings
                        name: 'images/[name].[ext]'
                        //name: 'public/images/[hash]-[name].[ext]'
                    }
                }]
            }
        ]
    },
    
    
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "initial"
                }
            }
        }  
    },
         

    plugins: [        
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),

        //this allows to for example use $() inside the code and work without importing jquery explicitly
        new webpack.ProvidePlugin({
            $: "jquery",
            "window.jQuery": "jquery",
            "moment": "moment",
        }),
        
        new webpack.DefinePlugin({
            __SMT_VERSION__: JSON.stringify(formatDate())
        }),

        // Ignore all locale files of moment.js
        //new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ],
    
    /* this is to fix some issues with react-data-export */
    node: {
        fs: "empty"
    },
    
    externals: {
      'xlsx': 'var _XLSX',
      '../xlsx': 'var _XLSX'
    },

};

function formatDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var min = today.getMinutes();
    var hh = today.getHours();
    
    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 
    return dd+'/'+mm+'/'+yyyy + ' '+ hh + ':' + min;
}