const i18n = require('i18n')
const path = require('path')

i18n.configure({
    locales: ['en_US', 'vi_VN'],
    defaultLocale: 'en_US',
    directory: path.join(__dirname, 'locales'),
    objectNotation: true,
    // autoReload: true,
    // sets a custom cookie name to parse locale settings from
    cookie: 'zsl_lang',
    header: 'accept-language',
    api: {
        __: 'translate',
        __n: 'translateN',
    },
})

module.exports = i18n
