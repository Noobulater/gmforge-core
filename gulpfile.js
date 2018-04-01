//gulpfile.js
var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var es6transpiler = require('gulp-es6-transpiler');

//script paths
var jsFiles = 'src/scripts/**/*.js',
    jsDest = 'public/bin';

gulp.task('core', function() {
    return gulp.src(jsFiles)
        .pipe(concat('core.js'))
        .pipe(gulp.dest('/dist'))
        .pipe(rename('core.js'))
        //.pipe(uglify())
        .pipe(gulp.dest(jsDest));
});

gulp.task('all', ['core']);
