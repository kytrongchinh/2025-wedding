const express = require("express")
const adminModel = require('../admin/models')
const logs = express()

logs.set('views',_basepath+'app/views');

//============================= LOAD RESOURCES ================================//
adminModel.findAll('adminResources',{module:'logs'}, 'name', {},function(result){
    if(result.length > 0){
        result.forEach((resource) => {
            logs.use(`/${resource.name}`,
                helpers.base.sanitizersQuery,
                helpers.admin.authAdmin, 
                require('./routes/'+resource.name
            ));
        })
    }
})
//============================= END RESOURCES =================================//

module.exports = logs;
