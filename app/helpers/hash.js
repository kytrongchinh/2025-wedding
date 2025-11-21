const crypto = require('crypto');
const bcrypt = require('bcrypt');

//const hashedPassword = await bcrypt.hash(password, 12);

var hash_helper = {};

/**
 * Bcrypt hash a password
 * @param {*} data 
 */
hash_helper.hash_password = async function(password,saltRounds=9){
    const plaintextPassword = `${password}${appConfig.secret.password}`
    return await bcrypt.hash(plaintextPassword, saltRounds);
};

/**
 * Bcrypt check a password
 * @param {*} data 
 */
hash_helper.check_password = async function(password,passwordHash){
    const plaintextPassword = `${password}${appConfig.secret.password}`
    const correctPassword = await bcrypt.compare(plaintextPassword, passwordHash);
    return correctPassword === true;
};

/** AES encrypt
 * @apiParam {String} data
 * @apiParam {String} secretKey
 *
 */

hash_helper.aes_encrypt = function(data, secretKey){
    return crypto.AES.encrypt(data, secretKey).toString();
};


/** AES decrypt
 * @apiParam {String} data
 * @apiParam {String} secretKey
 *
 */
hash_helper.aes_decrypt = function(data, secretKey){
    var bytes = crypto.AES.decrypt(data, secretKey);
    return bytes.toString(crypto.enc.Utf8);
};

/** SHA256 encrypt
 * @apiParam {String} data
 * @apiParam {String} disgest
 */
hash_helper.sha256 = function(data, disgest = 'hex'){
    if(disgest != '' && disgest != undefined){
        return crypto.createHash('sha256').update(data).digest(disgest);
    }
    else{
        return crypto.createHash('sha256').update(data).digest('hex');
    }
};

/** HmacSHA512
 * @apiParam {String} data Thông tin cần mã hóa.
 *
 */
hash_helper.sha512 = function(data,disgest='hex'){
    return crypto.createHash('sha512').update(data).digest(disgest);
};

/** MD5 encrypt
 * @apiParam {String} data Thông tin cần mã hóa.
 *
 */
hash_helper.md5 = function(data){
    return crypto.createHash('md5').update(data).digest("hex");
};

/** SHA1 encrypt
 * @apiParam {String} data Thông tin cần mã hóa.
 *
 */
hash_helper.sha1 = function(data){
    return crypto.createHash('sha1').update(data).digest("hex");
};

/** HmacSHA256
 * @apiParam {String} data Thông tin cần mã hóa.
 *
 */
hash_helper.hmacSHA256 = function(data,secretkey){
    return crypto.createHmac('sha256', secretkey).update(data).digest('hex');
};

hash_helper.verifyHmacSHA256 = function(data,mac,secretkey){
    var hmac = this.hmacSHA256(data,secretkey);
    var Buffer = require('buffer').Buffer;
    // Compare buffers in constant time
    return this.bufferEq(Buffer.from(hmac), Buffer.from(mac));
};

hash_helper.bufferEq = function(a, b) {
    var Buffer = require('buffer').Buffer;
    // shortcutting on type is necessary for correctness
    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
        return false;
    }

    // buffer sizes should be well-known information, so despite this
    // shortcutting, it doesn't leak any information about the *contents* of the
    // buffers.
    if (a.length !== b.length) {
        return false;
    }

    var c = 0;
    for (var i = 0; i < a.length; i++) {
        /*jshint bitwise:false */
        c |= a[i] ^ b[i]; // XOR
    }
    return c === 0;
}

module.exports = hash_helper;