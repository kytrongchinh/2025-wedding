var fs = require('fs');
var path = require('path');

//import all schema of module file in this dir, except index.js
var ignore = ['index.js','photo.js'];

var db = {};
fs.readdirSync(__dirname).filter(function(file){
    return (file.indexOf('.js') !== 0) && (file !== 'index.js') && (file !== 'adminModels.js') && ignore.indexOf(file) === -1;
}).forEach(function(file){
    var model = require(path.join(__dirname, file));
    db[model.modelName] = model;
});

//load model default
var MyModel = require('../../../libs/mongoose');
var model = new MyModel(db);

//load model custom
model['custom'] = {
	
};

module.exports = model;
