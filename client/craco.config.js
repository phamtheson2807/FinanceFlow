module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        webpackConfig.module.rules.push({
          test: /\.m?js/,
          resolve: {
            fullySpecified: false, // Bỏ qua yêu cầu fully specified cho ESM
          },
        });
        return webpackConfig;
      },
    },
  };