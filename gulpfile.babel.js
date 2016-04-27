import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import webpack from 'webpack';
import rimraf from 'rimraf';

const plugins = loadPlugins();

import webpackConfig from './webpack.config';

gulp.task('javascripts', ['clean'], (cb) => {
  webpack(webpackConfig, (err, stats) => {
    if(err) throw new plugins.util.PluginError('webpack', err);

    plugins.util.log('[webpack]', stats.toString({
      chunks: false,
      source: false,
    }));

    cb();
  });
});

gulp.task('copy-manifest', ['clean'], () => {
  return gulp.src('manifest.json')
    .pipe(gulp.dest('./build'));
});

gulp.task('clean', (cb) => {
  rimraf('./build', cb);
});

gulp.task('build', ['copy-manifest', 'javascripts']);

gulp.task('watch', ['default'], () => {
  gulp.watch('src/**/*', ['build']);
});

gulp.task('default', ['build']);
