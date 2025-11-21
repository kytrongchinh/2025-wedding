const fs = require('fs');
const path = require('path');

// import all schema file in this dir, except index.js
const db = {};
fs.readdirSync(__dirname).filter(function(file){
    return (file.indexOf('.js') !== 0) && (file !== 'index.js');
}).forEach(function(file){
    const resourceModel = require(path.join(__dirname, file));
    db[resourceModel.modelName] = resourceModel;
});

//load model default
const myModel = require('../../../libs/mongoose');
const model = new myModel(db);

//load model custom
model['custom'] = {

};
module.exports = model;
