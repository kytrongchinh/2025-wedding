var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objSchema = new Schema({
    name: String,
    module: String,
    collection_name: String,
    default_fields: Array,
    permissions: Array,
    update_by: String
},{timestamps:true});

//Create a model using it
module.exports = mongoose.model('adminResources',objSchema,'adminResources'); // model name, schema name, collection name