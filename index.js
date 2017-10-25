var fs = require('fs');
var cheerio = require('cheerio');
var through = require('through2');
var gulp = require('gulp');
var rename = require('gulp-rename');
var gutil = require('gulp-util');

var PluginError = gutil.PluginError;


// Consts
var PLUGIN_NAME = 'gulp-app-cache-builder';

function buildAppCache(options) {
    var excludeString = options.ExcludeString;
    var projectFile = options.ProjectFile;

    var excludes = excludeString.split(",");
    var contentNames = [];
    var newLine = "\n";
    var now = new Date();

    return through.obj(function (file, encoding, done) {

        var $ = cheerio.load(file.contents);

        $('Content').each(function (index, contentNode) {

            var fileName = "/" + contentNode.attribs["include"].replace(/\\/g, "\/");
            var exclude = false;

            for (var i = 0; i < excludes.length; i++) {
                var ext = excludes[i].toLowerCase();
                if (ext.startsWith(".")) {
                    if (fileName.toLowerCase().endsWith(ext)) {
                        exclude = true;
                        break;
                    }
                }
                else {
                    if (fileName.toLowerCase().includes(ext)) {
                        exclude = true;
                        break;
                    }
                }
            }
            if (!exclude) {
                contentNames.push(fileName);
            }
        });

        var output = "";

        output += "CACHE MANIFEST" + newLine;
        output += "# build time " +
            (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear() + " " +
            now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + " " + (now.getHours() <= 12 ? "AM" : "PM") + newLine;


        output += "CACHE:" + newLine;

        output += "/" + newLine;

        //add the cache section
        contentNames.forEach(function (name, index) {
            output += name + newLine;
        });

        //add the network section
        //*
        output += "NETWORK:" + newLine;
        output += "*" + newLine;

        output += "FALLBACK:";

        file.contents = Buffer(output);
        this.push(file);
        done();
    });

}


// Plugin level function(dealing with files)
function gulpAppCacheBuilder(options) {
    if (!options) {
        throw new PluginError(PLUGIN_NAME, 'options required!');
    }
    if (!options || !options.ProjectFile || !fs.existsSync(options.ProjectFile)) {
        throw new PluginError(PLUGIN_NAME, 'options.ProjectFile must be a valid csproj file.');
    }

    return gulp
        .src(options.ProjectFile)
        .pipe(buildAppCache(options));
}

// Exporting the plugin main function
module.exports = gulpAppCacheBuilder;