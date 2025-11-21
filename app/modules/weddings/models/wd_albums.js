const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// create a schema
const objSchema = new Schema(
	{
		name: String,
		link: String,
		status: String,
		thumb: String,
		image: String,
		tags: { type: Object, default: [] },
		weight: { type: Number, default: 0 },
		is_hot: { type: Number, default: 0 },
		update_by: String,
	},
	{ timestamps: true }
);

//Create a model using it
module.exports = mongoose.model("wd_albums", objSchema, "wd_albums"); // model name, schema name, collection name
