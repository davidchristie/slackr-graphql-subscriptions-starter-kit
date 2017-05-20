
var HtmlWebpackPlugin = require('html-webpack-plugin')
var path = require('path')
var webpack = require('webpack')

var loaders = require('./webpack.loaders')

var HOST = process.env.HOST || '127.0.0.1'
var PORT = process.env.PORT || '8888'

loaders.push({
  exclude: /src/,
  loaders: [
    'style?sourceMap',
    'css'
  ],
  test: /\.css$/
})

loaders.push({
  exclude: /(node_modules|bower_components|public)/,
  loaders: [
    'style?sourceMap',
    'css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]'
  ],
  test: /\.css$/
})

module.exports = {
  debug: true,
  devServer: {
    contentBase: './public',
    historyApiFallback: true,
    host: HOST,
    hot: true,
    inline: true,
    noInfo: true,
    port: PORT
  },
  devtool: 'eval-source-map',
  entry: [
    'react-hot-loader/patch',
    './src/index'
  ],
  module: {
    loaders
  },
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'public'),
    publicPath: '/'
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './src/template.html'
    })
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
}
