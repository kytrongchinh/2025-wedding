var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var objSchema = new Schema({
    link: String,
    name: String,
    parent_id: String,
    weight: Number,
    icon: String,
    is_dashboard: Boolean,
    status: Boolean,
    update_by: String
},{timestamps:true});
module.exports = mongoose.model('adminMenus',objSchema,'adminMenus'); // model name, schema name, collection name
