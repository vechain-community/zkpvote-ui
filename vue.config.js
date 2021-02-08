module.exports = {
  lintOnSave: true,
  outputDir: 'dist',
  publicPath: !!process.env.BASE ? process.env.BASE : '/',
  productionSourceMap: false,
};
