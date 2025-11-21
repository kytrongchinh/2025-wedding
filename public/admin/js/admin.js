var $j = jQuery;

$j(document).ready(function() {
    //select2
    if($j('select.select2').length > 0){
        $j('select.select2').select2();
    }

    //tooltip
    $('.is-tooltip, a').tooltip();
    //$('.is-tooltip').tooltip();
    //Filter
    $j(".filter_field").keypress(function(event){
        if(event.which == 13) {
            Admin.filter_submit();
        }
    });
    
    if($j('input.datepicker').length > 0){
        //Datetime picker
        $j('input.datepicker').datetimepicker({
            format: 'YYYY-MM-DD',
            keepOpen:true,
        }).keydown(function(event){
            if(event.which == 13) {
                event.preventDefault();
                Admin.filter_submit();
            }
        });
    }

    if($j('input.datetimepicker').length > 0){
        $j('input.datetimepicker').datetimepicker({
            format : 'YYYY-MM-DD HH:mm:ss',
            keepOpen:true,
        }).keydown(function(event){
            if(event.which == 13) {
                event.preventDefault();
                Admin.filter_submit();
            }
        });
    }

    // check all box
    $j('#checkbox_all').on('click', function() {
        var is_check = $j(this).is(':checked');
        if(is_check == true){
            $j('input[name^="listViewId"]').prop("checked",true);
        }else{
            $j('input[name^="listViewId"]').prop("checked",false);
        }
    });

    // delete item in list view
    $j('.JsDeleteItem').on('click', function () {
        var n = $j('input[name^="listViewId"]:checked').length;
        if (n >= 1) {
            $j.alertable.confirm('Are you sure Delete ?').then(function(){
                $j('form.JsDeleteForm').submit();
            });
        }else{
            $j.alertable.alert('Please select.');
        }
    });

    // delete one item
    $j('.JsDeleteItemRow').on('click', function () {
        var el = this;
        $j.alertable.confirm('Are you sure Delete ?').then(function(){
            var id = $j(el).data('id');
            var url = $j(el).data('url');
            var form = document.createElement("form");
            form.setAttribute('method','POST');
            form.setAttribute('action',url);
            var element1 = document.createElement("input");
            element1.name='listViewId';
            element1.type='checkbox';
            element1.value=id;
            element1.setAttribute('checked','checked');
            form.appendChild(element1);
            var element2 = document.createElement("input");
            element2.name='_csrf';
            element2.type='hidden';
            element2.value=token_value;
            form.appendChild(element2);
            document.body.appendChild(form);
            //console.log(form);
            form.submit();
        });
    });

    // public item in list view
    $j('.JsPublicItem').on('click', function () {
        var url = $(this).attr('data-url');
        var n = $j('input[name^="listViewId"]:checked').length;
        if (n >= 1) {
            $j.alertable.confirm('Are you sure Public ?').then(function(){
                $('.JsDeleteForm').attr('action', url).attr('method', 'post').submit();
            });
        }else{
            $j.alertable.alert('Please select.');
        }
    });

    // update item in list view
    $j('.JsUpdateItem').on('click', function () {
        var url = $(this).attr('data-update');
        $j.alertable.confirm('Are you sure Update ?').then(function(){
            $j('form.JsUpdateForm').attr('action',url).attr('method', 'post').submit();
        },function(){

        });
    });

    //Render th width
    $j('tr th.sorting').each(function(){
        var th_w = $j(this).innerWidth();
        if(th_w < 50){
            th_w = 50;
        }
        $j(this).css('width',th_w+'px');    
        $j(this).find('input.filter_field , select.filter_field').css('width',th_w+'px');

        if($j(this).find('input.filter_field').val()){
            $j(this).find('input.filter_field').removeClass('hide');
        }

        if($j(this).find('select.filter_field').val()){
            $j(this).find('select.filter_field').removeClass('hide');
        }
    });

    //Sort
    $j('.filter_sort a').on('click',function(){
        var div_filter = $j(this).data('filter');
        var el_filter = 'input.'+div_filter+' , select.'+div_filter;
        if($j(el_filter).hasClass('hide')){
            $j(el_filter).removeClass('hide');
            $j(el_filter).val('');
        }else{
            $j(el_filter).addClass('hide');
        }
        
    });

    //Add token for all form post
     if(token_value){
         $j('form[method="post"]').each(function(){
             $j(this).append('<input type="hidden" name="_csrf" value="'+token_value+'">');
         });
     }
});

var Admin = {
    filterForm : function(el){
        $j(el).find('input,select,textarea').each(function(i,e){
            if(e.value == ''){
                $(e).attr('disabled','disabled');
            }
        });
        return true;
    },
    filter_submit : function(){
        $j('tr th.sorting input, tr th.sorting select').each(function(){
            if(!$j(this).val()){
                $j(this).attr('disabled','disabled');
            }
        });
        $j('input[name="_csrf"]').remove();
        $j('.JsDeleteForm').attr('action', window.location.href).attr('method', 'get');
        var from = $j('input[name="from_date"]').val();
        var to = $j('input[name="to_date"]').val();
        if(from) $j('.JsDeleteForm').append('<input type="hidden" name="from_date" value="'+from+'">');
        if(to) $j('.JsDeleteForm').append('<input type="hidden" name="to_date" value="'+to+'">');

        $j('.JsDeleteForm').submit();
    },
    my_filter_submit : function(e){
        let selectedOption = $j(e).find("option:selected");
        let item = selectedOption.attr("data-item");
        let region = selectedOption.attr("data-region");
        let name = $j(e).val();
        let currentURL = base_url + `saintgobain/winner?gift_name=${name}&region=${region}&item=${item}`;
        window.location.href = currentURL;
    },
    confirm_submit : function(btn){
        var text = $(btn).html();
        var form = $(btn).closest("form");
        $j.alertable.confirm('Are you sure '+text+' ?').then(function(){
            form.submit();
        },function() {

        });
    },
    permission_roles : {
        reload_roles : function(el){
            var url = $j(el).val();
            window.location.replace(url);
        },
        select_resource : function(id){
            $j('#permission_resource .resource').hide();
            $j('#permission_resource .resource input[type="checkbox"]').prop('checked',false);
            $j('#permission_resource #resource_'+id).show();
        }
    },
    permission_users : {
        reload_user : function(el){
            var url = $j(el).val();
            window.location.replace(url);
        },
        select_user : function(id){
            $j('#permission_resource .resource').hide();
            $j('#permission_resource .resource input[type="checkbox"]').prop('checked',false);
            $j('#permission_resource #resource_'+id).show();
        }
    },
    module :{
        switch_module : function(el){
            var name = $j(el).val();
            if(name != '' && name == 0){
                $('input[name="module_new"]').removeAttr('disabled');
                $('input[name="module_new"]').show();
            }else{
                $('input[name="module_new"]').attr('disabled','disabled');
                $('input[name="module_new"]').hide();
            }
        }
    },
    apply_settings :function (){
        var url = base_url+'api/apply_setting';
        var zsl_menu = $j('select[name="zsl_menu"]').val();
        var zsl_language = $j('select[name="zsl_language"]').val();;
        var data_post = {zsl_menu : zsl_menu,zsl_language : zsl_language}
        data_post = Admin.add_token(data_post);
        $j.ajax({
            type: 'POST',
            url :  url,
            data : data_post,
            success: function(res){
                if(res.status == 1){
                    window.location.reload();
                }
            },
            error : function(e){
                $j.alertable.alert('Có lỗi xảy ra vui lòng thử lại.');
            }
        });
    },
    add_token : function (data){
        if(typeof data === 'object'){
            eval('var element = {_csrf  : token_value};');
            $j.extend( data, element );
        }
        return data;
    },
    refresh_token : function(value){
        if(value){
            $j('#zsl_token_value').val(value);
        }
    },
    alert : function(msg = '', options = {}){
        $j.alertable.alert(msg,options);
        //setTimeout(function(){$.alertable.hide();},2000);
        //$.alertable.alert('Messenger',{title:'Title',closeX:false,closeButton:''});
        //$.alertable.confirm('Content',{title:'Title'}).then(function(){alert(123)});
        //$.alertable.prompt('Content',{title:'Title'}).then(function(result){alert(result.value)});
    },
    confirm : function(msg = '', options = {}, callback=''){
        $j.alertable.confirm(msg,options).then(function(){
            if (typeof callback === "function") return callback();
            var fn = window[callback];
            if (typeof fn === "function") fn();
        },function(){

        });
    },
    prompt : function(msg = '', options = {}, callback = ''){
        $j.alertable.prompt(msg,options).then(function(result){
            var fn = window[callback];
            if (typeof fn === "function") fn(result);
        },function(){

        });
    },

    popup : function(options){
        $('#modal-alert').modal({backdrop: false});
    },
    loading_show : function(text = '',btn_close = ''){
        var h = $(window).height();   // returns height of browser viewport
        var w = $(window).width();   // returns width of browser viewport
        var t_final = h/2 - 60;
        var l_final = w/2 - 100;

        var w_loader_style = 'z-index: 10000;height: 100%;width: 100%;text-align: center;background-color: rgba(0, 0, 0, .5);vertical-align: top;position: fixed;top: 0;';
        var loader_style = 'margin: 20% auto;border: 5px solid #dddddd;border-top: 5px solid #00c0ef;border-radius: 50%;animation: spin 1s linear infinite;height: 35px;width: 35px;';
        var text_style = 'background-color: white !important;border: 1px solid #9d9d9d;border-radius:4px;position: absolute;min-height: 100px;min-width: 150px;top: '+t_final+'px;left: '+l_final+'px;';
        var el_close = (btn_close) ? '<span style="float: right;padding: 1px 8px;border: 1px #ddd;border-radius: 50%;background-color: #ddd; position: absolute;top: -8px;right: -7px; cursor: pointer;" onclick="Admin.loading_hide();">x</span>' : '';
        var loader_html = '<div class="w_loader" style="'+w_loader_style+'"><div class="text" style="'+text_style+'"><div style="padding:8px 14px 0 10px">'+text+'</div>'+el_close+'<div class="loader" style="'+loader_style+'"></div></div></div>';
        
        var styleNode = document.createElement('style');
        var styleText = document.createTextNode('@keyframes spin {0% { transform: rotate(0deg); }100% { transform: rotate(360deg); }} ');
        styleNode.appendChild(styleText);
        document.body.insertAdjacentHTML( 'beforeend', loader_html);
        document.getElementsByTagName('head')[0].appendChild(styleNode);
    },
    loading_hide : function(){
        $('.w_loader').remove();
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
        console.log('decodedCookie',document.cookie);
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
    export_data : function(el){
        var url = $(el).data('export');
        var total = $(el).data('total');
        Admin.loading_show('Total: '+total);
        $.ajax({
            url: url,
            type: 'POST',
            data:{
                _csrf : token_value
            },
            success: function(res) {
                Admin.loading_hide();
                if(res.status == 'success'){
                    Admin.downloadFile(res.path);
                }else{
                    Admin.loading_show(res.msg,true);
                }
            },
            error: function(e) {
                console.log(e);
            }
        });
    },
    downloadFile : function(sUrl){
        //iOS devices do not support downloading. We have to inform user about this.
        if (/(iP)/g.test(navigator.userAgent)) {
            window.open(sUrl, '_blank');
            return false;
        }

        //If in Chrome or Safari - download via virtual link click
        if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1 || navigator.userAgent.toLowerCase().indexOf('safari') > -1) {
            //Creating new link node.
            var link = document.createElement('a');
            link.href = sUrl;
            link.setAttribute('target','_blank');

            if (link.download !== undefined) {
                //Set HTML5 download attribute. This will prevent file from opening if supported.
                var fileName = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length);
                link.download = fileName;
            }

            //Dispatching click event.
            if (document.createEvent) {
                var e = document.createEvent('MouseEvents');
                e.initEvent('click', true, true);
                link.dispatchEvent(e);
                return true;
            }
        }

        // Force file download (whether supported by server).
        if (sUrl.indexOf('?') === -1) {
            sUrl += '?download';
        }

        window.open(sUrl, '_blank');
        return true;
    },
    update_module_db : function (el){
        var url = $(el).data('url');

        $.ajax({
            url: url,
            type: 'POST',
            data:{
                _csrf : token_value,
                update : 1
            },
            success: function(res) {
                window.location.reload();
            },
            error: function(e) {
                console.log(e);
            }
        });
    },
    render_data: function(t_name,data){
        var render = function(props){
            return function(tok, i) {
                return (i % 2) ? props[tok] : tok;
            };
        };
        var temp = $('script[data-template="'+t_name+'"]').text().split(/\$\{(.+?)\}/g);
        return data.map(function(item) {
            return temp.map(render(item)).join('');
        });
    },
    handleChangeModule: function(el,name){
        var data_post = {
            _csrf : token_value,
            module  : (name) ? name : el.value
        };
        $.ajax({
            url: base_url+'api/admin/get_resource_by_module',
            type: 'POST',
            data: data_post,
            beforeSend : function(){
                Admin.loading_show('Loading');
            },
            success: function(res) {
                Admin.loading_hide();
                if(res.status == '1'){
                    var html = '<option value=""></option>';
                    res.data.forEach(function(item){
                        html += '<option value="'+item.name+'">'+item.name+'</option>';
                    });
                    $('select[name="resource"]').html(html);
                }else{
                    Admin.alert(res.data);
                }
            },
            error: function(e) {
                console.log(e);
            }
        });
    },
    random : function(length = 20){
        let result = '';
        let characters = 'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789';
        let charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
};