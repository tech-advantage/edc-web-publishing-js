const conf = require('./gulp.conf');

module.exports = function (config) {
  const configuration = {
    basePath: '../',
    singleRun: true,
    autoWatch: false,
    logLevel: 'INFO',
    browsers: [
      'Firefox'
    ],
    frameworks: [
      'jasmine',
      'karma-typescript'
    ],
    files: [
      conf.path.src('./lib/axios/dist/axios.js'),
      conf.path.src('./lib/es6-promise/dist/es6-promise.js'),
      conf.path.src('**/*.ts')
    ],
    preprocessors: {
      [conf.path.src('**/*.ts')]: [
        'karma-typescript'
      ]
    },
    reporters: ['kjhtml'],
    plugins: [
      require('karma-jasmine'),
      require('karma-jasmine-html-reporter'),
      require('karma-typescript'),
      require('karma-firefox-launcher')
    ]
  };

  config.set(configuration);
};
