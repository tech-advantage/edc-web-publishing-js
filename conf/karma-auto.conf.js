const conf = require('./gulp.conf');

module.exports = function (config) {
  const configuration = {
    basePath: '../',
    singleRun: false,
    autoWatch: true,
    logLevel: 'INFO',
    browsers: [
      'Firefox'
    ],
    frameworks: [
      'jasmine',
      'karma-typescript'
    ],
    files: [
      conf.path.src('**/*.ts')
    ],
    preprocessors: {
      [conf.path.src('**/*.ts')]: [
        'karma-typescript'
      ]
    },
    plugins: [
      require('karma-jasmine'),
      require('karma-typescript'),
      require('karma-firefox-launcher')
    ]
  };

  config.set(configuration);
};
