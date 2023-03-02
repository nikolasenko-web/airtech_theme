let preprocessor = 'sass', // Preprocessor (sass, less, styl); 'sass' also work with the Scss syntax in blocks/ folder.
		fileswatch   = 'html,sass,htm,txt,json,md,woff2' // List of files extensions for watching & hard reload

import pkg from 'gulp'
const { gulp, src, dest, parallel, series, watch } = pkg

import browserSync   from 'browser-sync'
import bssi          from 'browsersync-ssi'
import ssi           from 'ssi'
import webpackStream from 'webpack-stream'
import webpack       from 'webpack'
import TerserPlugin  from 'terser-webpack-plugin'
import gulpSass      from 'gulp-sass'
import dartSass      from 'sass'
import sassglob      from 'gulp-sass-glob'
const  sass          = gulpSass(dartSass)
import named          from 'vinyl-named'
import less          from 'gulp-less'
import lessglob      from 'gulp-less-glob'
import styl          from 'gulp-stylus'
import stylglob      from 'gulp-noop'
import postCss       from 'gulp-postcss'
import cssnano       from 'cssnano'
import autoprefixer  from 'autoprefixer'
import imagemin      from 'gulp-imagemin'
import imageminWebp  from 'imagemin-webp';
import rename        from 'gulp-rename'
import changed       from 'gulp-changed'
import concat        from 'gulp-concat'
import rsync         from 'gulp-rsync'
import {deleteAsync} from 'del'



function browsersync() {
	browserSync.init({
		proxy: 'airtech',
		notify: false,
		online: true
	})
}





function scripts() {
	return src(`assets/js/main.js`)
	.pipe(webpackStream({
		mode: 'production',
		performance: { hints: false },
		plugins: [
			new webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery', 'window.jQuery': 'jquery' }), // jQuery (npm i jquery)
		],
		module: {
			rules: [
				{
					test: /\.m?js$/,
					exclude: /(node_modules)/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'],
							plugins: ['babel-plugin-root-import']
						}
					}
				}
			]
		},
		optimization: {
			minimize: true,
			minimizer: [
				new TerserPlugin({
					terserOptions: { format: { comments: false } },
					extractComments: false
				})
			]
		},
	}, webpack)).on('error', function handleError() {
		this.emit('end')
	})
	.pipe(concat('main.min.js'))
	.pipe(dest(`assets/js`))
	.pipe(browserSync.stream())
};

function styles() {
  return src([`styles/**/*.sass`,`styles/main.sass`])
		.pipe(eval(`${preprocessor}glob`)())
		.pipe(eval(preprocessor)({ 'include css': true }))
		.pipe(postCss([
			autoprefixer({ grid: 'autoplace' })
		]))
    .pipe(dest('assets/css'));
};

function images() {
	return src(['assets/images/src/**/*'])
		.pipe(changed('app/images/webp'))
    .pipe(imagemin([imageminWebp(
			{quality: 85}
		)]))
    .pipe(rename({ extname: '.webp' }))
		.pipe(dest('assets/images/webp'))
		.pipe(browserSync.stream())
};

function startwatch() {
	watch([`partials/**/*`,`styles/**/*`], { usePolling: true }, styles)
	watch([`partials/**/*.{${fileswatch}}`,`layouts/**/*.{${fileswatch}}`,`pages/**/*.{${fileswatch}}`,`styles/**/*.{${fileswatch}}`,`assets/**/*.{${fileswatch}}`], { usePolling: true }).on('change', browserSync.reload)
}


export { scripts, styles, images }

export default series(scripts, styles, images, parallel(browsersync, startwatch))
