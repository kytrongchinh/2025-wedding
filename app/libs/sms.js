/**
 * Class Topup_lib
 */

class sms_lib {
    constructor(data_config) {
        this._test_mode = 1
        this.username = appConfig.sms_gapit_username
        this.password = appConfig.sms_gapit_password
        this.brandname = appConfig.sms_gapit_brandname
        this.cpid = appConfig.sms_gapit_cpid
        this.api_mt = appConfig.sms_gapit_api_mt
        this.api_mtbulk = appConfig.sms_gapit_api_mtbulk
        if (typeof data_config === 'object') {
            this.username = data_config.username
            this.password = data_config.password
            this.brandname = data_config.brandname
        }
    }

    /** Send MT
     * @param string $phone  phone
     * @param string $mtid client_id
     * @param string $content_type text || text_ucs2
     * checksum 
     * @return array|bool
     */
    async sendMT(phone = '', mtid = '', msgbody='', content_type='text') {
        try {
            var apiUrl = this.api_mt;
            var brandname = this.brandname;
            if(content_type == 'text_ucs2'){
                var jsunicode = require("jsunicode");
                msgbody = jsunicode.encode(msgbody, { encoding: "UTF-16BE", byteWriter: "hex" });
            }
            var mtid = mtid;
            var cpid = this.cpid;
            var authen = 'Basic ' + Buffer.from(this.username + ':' + this.password).toString('base64')
            
            var params = {
                'url': apiUrl,
                'method': 'POST',
                'headers': {
                    Authorization: authen
                },
                'data': {
                    'dest': phone,
                    'brandname': brandname,
                    'msgbody': msgbody,
                    'content_type': content_type,
                    'serviceid': "Gapit",
                    'mtid': mtid,
                    'cpid': cpid
                }
            };
            var result = await helpers.base.http_request(params);
            helpers.log.writeError(result,'result','sendMT');
            if (result && (result.status == 200 || result.status == 0) ) {
                return {error:0, result:result};
            } else {
                return {error:result.status, result:result};
            }
        } catch (e) {
            helpers.log.writeError(e.message,'Error','sendMT');
            return {
                error: 1,
                msg: e.message
            }
        }
    }

    /** Get error sms
     * @param $status
     * @return string
     */
    get_status_sms(status) {
        status = helpers.base.parseInteger(status,true)
        var mess = ''
        switch (status) {
        case 0:
        case 200:
            mess = 'Success';break;
        case 400:
            mess = 'Undefined Error';break;
        case 408:
            mess = 'Timeout';break;
        case -1:
            mess = 'Bad Request';break;
        case -2:
            mess = 'Invalid Length';break;
        case -3:
            mess = 'Message Advertise';break;
        case -4:
            mess = 'PhoneNumber In BlackList';break;
        case -5:
            mess = 'Spam Message';break;
        case -6:
            mess = 'Template is not register';break;
        case -8:
            mess = 'Invalid CpId, accout';break;
        case -9:
            mess = 'Brandname is not register';break;
        case -10:
            mess = 'Invalid Source Ip';break;
        case -15:
            mess = 'PhoneNumber Not Support';break;
        case -18:
            mess = 'Message contains vietnamese sign (Viettel bank)';break;
        case -19:
            mess = 'Message is not decrypted (viettel bank)';break;
        case -32:
            mess = 'Out of quota';break;
        case -999:
            mess = 'Server Error';break;
        default:
            mess = 'Không xác định'
        }
        return mess
    }
}

module.exports = sms_lib;
