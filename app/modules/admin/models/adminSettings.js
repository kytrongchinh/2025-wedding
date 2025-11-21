var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var settingSchema = new Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    value: String,
    description: String,
    is_system: Boolean,
    update_by: String
},{timestamps:true});

var adminSettings = mongoose.model('adminSettings', settingSchema, 'adminSettings'); // model name, schema name, collection name
module.exports = adminSettings;
