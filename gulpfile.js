const gulp = require('gulp');
const tslint = require('gulp-tslint');
const ts = require('gulp-typescript');
const gulpMerge = require('gulp-merge');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const exec = require('child_process').exec;
const path = require('path');
const del = require('del');
const HubRegistry = require('gulp-hub');
const tslintCustom = require('tslint'); // for tslint-next https://github.com/panuhorsmalahti/gulp-tslint#specifying-the-tslint-module
require('dotbin');

const conf = require('./conf/gulp.conf');

// Load some files into the registry
const hub = new HubRegistry([conf.path.tasks('*.js')]);

const libraries = [
  './node_modules/axios/dist/axios.js',
  './node_modules/es6-promise/dist/es6-promise.auto.js'
];

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
      formatter: 'verbose'
    }))
    .pipe(tslint.report());
});

gulp.task('build', function (cb) {
  let tsResult = gulp.src(['./src/**/*.ts', '!*.spec.ts'])
    .pipe(sourcemaps.init()) // This means sourcemaps will be generated
    .pipe(ts());

  return gulpMerge(gulp.src(libraries), tsResult)
    .pipe(concat('edc.js')) // You can use other plugins that also support gulp-sourcemaps
    .pipe(uglify())
    .pipe(sourcemaps.write()) // Now the sourcemaps are added to the .js file
    .pipe(gulp.dest('dist/'));
});

gulp.task('test', gulp.series('karma:single-run'));
gulp.task('test:auto', gulp.series('karma:auto-run'));

gulp.task('watch', function () {
  gulp.watch(tsFilesGlob, ['build']);
});
