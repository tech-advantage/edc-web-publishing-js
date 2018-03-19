const gulp = require('gulp');
const conf = require('./conf/gulp.conf');
const webpackConfig = require('./webpack.config');
const webpack = require('webpack');
const tslint = require('gulp-tslint');
const del = require('del');
const HubRegistry = require('gulp-hub');
const tslintCustom = require('tslint'); // for tslint-next https://github.com/panuhorsmalahti/gulp-tslint#specifying-the-tslint-module
require('dotbin');

// Load some files into the registry
const hub = new HubRegistry([conf.path.tasks('*.js')]);

// Tell gulp to use the tasks just loaded
gulp.registry(hub);

const tsFilesGlob = (function (c) {
  return c.filesGlob || c.files || 'src/**/*.ts';
})(require('./tsconfig.json'));

gulp.task('clean', function () {
  return del([
    'release/**/*'
  ]);
});

gulp.task('lint', function () {
  return gulp.src(['src/**/*.ts', '!src/**/*.spec.ts', '!src/lib/**/*.ts'])
    .pipe(tslint({
      tslint: tslintCustom,
      formatter: 'verbose',
      typeCheck: true
    }))
    .pipe(tslint.report());
});

gulp.task('build', function (done) {
  return webpack(webpackConfig).run(function () {
    done();
  });
});

gulp.task('test', gulp.series('karma:single-run'));
gulp.task('test-auto', gulp.series('karma:auto-run'));

gulp.task('watch', function () {
  gulp.watch(tsFilesGlob, ['build']);
});
