const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// create a schema
const objSchema = new Schema({
	name:String,
	from:String,
	content:String,
	invite:String,
	status:String,
	update_by:String
},{timestamps:true});

//Create a model using it
module.exports = mongoose.model('wd_messages',objSchema,'wd_messages'); // model name, schema name, collection name
