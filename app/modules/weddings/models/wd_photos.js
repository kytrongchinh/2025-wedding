const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// create a schema
const objSchema = new Schema(
	{
		name: String,
		image: String,
		thumb: String,
		link: String,
		from: String,
		tags: { type: Object, default: [] },
		status: { type: Number, default: 0 },
		weight: { type: Number, default: 0 },
		is_hot: { type: Number, default: 0 },
		update_by: String,
	},
	{ timestamps: true }
);

//Create a model using it
module.exports = mongoose.model("wd_photos", objSchema, "wd_photos"); // model name, schema name, collection name
