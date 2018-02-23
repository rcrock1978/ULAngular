// include plug-ins
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var replace = require('gulp-string-replace');
var shell = require('gulp-shell');
var del = require('del');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

var config = {
    //Include all js files but exclude any min.js files
    src: ['shell/app.js', 'module/**/**/*.js', '!module/**/**/*.min.js'],
    route: 'shell/common/routeResolver.js',
    main: 'main.js',
    index: 'index.html',
    testsrc : ['module/**/**/*.spec.js']
}

gulp.task('test', function () {
    return gulp.src(config.testsrc)
        .pipe(mocha());
});

//delete the output file(s)
gulp.task('clean', function () {
    //del is an async function and not a gulp plugin (just standard nodejs)
    //It returns a promise, so make sure you return that from this task function
    //  so gulp knows when the delete is complete
    return del(['shell/app.min.js', 'module/**/**/*.min.js', 'main-built.js']);
});

//set app to min version
gulp.task('replaceApp', ['replaceRoute'], function () {

    return gulp.src(config.main, { base: './' })
      .pipe(replace('shell/all.min', 'shell/app.min'))      
      .pipe(gulp.dest('./'));
});

// Combine and minify all files from the app folder
// This tasks depends on the clean task which means gulp will ensure that the 
// Clean task is completed before running the scripts task.
gulp.task('scripts', ['clean'], function () {

    return gulp.src(config.src, {base: './'})
      .pipe(uglify())
      //.pipe(concat('all.min.js'))
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest('./'));
});

//set routeresolver to point to minified versions of files
gulp.task('replaceRoute', ['scripts'], function () {

    return gulp.src(config.route, {base: './'})
      .pipe(replace('Service.js', 'Service.min.js'))
      .pipe(replace('Controller.js', 'Controller.min.js'))
      .pipe(gulp.dest('./'));
});

//set app to min version
gulp.task('replaceApp', ['replaceRoute'], function () {

    return gulp.src(config.main, { base: './' })
      .pipe(replace('shell/all.min', 'shell/app.min'))      
      .pipe(gulp.dest('./'));
});

//optimize main.js file -> main-built.js
gulp.task('optimizeMain', ['replaceApp'], shell.task('node r.js -o build.js'));

//replace require file in index.html
gulp.task('replaceMain', ['optimizeMain'], function () {

    return gulp.src(config.index, { base: './' })
      .pipe(replace('data-main="main"', 'data-main="main-built"'))
      .pipe(gulp.dest('./'));
});

//replace require file in index.html
gulp.task('optimize', ['replaceMain'], function () { });

//Set a default tasks
gulp.task('default', ['optimize'], function () { });

///////////////////////////////////////////////////////
//reset routeresolver to point to minified versions of files
gulp.task('resetRoute', ['clean'], function () {

    return gulp.src(config.route, { base: './' })
      .pipe(replace('Service.min.js', 'Service.js'))
      .pipe(replace('Controller.min.js', 'Controller.js'))
      .pipe(gulp.dest('./'));
});

//set app to min version
gulp.task('resetApp', ['resetRoute'], function () {

    return gulp.src(config.main, { base: './' })
      .pipe(replace('shell/app.min', 'shell/app'))
      .pipe(gulp.dest('./'));
});

//replace require file in index.html
gulp.task('resetMain', ['resetApp'], function () {

    return gulp.src(config.index, { base: './' })
      .pipe(replace('data-main="main-built"', 'data-main="main"'))
      .pipe(gulp.dest('./'));
});

gulp.task('jshint', function () {
    return gulp.src(config.src)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('reset', ['resetMain'], function () { });