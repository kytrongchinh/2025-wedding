const express = require("express")
const adminModel = require('../admin/models')
const weddings = express()

weddings.set('views',_basepath+'app/views');

//============================= LOAD RESOURCES ================================//
adminModel.findAll('adminResources',{module:'weddings'}, 'name', {},function(result){
    if(result.length > 0){
        result.forEach((resource) => {
            weddings.use(`/${resource.name}`,
                helpers.base.sanitizersQuery,
                helpers.admin.authAdmin, 
                require('./routes/'+resource.name
            ));
        })
    }
})
//============================= END RESOURCES =================================//

module.exports = weddings;
