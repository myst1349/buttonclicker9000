'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var fileinclude = require('gulp-file-include');
var browserSync = require('browser-sync');
var base64 = require('gulp-base64');
var replace = require('gulp-replace-path');
var path = require('path');
var reload = browserSync.reload;

gulp.task('styles', function () {
  return gulp.src('app/styles/style.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      outputStyle: 'nested',
      precision: 10,
      includePaths: ['.'],
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe(base64({
      baseDir: './app',
      extensions: ['svg'],
      maxImageSize: 10 * 1024,
      debug: true
    }))
    .pipe($.postcss([
      require('autoprefixer-core')({browsers: ['last 1 version']})
    ]))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(gulp.dest('dist/styles/'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', function () {
  return gulp.src('app/scripts/**/*')
      .pipe(gulp.dest('dist/scripts'));
});

gulp.task('templater', function () {
  return gulp.src('app/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      indent: true,
      basepath: '@file'
    }))
    .pipe(gulp.dest('.tmp/'))
    .pipe(reload({stream: true}));
});

gulp.task('vendorStyles', function() {
  return gulp.src('app/styles/vendor/*')
    .pipe(gulp.dest('dist/styles/vendor'))
});

gulp.task('html', ['styles'], function () {
  var assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(fileinclude({
      prefix: '@@',
      indent: true,
      basepath: '@file'
    }))
    .pipe(replace(/(\.\/)/g, './../'))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
  return gulp.src('app/fonts/**/*')
      .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', function () {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['templater', 'styles', 'vendorStyles'], function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'app/*.html',
    'app/**/*.html',
    'app/partials/**/*.html',
    'app/scripts/**/*.js',
    'app/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('app/*.html', ['templater']);
  gulp.watch('app/partials/**/*.html', ['templater']);
});

gulp.task('build', ['html', 'images', 'styles', 'vendorStyles', 'scripts', 'fonts', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
