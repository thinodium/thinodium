var gulp = require('gulp'),
  path = require('path');

var pug = require('gulp-pug');
var stylus = require('gulp-stylus');
var nib = require('nib');
var rupture = require('rupture');
var minifyCSS = require('gulp-minify-css');
var expect = require('gulp-expect-file');
var runSequence = require('run-sequence');


var paths = {
  stylusSrcFiles: './stylus/style.styl',
  stylusSrcFilesWatch: './stylus/*.styl',
  cssBuildFolder: './css',
  pugSrcFiles: './pug/index.pug',
  pugSrcFilesWatch: './pug/*.pug',
  pugBuildFolder: './',
};


gulp.task('css', function () {
  return gulp.src( paths.stylusSrcFiles )
    .pipe( stylus({
      use: [ nib(), rupture() ],
      errors: true
    }) )
    .pipe( minifyCSS({
      keepSpecialComments: 0,
      noAdvanced: true
    }) )
    .pipe( gulp.dest( paths.cssBuildFolder ) )
    ;
});


gulp.task('pug', function () {
  return gulp.src( paths.pugSrcFiles )
    .pipe( pug() )
    .pipe( gulp.dest( paths.pugBuildFolder ) )
    ;
});


gulp.task('watch', ['css', 'pug'], function() {
  gulp.watch(paths.stylusSrcFilesWatch, ['css']); 
  gulp.watch(paths.pugSrcFilesWatch, ['pug']); 
});


gulp.task('build', ['css', 'pug']);


gulp.task('verify-build', function() {
  return gulp.src(
      [].concat(
        path.join(paths.cssBuildFolder, '**', '*.css'),
        path.join(paths.pugBuildFolder, '*.html')
      )
    )
    .pipe( expect([
      'css/style.css',
      'css/prism.css',
      'index.html'
    ]) )
  ;
})


gulp.task('default', function(cb) {
  runSequence(
    'build', 
    'verify-build',
    cb
  );
});

