'use strict';

var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var jsdoc = require('gulp-jsdoc');
var mocha = require('gulp-mocha');

gulp.task('build', ['license'], function() {
    return gulp.src(['lib/**/*.js', 'README.md'])
        .pipe(jsdoc('api'));
});

gulp.task('license', function() {
    return gulp.src('LICENSE.md')
        .pipe(gulp.dest('api'));
});

gulp.task('test', function(done) {
    gulp.src(['lib/**/*.js'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('finish', function () {
			gulp.src(['test/**/*.js', '!test/fixture/**/*.js', '!test/expected/**/*.js'])
				.pipe(mocha())
				.pipe(istanbul.writeReports())
				.on('end', done);
			});
});

gulp.task('test-watch', function() {
	gulp.watch('test/js/**/*.js', ['test']);
});

gulp.task('default', ['build']);