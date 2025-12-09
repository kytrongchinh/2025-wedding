const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// create a schema
const objSchema = new Schema(
	{
		name: String,
		slug_name: String,
		phone: String,
		title: String,
		link: String,
		thumb: String,
		qr: String,
		accept: { type: Boolean, default: false },
		from: String,
		status: { type: Number, default: 0 },
		update_by: String,
	},
	{ timestamps: true }
);

//Create a model using it
module.exports = mongoose.model("wd_invitees", objSchema, "wd_invitees"); // model name, schema name, collection name
