/**
 * Class Topup_lib
 */
class topup_lib {
    constructor(data_config) {
        this._test_mode = (appConfig.campaign.enable_gift_real == 0)
        this.username = appConfig.topup_vtdd_username
        this.password = appConfig.topup_vtdd_password
        this.privatekey = appConfig.topup_vtdd_privatekey
        this.url_card = appConfig.topup_vtdd_url_card
        this.url_topup = appConfig.topup_vtdd_url_topup
        this._data_card_default = {
            card_pin: '1234567891234',
            card_series: '98765432198',
            card_exp_date: '31/12/2022',
            card_money: '10000',
            card_status: '98765432198-1234567891234-31/12/2022',
            card_notify: 'OK'
        }
        this._data_topup_default = {
            topup_status: 1,
            topup_trans_id: '',
            topup_money: '10000',
            topup_notify: 'Giao dịch thành công'
        }
        if (typeof data_config === 'object') {
            this.username = data_config.username
            this.password = data_config.password
        }
    }

    /** Get card vttd
     * @param string $phone  phone || operator
     * @param string $amount
     * @param int $clientID
     * checksum 
     * @return array|bool
     */
    async get_card_vtdd(phone = '', amount = '10000', clientID = 0) {
        try {
            if (this._test_mode || appConfig.env == 'dev') {
                return {
                    status: true,
                    msg : 'Test',
                    result: this._data_card_default
                }
            }

            const gateway = encodeURI(phone)
            const soluong = encodeURI('1')
            amount = encodeURI(amount)
            clientID = encodeURI(clientID)
            const checksum_string = this.username + '|' + amount + '|' + soluong + '|' + this.privatekey
            const checksum = helpers.hash.sha1(checksum_string)
            const data_string = `username=${this.username}&password=${this.password}&gateway=${gateway}&soluong=${soluong}&amount=${amount}&clientID=${clientID}&checksum=${checksum}`
            const url_post = this.url_card + '?' + data_string
            const params = {
                url: url_post
                //use_proxy: false,
            }
            const response = await helpers.base.http_request(params);
            if (response) {
                if (typeof (response) === 'object' && response.statusCode !== 200) {
                    return {
                        status: false,
                        msg : response.statusCode,
                        result: response
                    }
                }
                const data_response = (Buffer.from(response, 'base64')).toString();
                const card_info = data_response.split('-')
                if (card_info.length === 3) {
                    // Success
                    return {
                        status: true,
                        msg : 'Success',
                        result: {
                            card_pin: card_info[1],
                            card_series: card_info[0],
                            card_exp_date: card_info[2],
                            card_money: amount,
                            card_status: data_response,
                            card_notify: 'OK'
                        }
                    }
                }
                // Failed
                return {
                    status: false,
                    msg : 'Response Info Invalid',
                    result: {
                        card_pin: '',
                        card_series: '',
                        card_exp_date: '',
                        card_money: amount,
                        card_status: data_response,
                        card_notify: this.get_status_vtdd_card(data_response)
                    }
                }
            }
            return {
                status: false,
                msg: 'Response Null'
            }
        } catch (error) {
            helpers.log.writeError(error.message,'Error','get_card_vtdd');
            return {
                status: false,
                msg: error.message
            }
        }
    }

    /** Topup to phone
     * @param string $phone
     * @param string $amount
     * @return array|bool|string
     */
    async send_topup_vtdd(phone = '', amount = '10000') {
        try {
            if (this._test_mode) {
                return this._data_topup_default
            }
            const checksum_string = this.username + this.phone + encodeURI(amount) + this.privatekey
            const checksum = helpers.hash.sha1(checksum_string)
            const data_string = `username=${this.username}&phone=${phone}&sotien=${amount}&privatekey=${this.privatekey}&checksum=${checksum}`
            const url_post = this.url_topup + '?' + data_string

            const params = {
                url: url_post
            }
            const response = await helpers.base.http_request(params)
            if (response) {
                const status = response.split(';')
                if (status.length === 2) {
                    // Success
                    return {
                        topup_status: status[0],
                        topup_trans_id: status[1],
                        topup_money: amount,
                        topup_notify: this.get_status_vtdd_topup(status[0])
                    }
                } else {
                    // Failed
                    return {
                        topup_status: response,
                        topup_trans_id: '',
                        topup_money: amount,
                        topup_notify: this.get_status_vtdd_topup(status[0], 1)
                    }
                }
            }
            return false
        } catch (error) {
            helpers.log.writeError(error, 'send_topup_vtdd')
            return false
        }
    }

    /** Get error code card
     * @param $error_code
     * @return string
     */
    get_status_vtdd_card(error_code) {
        try {
            error_code = parseInt(error_code)
        } catch (error) {
            return 'Undefined'
        }
        let mess = ''
        switch (error_code) {
        case -5:
            mess = 'Lỗi hệ thống mua thẻ nhà mạng'
            break
        case -4:
            mess = 'User bị khóa'
            break
        case -3:
            mess = 'Tài khoản không đủ để thực hiện'
            break
        case -2:
            mess = 'Số lượng giao dịch trên ngày đã hết'
            break
        case -1:
            mess = 'Số tiền giao dịch trên ngày đã hết'
            break
        case 0:
            mess = 'Thiếu tham số'
            break
        case 1:
            mess = 'Sai checksum'
            break
        case 2:
            mess = 'Client ID đã tồn tại'
            break
        case 4:
            mess = 'IP không được cho phép'
            break
        case 5:
            mess = 'Mệnh giá mua không được phép, hoặc sai mệnh giá'
            break
        case 7:
            mess = 'Sai gateway hoặc số điện thoại không biết của nhà mạng nào'
            break
        default:
            mess = 'Undefined'
        }
        return mess
    }

    /** Get error code topup
     * @param error_code
     * @param int $type
     * @return string
     */
    get_status_vtdd_topup(error_code, type = 2) {
        let mess = ''
        switch (error_code) {
        case 1:
            mess = 'Giao dịch thành công'
            break
        case 5:
            mess = 'Số tiền không được phép '
            break
        case 6:
            mess = 'Số đt không hợp lệ'
            break
        case 0:
            mess = 'Giao dịch chưa xác định  Giao dịch nghi vấn, không hoàn tiền '
            break
        case -1:
            if (type === 1) {
                mess = 'Quá số tiền cho phép trong ngày '
            } else {
                mess = 'Lỗi hệ thống Giao dịch nghi vấn không hoàn tiền'
            }
            break
        case -2:
            mess = 'Số lượt giao dịch quá giới hạn'
            break
        case -3:
            mess = 'Số tiền không còn đủ trong tài khoản'
            break
        case -4:
            mess = 'User bị khóa'
            break
        case -5:
            mess = 'Lỗi không xác định hoàn tiền '
            break
        case -6:
            mess = 'Sai check sum'
            break
        case -55:
            mess = 'Số dư tài khoản không đủ để thực hiện giao dịch này'
            break
        case -99:
            mess = 'Lỗi chưa xác định Giao dịch nghi vấn, không hoàn tiền'
            break
        case -302:
            mess = 'Partner không tồn tại hoặc đang tạm dừng hoạt động Cho phép hoàn tiền '
            break
        case -304:
            mess = 'Dịch vụ này không tồn tại hoặc đang tạm dừng Cho phép hoàn tiền'
            break
        case -305:
            mess = 'Chữ ký không hợp lệ Cho phép hoàn tiền'
            break
        case -306:
            mess = 'Mệnh giá không hợp lệ hoặc đang tạm dừng Cho phép hoàn tiền'
            break
        case -307:
            mess = 'Tài khoản nạp tiền không tồn tại hoặc không hợp lệ Cho phép hoàn tiền '
            break
        case -308:
            mess = 'RequestData không hợp lệ Cho phép hoàn tiền'
            break
        case -309:
            mess = 'Ngày giao dịch truyền không đúng Cho phép hoàn tiền'
            break
        case -310:
            mess = 'Hết hạn mức cho phép sử dụng dịch vụ này Cho phép hoàn tiền'
            break
        case -311:
            mess = 'RequesData hoặc PartnerCode không đúng Cho phép hoàn tiền'
            break
        case -315:
            mess = 'Phải truyền CommandType Cho phép hoàn tiền'
            break
        case -316:
            mess = 'Phải truyền version Cho phép hoàn tiền'
            break
        case -317:
            mess = 'Số lượng thẻ phải lớn hơn 0 Cho phép hoàn tiền '
            break
        case -318:
            mess = 'ServiceCode không đúng Cho phép hoàn tiền'
            break
        case -320:
            mess = 'Hệ thống gián đoạn Cho phép hoàn tiền '
            break
        case -348:
            mess = 'Tài khoản bị Block Cho phép hoàn tiên'
            break
        case -350:
            mess = 'Tài khoản không tồn tại Cho phép hoàn tiền'
            break
        case -500:
            mess = 'Loại thẻ này trong kho hiện đã hết hoặc tạm ngừng xuất Cho phép hoàn tiền'
            break
        case -501:
            mess = 'Giao dịch nạp tiền không thành công Cho phép hoàn tiền'
            break
        case -503:
            mess = 'Đối tác không đươc thực hiện chức năng này'
            break
        case -504:
            mess = 'Mã giao dịch này đã check quá tối đa số lần cho phép'
            break
        case -505:
            mess = 'Số lần check vượt quá hạn mức cho phép trong ngày'
            break
        default:
            mess = 'Undefined'
        }
        return mess
    }
}

module.exports = topup_lib;
