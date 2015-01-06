'use strict';

var gulp = require('gulp'),
    jsdoc = require('gulp-jsdoc');

gulp.task('build', ['license'], function() {
    return gulp.src(['./lib/*.js', 'README.md'])
        .pipe(jsdoc('./api'));
});

gulp.task('license', function() {
    return gulp.src('LICENSE.md')
        .pipe(gulp.dest('./api'));
});