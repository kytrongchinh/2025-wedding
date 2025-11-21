const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// create a schema
const userSchema = new Schema({
    avatar : String,
    fullname: String,
    username: {
        'type': String,
        'required': true,
        'unique': true,
        'index': true
    },
    password: {
        'type': String,
        'required': true
    },
    role: {
        'type': String,
        'default': 'guest'
    },
    login_incorrect : {
        'type': Number,
        'default': 0
    },
    login_time : {
        'type': Number,
        'default': 0
    },
    login_info : {
        'type' : Object,
        'default': {}
    },
    is2FAEnabled : {
        'type' : Boolean,
        'default': false
    },
    secret2FA : {
        'type' : String,
        'default': ''
    },
    status: {
        'type' : Boolean,
        'default': false
    },
    update_by: String
},{timestamps:true});

const adminUsers = mongoose.model('adminUsers', userSchema, 'adminUsers'); // model name, schema name, collection name
module.exports = adminUsers;