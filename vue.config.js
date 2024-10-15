module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/meganew/'
    : '/',
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