const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// create a schema
const objSchema = new Schema(
	{
		name: String,
		uid: String,
		from: String,
		ip: String,
		user: { type: mongoose.Schema.Types.ObjectId, ref: "ml_users" },
		path: String,
		user_agent: String,
		date: String,
		time: String,
		data: Object,
		result: Object,
		month: String,
		type: String,
		status: {
			type: Number,
			default: 0,
			// required: true, // Add required validation to the status field to ensure it's always present and non-empty.
		},
		update_by: String,
	},
	{ timestamps: true }
);

//Create a model using it
module.exports = mongoose.model("cp_logs", objSchema, "cp_logs"); // model name, schema name, collection name
