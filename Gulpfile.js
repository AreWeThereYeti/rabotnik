var gulp = require('gulp'),
		uglify = require('gulp-uglify'),
		express = require('express'),
		cssmin = require('gulp-cssmin'),
		path = require('path'),
		gutil = require('gulp-util'),
		concat = require('gulp-concat'),
		rename    = require('gulp-rename'),
		watch = require('gulp-watch'),
		ngAnnotate = require('gulp-ng-annotate'),
		clean = require('gulp-clean'),
		minifyHTML = require('gulp-minify-html'),
		imagemin = require('gulp-imagemin'),
		pngcrush = require('imagemin-pngcrush');

var EXPRESS_PORT = 3000;
var EXPRESS_ROOT = __dirname + '/app';
var LIVERELOAD_PORT = 35729;
var lr;

//------- Start live-reload and webserver-----------------------
function startExpress() {
	var app = express();
	app.use(require('connect-livereload')());
	app.use(express.static(EXPRESS_ROOT));
	app.listen(EXPRESS_PORT);
}

//Livereload
function startLivereload() {
	lr = require('tiny-lr')();
	lr.listen(LIVERELOAD_PORT);
}

function notifyLivereload(event) {
	// `gulp.watch()` events provide an absolute path
	// so we need to make it relative to the server root
	var fileName = require('path').relative(EXPRESS_ROOT, event.path);
	lr.changed({
		body: {
			files: [fileName]
		}
	});
}
//----------- End of livereload and webserver-------------------

//Clean tmp folder after tasks
gulp.task('clean', function () {
	return gulp.src('.tmp/', {read: false})
			.pipe(clean());
});

//optimize images and move to dist folder.
gulp.task('images', function () {
	//source
	return gulp.src('app/images/*')
		//optimization process
			.pipe(imagemin({
				progressive: true,
				svgoPlugins: [{removeViewBox: false}],
				use: [pngcrush()]
			}))
		//Destination
			.pipe(gulp.dest('dist/images'));
});

//Move html and minify
gulp.task('minify-html', function() {
	var opts = {comments:true,spare:true};
	gulp.src('./app/*.html')
			.pipe(minifyHTML({
				empty:true
			}))
			.pipe(gulp.dest('./dist/'))
});

//Minify js and move to dist
gulp.task('minify', function () {
	gulp.src('app/scripts/**/*.js')
			.pipe(ngAnnotate())
			.pipe(uglify('app.js', {
				mangle: false,
				output: {
					beautify: true
				}
			}))
			.pipe(gulp.dest('./dist/scripts'))
});

//Move html and minify
gulp.task('minify-template-html', function() {
	var opts = {comments:true,spare:true};
	gulp.src('./app/html/**/*.html')
			.pipe(minifyHTML({
				empty:true
			}))
			.pipe(gulp.dest('./dist/html'))
});

gulp.task('css', function () {
	gulp.src('app/stylesheets/**/*.css')
			.pipe(cssmin())
			.pipe(concat('main.css'))
			.pipe(rename({suffix: '.min'}))
			.pipe(gulp.dest('dist/stylesheets'));
});

//Start webserver on localhost /localhost:3000
gulp.task('default', function() {
	startExpress();
	startLivereload();
	gulp.watch('app/**').on('change', notifyLivereload);
});

gulp.task('build', ['minify', 'css', 'minify-template-html' ]);

gulp.task('minify-images', ['images']);