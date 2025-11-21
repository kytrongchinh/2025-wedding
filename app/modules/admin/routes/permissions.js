'use strict';

var express = require('express');

var adminModel = require('../models');
var mod_config = {
	module : 'admin',
	resource : 'permissions',
	collection : 'adminPermissions',
	route : `${appConfig.adminRouter}/permissions`,
	view : 'permissions',
	alias : 'Permissions'
};

var permissions = express.Router();
permissions.get('/', async function(req, res) {
	try {

		var page = parseInt(req.query.page);
		if(isNaN(page) || page <= 0) page = 1;

		var dataView = helpers.admin.get_data_view_admin(req,mod_config);
		var fields = await adminModel.get_fields(mod_config,'__v update_by',dataView.role);
		var conditions = helpers.admin.filterQuery(req.query, fields);
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
		dataView.modules_list = await adminModel.findAll('adminModules',{},'',{name:1});
		dataView.resources_list = await adminModel.findAll('adminResources',{},'',{name:1});
		return res.render('./'+mod_config.module+'/'+mod_config.resource+'/list', dataView);
	} catch (e) {
		console.log(e);
		req.flash('msg_error','Error: '+e.message);
		return res.redirect(_adminUrl);
	}
});

//Get Add Data
permissions.get('/add', async function(req, res){
	try {
		var dataView = helpers.admin.get_data_view_admin(req,mod_config);
		dataView.fields = await adminModel.get_fields(mod_config,'__v update_by');
		dataView.roles_list = await adminModel.findAll('adminRoles',{role:{$ne:'root'}},'role name');
		dataView.modules_list = await adminModel.findAll('adminModules',{},'',{name:1});
		dataView.resources_list = await adminModel.findAll('adminResources',{},'',{name:1});
		res.render('./'+mod_config.module+'/'+mod_config.view+'/add', dataView);
	} catch (e) {
		console.log(e);
		req.flash('msg_error',e.message);
		return helpers.base.redirect(res,mod_config.route);
	}
});

//Post Add Data
permissions.post('/add', async function(req, res){
	try {
		var post_data = req.body;
		req.flash('post_data',post_data);

		//validate
		var validator = new helpers.validate();
		var valid_error = validator.checkBody('module','notEmpty',req).checkBody('resource','notEmpty',req).checkBody('role','notEmpty',req).hasErrors();
		if(valid_error.length > 0){
			req.flash('valid_errors',valid_error);
			return helpers.base.redirect(res,mod_config.route+'/add');
		}

		//check exist
		var record = await adminModel.findOne('adminPermissions',{'module': post_data.module,'resource': post_data.resource,'role':post_data.role});
		if(record){
			req.flash('msg_error','Permission for role already exists');
			return helpers.base.redirect(res,mod_config.route+'/add');
		}

		//filter data
		let dataAdd = await adminModel.filterData(mod_config.collection,post_data,'__v');
		dataAdd.update_by = helpers.admin.get_update_by(req);

		// create
		var create = await adminModel.create('adminPermissions',dataAdd);
		if(create.status){
			req.flash('msg_success','Add success');
			return helpers.base.redirect(res,mod_config.route);
		}else{
			req.flash('msg_error',create.msg);
			return helpers.base.redirect(res,mod_config.route+'/add');
		}
	} catch(e){
		console.log(e);
		req.flash('msg_error',e.message);
		return helpers.base.redirect(res,mod_config.route+'/add');
	}
});

//Get Edit Data
permissions.get('/edit/:id', async function (req, res) {
	try {
		//validate ID
		var validator = new helpers.validate();
		var valid_error = validator.isObjectId(req.params.id,'Invalid ID').hasErrors();
		if(valid_error.length > 0){
			req.flash('msg_error',valid_error[0]);
			return helpers.base.redirect(res,mod_config.route);
		}
		var dataView = helpers.admin.get_data_view_admin(req,mod_config);
		dataView.resources_list = await adminModel.findAll('adminResources',{},'',{name:1});
		dataView.modules_list = await adminModel.findAll('adminModules',{},'',{name:1});

		var record = await adminModel.findOne(mod_config.collection,{'_id':req.params.id});
		let permission_resources = await adminModel.findOne('adminResources',{'module':record.module,'name':record.resource},'permissions');
		if (record) {
			//var fields = await adminModel.get_fields(mod_config,'__v');
			//dataView.field_keys = Object.keys(fields);
			dataView.data_edit = record;
			dataView.permission_resources = (permission_resources) ? permission_resources.permissions : [];
			return res.render('./'+mod_config.module+'/'+mod_config.view+'/edit', dataView);
		} else {
			req.flash('msg_error', 'Data null');
			return helpers.base.redirect(res,mod_config.route);
		}
	} catch(e) {
		console.log(e);
		req.flash('msg_error', e.message);
		return helpers.base.redirect(res,mod_config.route);
	}
});

//Post Edit Data
permissions.post('/edit/:id', async function (req, res) {
	try {
		var post_data = req.body;
		req.flash('post_data',post_data);

		if(post_data._id != req.params.id){
			req.flash('msg_error','Invalid ID.');
			return helpers.base.redirect(res,mod_config.route);
		}

		var dataUpdate = {
			'permissions': (post_data.permissions === undefined) ? [] : post_data.permissions,
			'update_by': helpers.admin.get_update_by(req)
		};

		var conditions = {
			'_id': req.params.id
		};

		let update = await adminModel.updateOne(mod_config.collection, conditions, dataUpdate);
		if(update.status === true){
			req.flash('msg_success','Edit success.');
			return helpers.base.redirect(res,mod_config.route);
		} else {
			req.flash('msg_error','Edit error.');
			return helpers.base.redirect(res,mod_config.route+'/edit/'+req.params.id);
		}

	} catch(e) {
		console.log(e);
		req.flash('msg_error',e.message);
		return helpers.base.redirect(res,mod_config.route);
	}
});

//GET import
permissions.get('/import', function(req, res){
    try {
        var dataView = helpers.admin.get_data_view_admin(req,mod_config);
        res.render('./layout/partial/import', dataView);
    } catch (e) {
        console.log(e);
        req.flash('msg_error',e.message);
        return helpers.base.redirect(res,mod_config.route);
    }
});

/** POST import
 *
 */
permissions.post('/import', async function(req, res){
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

//GET export
permissions.get('/export', async function(req, res){
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

//POST Export
permissions.post('/export', async function(req, res){
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

//Post Update Data
permissions.post('/update', async function (req, res) {
	var post_data = req.body;
	var update_by = helpers.admin.get_update_by(req);
	Object.keys(post_data).forEach(function(key){
		var dataUpdate = {
			'permissions': post_data[key],
			'update_by': update_by
		};
		var conditions = {
			'_id': key
		};
		adminModel.updateOne(mod_config.collection, conditions, dataUpdate);
	});
	return helpers.base.redirect(res,mod_config.route);
});

//Post Delete Data
permissions.post('/delete', async function (req, res) {
	var post_data = req.body;
	if(post_data != null && !post_data.listViewId){
		req.flash('msg_error','Delete error.');
		return helpers.base.redirect(res,mod_config.route);
	}

	try	{
		let condition = { _id: { $in: post_data.listViewId } };
		let del = await adminModel.deleteMany(mod_config.collection,condition);
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



module.exports = permissions;