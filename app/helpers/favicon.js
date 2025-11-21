var fs = require("fs");
var fresh = require('fresh');
var etag = require('etag');

var favicon = {};

favicon.handler = function(){
    var icon; // favicon cache
    return (req, res, next) => {
        if(req.originalUrl !== '/favicon.ico'){
            return next();
        }

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.statusCode = req.method === 'OPTIONS' ? 200 : 405;
            res.setHeader('Allow', 'GET, HEAD, OPTIONS');
            res.setHeader('Content-Length', '0');
            return res.end();
        }

        if(icon){
            return (icon == '404') ? res.sendStatus(204) : send(req, res, icon);
        }

        var faviname = (process.env.NODE_ENV == 'develop') ? 'develop.ico' : 'favicon.ico';

        //read first time
        fs.readFile(_basepath+'public/ico/'+faviname, function (err, buf) {
            if (err) {
                icon = '404';
                return res.sendStatus(204);
            }else{
                icon = {
                    body: buf,
                    headers: {
                        'Cache-Control': 'public, max-age=2592000',
                        'ETag': etag(buf)
                    }
                };
                send(req, res, icon)
            }
        });
    };
};

function isFresh(req, res){
    return fresh(req.headers, {
        'etag': res.getHeader('ETag'),
        'last-modified': res.getHeader('Last-Modified')
    })
}

function send (req, res, icon) {
    // Set headers
    var headers = icon.headers;
    var keys = Object.keys(headers);
    for(let v of keys){
        res.setHeader(v, headers[v]);
    }

    // Validate freshness
    if (isFresh(req, res)) {
        res.statusCode = 304;
        res.end();
        return
    }

    // Send icon
    res.statusCode = 200;
    res.setHeader('Content-Length', icon.body.length);
    res.setHeader('Content-Type', 'image/x-icon');
    res.end(icon.body)
}

module.exports = favicon;