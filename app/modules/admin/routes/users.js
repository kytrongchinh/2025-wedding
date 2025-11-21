'use strict';

var express = require('express');

var users = express.Router();

var adminModel = require('../models');
var mod_config = {
	module: 'admin',
	resource : 'users',
	collection : 'adminUsers',
	route : `${appConfig.adminRouter}/users`,
	view : 'users',
	alias : 'Users'
};

users.get('/', async function(req, res) {
	try {
		var page = parseInt(req.query.page);
		if(isNaN(page) || page <= 0) page = 1;

		var dataView = helpers.admin.get_data_view_admin(req,mod_config);
		var fields = await adminModel.get_fields(mod_config,'__v update_by',dataView.role);
		var conditions = helpers.admin.filterQuery(req.query, fields);
		if(typeof conditions.username == 'undefined') conditions.username = {};
		if(typeof conditions.role == 'undefined') conditions.role = {};
		conditions.username.$ne =  req.session.admin_userdata.username;
		conditions.role.$ne =  'root';
		var query_string = helpers.admin.build_query(req.query);
		var limit = appConfig.grid_limit;
		var skip = limit * (page - 1);
		var sort = { createdAt: -1 };
		var select = Object.keys(fields).join(' ');
		var query_link = _baseUrl + mod_config.route + '?' + query_string;
		var totals = await adminModel.count(mod_config.collection,conditions);
		var paginator = helpers.admin.pagination(query_link,page,totals,limit);

		//get data
		dataView.lists = (totals > 0) ? await adminModel.find(mod_config.collection,conditions,select,sort,limit,skip) : [];

		//check permission using display button
		dataView.perms = req.session.admin_userdata.perms;
		dataView.fields = fields;
		dataView.output_paging = paginator.render();
		dataView.total_record = totals;
		dataView.query_get = req.query;
		dataView.query_string = query_string;
		return res.render('./'+mod_config.module+'/'+mod_config.view+'/list', dataView);
	} catch (e) {
		console.log(e);
		req.flash('msg_error','Has Error');
		return res.redirect(_adminUrl);
	}
});

//Get add
users.get('/add', async function(req, res){
	try {
		var dataView = helpers.admin.get_data_view_admin(req,mod_config);
		var ignore_fields = '__v update_by createdAt updatedAt email verify login_incorrect login_time';
		dataView.fields = await adminModel.get_fields(mod_config,ignore_fields);
		res.render('./'+mod_config.module+'/'+mod_config.view+'/add', dataView);
	} catch (e) {
		console.log(e);
		req.flash('msg_error',e.message);
		return helpers.base.redirect(res,mod_config.route);
	}
});

//Post add
users.post('/add', async function(req, res){
	try {
		var post_data = req.body;
		req.flash('post_data',post_data);

		var validator = new helpers.validate();
	    validator.isFormatUsername(post_data.username);
	    validator.isFormatPassword(post_data.password);
	    validator.notEmpty(post_data.fullname,'fullname không được bỏ trống');
		validator.checkBody('status','isBoolean',req);
		var valid_error = validator.hasErrors();
		if(valid_error.length > 0){
			req.flash('valid_errors',valid_error);
			return helpers.base.redirect(res,mod_config.route+'/add');
		}

		if(appConfig.role_systems.indexOf(post_data.role) == -1){
			req.flash('valid_errors',"Invalid Role");
			return helpers.base.redirect(res,mod_config.route+'/add');
		}

		//check exists
		var record = await adminModel.findOne(mod_config.collection,{'username': post_data.username});
		if(record){
			req.flash('valid_errors','Username already exists');
			return helpers.base.redirect(res,mod_config.route+'/add');
		}

		var dataAdd = adminModel.filterData(mod_config.collection,post_data,'__v');
		dataAdd.update_by = helpers.admin.get_update_by(req);
		dataAdd.password = await helpers.hash.hash_password(post_data.password);
		dataAdd.avatar = 'public/admin/images/avatar/unknown.jpg';

		//create
		var create = await adminModel.create(mod_config.collection, dataAdd);
		if(create.status === true){
			//add permission dashboard for role
			//check exists
			var countPerm = await adminModel.count('adminPermissions',{'role': post_data.role,"module" : "admin","resource" : "dashboard"});
			if(countPerm == 0){
				var dataPerm = {
					"role" : post_data.role,
					"module" : "admin",
					"resource" : "dashboard",
					"permissions" : [
						"view",
						"update-profile"
					]
				};
				await adminModel.create('adminPermissions', dataPerm);
			}
			req.flash('msg_success','Add success');
			return helpers.base.redirect(res,mod_config.route);
		} else {
			req.flash('msg_error',create.msg);
			return helpers.base.redirect(res,mod_config.route+'/add');
		}
	} catch(e) {
		console.log(e);
		req.flash('msg_error',e.message);
		return helpers.base.redirect(res,mod_config.route+'/add');
	}
});

//Get edit
users.get('/edit/:id', async function (req, res) {
	try {
		//validate
		var validator = new helpers.validate();
		var valid_error = validator.isObjectId(req.params.id,'Invalid ID').hasErrors();
		if(valid_error.length > 0){
			req.flash('msg_error',valid_error[0]);
			return helpers.base.redirect(res,mod_config.route);
		}

		var record = await adminModel.findOne(mod_config.collection,{'_id':req.params.id});
		if (record) {
			var dataView = helpers.admin.get_data_view_admin(req,mod_config);
			var ignore_fields = '__v username role status update_by createdAt updatedAt avatar email verify login_incorrect login_time password';
			dataView.fields = await adminModel.get_fields(mod_config, ignore_fields);
			dataView.data_edit = dataView.post_data.length > 0 ? dataView.post_data[0] : record;
			return res.render('./'+mod_config.module+'/'+mod_config.view+'/edit', dataView);
		}else{
			req.flash('msg_error', 'Data does not exist');
			return helpers.base.redirect(res,mod_config.route);
		}
	} catch(e) {
		console.log(e.message);
		req.flash('msg_error', 'Error: '+e.message);
		return helpers.base.redirect(res,mod_config.route);
	}
});

//post edit
users.post('/edit/:id', async function (req, res) {
	try {
		var post_data = req.body;
		req.flash('post_data',post_data);

		//validation
		var validator = new helpers.validate();
		validator.isNumeric(req.body.status,'Status invalid');
		var valid_error = validator.hasErrors();
		if(valid_error?.length > 0){
			req.flash('valid_errors',valid_error);
			return helpers.base.redirect(res,mod_config.route+'/edit/'+req.params.id);
		}

		if(!post_data._id || post_data._id != req.params.id){
			req.flash('msg_error','Invalid ID');
			return helpers.base.redirect(res,mod_config.route);
		}

		//check exists
		var where = {
			username : {$eq:post_data.username.trim()},
			_id : {$not:{$eq:post_data._id}}
		};

		var record = await adminModel.findOne(mod_config.collection,where);
		if(record){
			req.flash('msg_error','username already exists');
			return helpers.base.redirect(res,mod_config.route+'/edit/'+req.params.id);
		}
		var dataUpdate = await adminModel.filterData(mod_config.collection,post_data,'__v _id');
		dataUpdate.update_by = helpers.admin.get_update_by(req);
		dataUpdate.avatar = 'public/admin/images/avatar/unknown.jpg';
		if(post_data.update_password == 1){
			var password_error = validator.isFormatPassword(post_data.password,'Mật khẩu phải từ 6-30 ký tự, tối thiểu 1 chữ hoa, 1 chữ thường, 1 chữ số').hasErrors();
			if(password_error?.length>0){
				req.flash('valid_errors',password_error);
				return helpers.base.redirect(res,mod_config.route+'/edit/'+req.params.id);
			}else{
				dataUpdate.password = await helpers.hash.hash_password(post_data.password);
			}
		}else{
			delete dataUpdate.password;
		}

		var conditions = {'_id': req.params.id};
		var update = await adminModel.updateOne(mod_config.collection, conditions, dataUpdate);

		if(update.status){
			req.flash('msg_success','Edit success.');
			return helpers.base.redirect(res,mod_config.route);
		} else {
			req.flash('msg_error',update.msg);
			return helpers.base.redirect(res,mod_config.route+'/edit/'+req.params.id);
		}

	} catch(e) {
		console.log(e.message);
		req.flash('msg_error',e.message);
		return helpers.base.redirect(res,mod_config.route);
	}

});

//GET import
users.get('/import', function (req, res) {
    try {
        var dataView = helpers.admin.get_data_view_admin(req, mod_config);
        res.render('./layout/partial/import', dataView);
    } catch (e) {
        console.log(e);
        req.flash('msg_error', e.message);
        return helpers.base.redirect(res, mod_config.route);
    }
});

/** POST import
 *
 */
users.post('/import', async function (req, res) {
    try {
        let postData = {...req.body};
        let data = JSON.parse(postData.data)
        //validate data fields
        let fields = await adminModel.get_fields(mod_config,'__v');
        let valid = helpers.admin.valid_import_data(fields,data);
        if(valid === true){
            let insertData = await adminModel.insertMany(mod_config.collection,data);
            if(insertData.status === true){
                return res.json({status: 'Success'});
            }else{
                return res.json({status: insertData.msg});
            }
        }else{
            clog(valid)
            return res.json({status: 'Invalid data'});
        }
    } catch (e) {
        clog(e);
        return res.json({ status: e.message });
    }
});

//GET Export
users.get('/export', async function(req, res){
	try {
		var fields = await adminModel.get_fields(mod_config,'__v');
		var field_keys = Object.keys(fields);
        var dataView = helpers.admin.get_data_view_admin(req, mod_config);
        dataView.field_keys = field_keys;
        dataView.fields = fields;
        res.render('./layout/partial/export', dataView);
    } catch (e) {
        console.log(e);
        req.flash('msg_error', e.message);
        return helpers.base.redirect(res, mod_config.route);
    }
});

// POST Export
users.post('/export', async function(req, res){
	try {
        const dataPost = {...req.body};

        let offset = helpers.base.parseInteger(dataPost.offset)
        if(offset == 0) offset = 1;
        const limit = appConfig.export_limit || 50
        const skip = parseInt((offset-1) * limit);

        const filterData = JSON.parse(dataPost.data);
        const columns = Object.keys(filterData)
        const fields = await adminModel.get_fields(mod_config,'__v');
        if(ctypeof(columns) !== 'array' || columns.length == 0 || !helpers.base.arrayContainsArray(columns,Object.keys(fields))){
            return res.json({error:1, msg:'Invalid column'})
        }

        const conditions = helpers.admin.buildQuery(filterData, fields);
        const data = await adminModel.find(mod_config.collection, conditions,columns.join(' '),{},limit,skip);
        let convertData = []
        if(data && data.length > 0){
            for(let i=0; i< data.length;i++){
                let item = []
                for (let j = 0; j < columns.length; j++) {
                    let field_type = fields[columns[j]];
                    item.push(helpers.admin.convertDataExport(data[i][columns[j]],field_type));
                }
                convertData.push(item)
            }
        }
        return res.json({error:0, data:convertData, msg:'Success'})
    } catch (e) {
        clog(e)
        return res.json({error:1, msg:e.message})
    }
});

//delete
users.post('/delete', async function (req, res) {
	var post_data = req.body;
	if(post_data != null && !post_data.listViewId){
		req.flash('msg_error','Delete error.');
		return helpers.base.redirect(res,mod_config.route);
	}

	try	{
		var condition = { _id: { $in: post_data.listViewId } };
		var del = await adminModel.deleteMany(mod_config.collection,condition);
		if(del.status){
			req.flash('msg_success' , "Delete success.");
		}else{
			req.flash('msg_error' , "Delete fail.");
		}
		return helpers.base.redirect(res,mod_config.route);
	} catch(e){
		console.log(e);
		req.flash('msg_error',e.message);
		return helpers.base.redirect(res,mod_config.route);
	}
});

//Get detail
users.get('/detail/:_id', async function(req, res){
    try {
        //validate
        var validator = new helpers.validate();
        var valid_error = validator.isObjectId(req.params._id,'ID must be ObjectID').hasErrors();
        if(valid_error.length > 0){
            req.flash('msg_error',valid_error);
            return helpers.base.redirect(res,mod_config.route);
        }

        var dataView = helpers.admin.get_data_view_admin(req,mod_config);
        var record = await adminModel.findOne(mod_config.collection,{'_id':req.params._id});
        if (record) {
            dataView.fields = await adminModel.get_fields(mod_config, '__v');
            dataView.data_detail = dataView.post_data.length > 0 ? dataView.post_data :record;
            res.render('./layout/partial/view', dataView);
        }else{
            req.flash('msg_error', 'Data null');
            return helpers.base.redirect(res,mod_config.route);
        }
    } catch(e) {
        req.flash('msg_error',e.message);
        return helpers.base.redirect(res,mod_config.route);
    }
});
module.exports = users;
