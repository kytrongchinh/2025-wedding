'use strict';
var express = require('express');

let adminModel = require('../models');
let mod_config = {
	module: 'admin',
	resource: 'modules',
	collection: 'adminModules',
	route : `${appConfig.adminRouter}/modules`,
	view: 'modules',
	alias: 'Modules'
};

var modules = express.Router();
modules.get('/', async function (req, res) {
	try {
		var page = parseInt(req.query.page);
		if (isNaN(page) || page <= 0) page = 1;

		let dataView = helpers.admin.get_data_view_admin(req, mod_config);
		let fields = await adminModel.get_fields(mod_config, '__v update_by',dataView.role);
		let field_keys = Object.keys(fields);
		
		let conditions = helpers.admin.filterQuery(req.query, fields);
		var query_string = helpers.admin.build_query(req.query);

		let limit = appConfig.grid_limit;
		let skip = limit * (page - 1);
		let sort = { createdAt: -1 };
		let select = field_keys.join(' ');
		let query_link = _baseUrl + '/' + mod_config.route + '?' + query_string;
		let totals = await adminModel.count(mod_config.collection, conditions);
		let paginator = helpers.admin.pagination(query_link, page, totals, limit);

		//get data
		dataView.lists = (totals > 0) ? await adminModel.find(mod_config.collection, conditions, select, sort, limit, skip) : [];

		//check permission using display button
		dataView.perms = req.session.admin_userdata.perms;
		dataView.fields = fields;
		dataView.field_keys = field_keys;
		dataView.output_paging = paginator.render();
		dataView.total_record = totals;
		dataView.query_get = req.query;
		dataView.query_string = query_string;
		return res.render('./admin/'+mod_config.view+'/list', dataView);
	} catch (e) {
		req.flash('msg_error','Error: '+e.message);
		return res.redirect(_adminUrl);
	}
});

//Get add
modules.get('/add', async function(req, res){
	let dataView = helpers.admin.get_data_view_admin(req,mod_config);
	try {
		//assign data
		let fields = await adminModel.get_fields(mod_config,'__v');
		dataView.field_keys = Object.keys(fields);
		dataView.modules_list = await adminModel.findAll('adminModules',{},'',{name:1});
		res.render('./admin/'+mod_config.view+'/add', dataView);
	} catch (e) {
		req.flash('msg_error','Error: Get Add '+mod_config.alias);
		return helpers.base.redirect(res,mod_config.route);
	}
});

//Post add
modules.post('/add', async function(req, res){
	let dataView = helpers.admin.get_data_view_admin(req,mod_config);
	try {
		let fields = await adminModel.get_fields(mod_config,'__v');
		dataView.field_keys = Object.keys(fields);
		//validation
		let post_data = req.body;
		dataView.post_data = post_data;

		if(!post_data.name && !post_data.route){
			req.flash('msg_error','Field name, route is required');
			req.flash('post_data',post_data);
			return helpers.base.redirect(res,mod_config.route+'/add');
		}

		//check exists
		let record = await adminModel.findOne(mod_config.collection,{'name': post_data.name});
		if(record){
			req.flash('msg_error','Resource already exists');
			req.flash('post_data',post_data);
			return helpers.base.redirect(res,mod_config.route+'/add');
		}

		let dataAdd = post_data;
		dataAdd.update_by = helpers.admin.get_update_by(req);

		//create
		let create = await adminModel.create(mod_config.collection, dataAdd, true);
		if(create.status){
			req.flash('msg_success','Add success');
			return helpers.base.redirect(res,mod_config.route);
		} else {
			req.flash('msg_error',create.msg);
			req.flash('post_data',post_data);
			return helpers.base.redirect(res,mod_config.route+'/add');
		}
	} catch(e) {
		console.log(e);
		return helpers.base.redirect(res,mod_config.route+'/add');
	}
});

//Get edit
modules.get('/edit/:id', async function (req, res) {
	let dataView = helpers.admin.get_data_view_admin(req,mod_config);
	if (req.params.id) {
		try {
			let record = await adminModel.findOne(mod_config.collection,{'_id':req.params.id});
			if (record) {
				let fields = await adminModel.get_fields(mod_config,'__v');
				dataView.field_keys = Object.keys(fields);
				dataView.data_edit = record;
				return res.render('./admin/'+mod_config.view+'/edit', dataView);
			}else{
				req.flash('msg_error', 'Data null');
				return helpers.base.redirect(res,mod_config.route);
			}
		} catch(e) {
			console.log(e.message);
			return helpers.base.redirect(res,mod_config.route);
		}
	} else {
		return helpers.base.redirect(res,mod_config.route);
	}
});

//post edit
modules.post('/edit/:id', async function (req, res) {
	let post_data = req.body;
	if(!post_data._id || post_data._id != req.params.id){
		req.flash('msg_error','Invalid ID');
		return helpers.base.redirect(res,mod_config.route);
	}

	try {
		let dataUpdate = post_data;
		dataUpdate.update_by = helpers.admin.get_update_by(req);
		let conditions = {'_id': req.params.id};
		let update = await adminModel.updateOne(mod_config.collection, conditions, dataUpdate);
		if(update.status){
			req.flash('msg_success','Edit success.');
			return helpers.base.redirect(res,mod_config.route);
		} else {
			req.flash('msg_error','Has error.');
			req.flash('post_data',post_data);
			return helpers.base.redirect(res,mod_config.route+'/edit/'+req.params.id);
		}

	} catch(e) {
		console.log(e);
		return helpers.base.redirect(res,mod_config.route);
	}

});

//GET import
modules.get('/import', function (req, res) {
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
modules.post('/import', async function (req, res) {
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
modules.get('/export', async function(req, res){
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
modules.post('/export', async function(req, res){
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
modules.post('/delete', async function (req, res) {
	let post_data = req.body;
	if(post_data != null && !post_data.listViewId){
		req.flash('msg_error','Delete error.');
		return helpers.base.redirect(res,mod_config.route);
	}

	var module_data = await adminModel.find(mod_config.collection,{ _id: { $in: post_data.listViewId }},'-_id name');
	var condition_module = [];
	module_data.forEach(function(item){
		condition_module.push(item.name);
	});
	var resource_data = await adminModel.find('adminResources',{ module: { $in: condition_module }},'-_id name module');
	var condition_menu = [];
	resource_data.forEach(function(item){
		condition_menu.push(item.module+'/'+item.name);
	});

	try	{
		let condition = { _id: { $in: post_data.listViewId } };
		let del = await adminModel.deleteMany(mod_config.collection,condition);
		if(del.status){
			//remove resources
			await adminModel.deleteMany('adminResources',{ module: { $in: condition_module } });
			//remove permissions
			await adminModel.deleteMany('adminPermissions',{ module: { $in: condition_module } });
			//remove menus
			await adminModel.deleteMany('adminMenus',{ link: { $in: condition_menu } });

			//remove files
			if (appConfig.env == 'develop') {
				helpers.file.removeModule(condition_module);
			}

			req.flash('msg_success' , "Delete success.");
		}else{
			req.flash('msg_error' , "Delete fail.");
		}
		return helpers.base.redirect(res,mod_config.route);
	} catch(e){
		console.log(e);
		return helpers.base.redirect(res,mod_config.route);
	}
});

//Get detail
modules.get('/detail/:_id', async function(req, res){
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


//Get add
modules.get('/builder', async function(req, res){
	let dataView = helpers.admin.get_data_view_admin(req,mod_config);
	try {
		//assign data
		let fields = await adminModel.get_fields(mod_config,'__v');
		dataView.field_keys = Object.keys(fields);
		dataView.modules_list = await adminModel.findAll('adminModules',{name : { $ne: 'admin' }},'',{name:1});

		//dataView.modules_list = [];

		res.render('./admin/'+mod_config.view+'/builder', dataView);
	} catch (e) {
		req.flash('msg_error','Error: '+mod_config.alias);
		return helpers.base.redirect(res,mod_config.route);
	}
});

//Get add
modules.post('/reset_module', async function(req, res){
	try{
		const postData = {...req.body};
		if(postData.update == 1){
			helpers.admin.updateModule();
			return res.send({status:1});
		}
	}catch(e){
		clog(e)
		return res.send({status:0});
	}
});

//POST builder
modules.post('/builder', async function(req, res){
	if(!['dev','develop'].includes(process.env.NODE_ENV)){
		req.flash('valid_errors' , "Only builder module on development environment");
		// return helpers.base.redirect(res,mod_config.route+'/builder');
	}

	var post_data = {...req.body};
	req.flash('post_data',post_data);

	var module = (post_data.module_new) ? post_data.module_new : post_data.module;
	var validator = new helpers.validate();
	validator.notEmpty(module, 'Module is required').checkBody('collection', 'notEmpty', req).checkBody('schema', 'notEmpty', req);
	validator.isFormat(post_data.resource, 1, 'Resource incorrect format');
	validator.isFormat(post_data.collection, 1, 'Collection incorrect format');
	validator.isFormat(post_data.schema, 3, 'Schema incorrect format');

	var valid_error = validator.hasErrors();
	if(valid_error.length>0){
		req.flash('valid_errors',valid_error);
		return helpers.base.redirect(res,mod_config.route+'/builder');
	}

	if(module.trim() == 'admin'){
		req.flash('valid_errors','Module Invalid');
		return helpers.base.redirect(res,mod_config.route+'/builder');
	}

	var resource = post_data.resource;
	var collection = post_data.collection;
	var schema = post_data.schema.split(',');
	if(schema.indexOf('update_by') === -1) schema.push('update_by');

	//create module
	var check_module = await adminModel.findOne('adminModules', {'name' : module});
	if(check_module == null){
		var dataAdd = {
			'name' : module,
			'route' : module,
			'status' : 1
		};
		await adminModel.create('adminModules', dataAdd);
	}
	

	//create resource
	dataAdd = {
		'name' : resource,
		'module' : module,
		'collection_name' : collection,
		'default_fields' : [],
		'permissions' : appConfig.perm_default
	};
	await adminModel.create('adminResources', dataAdd);

	//create perm view for root
	// dataAdd = {
	// 	'role' : 'root',
	// 	'module' : module,
	// 	'resource' : resource,
	// 	'permissions' : appConfig.perm_default
	// };
	// await adminModel.create('adminPermissions', dataAdd);

	//create menu
	dataAdd = {
		'name' : module+'_'+resource,
		'link' : module+'/'+resource,
		'parent_id' : '',
		'weight' : 1,
		'icon' : 'fa-circle-o',
		'status' : true,
		'is_dashboard' : false
	};
	await adminModel.create('adminMenus', dataAdd);

	writeModule(module,resource,collection,schema);

	req.flash('msg_success' , "Builder success, Please restart app");
	return helpers.base.redirect(res,mod_config.route+'/builder');	
});

const writeModule = (module,resource,collection,schema) => {
	try {
		const fs = require("fs");
        var dir = _basepath +'app/modules/'+module;
        var dir_routes = _basepath +'app/modules/'+module+'/routes';
        var dir_models = _basepath +'app/modules/'+module+'/models';
        var dir_views = _basepath +'app/views/'+module+'/'+resource;

        fs.mkdirSync(dir, { recursive: true });
        fs.mkdirSync(dir_routes, { recursive: true });
        fs.mkdirSync(dir_models, { recursive: true });
        fs.mkdirSync(dir_views, { recursive: true });

        //create modules/index.js if not exists
        fs.access(dir + '/index.js', fs.constants.F_OK, (err) => {
            if(err){
                var index_content = fs.readFileSync(_basepath+'app/modules/admin/template/index.txt', 'utf8');
                index_content = index_content.replace(/##module_name##/g, module);
                var index_stream = fs.createWriteStream(dir + '/index.js' , {flags: 'w'}).end(index_content);
                index_stream.on('error', (err) => {console.log('err',err);index_stream.end();});
            }
        });

        //create modules/routes/<route_name>
        fs.access(dir_routes + '/'+resource+'.js', fs.constants.F_OK, (err) => {
            if(err){
                var route = module+'/'+resource;
                var route_content = fs.readFileSync(_basepath+'app/modules/admin/template/route.txt', 'utf8');
                route_content = route_content.replace(/##route_name##/g, route).replace(/##resource_name##/g, resource).replace(/##module_name##/g, module).replace(/##collection_name##/g, collection);
                var route_stream = fs.createWriteStream(dir_routes + '/'+resource+'.js' , {flags: 'w'}).end(route_content);
                route_stream.on('error', (err) => {console.log('err',err);route_stream.end();});
            }
        });

        //create modules/models/index.js if not exists
        fs.access(dir_models + '/index.js', fs.constants.F_OK, (err) => {
            if(err){
                var model_content = fs.readFileSync(_basepath+'app/modules/admin/template/model_index.txt', 'utf8');
                var model_stream = fs.createWriteStream(dir_models + '/index.js' , {flags: 'w'}).end(model_content);
                model_stream.on('error', (err) => {console.log('err',err);model_stream.end();});
            }
        });

        //create modules/models/<schemamodel>
        fs.access(dir_models + '/'+collection+'.js', fs.constants.F_OK, (err) => {
            if(err){
                var fields = '';
                schema.forEach(function(item,index){
                    fields += (index == schema.length - 1) ? '\t'+item+':String' : '\t'+item+':String,'+'\n';
                });
                var schema_content = fs.readFileSync(_basepath+'app/modules/admin/template/model_schema.txt', 'utf8');
                schema_content = schema_content.replace(/##collection_name##/g, collection).replace(/<fields>/g, fields);
                var schema_stream = fs.createWriteStream(dir_models + '/'+collection+'.js' , {flags: 'w'}).end(schema_content);
                schema_stream.on('error', (err) => {console.log('err',err);schema_stream.end();});
            }
        });
        

        //create views/<module>/list.js
        fs.access(dir_views + '/list.ejs', fs.constants.F_OK, (err) => {
            if(err){
                var view_list= fs.readFileSync(_basepath+'app/modules/admin/template/view_list.txt', 'utf8');
                var view_list_stream = fs.createWriteStream(dir_views + '/list.ejs' , {flags: 'w'}).end(view_list);
                view_list_stream.on('error', (err) => {console.log('err',err);view_list_stream.end();});
            }
        });
        

        //create views/<module>/add.js
        fs.access(dir_views + '/add.ejs', fs.constants.F_OK, (err) => {
            if(err){
                var view_add = fs.readFileSync(_basepath+'app/modules/admin/template/view_add.txt', 'utf8');
                var view_add_stream = fs.createWriteStream(dir_views + '/add.ejs' , {flags: 'w'}).end(view_add);
                view_add_stream.on('error', (err) => {console.log('err',err);view_add_stream.end();});
            }
        });
        

        //create view add
        fs.access(dir_views + '/edit.ejs', fs.constants.F_OK, (err) => {
            if(err){
                var view_edit = fs.readFileSync(_basepath+'app/modules/admin/template/view_edit.txt', 'utf8');
                var view_edit_stream =fs.createWriteStream(dir_views + '/edit.ejs' , {flags: 'w'}).end(view_edit);
                view_edit_stream.on('error', (err) => {console.log('err',err);view_edit_stream.end();});
            }
        });

		//create view add
        fs.access(dir_views + '/report.ejs', fs.constants.F_OK, (err) => {
            if(err){
                var view_report = fs.readFileSync(_basepath+'app/modules/admin/template/view_report.txt', 'utf8');
                var view_report_stream =fs.createWriteStream(dir_views + '/report.ejs' , {flags: 'w'}).end(view_report);
                view_report_stream.on('error', (err) => {console.log('err',err);view_report_stream.end();});
            }
        });
        

    } catch(e){
        console.log(e.message);
        return false;
    }
}

module.exports = modules;
