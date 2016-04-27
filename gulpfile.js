var gulp = require('gulp'),
  path = require('path');


var mocha = require('gulp-mocha');



gulp.task('tests', function () {
  return gulp.src('./test/**/*.test.js', { read: false })
      .pipe(mocha({
        ui: 'exports',
        reporter: 'spec'
      }))
    ;
});


gulp.task('default', ['tests']);



