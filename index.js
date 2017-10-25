const fs = require('fs');
const cheerio = require('cheerio');
const through = require('through2');
const gulp = require('gulp');
const rename = require('gulp-rename');
const gutil = require('gulp-util');

const PluginError = gutil.PluginError;


// Consts
const PLUGIN_NAME = 'gulp-app-cache-builder';

function buildAppCache(options) {
    let excludeString = options.ExcludeString;
    let projectFile = options.ProjectFile;

    let excludes = excludeString.split(",");
    let contentNames = [];
    let newLine = "\n";
    let now = new Date();

    return through.obj(function (file, encoding, done) {

        let $ = cheerio.load(file.contents);

        $('Content').each(function (index, contentNode) {

            let fileName = "/" + contentNode.attribs["include"].replace(/\\/g, "\/");
            let exclude = false;

            for (let i = 0; i < excludes.length; i++) {
                let ext = excludes[i].toLowerCase();
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