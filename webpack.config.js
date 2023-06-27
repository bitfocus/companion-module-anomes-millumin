const path = require('path');

module.exports = {
  entry: './dist/index.js',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: { "os": false, "stream": false, "path": false, "assert": false, "url": false, "util": false, "zlib": false, "http": false, "https": false, "domain": false, "dgram": false, "net": false, "fs": false, "child_process": false, "tls": false, "inspector": false }
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};