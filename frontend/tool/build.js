'use strict';
const webpack = require('webpack');
const rm = require('rimraf');
const ora = require('ora');
const chalk = require('chalk');
const HtmlReplacePlugin = require('./HtmlReplacePlugin');

// env 'production'
process.env.WEBPACK_ENV = 'production';

let webpackConfig = require('./webpack.prod.config');

let spinner = ora('building for production...');
spinner.start();

let feRoots = {
    'index': './'
};

webpackConfig.plugins = webpackConfig.plugins.concat([

    new HtmlReplacePlugin({
        replacer: function(html, opt) {

            var name = opt.outputName.replace(/\.html$/, '');

            /*
             We do not need the following hack, which was added here:

             https://github.com/PaddlePaddle/VisualDL/commit/75f5c3b55fb411e0329b98d66253e60137f88bd5#diff-b6dc766994d45268924eff9a07f0765bR31

             What it does is simply add './' in front of 'src' and 'href' to make sure it is loading local files.
             But it should be able to load both local JS files and CDN files via 'https://...'
             */

            // var feRoot = feRoots[name];

            // if (feRoot) {
            //     html = html
            //         .replace(/href="/g, 'href="' + feRoot);
            //         .replace(/src="/g, 'src="' + feRoot);
            // }

            return html;

        }
    })

]);

rm(webpackConfig.output.path, err => {

    if (err) throw err;

    webpack(webpackConfig, function(err, stats) {
        spinner.stop()
        if (err) throw err

        process.stdout.write(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        }) + '\n\n');

        console.log(chalk.cyan('  Build complete.\n'));
        console.log(chalk.yellow(
            '  Tip: built files are meant to be served over an HTTP server.\n' +
            '  Opening index.html over file:// won\'t work.\n'
        ));
    })

});
