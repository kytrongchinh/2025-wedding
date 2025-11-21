/**
 * helpers/2fa.js
 */
const qrcode = require("qrcode")
const otplib = require("otplib")

/** Gọi ra để sử dụng đối tượng "authenticator" của thằng otplib */
const { authenticator } = otplib

/** Tạo secret key ứng với từng user để phục vụ việc tạo otp token.
  * Lưu ý: Secret phải được gen bằng lib otplib thì những app như
    Google Authenticator hoặc tương tự mới xử lý chính xác được.
*/
const generateUniqueSecret = () => {
    return authenticator.generateSecret()
}

/** Tạo mã OTP token */
const generateOTPToken = (username, serviceName, secret) => {
    return authenticator.keyuri(username, serviceName, secret)
}

/** Kiểm tra mã OTP token có hợp lệ hay không
 * Có 2 method "verify" hoặc "check", có thể thử dùng một trong 2 tùy thích.
*/
const verifyOTPToken = (token, secret) => {
    return authenticator.verify({ token, secret })
    // return authenticator.check(token, secret)
}

/** Tạo QR code từ mã OTP để gửi về cho user sử dụng app quét mã */
const generateQRCode = async (otpAuth) => {
    try {
        const QRCodeImageUrl = await qrcode.toDataURL(otpAuth)
        return QRCodeImageUrl;
    } catch (error) {
        console.log('Could not generate QR code', error)
        return ''
    }
}

module.exports = {
    generateUniqueSecret,
    verifyOTPToken,
    generateOTPToken,
    generateQRCode,
}
