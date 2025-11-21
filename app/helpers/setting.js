const adminModel = require('../modules/admin/models');
const setting = {};

const prefix_setting = 'setting_';

setting.set_value_setting = async (key, value, expired=86400) => {
    let key_setting = prefix_setting + key;
    let setRedis = await libs.redis.set(key_setting, value, expired);
    if(setRedis){
        const updateDB = await adminModel.updateOne('adminSettings', {key:key}, {value:value});
        return updateDB.status;
    }
    return false;
};

setting.get_value_setting = async (key,expired=86400) => {
    let key_setting = prefix_setting + key;
    let value = await libs.redis.get(key_setting);
    if (value) {
        return value;
    }
    //Get in DB
    let valueSetting = await adminModel.findOne('adminSettings', {key: key});
    if (valueSetting) {
        libs.redis.set(key_setting, valueSetting.value, expired);
        return valueSetting.value;
    }
    return null;
};

module.exports = setting;
