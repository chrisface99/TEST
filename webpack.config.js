const path = require('path');

module.exports = {
  entry: './main.js',  
  
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')  
  },

  module: {
    rules: [
      {
        test: /\.js$/,               
        exclude: /node_modules/,     
        use: {
          loader: 'babel-loader'     
        }
      }
    ]
  },

  mode: 'production' 
};
