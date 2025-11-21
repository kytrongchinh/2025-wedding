const fs = require('fs');
const path = require('path');

const libs = {};

const ignore = ['index.js','social.js','mongoose.js'];

fs.readdirSync(__dirname).filter(function(file){
    return (file.lastIndexOf('.js') > 0) && (file.length - 3 == file.lastIndexOf('.js')) && (ignore.indexOf(file) === -1);
}).forEach(function(file){
    let name = file.split('.')[0];
    libs[name] = require(path.join(__dirname, file));
});

module.exports = libs;
