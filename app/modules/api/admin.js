/**
 * API path: /api/admin
 */
const express = require("express")
const api = express()

const mdw = function(req, res, next) {
	const admin_userdata = req.session.admin_userdata;
	if (ctypeof(admin_userdata) !== 'object' || Object.keys(admin_userdata).length <=0) {
		return res.json({status:"Forbidden"});
	}
	return next();
};

/* API setup menu top|left, language vn|en, view_as if role is root
 *  
 * @param Object req body{zsl_menu|zsl_language|view_as}
 * @param Object res
 *
 * @return json status 0|1
 */
api.post('/apply_setting',mdw, async function (req, res) {
	try{
		let dataPost = {...req.body}
        if(['top','left'].includes(dataPost.zsl_menu)){
            req.session.menu_layout = dataPost.zsl_menu
        }
		return res.json({'status':1})
	}catch(e){
		console.log(e);
		return res.json({'status':0,'data':e.message});
	}
	
});

module.exports = api