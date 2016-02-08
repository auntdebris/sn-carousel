var gulp         = require('gulp'),

	clean        = require('gulp-clean'),
	
	jshint       = require('gulp-jshint'),
	uglify       = require('gulp-uglify'),
	concat       = require('gulp-concat'),
	
	imagemin     = require('gulp-imagemin'),
	
	sass         = require('gulp-sass'),
	sourcemaps   = require('gulp-sourcemaps'),
	autoprefixer = require('gulp-autoprefixer'),

	livereload   = require('gulp-livereload'),

	bases = {
		app: 'app/',
		dist: 'dist/',
	},

	paths = {
		scripts: ['scripts/**/*.js', '!scripts/libs/**/*.js', '!scripts/vendor/**/*.js'],
		libs: ['scripts/libs/**/*.js'],
		vendor: ['scripts/vendor/**/*.js'],
		styles: ['styles/app.scss'],
		html: ['*.html'],
		images: ['images/**/*'],
		fonts: ['fonts/**/*'],
		assets: ['assets/**/*'],
		extras: ['humans.txt', 'robots.txt', 'favicon.ico'],
	},

	sassOptions = {
		errLogToConsole: true,
		outputStyle: 'compact'
	},

	autoprefixerOptions = {
		browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
	};


// Delete dist directory

gulp.task('clean', function(){
	
	return gulp.src(bases.dist)
			   .pipe(clean());
});


// Validate, minify and concatenate scripts

gulp.task('scripts', ['clean'], function(){
	
	gulp.src(paths.scripts, {cwd: bases.app})
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(uglify())
		.pipe(concat('app.min.js'))
		.pipe(gulp.dest(bases.dist + 'scripts/'));
});


// Compile CSS

gulp.task('sass', ['clean'], function(){
	
	gulp.src(paths.styles, {cwd: bases.app})
	    .pipe(sourcemaps.init())
	    .pipe(sass(sassOptions).on('error', sass.logError))
	    .pipe(sourcemaps.write())
	    .pipe(autoprefixer(autoprefixerOptions))
	    .pipe(gulp.dest(bases.dist + 'styles/'))
	    .pipe(livereload());
});


// Compress images

gulp.task('imagemin', ['clean'], function(){

	gulp.src(paths.images, {cwd: bases.app})
		.pipe(imagemin())
		.pipe(gulp.dest(bases.dist + 'images/'));

	gulp.src(paths.assets, {cwd: bases.app})
		.pipe(imagemin())
		.pipe(gulp.dest(bases.dist + 'assets/'));
});


// Copy files to dist

gulp.task('copy', ['clean'], function(){
 
	// HTML
	gulp.src(paths.html, {cwd: bases.app})
		.pipe(gulp.dest(bases.dist));

	// Libraries
	gulp.src(paths.libs, {cwd: 'app/**'})
		.pipe(gulp.dest(bases.dist));

	// Vendor scripts
	gulp.src(paths.vendor, {cwd: 'app/**'})
		.pipe(gulp.dest(bases.dist));

	// Fonts
	gulp.src(paths.fonts, {cwd: 'app/**'})
		.pipe(gulp.dest(bases.dist));

	// Additional files
	gulp.src(paths.extras, {cwd: bases.app})
		.pipe(gulp.dest(bases.dist));
});


// Watch file changes

gulp.task('watch', function(){
	livereload.listen();
	gulp.watch('app/**/*', ['clean', 'scripts', 'sass', 'imagemin', 'copy']);
});


// Default task

gulp.task('default', ['watch', 'clean', 'scripts', 'sass', 'imagemin', 'copy']);

