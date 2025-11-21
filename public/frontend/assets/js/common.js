var Common = {
    loading: function(t){
        let w_loader = document.getElementById('w_loader');
        if(t=='hide'){
            if(w_loader) $('#w_loader').hide();
        }else if(w_loader){
            $('#w_loader').show();
        }else{
            let height = (window.innerHeight / 2) - 50;
            let w_loader_style = 'z-index: 99999;height: 100%;width: 100%;text-align: center;background-color: rgba(0, 0, 0, .5);vertical-align: top;position: fixed;top: 0;';
            let loader_style = 'margin: 0px auto; margin-top: '+height+'px; border: 15px solid #dddddd;border-top: 15px solid #009b3f;border-radius: 50%;animation: spin 2s linear infinite;height: 10px;width: 10px;';
            let loader_html = '<div id="w_loader" style="'+w_loader_style+'"><div class="loader" style="'+loader_style+'"></div><span style="color: white; font-size: 13px; margin-top: 4px; display: block;"> loading...</span></div>';

            let styleNode = document.createElement('style');
            let styleText = document.createTextNode('@keyframes spin {0% { transform: rotate(0deg); }100% { transform: rotate(360deg); }} ');
            styleNode.appendChild(styleText);
            document.body.insertAdjacentHTML( 'beforeend', loader_html);
            document.getElementsByTagName('head')[0].appendChild(styleNode);
        }
    },
    setCookie : function (cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },
    getCookie : function (cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    },
    inProcessing : function(){
        return window.in_processing
    },
    setProcessing : function(v=true){
        window.in_processing = v;
    }
}
