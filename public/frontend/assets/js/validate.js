!(function (t, e) {
  'object' == typeof exports && 'undefined' != typeof module
    ? (module.exports = e())
    : 'function' == typeof define && define.amd
    ? define(e)
    : (t.validate = e());
})(this, function () {
  'use strict';

  //load script validator
  var script = document.createElement('script');
  script.src = static_url + 'public/frontend/assets/js/validator.min.js';
  document.head.appendChild(script);

  var o = {
    //init function
    i() {
      this.errors = [];
      return this;
    },
    notEmpty(value, mess, key) {
      mess = mess ? mess : 'Value is required';
      if (
        value == undefined ||
        validator.isEmpty(value, { ignore_whitespace: true })
      ) {
        this.errors.push({ key: key, mess: mess });
      }
      return this;
    },
    equals(value, value2, mess, key) {
      mess = mess ? mess : 'Value is not equal';
      if (!validator.equals(value, value2)) {
        this.errors.push({ key: key, mess: mess });
      }
      return this;
    },
    isFormatEmail(value, mess, key) {
      mess = mess ? mess : 'Email incorrect';
      var re =
        /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|xyz|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
      if (typeof value === 'undefined' || !re.test(value)) {
        this.errors.push({ key: key, mess: mess });
      }
      return this;
    },
    isFormatPhone(value, mess, key) {
      console.log(value);
      mess = mess ? mess : 'Phone incorrect';
      var re =
        /^(096|097|098|086|032|033|034|035|036|037|038|039|094|091|081|082|083|084|085|088|093|090|089|070|076|077|078|079|092|052|056|058|059|099|019|095|087)+([0-9]{7})\b$/;
      if (typeof value === 'undefined' || !re.test(value)) {
        this.errors.push({ key: key, mess: mess });
      }
      return this;
    },
    /**
     * 6-50 chars, at least 1 lowercase, at least 1 uppercase and at least 1 numeric
     */
    isFormatPassword(value, mess, key) {
      mess = mess ? mess : 'Password incorrect';
      var re = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{6,30}$/;
      if (typeof value === 'undefined' || !re.test(value)) {
        this.errors.push({ key: key, mess: mess });
      }
      return this;
    },
    isValidDate(value,mess,key){
      mess = (mess) ? mess : 'Date incorrect';
      var regex_date = /^\d{2}\/\d{2}\/\d{4}$/;
      if(!regex_date.test(value)){
          this.errors.push({key:key,mess:mess});
          return this;
      }
      // Parse the date parts to integers
      var parts   = value.split('/');
      var day     = parseInt(parts[0], 10);
      var month   = parseInt(parts[1], 10);
      var year    = parseInt(parts[2], 10);
      // Check the ranges of month and year
      if(year < 1000 || year > 3000 || month == 0 || month > 12){
          this.errors.push({key:key,mess:mess});
          return this;
      }
      var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
      // Adjust for leap years
      if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)){
          monthLength[1] = 29;
      }
      
      if(day<=0 || day > monthLength[month - 1]){
          this.errors.push({key:key,mess:mess});
          return this;
      }
    },
    maxLength(value, maximum, mess,key) {
      mess = mess ? mess : 'Length value is maximum ' + maximum;
      if (value == undefined || value.length > maximum) {
        //this.errors.push(mess);
        this.errors.push({ key: key, mess: mess });
      }
      return this;
    },
    minLength(value, minimum, mess,key) {
      mess = mess ? mess : 'Length value is minimum ' + minimum;
      if (value == undefined || value.length < minimum) {
        //this.errors.push(mess);
        this.errors.push({ key: key, mess: mess });
      }
      return this;
    },
    isNumeric(value, mess) {
      mess = mess ? mess : 'Value must be Number';
      if (
        value == undefined ||
        !validator.isNumeric(value, { no_symbols: true })
      ) {
        this.errors.push(mess);
      }
      return this;
    },
    isArray(value, mess) {
      try {
        mess = mess ? mess : 'Value must be Array';
        if (
          value === null ||
          typeof value !== 'object' ||
          value.constructor !== Array
        ) {
          this.errors.push(mess);
        }
        return this;
      } catch (e) {
        return this;
      }
    },

    //check value is format
    isFormat(value, pattern, mess) {
      mess = mess ? mess : 'value incorrect format';
      var regex = new RegExp(pattern);
      if (typeof value === 'undefined' || !regex.test(value))
        this.errors.push(mess);
      return this;
    },
    //check if the string contains only letters (a-zA-Z).
    isAlpha(value, mess, locale = 'en-US') {
      mess = mess ? mess : 'The string must be contains only letters (a-zA-Z)';
      if (!validator.isAlpha(value, locale)) {
        this.errors.push(mess);
      }
      return this;
    },
    //check if the string contains only letters and numbers.
    isAlphanumeric(value, mess, key, locale = 'en-US',) {
      mess = mess ? mess : 'The string must be contains only letters (a-zA-Z)';
      if (!validator.isAlphanumeric(value, locale)) {
        //this.errors.push(mess);
        this.errors.push({ key: key, mess: mess });
      }
      return this;
    },
    /** check file type
     *
     * @param file_upload
     * @param mimetype []
     * @param mess
     * @returns {my_validate}
     */
    checkFileType(file_upload, mimetype, mess) {
      if (mimetype.indexOf(file_upload.mimetype) == -1) {
        mess = mess ? mess : 'Only accept file type: ' + mimetype;
        this.errors.push(mess);
      }
      return this;
    },
    /** check file size
     *
     * @param file_upload
     * @param size
     * @param mess
     * @returns {my_validate}
     */
    checkFileSize(file_upload, size, mess) {
      if (file_upload.size > size) {
        mess = mess ? mess : 'Maximum ' + Math.floor(size / 1048576) + 'MB';
        this.errors.push(mess);
      }
      return this;
    },
    hasErrors() {
      var err = [];
      if (this.errors.length > 0) {
        err = this.errors;
        this.errors = [];
      }
      return err;
    },
  };
  return o.i();
});
