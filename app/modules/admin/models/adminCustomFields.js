var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var objSchema = new Schema({
    module : String,
    resource : String,
    role : String,
    custom_fields : Array,
    update_by : String
},{timestamps:true});
module.exports = mongoose.model('adminCustomFields',objSchema,'adminCustomFields'); // model name, schema name, collection name