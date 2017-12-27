'use strict';
function noopReplace (val) { return val; }

function HtmlReplacePlugin(options) {
    this.replacer = options.replacer || noopReplace;
}

HtmlReplacePlugin.prototype.apply = function(compiler) {

   var replacer = this.replacer;

    compiler.plugin('compilation', function(compilation) {

        compilation.plugin('html-webpack-plugin-after-html-processing', function(htmlPluginData, callback) {

            htmlPluginData.html = replacer(htmlPluginData.html, htmlPluginData);

            callback(null, htmlPluginData);

        });
    });

};

module.exports = HtmlReplacePlugin;
