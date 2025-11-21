const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// create a schema
const objSchema = new Schema(
	{
		name: String,
		data_request: { type: Object, default: {} },
		data_response: { type: Object, default: {} },
		status: { type: Number, default: 0 },
		update_by: String,
	},
	{ timestamps: true }
);

//Create a model using it
module.exports = mongoose.model("acds", objSchema, "acds"); // model name, schema name, collection name
