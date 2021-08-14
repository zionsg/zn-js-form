// Import modules
const banner = require('@jsdevtools/browserify-banner');
const browserify = require('browserify');
const del = require('del');
const fs = require('fs');
const gulp = require('gulp');
const gulpMinify = require('gulp-babel-minify');
const vinylBuffer = require('vinyl-buffer');
const vinylSourceStream = require('vinyl-source-stream');

let libraryName = 'ZnJsForm';
let srcFile = './src/index.js';
let destFolder = './dist';
let destFile = 'bundle.js';
let destPath = `${destFolder}/${destFile}`;

// See https://blog.revathskumar.com/2016/02/browserify-with-gulp.html
gulp.task(
    'build',
    gulp.series(
        function removeBundle(done) {
            del([destPath]);
            done();
        },
        function buildMinified(done) {
            let plugins = [
                [
                    banner,
                    { template: '<%= pkg.name %> v<%= pkg.version %> <%= pkg.homepage %>\n<%= moment().format() %>' }
                ],
            ];

            browserify({
                entries: [srcFile],
                standalone: libraryName, // exposes the object exported by src/index.js as a global JS variable
                cache: {},
                packageCache: {},
                plugin: plugins
            })
            .bundle()
            .pipe(vinylSourceStream(destFile)) // output is stream
            .pipe(vinylBuffer()) // output is buffer, appropriate input type for gulpMinify
            .pipe(gulpMinify()) // minify
            .pipe(gulp.dest(destFolder)); // save to folder

            done();
        }
    )
);

gulp.task('watch', function () {
    gulp.watch(
        './src/*.js',
        {
            usePolling: true,
        },
        gulp.series(
            function (done) {
                console.log('Detected file changes.');
                done();
            },
            'build'
        )
    );
});
