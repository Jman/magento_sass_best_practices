var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    ignore = require('gulp-ignore'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    gutil = require('gulp-util'),
    skin_url = './skin/frontend/rwd/<theme_name>/',
    theme_url = './app/design/frontend/rwd/<theme_name>/';


function swallowError (error) {
    gutil.log(error);
    this.emit('end');
}

gulp.task('sass', function () {
    return gulp.src(skin_url +'scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle:'compressed'
        }))
        .on('error', swallowError)
        .pipe(autoprefixer({remove:true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(skin_url +'css/'))
        .pipe(ignore.exclude('*.map'))
        .pipe(livereload());
});

gulp.task('js', function(){
    return gulp.src(skin_url +'js/src/**/*')
        .pipe(sourcemaps.init())
        .pipe(concat('main.js').on('error', gutil.log))
        .pipe(uglify())
        .on('error', swallowError)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(skin_url + 'js/'))
        .pipe(livereload());
});

gulp.task('clean', function(cb) {
    return del(['./var/cache']).then(livereload);
});

gulp.task('watch', function(cb) {
    livereload.listen();
    gulp.watch(skin_url + 'scss/**/*', ['sass']);
    gulp.watch(skin_url + 'js/src/**/*', ['js']);
    gulp.watch(theme_url + '**/*', ['clean']);
    cb();
});