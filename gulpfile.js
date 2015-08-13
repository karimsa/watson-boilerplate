/**
 * gulpfile.js - watson-boilerplate
 *
 * Copyright (C) 2015 Karim Alibhai.
 * Licensed under Apache 2.0.
 **/

'use strict';

var gulp = require('gulp'),
    babel = require('gulp-babel'),
    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify');

gulp.task('default', function () {
  return gulp.src('./src/index.js')
          .pipe(babel())
          .pipe(browserify())
          .pipe(uglify())
          .pipe(gulp.dest('./dist/js'));
});
