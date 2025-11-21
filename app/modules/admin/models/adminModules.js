var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var objSchema = new Schema({
    name: String,
    route: String,
    status: Boolean,
    update_by: String
},{timestamps:true});
module.exports = mongoose.model('adminModules',objSchema,'adminModules'); // model name, schema name, collection name
