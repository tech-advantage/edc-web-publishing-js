const gulp = require('gulp');
const tslint = require('gulp-tslint');
const exec = require('child_process').exec;
const path = require('path');
const del = require('del');
const HubRegistry = require('gulp-hub');
const tslintCustom = require('tslint'); // for tslint-next https://github.com/panuhorsmalahti/gulp-tslint#specifying-the-tslint-module
require('dotbin');

const conf = require('./conf/gulp.conf');

// Load some files into the registry
const hub = new HubRegistry([conf.path.tasks('*.js')]);

// Tell gulp to use the tasks just loaded
gulp.registry(hub);

const tsFilesGlob = (function (c) {
  return c.filesGlob || c.files || 'src/**/*.ts';
})(require('./tsconfig.json'));

gulp.task('clean', function () {
  return del([
    'lib/**/*'
  ]);
});

gulp.task('lint', function () {
  return gulp.src(tsFilesGlob)
    .pipe(tslint({
      tslint: tslintCustom,
      formatter: 'verbose'
    }))
    .pipe(tslint.report());
});

gulp.task('build', function (cb) {
  exec('tsc --version', function (err, stdout, stderr) {
    console.log('Using TypeScript ', stdout);
    if (stderr) {
      console.log(stderr);
    }
  });

  return exec('tsc', function (err, stdout, stderr) {
    console.log(stdout);
    if (stderr) {
      console.log(stderr);
    }
    cb(err);
  });
});

gulp.task('test', gulp.series('karma:single-run'));
gulp.task('test:auto', gulp.series('karma:auto-run'));

gulp.task('watch', function () {
  gulp.watch(tsFilesGlob, ['build']);
});
