let publicPath = '/';

if (process.env.NODE_ENV === 'production' && process.env.GITHUB_REPOSITORY) {
  const getRepository = process.env.GITHUB_REPOSITORY.split('/')[1];
  publicPath = `/${getRepository}/`;
}

module.exports = {
  lintOnSave: true,
  outputDir: 'dist',
  publicPath,
  productionSourceMap: false,
};
