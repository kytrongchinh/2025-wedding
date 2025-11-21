'use strict';

var express = require('express');

var moduleModel = require('../models');
var mod_config = {
    module : 'admin',
    resource : 'custom_fields',
    collection : 'adminCustomFields',
    route : 'admin/custom_fields',
    view : 'custom_fields',
    alias : 'custom_fields'
};

var custom_fields = express.Router();
custom_fields.get('/', async function(req, res) {
    var dataView = helpers.admin.get_data_view_admin(req,mod_config);
    try {
        var fields = await moduleModel.get_fields(mod_config,'__v',dataView.role);
        var field_keys = Object.keys(fields);
        var page = (req.query.page) ? (req.query.page) : 1;
        var conditions = helpers.admin.filterQuery(req.query, fields);
        var query_string = helpers.admin.build_query(req.query);
        var limit = appConfig.grid_limit;
        var skip = limit * (page - 1);
        //var sort = { createdAt: -1 };
        var sort = helpers.admin.sortQuery(req.query);
        var select = field_keys.join(' ');
        var query_link = _baseUrl + mod_config.route+ '?' + query_string;
        var totals = await moduleModel.count(mod_config.collection,conditions);
        var paginator = helpers.admin.pagination(query_link,page,totals,limit);

        //assign data
        dataView.lists = [];
        if(totals > 0){
            dataView.lists = await moduleModel.find(mod_config.collection,conditions,select,sort,limit,skip);
        }

        //check permission using display button
        dataView.perms = req.session.admin_userdata.perms;
        dataView.fields = fields;
        dataView.field_keys = field_keys;
        dataView.output_paging = paginator.render();
        dataView.total_record = totals;
        dataView.query_get = req.query;
        dataView.query_string = query_string;
        dataView.curent_url = req.originalUrl;
        dataView.roles_list = await moduleModel.findAll('adminRoles',{},'',{weight:-1});
        return res.render('./'+mod_config.module+'/'+mod_config.view+'/list', dataView);
    } catch (e) {
        console.log(e);
        req.flash('msg_error',e.message);
        return res.redirect(_adminUrl);
    }
});


//Get add
custom_fields.get('/add', async function(req, res){
    try {
        var dataView = helpers.admin.get_data_view_admin(req,mod_config);
        var ignore_fields = '__v';
        var fields = await moduleModel.get_fields(mod_config, ignore_fields);
        dataView.field_keys = Object.keys(fields);
        dataView.roles_list = await moduleModel.findAll('adminRoles',{},'',{name:1});
        dataView.modules_list = await moduleModel.findAll('adminModules',{},'',{name:1});
        //dataView.resources_list = await moduleModel.findAll('adminResources',{},'',{name:1});
        
        res.render('./'+mod_config.module+'/'+mod_config.view+'/add', dataView);
    } catch (e) {
		console.log(e);
		req.flash('msg_error',e.message);
		return helpers.base.redirect(res,mod_config.route);
    }
});

//Post add
custom_fields.post('/add', async function(req, res){
    try {
        req.flash('post_data',req.body);
        //validate
        var validator = new helpers.validate();
        validator.notEmpty(req.body.role,'Role is requied !');
        validator.notEmpty(req.body.module,'Module is requied !');
        validator.notEmpty(req.body.resource,'Resource is requied !');
        var valid_error = validator.hasErrors();
        if(valid_error.length > 0){
            req.flash('valid_errors',valid_error);
            return helpers.base.redirect(res,mod_config.route+'/add');
        }

        //check exists
        let where = {
            role : req.body.role,
            module : req.body.module,
            resource : req.body.resource,
        }
        let record = await moduleModel.count(mod_config.collection, where);
        if (record > 0) {
            req.flash('valid_errors', 'Data already exists');
            return helpers.base.redirect(res, mod_config.route + '/add');
        }

        var dataAdd = await moduleModel.filterData(mod_config.collection,req.body);
        dataAdd.update_by = helpers.admin.get_update_by(req);
        var create = await moduleModel.create(mod_config.collection, dataAdd, true);
        if(create.status){
            req.flash('msg_success','Add success');
            return helpers.base.redirect(res,mod_config.route);
        } else {
            req.flash('msg_error',create.msg);
            return helpers.base.redirect(res,mod_config.route+'/add');
        }
    } catch(e) {
        req.flash('msg_error',e.message);
        return helpers.base.redirect(res,mod_config.route+'/add');
    }
});

//Get edit
custom_fields.get('/edit/:id', async function (req, res) {
    try {
        //validate
        var validator = new helpers.validate();
        var valid_error = validator.isObjectId(req.params.id,'ID must be ObjectId').hasErrors();
        if(valid_error.length > 0){
            req.flash('msg_error',valid_error);
            return helpers.base.redirect(res,mod_config.route);
        }

        var record = await moduleModel.findOne(mod_config.collection,{'_id':req.params.id},'-__v -update_by -createdAt -updatedAt');
        if (record) {
            var dataView = helpers.admin.get_data_view_admin(req,mod_config);
            var fields = [];
            var collection = await moduleModel.findOne('adminResources',{name:record.resource,module:record.module},'-_id collection_name');
            if(collection && collection.collection_name){
                var otherModel = require('../../'+record.module+'/models');
                fields = await otherModel.get_fields({module : record.module,resource : record.resource,collection : collection.collection_name});
            }

            var custom_fields = Array.from(record.custom_fields);
            Object.keys(fields).forEach(function(key){
                if(custom_fields.indexOf(key) == -1){
                    custom_fields.push(key);
                }
            });
            
            dataView.field_keys = custom_fields;
            dataView.modules_list = await moduleModel.findAll('adminModules',{},'',{name:1});
            dataView.resources_list = await moduleModel.findAll('adminResources',{module:record.module},'',{name:1});
            dataView.roles_list = await moduleModel.findAll('adminRoles',{},'',{name:1});
            dataView.data_edit = dataView.post_data.length > 0 ? dataView.post_data[0] : record;
            return res.render('./'+mod_config.module+'/'+mod_config.view+'/edit', dataView);
        }else{
            req.flash('msg_error', 'Data null');
            return helpers.base.redirect(res,mod_config.route);
        }
    } catch(e) {
        req.flash('msg_error',e.message);
        return helpers.base.redirect(res,mod_config.route);
    }
});

//post edit
custom_fields.post('/edit/:id', async function (req, res) {
    try {
        var post_data = req.body;
        req.flash('post_data',post_data);
        //return helpers.base.redirect(res,mod_config.route+'/edit/'+req.params.id);
        //validate
        var validator = new helpers.validate();
        var valid_error = validator.isObjectId(post_data._id,'Invalid ID').hasErrors();
        if(valid_error.length > 0){
            req.flash('msg_error',valid_error[0]);
            return helpers.base.redirect(res,mod_config.route);
        }

        if(!post_data._id || post_data._id != req.params.id){
            req.flash('valid_errors','Invalid ID');
            return helpers.base.redirect(res,mod_config.route);
        }

        //check exists different current _id
        var where = {
            role : req.body.role,
            module : req.body.module,
            resource : req.body.resource,
            _id : {$not:{$eq:post_data._id}}
        };
        var record = await moduleModel.count(mod_config.collection,where);
        if(record > 0){
            req.flash('msg_error','Data already exists');
            return helpers.base.redirect(res,mod_config.route+'/edit/'+req.params.id);
        }

        var dataUpdate = await moduleModel.filterData(mod_config.collection,post_data,'__v _id');
        dataUpdate.update_by = helpers.admin.get_update_by(req);
        var update = await moduleModel.updateOne(mod_config.collection, {'_id': req.params.id}, dataUpdate);
        if(update.status === true){
            req.flash('msg_success','Edit success.');
            return helpers.base.redirect(res,mod_config.route);
        } else {
            req.flash('msg_error',update.msg);
            return helpers.base.redirect(res,mod_config.route+'/edit/'+req.params.id);
        }
    } catch(e) {
        console.log(e);
        req.flash('msg_error',e.message);
        return helpers.base.redirect(res,mod_config.route);
    }
});

//GET import
custom_fields.get('/import', function(req, res){
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
custom_fields.post('/import',async function(req, res){
    try {
        let postData = {...req.body};
        let data = JSON.parse(postData.data)
        //validate data fields
        let fields = await moduleModel.get_fields(mod_config,'__v');
        let valid = helpers.admin.valid_import_data(fields,data);
        if(valid === true){
            let insertData = await moduleModel.insertMany(mod_config.collection,data);
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
custom_fields.get('/export', async function(req, res){
    try {
        let dataView = helpers.admin.get_data_view_admin(req, mod_config);
        let fields = await moduleModel.get_fields(mod_config,'__v',dataView.role);
        let field_keys = Object.keys(fields);
        dataView.field_keys = field_keys;
        dataView.fields = fields;
        res.render('./layout/partial/export', dataView);
    } catch (e) {
        console.log(e);
        req.flash('msg_error', e.message);
        return helpers.base.redirect(res, mod_config.route);
    }
});

//Export
custom_fields.post('/export', async function(req, res){
    try {
        const dataPost = {...req.body};

        let offset = helpers.base.parseInteger(dataPost.offset)
        if(offset == 0) offset = 1;
        const limit = appConfig.export_limit || 50
        const skip = parseInt((offset-1) * limit);

        const filterData = JSON.parse(dataPost.data);
        const columns = Object.keys(filterData)
        const fields = await moduleModel.get_fields(mod_config,'__v');
        if(ctypeof(columns) !== 'array' || columns.length == 0 || !helpers.base.arrayContainsArray(columns,Object.keys(fields))){
            return res.json({error:1, msg:'Invalid column'})
        }

        const conditions = helpers.admin.buildQuery(filterData, fields);
        const data = await moduleModel.find(mod_config.collection, conditions,columns.join(' '),{},limit,skip);
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
custom_fields.post('/delete', async function (req, res) {
    var post_data = req.body;
    if(post_data != null && !post_data.listViewId){
        req.flash('msg_error','Delete error.');
        return helpers.base.redirect(res,mod_config.route);
    }

    try	{
        var condition = { _id: { $in: post_data.listViewId } };
        var del = await moduleModel.deleteMany(mod_config.collection,condition);
        if(del.status){
            req.flash('msg_success' , "Delete success.");
        }else{
            req.flash('msg_error' , "Delete fail.");
        }
        return helpers.base.redirect(res,mod_config.route);
    } catch(e){
        console.log(e);
        req.flash('msg_error' , e.message);
        return helpers.base.redirect(res,mod_config.route);
    }
});

//get_resource_by_module
custom_fields.post('/get_resource_by_module', async function (req, res) {
    try{
        clog(req.body)
        const module_name = req.body.module;
	    const resources = await moduleModel.findAll('adminResources', { module: module_name }, '-_id name');
        if (resources) {
            return res.json({ status: 1, data: resources });
        }
        return res.json({ status: 0, data: `Module don't have resources` });
    }catch(e){
        clog(e)
        return res.json({ status: 0, data: `Module don't have resources` });
    }
});

//get_fields_by_resource
custom_fields.post('/get_fields_by_resource', async function (req, res) {
    try{
        const module_name = req.body.module;
        const resource_name = req.body.resource;
        const record = await moduleModel.findOne('adminResources', { name: resource_name, module: module_name }, '-_id name module collection_name');
        if (record && record.collection_name) {
            const mod_config = {
                module: record.module,
                resource: record.name,
                collection: record.collection_name
            };
            const moduleModel = require('../../' + module_name + '/models');
            const fields = await moduleModel.get_fields(mod_config);
            return res.json({ status: 1, data: Object.keys(fields) });
        }
        return res.json({ status: 0, data: `Resource don't have collection` });
    }catch(e){
        clog(e)
        return res.json({ status: 0, data: `Resource don't have collection` });
    }
});

module.exports = custom_fields;