const path = require('path');

module.exports = {
  entry: './src/index.js', // Точка входу
  output: {
    path: path.resolve(__dirname, 'build'), // Папка для вихідних файлів
    filename: 'bundle.js', // Назва зібраного файлу
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Обробка JavaScript файлів
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.scss$/, // Обробка SCSS файлів
        use: [
          'style-loader',  // Додає CSS у DOM
          {
            loader: "css-loader",
            options: { sourceMap: true },
          },
          {
            loader: 'resolve-url-loader', // Вирішує відносні шляхи
            options: { sourceMap: true },
          },
          {
            loader: 'sass-loader', // Компілює SCSS у CSS
            options: { sourceMap: true },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|woff|woff2|eot|ttf|svg)$/, // Обробка файлів
        use: ['file-loader'],
      },
    ],
  },
  devServer: {
    static: './build', // Папка для статичних файлів
    port: 3000, // Порт для DevServer
  },
  mode: 'development', // Або 'production'
};
