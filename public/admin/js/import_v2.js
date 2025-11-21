"use strict";

$(document).ready(function(){
    var uploadOpts = {
        target: '',//uri received data
        maxFiles : 1,
        chunkSize: 2*1024*1024,//2MB
        simultaneousUploads: 1,
        testChunks: false,
        throttleProgressCallbacks: 1,
        resumableChunkNumber: 1,
        fileType: ['xlsx','txt'],
        minFileSize : null,
        maxFileSize : 100 * 1024 * 1024,//100MB
        query: {_csrf: token_value},
        headers: {
            'CSRF-Token': token_value ,
            'Access-Control-Allow-Origin' : '*'
        },
        fileTypeErrorCallback: function(file, errorCount) {
            $('.resum-error').html('Chỉ cho phép upload file dạng ' + r.getOpt('fileType'));
        },
        maxFilesErrorCallback:function (files, errorCount) {
            $('.resum-error').html('Upload tối thiểu ' + r.getOpt('maxFiles') +' file');
        },
        minFileSizeErrorCallback:function(file, errorCount) {
            $('.resum-error').html('File quá nhỏ, dung lượng tối thiểu ' + r.formatSize(r.getOpt('minFileSize')));
        },
        maxFileSizeErrorCallback:function(file, errorCount) {
            $('.resum-error').html('File quá lớn, dung lượng tối đa ' + r.formatSize(r.getOpt('maxFileSize')));
        },
        generateUniqueIdentifier:function(file, event){
            var relativePath = file.webkitRelativePath||file.relativePath||file.fileName||file.name; // Some confusion in different versions of Firefox
            var size = file.size;
            relativePath = relativePath.toLowerCase();
            return(size + '-' + relativePath.replace(/[^0-9a-zA-Z_-]/img, ''));
        }
    };

    //Init
    var r = new Resumable(uploadOpts);

    // Upload method isn't supported, fall back on a different method
    if (!r.support) {
        $('.error').html('BROWSER Not support');
    } else {
        // Show a place for selecting files
        var elUploader = $('.resum-files');
        elUploader.after('<div class="resum-process" style="width: 50%"></div>');
        elUploader.after('<div class="resum-error"></div>');
        var btnName = elUploader.data('btn-name') || 'Upload';
        r.assignBrowse(elUploader[0]);
        // Handle file add event
        r.on('fileAdded', function (file) {
            $('.resum-error').empty();
            //Preview
            var html = '<div class="btn btn-primary resum-submit">'+btnName+'</div>'+
                '<div class="resumable-file-'+ file.uniqueIdentifier +'">' +
                '<span class="resum-file-name">'+ file.fileName +'</span>' +"\n\n\n\n"+
                '<span class="resum-file-size">'+ r.formatSize(file.size)+'</span>' +
                '</div>'+
                '<table><tr>' +
                '<td width="100%">' +
                '<div class="progress-container">' +
                '<div class="progress-bar"></div>' +
                '</div>' +
                '</td>' +
                '<td class="progress-text" nowrap="nowrap"></td>' +
                '<td class="progress-btn" nowrap="nowrap">' +
                '<a class="resum-resume" role="button"><i class="icon fa fa-play"></i></a>' +
                '<a class="resum-pause" role="button"><i class="icon fa fa-pause"></i></a>' +
                '<a class="resum-cancel" role="button"><i class="icon fa fa-remove"></i></a>' +
                '</td></tr></table>';
            $('.resum-process').html(html);
            $('.resum-files').hide();
            $('.resum-pause').on('click',function(){r.pause();});
            $('.resum-resume').on('click',function(){r.upload();});
            $('.resum-cancel').on('click',function(){r.cancel();});
            //Attach a click event upload
            $('.resum-submit').on('click',function(){
                if(r.files.length > 0 && r.isUploading() === false) r.upload();
            });
        });
        r.on('uploadStart', function () {
            Admin.loading_show();
            var flushData = elUploader.data('flush-data') || false;
            r.updateQuery({_csrf: token_value,flushData:flushData});
            // Show pause, hide resume
            $('.resum-pause').show();
            $('.resum-resume').hide();
        });
        r.on('pause', function () {
            // Show resume, hide pause
            $('.resum-pause').hide();
            $('.resum-resume').show();
        });
        r.on('cancel', function () {
            $('.result_import').empty();
            $('.resum-process').empty();
            $('.resum-files').show();
            $('.resum-submit').hide();
        });
        r.on('fileProgress', function (file) {
            // Handle progress for both the file and the overall upload
            $('.progress-text').html(Math.floor(file.progress() * 100) + '%');
            $('.progress-bar').css({width: Math.floor(r.progress() * 100) + '%'});
        });
        r.on('fileSuccess', function (file, message) {
            var res = JSON.parse(message);
            console.log('fileSuccess',res);
            if(res.status == 'starting_import'){
                handleImport(res.token);
                /*
                if(res.error == ''){
                    var htm = res.result.join("<br>");
                    $('.result_import').html(htm);
                }else{
                    $('.result_import').html(res.error);
                }
                */
            }
        });
        r.on('complete', function (file) {
            Admin.loading_hide();
            // Hide pause/resume when the upload has completed
            $('.resum-pause').hide();
            $('.resum-resume').hide();
        });
        r.on('fileError', function (file, message) {
            $('.resum-error').html('File error: ' + message);
        });
    }
});
