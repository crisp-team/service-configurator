const path = require('path');
const { create } = require('sass-alias');

module.exports = {
  webpack: {
    alias: {
      '@styles': path.resolve(__dirname, 'src/styles'),
    },
    configure: (webpackConfig) => {
      webpackConfig.module.rules.push({
        test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'src/fonts/[name].[hash][ext]',
          },
      });

      const scssRule = webpackConfig.module.rules.find(
        (rule) => rule.test && rule.test.toString().includes('scss')
      );

      if (scssRule) {
        scssRule.use = [
          'style-loader',
          'css-loader',
          {
            loader: 'resolve-url-loader',
            options: {
              sourceMap: true,
              root: path.resolve(__dirname, 'src'),
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sassOptions: {
								importer: create({
									'@styles': path.join(__dirname, 'src/styles'),
								}),
							},
            },
          },
        ];
      }

      return webpackConfig;
    },
  },
};
