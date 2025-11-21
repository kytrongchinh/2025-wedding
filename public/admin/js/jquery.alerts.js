//
// jquery.alertable.js - Minimal alert and confirmation alternatives.
//
// Developed by Cory LaViska for A Beautiful Site, LLC
//
// Licensed under the MIT license: http://opensource.org/licenses/MIT
//
if(jQuery) (function($) {
    'use strict';

    var modal,
        overlay,
        okButton,
        cancelButton,
        closeButton,
        closeX,
        activeElement;

    function show(type, message, options) {
        var defer = $.Deferred();

        // Remove focus from the background
        activeElement = document.activeElement;
        activeElement.blur();

        // Remove other instances
        $(modal).add(overlay).remove();

        // Merge options
        options = $.extend({}, $.alertable.defaults, options);

        // Create elements
        modal = $(options.modal).hide();
        overlay = $(options.overlay).hide();
        okButton = $(options.okButton);
        cancelButton = $(options.cancelButton);
        closeButton = $(options.closeButton);
        closeX = $(options.closeX);

        //Add Title
        if(options.title){
            modal.find('.alertable-title').html(options.title);
        }

        // Add message
        if( options.html ) {
            modal.find('.alertable-message').html(message);
        } else {
            modal.find('.alertable-message').text(message);
        }

        // Add prompt
        if( type === 'prompt' ) {
            modal.find('.alertable-prompt').html(options.prompt);
        } else {
            modal.find('.alertable-prompt').remove();
        }

        // Add buttons
        if(type === 'alert'){
            $(modal).find('.alertable-buttons').append(closeButton);
        }else{
            $(modal).find('.alertable-buttons').append(okButton).append(cancelButton);
        }

        //Add closeX
        if(options.closeX !== false){
            $(modal).find('.alertable-title').append(closeX);
        }


        // Add to container
        $(options.container).append(overlay).append(modal);

        // Show it
        options.show.call({
            modal: modal,
            overlay: overlay
        });

        // Set focus
        if( type === 'prompt' ) {
            // First input in the prompt
            $(modal).find('.alertable-prompt :input:first').focus();
        } else {
            // OK button
            $(modal).find(':input[type="submit"]').focus();
        }

        // Watch for submit
        $(modal).on('submit.alertable', function(event) {
            var i,
                formData,
                values = [];

            event.preventDefault();

            if( type === 'prompt' ) {
                formData = $(modal).serializeArray();
                for( i = 0; i < formData.length; i++ ) {
                    values[formData[i].name] = formData[i].value;
                }
            } else {
                values = null;
            }

            hide(options);
            defer.resolve(values);
        });

        // Watch for cancelButton
        cancelButton.on('click.alertable', function() {
            hide(options);
            defer.reject();
        });

        // Watch for closeButton
        closeButton.on('click.alertable', function() {
            hide(options);
        });

        // Watch for closeX
        closeX.on('click.alertable', function() {
            hide(options);
        });

        // Cancel on escape
        $(document).on('keydown.alertable', function(event) {
            if( event.keyCode === 27 ) {
                event.preventDefault();
                hide(options);
                defer.reject();
            }
        });

        // Prevent focus from leaving the modal
        $(document).on('focus.alertable', '*', function(event) {
            if( !$(event.target).parents().is('.alertable') ) {
                event.stopPropagation();
                event.target.blur();
                $(modal).find(':input:first').focus();
            }
        });

        return defer.promise();
    }

    function hide(options) {
        // Hide it
        options.hide.call({
            modal: modal,
            overlay: overlay
        });

        // Remove bindings
        $(document).off('.alertable');
        modal.off('.alertable');
        cancelButton.off('.alertable');
        closeButton.off('.alertable');
        closeX.off('.alertable');

        // Restore focus
        activeElement.focus();
    }

    // Defaults
    $.alertable = {
        // Show an alert
        alert: function(message, options) {
            return show('alert', message, options);
        },

        // Show a confirmation
        confirm: function(message, options) {
            return show('confirm', message, options);
        },

        // Show a prompt
        prompt: function(message, options) {
            return show('prompt', message, options);
        },
        hide : function(){
            var options = $.extend({}, $.alertable.defaults, options);
            return hide(options);
        },
        defaults: {
            // Preferences
            container: 'body',
            html: false,

            // Templates
            cancelButton: '<button class="alertable-cancel" type="button">Cancel</button>',
            okButton: '<button class="alertable-ok" type="submit">OK</button>',
            closeButton: '<button class="alertable-close" type="button">Close</button>',
            closeX: '<button class="alertable-close-x" type="button"><span aria-hidden="true">×</span></button>',
            overlay: '<div class="alertable-overlay"></div>',
            prompt: '<input class="alertable-input" type="text" name="value" maxlength="200">',
            modal:
            '<form class="alertable">' +
            '<div class="alertable-title"></div>' +
            '<div class="alertable-message"></div>' +
            '<div class="alertable-prompt"></div>' +
            '<div class="alertable-buttons"></div>' +
            '</form>',

            // Hooks
            hide: function() {
                $(this.modal).add(this.overlay).fadeOut(100);
            },
            show: function() {
                $(this.modal).add(this.overlay).fadeIn(100);
            }
        }
    };
})(jQuery);