'use strict';

var express = require('express');

var adminModel = require('../models');
var mod_config = {
	module : 'admin',
	resource : 'resources',
	collection : 'adminResources',
	route : `${appConfig.adminRouter}/resources`,
	view : 'resources',
	alias : 'Resources'
};

var resources = express.Router();
resources.get('/', async function(req, res) {
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
		return res.render('./'+mod_config.module+'/'+mod_config.view+'/list', dataView);
	} catch (e) {
		console.log(e);
		req.flash('msg_error','Has Error');
		return res.redirect(_adminUrl);
	}
});

//Get add
resources.get('/add', async function(req, res){
	var dataView = helpers.admin.get_data_view_admin(req,mod_config);
	try {
		//assign data
		var fields = await adminModel.get_fields(mod_config,'__v');
		dataView.field_keys = Object.keys(fields);
		dataView.perm_default = appConfig.perm_default;
		dataView.modules_list = await adminModel.findAll('adminModules',{},'',{name:1});
		res.render('./admin/'+mod_config.view+'/add', dataView);
	} catch (e) {
		req.flash('msg_error','Error: Get Add '+mod_config.alias);
		return helpers.base.redirect(res,mod_config.route);
	}
});

//Post add
resources.post('/add', async function(req, res){
	try {
		//validation
		var post_data = req.body;
		req.flash('post_data',post_data);

		//validation
		var validator = new helpers.validate();
		validator.isFormat(post_data.name,2,'Resource incorrect format [A-Za-z_0-9]');
		validator.isFormat(post_data.module,3,'Module incorrect format [A-Za-z_0-9]');
		var valid_error = validator.hasErrors();
		if(valid_error.length > 0){
			req.flash('valid_errors',valid_error);
			return helpers.base.redirect(res,mod_config.route+'/add');
		}

		//check exists
		var record = await adminModel.findOne(mod_config.collection,{'name': post_data.name,'module': post_data.module});
		if(record){
			req.flash('msg_error','Resource already exists');
			return helpers.base.redirect(res,mod_config.route+'/add');
		}

		var dataAdd = post_data;
		dataAdd.update_by = helpers.admin.get_update_by(req);

		//create
		var create = await adminModel.create(mod_config.collection, dataAdd, true);
		if(create.status){
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
resources.get('/edit/:id', async function (req, res) {
	try {
		var dataView = helpers.admin.get_data_view_admin(req,mod_config);

		//validate
		var validator = new helpers.validate();
		var valid_error = validator.isObjectId(req.params.id,'Invalid ID').hasErrors();
		if(valid_error.length > 0){
			req.flash('msg_error',valid_error[0]);
			return helpers.base.redirect(res,mod_config.route);
		}

		var record = await adminModel.findOne(mod_config.collection,{'_id':req.params.id});
		if (record) {
			var fields = await adminModel.get_fields(mod_config,'__v');
			dataView.field_keys = Object.keys(fields);
			dataView.data_edit = record;
			dataView.perm_default = helpers.base.arrayUnique(appConfig.perm_default.concat(record.permissions));
			return res.render('./admin/'+mod_config.view+'/edit', dataView);
		}else{
			req.flash('msg_error', 'Data null');
			return helpers.base.redirect(res,mod_config.route+'/add');
		}
	} catch(e) {
		console.log(e.message);
		return helpers.base.redirect(res,mod_config.route);
	}
});

//post edit
resources.post('/edit/:id', async function (req, res) {
	try {
		var post_data = req.body;
		req.flash('post_data',post_data);
		//validation
		var validator = new helpers.validate();
		validator.isObjectId(post_data._id,'Invalid ID');
		validator.equals(post_data._id,req.params.id,'Invalid ID');
		var valid_error = validator.hasErrors();
		if(valid_error.length > 0){
			req.flash('msg_error',valid_error);
			return helpers.base.redirect(res,mod_config.route);
		}

		var dataUpdate = {
			default_fields : (post_data.default_fields == undefined) ? [] : post_data.default_fields,
			permissions : (post_data.permissions == undefined) ? [] : post_data.permissions,
			collection_name : (post_data.collection_name == undefined) ? '' : post_data.collection_name,
			update_by : helpers.admin.get_update_by(req)
		};

		var conditions = {'_id': post_data._id};
		var update = await adminModel.updateOne(mod_config.collection, conditions, dataUpdate);
		if(update.status){
			req.flash('msg_success','Edit success.');
			return helpers.base.redirect(res,mod_config.route);
		} else {
			req.flash('msg_error','Has error.');
			return helpers.base.redirect(res,mod_config.route+'/edit/'+req.params.id);
		}
	} catch(e) {
		console.log(e);
		req.flash('msg_error',e.message);
		return helpers.base.redirect(res,mod_config.route);
	}
});

//GET import
resources.get('/import', function(req, res){
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
resources.post('/import', async function(req, res){
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
resources.get('/export', async function(req, res){
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
resources.post('/export', async function(req, res){
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
resources.post('/delete', async function (req, res) {
	var post_data = req.body;
	if(post_data != null && !post_data.listViewId){
		req.flash('msg_error','Delete error.');
		return helpers.base.redirect(res,mod_config.route);
	}

	try	{
		var resource_data = await adminModel.find(mod_config.collection,{ _id: { $in: post_data.listViewId }},'-_id name module collection_name');
		var condition_resource = [];
		var condition_menu = [];
		resource_data.forEach(function(item){
			condition_resource.push(item.name);
			condition_menu.push(item.module+'/'+item.name);
		});

		var condition = { _id: { $in: post_data.listViewId } };
		var del = await adminModel.deleteMany(mod_config.collection,condition);
		if(del.status){
			//remove permissions
			await adminModel.deleteMany('adminPermissions',{ resource: { $in: condition_resource } });
			//remove menus
			await adminModel.deleteMany('adminMenus',{ link: { $in: condition_menu } });
			//remove files
			if(appConfig.env == 'dev'){
				//helpers.file.removeResource(resource_data);
			}

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
resources.get('/detail/:_id', async function(req, res){
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

module.exports = resources;