const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const tsLintLoader = require.resolve('tslint-loader');
const tsLoader = require.resolve('ts-loader');

module.exports = {
  cache: true,
  entry: './src/edc-client.ts',
  module: {
    loaders: [
      {
        test: /\.ts(x?)$/,
        enforce: 'pre',
        loader: tsLintLoader,
        exclude: path.resolve(__dirname, './node_modules'),
        query: {
          formatter: 'stylish',
          configFile: path.resolve(__dirname, './tsconfig.json')
        }
      },
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        loader: tsLoader
      }
    ]
  },
  resolve: {
    modules: [
      'node_modules',
      path.join(__dirname, 'node_modules')
    ],
    extensions: [ '.tsx', '.ts', '.js', '!**/*.spec.ts', '!src/lib/**/*.ts' ]
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'edc-client.js',
    library: 'edc-client-js',
    libraryTarget: "umd"
  },
  externals: {
    axios: 'axios',
    "es6-promise": 'es6-promise',
    lodash: 'lodash'
  },
  plugins: [
    new UglifyJsPlugin() // -options
  ]
};
