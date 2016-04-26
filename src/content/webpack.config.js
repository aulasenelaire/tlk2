const path = require('path');

/**
 * Based on enviroment put CSS inside webpack bundle
 * or extract into a css file
 *
 * @param {String} env
 * @return {String}
 */
function getCSSLoader(env) {
  var cssLocalIdentName = env === 'development' ?
        '[name]__[local]___[hash:base64:5]' : '[hash:base64:5]';

  var styleLoader = 'style';
  var otherLoaders = 'css?modules&importLoaders=1&localIdentName=' + cssLocalIdentName + '!postcss';

  return styleLoader + '!' + otherLoaders;
}

module.exports = {
  devtool: 'eval-source-map',
  entry: [
    './src/content/src/index.js'
  ],

  output: {
    filename: 'content.js',
    path: path.join(__dirname, '../../', 'build'),
    publicPath: '/'
  },

  resolve: {
    root: [
      path.resolve('../src/'),
    ],
    extensions: ['', '.js', '.jsx', '.scss', '.json', '.css'],
    modulesDirectories: ['node_modules']
  },

  module: {
    loaders: [
      {
        test: /\.(jsx|js)?$/,
        loader: 'babel',
        exclude: /(node_modules)/,
        include: path.join(__dirname, 'src'),
        query: {
          presets: ['es2015', 'react']
        }
      },
      {
        test: /\.css$/,
        loader: getCSSLoader('development')
      },
    ]
  },

  postcss: [
    require('postcss-import')(),
    require('postcss-cssnext')(),
    require('postcss-nested'),
    require('autoprefixer-core'),
  ],
};
