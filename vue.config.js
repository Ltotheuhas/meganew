module.exports = {
  publicPath: "/",
  outputDir: "dist",
  transpileDependencies: ['vue-joystick-component'],
  chainWebpack: (config) => {
    config.module
      .rule('ts')
      .test(/\.ts$/)
      .use('babel-loader')
      .loader('babel-loader')
      .end();
  }
};