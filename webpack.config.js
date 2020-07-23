const path = require('path');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const optimization = ()=> {
  const config = { 
    splitChunks: {
      chunks: 'all'
    }
  }

  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetsWebpackPlugin(),
      new TerserWebpackPlugin()
    ]
  }

  return config
}

const plugins = ()=> {
  const base = [  
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
        template: "./public/index.html",
        minify: {
          collapseWhitespace: isProd
        }
    }),
    new MiniCssExtractPlugin({
        filename: filename('css'),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/public/favicon.ico'),
          to: path.resolve(__dirname, 'dist'),
        }
      ],
    }),
  ]

  if (isProd) {
    base.push(new BundleAnalyzerPlugin())
  }

  return base
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

module.exports = {
    mode: 'development',
    context: path.resolve(__dirname, 'src'),
    entry: ["@babel/polyfill", './app/index.js'], //add polifill for babel
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist')
    },
    optimization: optimization(),
    module: {  
        rules: [
          {
						test: /\.(s[ac]ss)$/,
						use: [{
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: isDev
              },
            },
						'css-loader',
            'sass-loader'],
          },
          {
            test: /\.(png|jpg|svg|gif)$/,
            loader: 'file-loader',
              options: {
                outputPath: 'images'
            },
          },
          {
            test: /\.(ttf|woff|woff2|eot)$/,
            loader: 'file-loader',
            options: {
              outputPath: 'fonts'
            },
          },
          { test: /\.js$/, 
            exclude: /node_modules/, 
            loader: {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-env' //presets in https://babeljs.io/docs/en/presets
                ]
              }
            }
          },
          {
            test: /\.html$/i,
            loader: 'html-loader',
            options: {
              attributes: {
                root: path.resolve(__dirname, 'src')
              }
            }
          }
        ]
    },
    devtool: isDev ? 'source-map' : '',
    plugins: plugins(),
    devServer: {  
        port: 8080,
        hot: isDev
    } 
}