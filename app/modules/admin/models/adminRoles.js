var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var objSchema = new Schema({
    role:{
        type : String,
        required : true,
        unique : true,
        lowercase : true
    },
    name: String,
    weight : Number,
    status : Boolean,
    update_by: String
},{timestamps:true});

module.exports = mongoose.model('adminRoles',objSchema,'adminRoles'); // model name, schema name, collection name