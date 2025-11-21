const express = require("express");
const login = express();
login.disable('x-powered-by');



login.post('/logout', async function (req, res) {
    if (req.session) {
        console.log(req.session.userdata);
        req.session.userdata = null;
    }
    return helpers.base.redirect(res);
});

/* Note
 * code_verifier là 1 chuỗi bất kỳ, format có đủ chữ hoa, chữ thường, số và dài 43 ký tự.
 * code_challenge = Base64.encode(SHA-256.hash(ASCII(code_verifier)))
 *
 * oauth_code: using get (access_token, refresh_token) expires 10 minutes, use one time
 * access_token: using get (profile, send api) expires 1 hour
 * refresh_token: using get (access_token) expires 3 month, use one time
 * expires_in: second
 */
login.get('/zalo', async function (req, res) {
    const model = require('../../campaign/models');
    return helpers.base.redirect(res);

    try {
        //onsole.log('appConfig.env',appConfig.env);
        //return helpers.base.redirect(res)
        const query_string = helpers.admin.build_query(req.query);
        // utm_source=Adtima-Zingnewbaomoi&utm_medium=SPMH-CPD&utm_campaign=WK247-Promo query_string
        if(query_string.indexOf('utm_source') > -1 || query_string.indexOf('utm_medium') > -1 || query_string.indexOf('utm_campaign') > -1) {
            req.session.query_string = query_string;
            // console.log(req.session.query_string,'req.session.query_string')
        }
        
        if (libs.social.isLogin(req)) return helpers.base.redirect(res, 'fill-info'+ (query_string ? '?'+query_string : ''))

        if(appConfig.env == 'develop'){
            //let zalo_id = '8016725044152197066';
            let zalo_id = '143104729564341131';
            let user = await model.custom.getProfile(zalo_id);
            clog(user,'user')
            if (!user) {
                return helpers.base.redirect(res);
            }
            libs.social.setSessionUser(req,user);
            if (user?.is_updated_info) {
                return helpers.base.redirect(res, 'quiz-ready' + (query_string ? '?'+query_string : ''));
            }
            return helpers.base.redirect(res, 'fill-info' + (query_string ? '?'+query_string : ''));
        }

        let zalo_info = {};
        let zalo_access_token = req.cookies['zatoken'];
        if (!zalo_access_token) {
            let oToken = {};
            let zalo_refresh_token = req.cookies['zrtoken'];
            if (!zalo_refresh_token) {
                let oauth_code = req.query.code;
                if (!oauth_code) {
                    //redirect zalo login box
                    let state = {
                        router: req.query.router && req.query.router != 'undefined' ? req.query.router : '',
                        action: req.query.action && req.query.action != 'undefined' ? req.query.action: '',
                        data: req.query.data && req.query.data != 'undefined' ? req.query.data : '',
                        // query_string: helpers.admin.build_query(req.query).replace(/&/g, '----')
                    };

                    // console.log(state)
                   
                    let oauthUrl = libs.social.getZaloOAuthUrl(helpers.base.json_data(state, true));
                    return oauthUrl ? res.redirect(oauthUrl) : res.redirect(_baseUrl);
                }
                //get access_token by oauth_code
                oToken = await libs.social.getZaloAccessTokenByOauthCode(oauth_code);
                if (oToken.error) {
                    console.log(`Lỗi đăng nhập Zalo [1][${oToken.error_name}]`);
                    return helpers.base.redirect(res);
                } else {
                    //save zatoken, zrtoken
                    zalo_access_token = oToken.access_token; //expires in 1 hour
                    res.cookie('zatoken', oToken.access_token, {maxAge: 1000 * 60 * 60});
                    res.cookie('zrtoken', oToken.refresh_token, {maxAge: 1000 * 60 * 60 * 24 * 30});
                }
            } else {
                 //get access_token by refresh_token
                oToken = await libs.social.getZaloAccessTokenByRefreshToken(zalo_refresh_token);
                if (oToken.error) {
                    console.log(`Lỗi đăng nhập Zalo [2][${oToken.error_name}]`);
                    res.clearCookie('zrtoken');
                    return helpers.base.redirect(res);
                } else {
                    //save zatoken, zrtoken
                    zalo_access_token = oToken.access_token; //expires in 1 hour
                    res.cookie('zatoken', oToken.access_token, {maxAge: 1000 * 60 * 60}); //1 hour
                    res.cookie('zrtoken', oToken.refresh_token, {maxAge: 1000 * 60 * 60 * 24 * 30}); //30d
                }
            }
        }

        zalo_info = await libs.social.getZaloProfileUserByAccessToken(zalo_access_token);
        //console.log('zalo_info',zalo_info);
        if (zalo_info.error) {
            // console.log(zalo_info);
            console.log(`Lỗi đăng nhập Zalo [3][${zalo_info.error}]`);
            res.clearCookie('zatoken');
            res.clearCookie('zrtoken');
            return helpers.base.redirect(res);
        } else {
            //find in DB
            let user = await model.custom.getProfile(zalo_info.userIdByOA);
            //console.log('user',user);
            if (!user) {
                return helpers.base.redirect(res);
            }
            
            libs.social.setSessionUser(req,user);

            if(req.query.state){
                let query_string_text = req.session.query_string;
                // console.log(query_string_text,'query_string_text');
                let query_string = '';
                if(query_string_text){
                    // query_string = query_string_text.replace(/----utm_/g, '&utm_');
                    query_string = query_string_text;
                }
                
                if (user?.is_updated_info) {
                    return helpers.base.redirect(res, 'quiz-ready' + (query_string ? '?'+ query_string : ''));
                }
    
                return helpers.base.redirect(res, 'fill-info' + (query_string ? '?'+ query_string : ''));
            }else{
                if (user?.is_updated_info) {
                    return helpers.base.redirect(res, 'quiz-ready' + (query_string ? '?'+ query_string : ''));
                }
                return helpers.base.redirect(res, 'fill-info' + (query_string ? '?'+ query_string : ''));
            }
        }
    } catch (e) {
        console.log('error_social_zalo', e);
        return helpers.base.redirect(res);
    }
});

module.exports = login;
