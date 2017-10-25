# gulp-app-cache-builder
Inspects a C# project file and generates an application cache manifest for included items. It allows the use of an ExcludeString to filter included items that are not needed in the manifest.

## Installation

Install package with NPM and add it to your development dependencies:

`npm install --save-dev gulp-app-cache-builder`

## Usage

```javascript
const gulp = require('gulp');
const rename = require('gulp-rename');
const gulpAppCacheBuilder = require('gulp-app-cache-builder');

gulp.task('default', function () {
    let excludeString=".master,.config,.rpt,.svc,/aspnet_client/,/controls/,/email/,ForgotPassword.aspx,ReportViewer.aspx,.txt,offline.appcache,siteversion.config.xml,.map,/ts/,compilerconfig.json,packages.config,/@(TypeScriptCompile)";
    
    gulpAppCacheBuilder({
        ProjectFile: "Align.Web.csproj",
        ExcludeString: excludeString
    })
    .pipe(rename("output.txt"))
    .pipe(gulp.dest("."));

});
```

## Options

`ProjectFile` is the path to the C# csproj that will be used for input.

`ExcludeString` is a comma delimited string that contains regex matchs for paths. You can exclude files by extension(.config) or folders(/ts/).
