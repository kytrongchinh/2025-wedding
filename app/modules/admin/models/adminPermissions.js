var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var objSchema = new Schema({
    role: String,
    module : String,
    resource : String,
    permissions : Array,
    update_by : String
},{timestamps:true});

//Create a model using it
module.exports = mongoose.model('adminPermissions', objSchema, 'adminPermissions');