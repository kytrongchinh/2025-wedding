var fs = require("fs");
var path = require("path");

var libs = {};

var ignore = ["index.js"];

fs.readdirSync(__dirname)
	.filter(function (file) {
		return file.lastIndexOf(".js") > 0 && file.length - 3 == file.lastIndexOf(".js") && ignore.indexOf(file) === -1;
	})
	.forEach(function (file) {
		var name = file.split(".")[0];
		libs[name] = require(path.join(__dirname, file));
	});

module.exports = libs;
