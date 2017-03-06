/* eslint-env node*/
/* eslint no-console:0*/
var fs = require('fs'),
  path = require('path');

module.exports = function () {
  var htmlFileNames,
    filesObj = {};

  htmlFileNames = fs.readdirSync('templates').filter(function (file) {
    return path.extname(file) === ".html";
  });

  htmlFileNames.forEach(function (file) {
    var name = path.basename(file, '.html'),
      fileStr = fs.readFileSync(path.join('templates', file), 'utf8');
    filesObj[name] = fileStr;
  });

  return filesObj;
}
