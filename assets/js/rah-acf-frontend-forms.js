(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

global.jQuery = $ = window.jQuery;

window.acfAutoFill = function () {
  var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;


  var $forms = $('.acf-form');

  if (!$forms.length) {
    return;
  }

  var values = window.acfAutofillValues;
  if ((typeof values === 'undefined' ? 'undefined' : _typeof(values)) !== 'object') {
    console.warn('window.acfAutofillValues is not defined');
    return;
  }
  values = values[id];

  var scrollTop = $(document).scrollTop();

  $forms.each(function (i, el) {
    var $form = $(el);
    $form.addClass('is-autofilled');

    $form.find('.fill-password-suggestion').click();
    fillFields($form, values);

    $form.find('textarea').each(function (i, ta) {
      $(ta).trigger('maxlength:update');
      var evt = document.createEvent('Event');
      evt.initEvent('autosize:update', true, false);
      ta.dispatchEvent(evt);
    });

    $form.trigger('autofilled');
  });

  $('html,body').animate({
    scrollTop: scrollTop
  }, 0);

  function leadingZero(number) {
    if (number < 10) {
      return '0' + number;
    }
    return number;
  }

  function fillFields($wrap, values) {
    $.each(values, function (key, value) {
      var $fields = $wrap.find('.acf-field[data-name="' + key + '"]');

      if (!$fields.length) {
        return true;
      }

      $fields.each(function (i, el) {
        var $field = $(el);

        if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && !(value instanceof Date)) {

          $.each(value, function (key, val) {

            if (typeof key === 'number') {
              if (key > 0) {
                $field.find('[data-event="add-row"]:last').click();
              }
              var _$fields = $field.find('.acf-fields').eq(key);
              fillFields(_$fields, val);
            } else {
              fillFields($field, val);
            }
          });
        } else {

          var $inputs = $field.find('input, select, checkbox, textarea');
          fillField($inputs, value);
        }
      });
    });
  }

  function fillField($inputs, value) {

    $inputs.each(function (i, el) {
      var $input = $(el);
      var type = $input.attr('type');

      if (type === 'hidden' || $input.hasClass('select2-search__field') || type === 'file' || $input.parents('.acf-clone').length) {

        return true;
      }

      if (typeof $input.data('select2') !== 'undefined') {
        $input.select2("trigger", "select", {
          data: value
        }).trigger('change');
        return true;
      }

      switch (type) {

        case 'checkbox':
          $input.prop('checked', value).trigger('change');
          return true;
          break;
        case 'true_false':
          $input.prop('checked', value).trigger('change');
          return true;
          break;

      }

      if ($input.hasClass('hasDatepicker')) {
        $input.datepicker("setDate", value).trigger('change');
        return true;
      }

      // default
      $input.val(value).trigger('change');
    });
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * ACF Frontend Form
 * Version: 1.0
 */

global.jQuery = $ = window.jQuery;

var ACFFrontendForm = function () {
  function ACFFrontendForm($form) {
    var _this = this;

    var jsOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, ACFFrontendForm);

    // return if there is no form element
    if (!$form.length) {
      console.warn('Form element doesn\'t exist');
      return;
    }
    // return if global acf object doesn't exist
    if (typeof acf === 'undefined') {
      console.warn('The global acf object is not defined');
      return;
    }
    // return if form has already been initialized
    if ($form.hasClass('rah-is-initialized')) {
      return;
    }
    $form.addClass('rah-is-initialized');

    var defaultOptions = {
      ajaxSubmit: true,
      waitAfterSubmit: 1000,
      resetAfterSubmit: true,
      submitOnChange: false
    };

    var dataOptions = $form.data('rah-options') || {};

    this.options = $.extend(defaultOptions, dataOptions, jsOptions);

    this.$form = $form;

    acf.doAction('append', $form);
    acf.validation.enable();

    this.$form.find('.acf-field input').each(function (i, el) {
      _this.adjustHasValueClass($(el));
    });

    this.createAjaxResponse();
    this.setupForm();
    this.setupInputs();
    this.hideConditionalFields();

    this.$form.data('RAHFrontendForm', this);
  }

  _createClass(ACFFrontendForm, [{
    key: 'setupForm',
    value: function setupForm() {

      if (this.options.ajaxSubmit) {
        this.$form.addClass('is-ajax-submit');
        this.$form.on('submit', function (e) {
          e.preventDefault();
        });
      }

      this.$form.find('[data-event="add-row"]').removeClass('acf-icon');

      // disable the confirmation for repeater remove-row buttons
      this.$form.on('click', '[data-event="remove-row"]', function (e) {
        $(this).click();
      });
    }
  }, {
    key: 'doAjaxSubmit',
    value: function doAjaxSubmit() {
      var _this2 = this;

      // Fix for Safari Webkit – empty file inputs
      // https://stackoverflow.com/a/49827426/586823
      var $fileInputs = $('input[type="file"]:not([disabled])', this.$form);
      $fileInputs.each(function (i, input) {
        if (input.files.length > 0) {
          return;
        }
        $(input).prop('disabled', true);
      });

      var formData = new FormData(this.$form[0]);

      // Re-enable empty file $fileInputs
      $fileInputs.prop('disabled', false);

      acf.validation.lockForm(this.$form);
      this.$form.addClass('rah-is-locked');

      $.ajax({
        url: window.location.href,
        method: 'post',
        data: formData,
        cache: false,
        processData: false,
        contentType: false
      }).done(function (response) {
        _this2.handleAjaxResponse(response);
      });
    }
  }, {
    key: 'handleAjaxResponse',
    value: function handleAjaxResponse(response) {
      var _this3 = this;

      acf.validation.hideSpinner();
      this.showAjaxResponse(response);
      setTimeout(function () {
        _this3.$form.removeClass('show-ajax-response');
        acf.validation.unlockForm(_this3.$form);
        _this3.$form.removeClass('rah-is-locked');
        if (_this3.options.resetAfterSubmit) {
          _this3.resetForm();
        }
      }, this.options.waitAfterSubmit);
    }
  }, {
    key: 'createAjaxResponse',
    value: function createAjaxResponse() {
      this.$ajaxResponse = $('<div class="acf-ajax-response"></div>');
      this.$form.find('.acf-form-submit').append(this.$ajaxResponse);
    }
  }, {
    key: 'showAjaxResponse',
    value: function showAjaxResponse(response) {
      var message = response.data.message;
      this.$ajaxResponse.text(message).toggleClass('is--error', response.success === false);

      this.$form.addClass('show-ajax-response');
    }
  }, {
    key: 'resetForm',
    value: function resetForm() {
      this.$form.get(0).reset();
      this.$form.find('.acf-field').find('input,textarea,select').trigger('change');
      this.$form.find('.acf-field').removeClass('has-value has-focus');
    }
  }, {
    key: 'initImageDrops',
    value: function initImageDrops() {
      $('.acf-field-image').each(function (i, el) {
        new ImageDrop($(el));
      });
    }
  }, {
    key: 'hideConditionalFields',
    value: function hideConditionalFields() {
      this.$form.find('.acf-field.hidden-by-conditional-logic').hide();
    }
  }, {
    key: 'setupInputs',
    value: function setupInputs() {
      var _this4 = this;

      var selector = 'input,textarea,select';
      this.$form.on('keyup keydown change', selector, function (e) {
        return _this4.adjustHasValueClass($(e.currentTarget));
      });
      this.$form.on('change', selector, function (e) {
        return _this4.maybeSubmitForm();
      });
      this.$form.on('focus', selector, function (e) {
        return _this4.onInputFocus(e.currentTarget);
      });
      this.$form.on('blur', selector, function (e) {
        return _this4.onInputBlur(e.currentTarget);
      });
    }
  }, {
    key: 'adjustHasValueClass',
    value: function adjustHasValueClass($input) {

      var $field = $input.parents('.acf-field:first');
      var field = acf.getInstance($field);
      if (typeof field === 'undefined') {
        return;
      }
      var type = $input.attr('type');
      var val = $input.val();

      var enabledInputs = ['text', 'password', 'url', 'email', 'textarea', 'select', 'true_false', 'date_picker', 'time_picker', 'date_time_picker', 'oembed'];
      if ($.inArray(field.get('type'), enabledInputs) === -1) {
        return;
      }
      if (type === 'checkbox') {
        val = $input.prop('checked');
      }

      if (val) {
        $field.addClass('has-value');
      } else {
        $field.removeClass('has-value');
      }
    }
  }, {
    key: 'maybeSubmitForm',
    value: function maybeSubmitForm() {
      if (this.options.submitOnChange) {
        this.$form.find('[type="submit"]').click();
      }
    }
  }, {
    key: 'onInputFocus',
    value: function onInputFocus(el) {
      this.$field(el).addClass('has-focus');
    }
  }, {
    key: 'onInputBlur',
    value: function onInputBlur(el) {
      this.$field(el).removeClass('has-focus');
    }
  }, {
    key: '$field',
    value: function $field(input) {
      return $(input).parents('.acf-field:first');
    }
  }]);

  return ACFFrontendForm;
}();

exports.default = ACFFrontendForm;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _featherIcons = require('feather-icons');

var _featherIcons2 = _interopRequireDefault(_featherIcons);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

global.jQuery = $ = window.jQuery;

var ImageDrop = function () {
  function ImageDrop(acfField) {
    _classCallCheck(this, ImageDrop);

    // vars
    this.acfField = acfField;

    this.$el = acfField.$el;

    this.$input = this.$el.find('input[type="file"]');
    this.$imagePreview = this.$el.find('.image-wrap');
    this.$image = this.$imagePreview.find('img');
    this.$clear = this.$el.find('[data-name="remove"]');
    this.$clear.html(_featherIcons2.default.icons['x-circle'].toSvg());

    this.$imageUploader = this.$el.find('.acf-image-uploader');
    this.$instructions = this.$el.find('.instructions');
    this.$instructions.appendTo(this.$imageUploader);
    this.dataSettings = this.$instructions.data('settings');
    this.maxFileSize = this.maybeGet('max_size', this.dataSettings, false);

    this.$el.addClass('image-drop');
    this.setupEvents();
    this.renderImage(this.$image.attr('src'));
  }

  _createClass(ImageDrop, [{
    key: 'maybeGet',
    value: function maybeGet(key, object, fallback) {
      var value = object[key];
      if (typeof value === 'undefined') {
        value = fallback;
      }
      return value;
    }
  }, {
    key: 'setupEvents',
    value: function setupEvents() {
      var _this = this;

      if ($.inArray('dataTransfer', $.event.props) === -1) {
        $.event.props.push('dataTransfer');
      }

      this.$imageUploader.on('dragover', function (e) {
        e.preventDefault();
        _this.$imageUploader.addClass('is-dragover');
      });

      this.$imageUploader.on('dragleave', function () {
        _this.$imageUploader.removeClass('is-dragover');
      });

      this.$imageUploader.on('drop', function (e) {
        e.preventDefault();
        _this.$imageUploader.removeClass('is-dragover');
        _this.$input.get(0).files = e.dataTransfer.files;
        _this.$input.trigger('change');
        // this.parseFile( e.dataTransfer.files[0] );
      });

      this.$clear.unbind().click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        _this.clear();
      });

      this.currentImageSrc = this.$image.attr('src');

      this.lastInputVal = this.$input.val();
      this.$input.change(function (e) {
        return _this.onInputChange(_this.$input);
      });
    }
  }, {
    key: 'renderImage',
    value: function renderImage(src) {
      var _this2 = this;

      if (typeof src === 'undefined' || !src.length) {
        return;
      }

      var img = new Image();
      img.onload = function () {
        var ratio = img.height / img.width;
        if (ratio < 0.5) {
          _this2.clear(['The image can\'t be more than twice the width of it\'s height']);
          return;
        } else if (ratio > 2) {
          _this2.clear(['The image can\'t be more than twice the height of it\'s width']);
          return;
        }
        var paddingBottom = Math.floor(ratio * 100);
        _this2.$imageUploader.css({
          paddingBottom: paddingBottom + '%'
        });

        _this2.$image.attr('src', src);
        _this2.$imageUploader.addClass('has-value');

        $(document).trigger('rah/acf-form-resized');
      };
      img.src = src;
    }
  }, {
    key: 'clear',
    value: function clear() {
      var errors = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      this.acfField.removeAttachment();
      this.$input.val('');
      this.lastInputVal = this.$input.val();
      this.$imageUploader.css({ paddingBottom: '' });
      if (errors) {
        this.acfField.showError(errors.join('<br>'));
      }
    }
  }, {
    key: 'onInputChange',
    value: function onInputChange($input) {
      if (this.lastInputVal === $input.val()) {
        return;
      }
      this.lastInputVal = $input.val();
      if ($input.val()) {
        this.parseFile($input[0].files[0]);
      } else {
        this.clear();
      }
    }
  }, {
    key: 'parseFile',
    value: function parseFile(file) {
      var _this3 = this;

      var reader = new FileReader();
      reader.onload = function (e) {
        var errors = _this3.getErrors(file);
        if (!errors) {
          _this3.renderImage(e.target.result);
          _this3.acfField.removeError();
        } else {
          _this3.clear(errors);
          _this3.renderImage(_this3.currentImageSrc);
        }
      };
      reader.readAsDataURL(file);
    }
  }, {
    key: 'getErrors',
    value: function getErrors(file) {
      var errors = [];

      // Check for max size
      var maxSize = this.maybeGet('max_size', this.dataSettings.restrictions, false);
      if (maxSize && file.size / 1000000 > maxSize.value) {
        errors.push(maxSize.error);
      }

      // Check for mime type
      var mimeTypes = this.maybeGet('mime_types', this.dataSettings.restrictions, false);
      if (mimeTypes) {
        var extension = file.name.split('.').pop().toLowerCase(); // file extension from input file
        var isValidMimeType = $.inArray(extension, mimeTypes.value) > -1; // is extension in acceptable types
        if (!isValidMimeType) {
          errors.push(mimeTypes.error);
        }
      }

      return errors.length ? errors : false;
    }
  }]);

  return ImageDrop;
}();

exports.default = ImageDrop;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"feather-icons":7}],4:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

global.jQuery = $ = window.jQuery;

var MaxLength = function () {
  function MaxLength(field) {
    var _this = this;

    _classCallCheck(this, MaxLength);

    var $el = field.$el;
    this.$info = $el.find('.maxlength-info');
    this.max = parseInt(this.$info.attr('data-maxlength'), 10);
    this.$remainingCount = $el.find('.remaining-count');
    this.$input = field.$input();
    this.$input.on('input maxlength:update', function () {
      return _this.update();
    });
    this.update();
  }

  _createClass(MaxLength, [{
    key: 'update',
    value: function update() {
      var value = this.$input.val();
      var remaining = this.max - value.length;
      remaining = Math.max(0, remaining);
      if (remaining < 20) {
        this.$info.addClass('is-warning');
      } else {
        this.$info.removeClass('is-warning');
      }
      this.$remainingCount.text(remaining);
      this.$input.val(value.substring(0, this.max));
    }
  }]);

  return MaxLength;
}();

exports.default = MaxLength;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
(function (global){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('./modules/autofill');

var _frontendForm = require('./modules/frontend-form');

var _frontendForm2 = _interopRequireDefault(_frontendForm);

var _imageDrop = require('./modules/image-drop');

var _imageDrop2 = _interopRequireDefault(_imageDrop);

var _maxlength = require('./modules/maxlength');

var _maxlength2 = _interopRequireDefault(_maxlength);

var _autosize = require('autosize');

var _autosize2 = _interopRequireDefault(_autosize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * ACF Frontend Forms
 * Version: 1.0
 */

global.jQuery = $ = window.jQuery;

window.rah = window.rah || {};

window.rah.acfForm = function ($form) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var instance = $form.data('RAHFrontendForm');
  return instance || new _frontendForm2.default($form, options);
};

var App = function () {
  function App() {
    _classCallCheck(this, App);

    if (typeof acf === 'undefined') {
      console.warn('The global acf object is not defined');
      return;
    }

    this.setup();
    this.setupAjaxSubmit();
  }

  /**
   * Setup global acf functions and hooks
   */


  _createClass(App, [{
    key: 'setup',
    value: function setup() {
      var _this = this;

      // add initialized class to fields on initialization
      acf.addAction('new_field', function (field) {
        field.$el.addClass('rah-is-initialized');
        _this.initMaxInputInfo(field);
      });

      acf.addAction('new_field/type=image', function (field) {
        new _imageDrop2.default(field);
      });

      acf.addAction('new_field/type=textarea', function (field) {
        _this.initAutosize(field);
      });

      // functions
      acf.validation.show_spinner = acf.validation.showSpinner = function () {
        $('html').addClass('is-loading-form');
      };
      acf.validation.hide_spinner = acf.validation.hideSpinner = function () {
        $('html').removeClass('is-loading-form');
      };
      acf.addAction('remove', function ($el) {
        var $repeater = $el.closest('.acf-repeater');
        $el.remove();
        _this.adjustRepeater($el, $repeater, 'remove');
      });

      acf.addAction('append', function ($el) {
        _this.adjustRepeater($el, $el.closest('.acf-repeater'), 'append');
      });
    }

    /**
     * Setup the ajax submit
     */

  }, {
    key: 'setupAjaxSubmit',
    value: function setupAjaxSubmit() {
      var _this2 = this;

      acf.addAction('submit', function ($form) {

        if (!$form.hasClass('is-ajax-submit')) {
          return true;
        }

        _this2.getInstance($form).doAjaxSubmit();
      });
    }
  }, {
    key: 'getInstance',
    value: function getInstance($form) {
      return $form.data('RAHFrontendForm');
    }
  }, {
    key: 'initMaxInputInfo',
    value: function initMaxInputInfo(field) {
      var $info = field.$el.find('.maxlength-info');
      if ($info.length) {
        new _maxlength2.default(field);
      }
    }
  }, {
    key: 'initAutosize',
    value: function initAutosize(field) {
      var $input = field.$input();

      $input.each(function () {
        (0, _autosize2.default)(this);
      }).on('autosize:resized', function () {
        $(document).trigger('rah/acf-form-resized');
      });
    }
  }, {
    key: 'adjustRepeater',
    value: function adjustRepeater($el, $repeater, action) {
      if (!$repeater.length) {
        return;
      }
      // adjust disabled class
      var o = acf.get_data($repeater);
      var $rows = $repeater.find('.acf-row:not(.acf-clone)');
      var $lastRow = $rows.last();
      var $addRow = $lastRow.find('[data-event="add-row"]');
      $addRow.toggleClass('is-disabled', o.max > 0 && $rows.length >= o.max);

      switch (action) {
        case 'append':
          this.focusFirstInput($lastRow);
          break;
        case 'remove':
          break;
      }

      $(document).trigger('rah/acf-form-resized');
    }
  }, {
    key: 'focusFirstInput',
    value: function focusFirstInput($el) {
      // focus the first input of the new row
      setTimeout(function () {
        var $input = $el.find('input:first');
        if (!$input.length) {
          return;
        }
        $input.focus();
      }, 1);
    }
  }]);

  return App;
}();

new App();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./modules/autofill":1,"./modules/frontend-form":2,"./modules/image-drop":3,"./modules/maxlength":4,"autosize":6}],6:[function(require,module,exports){
/*!
	autosize 4.0.2
	license: MIT
	http://www.jacklmoore.com/autosize
*/
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['module', 'exports'], factory);
	} else if (typeof exports !== "undefined") {
		factory(module, exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod, mod.exports);
		global.autosize = mod.exports;
	}
})(this, function (module, exports) {
	'use strict';

	var map = typeof Map === "function" ? new Map() : function () {
		var keys = [];
		var values = [];

		return {
			has: function has(key) {
				return keys.indexOf(key) > -1;
			},
			get: function get(key) {
				return values[keys.indexOf(key)];
			},
			set: function set(key, value) {
				if (keys.indexOf(key) === -1) {
					keys.push(key);
					values.push(value);
				}
			},
			delete: function _delete(key) {
				var index = keys.indexOf(key);
				if (index > -1) {
					keys.splice(index, 1);
					values.splice(index, 1);
				}
			}
		};
	}();

	var createEvent = function createEvent(name) {
		return new Event(name, { bubbles: true });
	};
	try {
		new Event('test');
	} catch (e) {
		// IE does not support `new Event()`
		createEvent = function createEvent(name) {
			var evt = document.createEvent('Event');
			evt.initEvent(name, true, false);
			return evt;
		};
	}

	function assign(ta) {
		if (!ta || !ta.nodeName || ta.nodeName !== 'TEXTAREA' || map.has(ta)) return;

		var heightOffset = null;
		var clientWidth = null;
		var cachedHeight = null;

		function init() {
			var style = window.getComputedStyle(ta, null);

			if (style.resize === 'vertical') {
				ta.style.resize = 'none';
			} else if (style.resize === 'both') {
				ta.style.resize = 'horizontal';
			}

			if (style.boxSizing === 'content-box') {
				heightOffset = -(parseFloat(style.paddingTop) + parseFloat(style.paddingBottom));
			} else {
				heightOffset = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
			}
			// Fix when a textarea is not on document body and heightOffset is Not a Number
			if (isNaN(heightOffset)) {
				heightOffset = 0;
			}

			update();
		}

		function changeOverflow(value) {
			{
				// Chrome/Safari-specific fix:
				// When the textarea y-overflow is hidden, Chrome/Safari do not reflow the text to account for the space
				// made available by removing the scrollbar. The following forces the necessary text reflow.
				var width = ta.style.width;
				ta.style.width = '0px';
				// Force reflow:
				/* jshint ignore:start */
				ta.offsetWidth;
				/* jshint ignore:end */
				ta.style.width = width;
			}

			ta.style.overflowY = value;
		}

		function getParentOverflows(el) {
			var arr = [];

			while (el && el.parentNode && el.parentNode instanceof Element) {
				if (el.parentNode.scrollTop) {
					arr.push({
						node: el.parentNode,
						scrollTop: el.parentNode.scrollTop
					});
				}
				el = el.parentNode;
			}

			return arr;
		}

		function resize() {
			if (ta.scrollHeight === 0) {
				// If the scrollHeight is 0, then the element probably has display:none or is detached from the DOM.
				return;
			}

			var overflows = getParentOverflows(ta);
			var docTop = document.documentElement && document.documentElement.scrollTop; // Needed for Mobile IE (ticket #240)

			ta.style.height = '';
			ta.style.height = ta.scrollHeight + heightOffset + 'px';

			// used to check if an update is actually necessary on window.resize
			clientWidth = ta.clientWidth;

			// prevents scroll-position jumping
			overflows.forEach(function (el) {
				el.node.scrollTop = el.scrollTop;
			});

			if (docTop) {
				document.documentElement.scrollTop = docTop;
			}
		}

		function update() {
			resize();

			var styleHeight = Math.round(parseFloat(ta.style.height));
			var computed = window.getComputedStyle(ta, null);

			// Using offsetHeight as a replacement for computed.height in IE, because IE does not account use of border-box
			var actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(computed.height)) : ta.offsetHeight;

			// The actual height not matching the style height (set via the resize method) indicates that 
			// the max-height has been exceeded, in which case the overflow should be allowed.
			if (actualHeight < styleHeight) {
				if (computed.overflowY === 'hidden') {
					changeOverflow('scroll');
					resize();
					actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(window.getComputedStyle(ta, null).height)) : ta.offsetHeight;
				}
			} else {
				// Normally keep overflow set to hidden, to avoid flash of scrollbar as the textarea expands.
				if (computed.overflowY !== 'hidden') {
					changeOverflow('hidden');
					resize();
					actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(window.getComputedStyle(ta, null).height)) : ta.offsetHeight;
				}
			}

			if (cachedHeight !== actualHeight) {
				cachedHeight = actualHeight;
				var evt = createEvent('autosize:resized');
				try {
					ta.dispatchEvent(evt);
				} catch (err) {
					// Firefox will throw an error on dispatchEvent for a detached element
					// https://bugzilla.mozilla.org/show_bug.cgi?id=889376
				}
			}
		}

		var pageResize = function pageResize() {
			if (ta.clientWidth !== clientWidth) {
				update();
			}
		};

		var destroy = function (style) {
			window.removeEventListener('resize', pageResize, false);
			ta.removeEventListener('input', update, false);
			ta.removeEventListener('keyup', update, false);
			ta.removeEventListener('autosize:destroy', destroy, false);
			ta.removeEventListener('autosize:update', update, false);

			Object.keys(style).forEach(function (key) {
				ta.style[key] = style[key];
			});

			map.delete(ta);
		}.bind(ta, {
			height: ta.style.height,
			resize: ta.style.resize,
			overflowY: ta.style.overflowY,
			overflowX: ta.style.overflowX,
			wordWrap: ta.style.wordWrap
		});

		ta.addEventListener('autosize:destroy', destroy, false);

		// IE9 does not fire onpropertychange or oninput for deletions,
		// so binding to onkeyup to catch most of those events.
		// There is no way that I know of to detect something like 'cut' in IE9.
		if ('onpropertychange' in ta && 'oninput' in ta) {
			ta.addEventListener('keyup', update, false);
		}

		window.addEventListener('resize', pageResize, false);
		ta.addEventListener('input', update, false);
		ta.addEventListener('autosize:update', update, false);
		ta.style.overflowX = 'hidden';
		ta.style.wordWrap = 'break-word';

		map.set(ta, {
			destroy: destroy,
			update: update
		});

		init();
	}

	function destroy(ta) {
		var methods = map.get(ta);
		if (methods) {
			methods.destroy();
		}
	}

	function update(ta) {
		var methods = map.get(ta);
		if (methods) {
			methods.update();
		}
	}

	var autosize = null;

	// Do nothing in Node.js environment and IE8 (or lower)
	if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
		autosize = function autosize(el) {
			return el;
		};
		autosize.destroy = function (el) {
			return el;
		};
		autosize.update = function (el) {
			return el;
		};
	} else {
		autosize = function autosize(el, options) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], function (x) {
					return assign(x, options);
				});
			}
			return el;
		};
		autosize.destroy = function (el) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], destroy);
			}
			return el;
		};
		autosize.update = function (el) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], update);
			}
			return el;
		};
	}

	exports.default = autosize;
	module.exports = exports['default'];
});
},{}],7:[function(require,module,exports){
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["feather"] = factory();
	else
		root["feather"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./dist/icons.json":
/*!*************************!*\
  !*** ./dist/icons.json ***!
  \*************************/
/*! exports provided: activity, airplay, alert-circle, alert-octagon, alert-triangle, align-center, align-justify, align-left, align-right, anchor, aperture, archive, arrow-down-circle, arrow-down-left, arrow-down-right, arrow-down, arrow-left-circle, arrow-left, arrow-right-circle, arrow-right, arrow-up-circle, arrow-up-left, arrow-up-right, arrow-up, at-sign, award, bar-chart-2, bar-chart, battery-charging, battery, bell-off, bell, bluetooth, bold, book-open, book, bookmark, box, briefcase, calendar, camera-off, camera, cast, check-circle, check-square, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-left, chevrons-right, chevrons-up, chrome, circle, clipboard, clock, cloud-drizzle, cloud-lightning, cloud-off, cloud-rain, cloud-snow, cloud, code, codepen, command, compass, copy, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, cpu, credit-card, crop, crosshair, database, delete, disc, dollar-sign, download-cloud, download, droplet, edit-2, edit-3, edit, external-link, eye-off, eye, facebook, fast-forward, feather, file-minus, file-plus, file-text, file, film, filter, flag, folder-minus, folder-plus, folder, gift, git-branch, git-commit, git-merge, git-pull-request, github, gitlab, globe, grid, hard-drive, hash, headphones, heart, help-circle, home, image, inbox, info, instagram, italic, layers, layout, life-buoy, link-2, link, linkedin, list, loader, lock, log-in, log-out, mail, map-pin, map, maximize-2, maximize, menu, message-circle, message-square, mic-off, mic, minimize-2, minimize, minus-circle, minus-square, minus, monitor, moon, more-horizontal, more-vertical, move, music, navigation-2, navigation, octagon, package, paperclip, pause-circle, pause, percent, phone-call, phone-forwarded, phone-incoming, phone-missed, phone-off, phone-outgoing, phone, pie-chart, play-circle, play, plus-circle, plus-square, plus, pocket, power, printer, radio, refresh-ccw, refresh-cw, repeat, rewind, rotate-ccw, rotate-cw, rss, save, scissors, search, send, server, settings, share-2, share, shield-off, shield, shopping-bag, shopping-cart, shuffle, sidebar, skip-back, skip-forward, slack, slash, sliders, smartphone, speaker, square, star, stop-circle, sun, sunrise, sunset, tablet, tag, target, terminal, thermometer, thumbs-down, thumbs-up, toggle-left, toggle-right, trash-2, trash, trending-down, trending-up, triangle, truck, tv, twitter, type, umbrella, underline, unlock, upload-cloud, upload, user-check, user-minus, user-plus, user-x, user, users, video-off, video, voicemail, volume-1, volume-2, volume-x, volume, watch, wifi-off, wifi, wind, x-circle, x-square, x, youtube, zap-off, zap, zoom-in, zoom-out, default */
/***/ (function(module) {

module.exports = {"activity":"<polyline points=\"22 12 18 12 15 21 9 3 6 12 2 12\"></polyline>","airplay":"<path d=\"M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1\"></path><polygon points=\"12 15 17 21 7 21 12 15\"></polygon>","alert-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"16\"></line>","alert-octagon":"<polygon points=\"7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2\"></polygon><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"16\"></line>","alert-triangle":"<path d=\"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z\"></path><line x1=\"12\" y1=\"9\" x2=\"12\" y2=\"13\"></line><line x1=\"12\" y1=\"17\" x2=\"12\" y2=\"17\"></line>","align-center":"<line x1=\"18\" y1=\"10\" x2=\"6\" y2=\"10\"></line><line x1=\"21\" y1=\"6\" x2=\"3\" y2=\"6\"></line><line x1=\"21\" y1=\"14\" x2=\"3\" y2=\"14\"></line><line x1=\"18\" y1=\"18\" x2=\"6\" y2=\"18\"></line>","align-justify":"<line x1=\"21\" y1=\"10\" x2=\"3\" y2=\"10\"></line><line x1=\"21\" y1=\"6\" x2=\"3\" y2=\"6\"></line><line x1=\"21\" y1=\"14\" x2=\"3\" y2=\"14\"></line><line x1=\"21\" y1=\"18\" x2=\"3\" y2=\"18\"></line>","align-left":"<line x1=\"17\" y1=\"10\" x2=\"3\" y2=\"10\"></line><line x1=\"21\" y1=\"6\" x2=\"3\" y2=\"6\"></line><line x1=\"21\" y1=\"14\" x2=\"3\" y2=\"14\"></line><line x1=\"17\" y1=\"18\" x2=\"3\" y2=\"18\"></line>","align-right":"<line x1=\"21\" y1=\"10\" x2=\"7\" y2=\"10\"></line><line x1=\"21\" y1=\"6\" x2=\"3\" y2=\"6\"></line><line x1=\"21\" y1=\"14\" x2=\"3\" y2=\"14\"></line><line x1=\"21\" y1=\"18\" x2=\"7\" y2=\"18\"></line>","anchor":"<circle cx=\"12\" cy=\"5\" r=\"3\"></circle><line x1=\"12\" y1=\"22\" x2=\"12\" y2=\"8\"></line><path d=\"M5 12H2a10 10 0 0 0 20 0h-3\"></path>","aperture":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"14.31\" y1=\"8\" x2=\"20.05\" y2=\"17.94\"></line><line x1=\"9.69\" y1=\"8\" x2=\"21.17\" y2=\"8\"></line><line x1=\"7.38\" y1=\"12\" x2=\"13.12\" y2=\"2.06\"></line><line x1=\"9.69\" y1=\"16\" x2=\"3.95\" y2=\"6.06\"></line><line x1=\"14.31\" y1=\"16\" x2=\"2.83\" y2=\"16\"></line><line x1=\"16.62\" y1=\"12\" x2=\"10.88\" y2=\"21.94\"></line>","archive":"<polyline points=\"21 8 21 21 3 21 3 8\"></polyline><rect x=\"1\" y=\"3\" width=\"22\" height=\"5\"></rect><line x1=\"10\" y1=\"12\" x2=\"14\" y2=\"12\"></line>","arrow-down-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><polyline points=\"8 12 12 16 16 12\"></polyline><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"16\"></line>","arrow-down-left":"<line x1=\"17\" y1=\"7\" x2=\"7\" y2=\"17\"></line><polyline points=\"17 17 7 17 7 7\"></polyline>","arrow-down-right":"<line x1=\"7\" y1=\"7\" x2=\"17\" y2=\"17\"></line><polyline points=\"17 7 17 17 7 17\"></polyline>","arrow-down":"<line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"></line><polyline points=\"19 12 12 19 5 12\"></polyline>","arrow-left-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><polyline points=\"12 8 8 12 12 16\"></polyline><line x1=\"16\" y1=\"12\" x2=\"8\" y2=\"12\"></line>","arrow-left":"<line x1=\"19\" y1=\"12\" x2=\"5\" y2=\"12\"></line><polyline points=\"12 19 5 12 12 5\"></polyline>","arrow-right-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><polyline points=\"12 16 16 12 12 8\"></polyline><line x1=\"8\" y1=\"12\" x2=\"16\" y2=\"12\"></line>","arrow-right":"<line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line><polyline points=\"12 5 19 12 12 19\"></polyline>","arrow-up-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><polyline points=\"16 12 12 8 8 12\"></polyline><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"8\"></line>","arrow-up-left":"<line x1=\"17\" y1=\"17\" x2=\"7\" y2=\"7\"></line><polyline points=\"7 17 7 7 17 7\"></polyline>","arrow-up-right":"<line x1=\"7\" y1=\"17\" x2=\"17\" y2=\"7\"></line><polyline points=\"7 7 17 7 17 17\"></polyline>","arrow-up":"<line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"5\"></line><polyline points=\"5 12 12 5 19 12\"></polyline>","at-sign":"<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94\"></path>","award":"<circle cx=\"12\" cy=\"8\" r=\"7\"></circle><polyline points=\"8.21 13.89 7 23 12 20 17 23 15.79 13.88\"></polyline>","bar-chart-2":"<line x1=\"18\" y1=\"20\" x2=\"18\" y2=\"10\"></line><line x1=\"12\" y1=\"20\" x2=\"12\" y2=\"4\"></line><line x1=\"6\" y1=\"20\" x2=\"6\" y2=\"14\"></line>","bar-chart":"<line x1=\"12\" y1=\"20\" x2=\"12\" y2=\"10\"></line><line x1=\"18\" y1=\"20\" x2=\"18\" y2=\"4\"></line><line x1=\"6\" y1=\"20\" x2=\"6\" y2=\"16\"></line>","battery-charging":"<path d=\"M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.19\"></path><line x1=\"23\" y1=\"13\" x2=\"23\" y2=\"11\"></line><polyline points=\"11 6 7 12 13 12 9 18\"></polyline>","battery":"<rect x=\"1\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\" ry=\"2\"></rect><line x1=\"23\" y1=\"13\" x2=\"23\" y2=\"11\"></line>","bell-off":"<path d=\"M8.56 2.9A7 7 0 0 1 19 9v4m-2 4H2a3 3 0 0 0 3-3V9a7 7 0 0 1 .78-3.22M13.73 21a2 2 0 0 1-3.46 0\"></path><line x1=\"1\" y1=\"1\" x2=\"23\" y2=\"23\"></line>","bell":"<path d=\"M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0\"></path>","bluetooth":"<polyline points=\"6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5\"></polyline>","bold":"<path d=\"M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z\"></path><path d=\"M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z\"></path>","book-open":"<path d=\"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z\"></path><path d=\"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z\"></path>","book":"<path d=\"M4 19.5A2.5 2.5 0 0 1 6.5 17H20\"></path><path d=\"M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z\"></path>","bookmark":"<path d=\"M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z\"></path>","box":"<path d=\"M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z\"></path><polyline points=\"2.32 6.16 12 11 21.68 6.16\"></polyline><line x1=\"12\" y1=\"22.76\" x2=\"12\" y2=\"11\"></line>","briefcase":"<rect x=\"2\" y=\"7\" width=\"20\" height=\"14\" rx=\"2\" ry=\"2\"></rect><path d=\"M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16\"></path>","calendar":"<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect><line x1=\"16\" y1=\"2\" x2=\"16\" y2=\"6\"></line><line x1=\"8\" y1=\"2\" x2=\"8\" y2=\"6\"></line><line x1=\"3\" y1=\"10\" x2=\"21\" y2=\"10\"></line>","camera-off":"<line x1=\"1\" y1=\"1\" x2=\"23\" y2=\"23\"></line><path d=\"M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56\"></path>","camera":"<path d=\"M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z\"></path><circle cx=\"12\" cy=\"13\" r=\"4\"></circle>","cast":"<path d=\"M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6\"></path><line x1=\"2\" y1=\"20\" x2=\"2\" y2=\"20\"></line>","check-circle":"<path d=\"M22 11.08V12a10 10 0 1 1-5.93-9.14\"></path><polyline points=\"22 4 12 14.01 9 11.01\"></polyline>","check-square":"<polyline points=\"9 11 12 14 22 4\"></polyline><path d=\"M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11\"></path>","check":"<polyline points=\"20 6 9 17 4 12\"></polyline>","chevron-down":"<polyline points=\"6 9 12 15 18 9\"></polyline>","chevron-left":"<polyline points=\"15 18 9 12 15 6\"></polyline>","chevron-right":"<polyline points=\"9 18 15 12 9 6\"></polyline>","chevron-up":"<polyline points=\"18 15 12 9 6 15\"></polyline>","chevrons-down":"<polyline points=\"7 13 12 18 17 13\"></polyline><polyline points=\"7 6 12 11 17 6\"></polyline>","chevrons-left":"<polyline points=\"11 17 6 12 11 7\"></polyline><polyline points=\"18 17 13 12 18 7\"></polyline>","chevrons-right":"<polyline points=\"13 17 18 12 13 7\"></polyline><polyline points=\"6 17 11 12 6 7\"></polyline>","chevrons-up":"<polyline points=\"17 11 12 6 7 11\"></polyline><polyline points=\"17 18 12 13 7 18\"></polyline>","chrome":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><line x1=\"21.17\" y1=\"8\" x2=\"12\" y2=\"8\"></line><line x1=\"3.95\" y1=\"6.06\" x2=\"8.54\" y2=\"14\"></line><line x1=\"10.88\" y1=\"21.94\" x2=\"15.46\" y2=\"14\"></line>","circle":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle>","clipboard":"<path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"></path><rect x=\"8\" y=\"2\" width=\"8\" height=\"4\" rx=\"1\" ry=\"1\"></rect>","clock":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><polyline points=\"12 6 12 12 16 14\"></polyline>","cloud-drizzle":"<line x1=\"8\" y1=\"19\" x2=\"8\" y2=\"21\"></line><line x1=\"8\" y1=\"13\" x2=\"8\" y2=\"15\"></line><line x1=\"16\" y1=\"19\" x2=\"16\" y2=\"21\"></line><line x1=\"16\" y1=\"13\" x2=\"16\" y2=\"15\"></line><line x1=\"12\" y1=\"21\" x2=\"12\" y2=\"23\"></line><line x1=\"12\" y1=\"15\" x2=\"12\" y2=\"17\"></line><path d=\"M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25\"></path>","cloud-lightning":"<path d=\"M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9\"></path><polyline points=\"13 11 9 17 15 17 11 23\"></polyline>","cloud-off":"<path d=\"M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3\"></path><line x1=\"1\" y1=\"1\" x2=\"23\" y2=\"23\"></line>","cloud-rain":"<line x1=\"16\" y1=\"13\" x2=\"16\" y2=\"21\"></line><line x1=\"8\" y1=\"13\" x2=\"8\" y2=\"21\"></line><line x1=\"12\" y1=\"15\" x2=\"12\" y2=\"23\"></line><path d=\"M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25\"></path>","cloud-snow":"<path d=\"M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25\"></path><line x1=\"8\" y1=\"16\" x2=\"8\" y2=\"16\"></line><line x1=\"8\" y1=\"20\" x2=\"8\" y2=\"20\"></line><line x1=\"12\" y1=\"18\" x2=\"12\" y2=\"18\"></line><line x1=\"12\" y1=\"22\" x2=\"12\" y2=\"22\"></line><line x1=\"16\" y1=\"16\" x2=\"16\" y2=\"16\"></line><line x1=\"16\" y1=\"20\" x2=\"16\" y2=\"20\"></line>","cloud":"<path d=\"M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z\"></path>","code":"<polyline points=\"16 18 22 12 16 6\"></polyline><polyline points=\"8 6 2 12 8 18\"></polyline>","codepen":"<polygon points=\"12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2\"></polygon><line x1=\"12\" y1=\"22\" x2=\"12\" y2=\"15.5\"></line><polyline points=\"22 8.5 12 15.5 2 8.5\"></polyline><polyline points=\"2 15.5 12 8.5 22 15.5\"></polyline><line x1=\"12\" y1=\"2\" x2=\"12\" y2=\"8.5\"></line>","command":"<path d=\"M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z\"></path>","compass":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><polygon points=\"16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76\"></polygon>","copy":"<rect x=\"9\" y=\"9\" width=\"13\" height=\"13\" rx=\"2\" ry=\"2\"></rect><path d=\"M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1\"></path>","corner-down-left":"<polyline points=\"9 10 4 15 9 20\"></polyline><path d=\"M20 4v7a4 4 0 0 1-4 4H4\"></path>","corner-down-right":"<polyline points=\"15 10 20 15 15 20\"></polyline><path d=\"M4 4v7a4 4 0 0 0 4 4h12\"></path>","corner-left-down":"<polyline points=\"14 15 9 20 4 15\"></polyline><path d=\"M20 4h-7a4 4 0 0 0-4 4v12\"></path>","corner-left-up":"<polyline points=\"14 9 9 4 4 9\"></polyline><path d=\"M20 20h-7a4 4 0 0 1-4-4V4\"></path>","corner-right-down":"<polyline points=\"10 15 15 20 20 15\"></polyline><path d=\"M4 4h7a4 4 0 0 1 4 4v12\"></path>","corner-right-up":"<polyline points=\"10 9 15 4 20 9\"></polyline><path d=\"M4 20h7a4 4 0 0 0 4-4V4\"></path>","corner-up-left":"<polyline points=\"9 14 4 9 9 4\"></polyline><path d=\"M20 20v-7a4 4 0 0 0-4-4H4\"></path>","corner-up-right":"<polyline points=\"15 14 20 9 15 4\"></polyline><path d=\"M4 20v-7a4 4 0 0 1 4-4h12\"></path>","cpu":"<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\" ry=\"2\"></rect><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\"></rect><line x1=\"9\" y1=\"1\" x2=\"9\" y2=\"4\"></line><line x1=\"15\" y1=\"1\" x2=\"15\" y2=\"4\"></line><line x1=\"9\" y1=\"20\" x2=\"9\" y2=\"23\"></line><line x1=\"15\" y1=\"20\" x2=\"15\" y2=\"23\"></line><line x1=\"20\" y1=\"9\" x2=\"23\" y2=\"9\"></line><line x1=\"20\" y1=\"14\" x2=\"23\" y2=\"14\"></line><line x1=\"1\" y1=\"9\" x2=\"4\" y2=\"9\"></line><line x1=\"1\" y1=\"14\" x2=\"4\" y2=\"14\"></line>","credit-card":"<rect x=\"1\" y=\"4\" width=\"22\" height=\"16\" rx=\"2\" ry=\"2\"></rect><line x1=\"1\" y1=\"10\" x2=\"23\" y2=\"10\"></line>","crop":"<path d=\"M6.13 1L6 16a2 2 0 0 0 2 2h15\"></path><path d=\"M1 6.13L16 6a2 2 0 0 1 2 2v15\"></path>","crosshair":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"22\" y1=\"12\" x2=\"18\" y2=\"12\"></line><line x1=\"6\" y1=\"12\" x2=\"2\" y2=\"12\"></line><line x1=\"12\" y1=\"6\" x2=\"12\" y2=\"2\"></line><line x1=\"12\" y1=\"22\" x2=\"12\" y2=\"18\"></line>","database":"<ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\"></ellipse><path d=\"M21 12c0 1.66-4 3-9 3s-9-1.34-9-3\"></path><path d=\"M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5\"></path>","delete":"<path d=\"M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z\"></path><line x1=\"18\" y1=\"9\" x2=\"12\" y2=\"15\"></line><line x1=\"12\" y1=\"9\" x2=\"18\" y2=\"15\"></line>","disc":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>","dollar-sign":"<line x1=\"12\" y1=\"1\" x2=\"12\" y2=\"23\"></line><path d=\"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"></path>","download-cloud":"<polyline points=\"8 17 12 21 16 17\"></polyline><line x1=\"12\" y1=\"12\" x2=\"12\" y2=\"21\"></line><path d=\"M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29\"></path>","download":"<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><polyline points=\"7 10 12 15 17 10\"></polyline><line x1=\"12\" y1=\"15\" x2=\"12\" y2=\"3\"></line>","droplet":"<path d=\"M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z\"></path>","edit-2":"<polygon points=\"16 3 21 8 8 21 3 21 3 16 16 3\"></polygon>","edit-3":"<polygon points=\"14 2 18 6 7 17 3 17 3 13 14 2\"></polygon><line x1=\"3\" y1=\"22\" x2=\"21\" y2=\"22\"></line>","edit":"<path d=\"M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34\"></path><polygon points=\"18 2 22 6 12 16 8 16 8 12 18 2\"></polygon>","external-link":"<path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"></path><polyline points=\"15 3 21 3 21 9\"></polyline><line x1=\"10\" y1=\"14\" x2=\"21\" y2=\"3\"></line>","eye-off":"<path d=\"M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24\"></path><line x1=\"1\" y1=\"1\" x2=\"23\" y2=\"23\"></line>","eye":"<path d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>","facebook":"<path d=\"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z\"></path>","fast-forward":"<polygon points=\"13 19 22 12 13 5 13 19\"></polygon><polygon points=\"2 19 11 12 2 5 2 19\"></polygon>","feather":"<path d=\"M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z\"></path><line x1=\"16\" y1=\"8\" x2=\"2\" y2=\"22\"></line><line x1=\"17\" y1=\"15\" x2=\"9\" y2=\"15\"></line>","file-minus":"<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><polyline points=\"14 2 14 8 20 8\"></polyline><line x1=\"9\" y1=\"15\" x2=\"15\" y2=\"15\"></line>","file-plus":"<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><polyline points=\"14 2 14 8 20 8\"></polyline><line x1=\"12\" y1=\"18\" x2=\"12\" y2=\"12\"></line><line x1=\"9\" y1=\"15\" x2=\"15\" y2=\"15\"></line>","file-text":"<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><polyline points=\"14 2 14 8 20 8\"></polyline><line x1=\"16\" y1=\"13\" x2=\"8\" y2=\"13\"></line><line x1=\"16\" y1=\"17\" x2=\"8\" y2=\"17\"></line><polyline points=\"10 9 9 9 8 9\"></polyline>","file":"<path d=\"M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z\"></path><polyline points=\"13 2 13 9 20 9\"></polyline>","film":"<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"2.18\" ry=\"2.18\"></rect><line x1=\"7\" y1=\"2\" x2=\"7\" y2=\"22\"></line><line x1=\"17\" y1=\"2\" x2=\"17\" y2=\"22\"></line><line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\"></line><line x1=\"2\" y1=\"7\" x2=\"7\" y2=\"7\"></line><line x1=\"2\" y1=\"17\" x2=\"7\" y2=\"17\"></line><line x1=\"17\" y1=\"17\" x2=\"22\" y2=\"17\"></line><line x1=\"17\" y1=\"7\" x2=\"22\" y2=\"7\"></line>","filter":"<polygon points=\"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3\"></polygon>","flag":"<path d=\"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z\"></path><line x1=\"4\" y1=\"22\" x2=\"4\" y2=\"15\"></line>","folder-minus":"<path d=\"M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z\"></path><line x1=\"9\" y1=\"14\" x2=\"15\" y2=\"14\"></line>","folder-plus":"<path d=\"M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z\"></path><line x1=\"12\" y1=\"11\" x2=\"12\" y2=\"17\"></line><line x1=\"9\" y1=\"14\" x2=\"15\" y2=\"14\"></line>","folder":"<path d=\"M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z\"></path>","gift":"<polyline points=\"20 12 20 22 4 22 4 12\"></polyline><rect x=\"2\" y=\"7\" width=\"20\" height=\"5\"></rect><line x1=\"12\" y1=\"22\" x2=\"12\" y2=\"7\"></line><path d=\"M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z\"></path><path d=\"M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z\"></path>","git-branch":"<line x1=\"6\" y1=\"3\" x2=\"6\" y2=\"15\"></line><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><circle cx=\"6\" cy=\"18\" r=\"3\"></circle><path d=\"M18 9a9 9 0 0 1-9 9\"></path>","git-commit":"<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><line x1=\"1.05\" y1=\"12\" x2=\"7\" y2=\"12\"></line><line x1=\"17.01\" y1=\"12\" x2=\"22.96\" y2=\"12\"></line>","git-merge":"<circle cx=\"18\" cy=\"18\" r=\"3\"></circle><circle cx=\"6\" cy=\"6\" r=\"3\"></circle><path d=\"M6 21V9a9 9 0 0 0 9 9\"></path>","git-pull-request":"<circle cx=\"18\" cy=\"18\" r=\"3\"></circle><circle cx=\"6\" cy=\"6\" r=\"3\"></circle><path d=\"M13 6h3a2 2 0 0 1 2 2v7\"></path><line x1=\"6\" y1=\"9\" x2=\"6\" y2=\"21\"></line>","github":"<path d=\"M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22\"></path>","gitlab":"<path d=\"M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z\"></path>","globe":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\"></line><path d=\"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"></path>","grid":"<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"></rect><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"></rect>","hard-drive":"<line x1=\"22\" y1=\"12\" x2=\"2\" y2=\"12\"></line><path d=\"M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z\"></path><line x1=\"6\" y1=\"16\" x2=\"6\" y2=\"16\"></line><line x1=\"10\" y1=\"16\" x2=\"10\" y2=\"16\"></line>","hash":"<line x1=\"4\" y1=\"9\" x2=\"20\" y2=\"9\"></line><line x1=\"4\" y1=\"15\" x2=\"20\" y2=\"15\"></line><line x1=\"10\" y1=\"3\" x2=\"8\" y2=\"21\"></line><line x1=\"16\" y1=\"3\" x2=\"14\" y2=\"21\"></line>","headphones":"<path d=\"M3 18v-6a9 9 0 0 1 18 0v6\"></path><path d=\"M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z\"></path>","heart":"<path d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"></path>","help-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"></path><line x1=\"12\" y1=\"17\" x2=\"12\" y2=\"17\"></line>","home":"<path d=\"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"></path><polyline points=\"9 22 9 12 15 12 15 22\"></polyline>","image":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"></circle><polyline points=\"21 15 16 10 5 21\"></polyline>","inbox":"<polyline points=\"22 12 16 12 14 15 10 15 8 12 2 12\"></polyline><path d=\"M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z\"></path>","info":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"8\"></line>","instagram":"<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"5\" ry=\"5\"></rect><path d=\"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z\"></path><line x1=\"17.5\" y1=\"6.5\" x2=\"17.5\" y2=\"6.5\"></line>","italic":"<line x1=\"19\" y1=\"4\" x2=\"10\" y2=\"4\"></line><line x1=\"14\" y1=\"20\" x2=\"5\" y2=\"20\"></line><line x1=\"15\" y1=\"4\" x2=\"9\" y2=\"20\"></line>","layers":"<polygon points=\"12 2 2 7 12 12 22 7 12 2\"></polygon><polyline points=\"2 17 12 22 22 17\"></polyline><polyline points=\"2 12 12 17 22 12\"></polyline>","layout":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect><line x1=\"3\" y1=\"9\" x2=\"21\" y2=\"9\"></line><line x1=\"9\" y1=\"21\" x2=\"9\" y2=\"9\"></line>","life-buoy":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><line x1=\"4.93\" y1=\"4.93\" x2=\"9.17\" y2=\"9.17\"></line><line x1=\"14.83\" y1=\"14.83\" x2=\"19.07\" y2=\"19.07\"></line><line x1=\"14.83\" y1=\"9.17\" x2=\"19.07\" y2=\"4.93\"></line><line x1=\"14.83\" y1=\"9.17\" x2=\"18.36\" y2=\"5.64\"></line><line x1=\"4.93\" y1=\"19.07\" x2=\"9.17\" y2=\"14.83\"></line>","link-2":"<path d=\"M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3\"></path><line x1=\"8\" y1=\"12\" x2=\"16\" y2=\"12\"></line>","link":"<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"></path><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"></path>","linkedin":"<path d=\"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z\"></path><rect x=\"2\" y=\"9\" width=\"4\" height=\"12\"></rect><circle cx=\"4\" cy=\"4\" r=\"2\"></circle>","list":"<line x1=\"8\" y1=\"6\" x2=\"21\" y2=\"6\"></line><line x1=\"8\" y1=\"12\" x2=\"21\" y2=\"12\"></line><line x1=\"8\" y1=\"18\" x2=\"21\" y2=\"18\"></line><line x1=\"3\" y1=\"6\" x2=\"3\" y2=\"6\"></line><line x1=\"3\" y1=\"12\" x2=\"3\" y2=\"12\"></line><line x1=\"3\" y1=\"18\" x2=\"3\" y2=\"18\"></line>","loader":"<line x1=\"12\" y1=\"2\" x2=\"12\" y2=\"6\"></line><line x1=\"12\" y1=\"18\" x2=\"12\" y2=\"22\"></line><line x1=\"4.93\" y1=\"4.93\" x2=\"7.76\" y2=\"7.76\"></line><line x1=\"16.24\" y1=\"16.24\" x2=\"19.07\" y2=\"19.07\"></line><line x1=\"2\" y1=\"12\" x2=\"6\" y2=\"12\"></line><line x1=\"18\" y1=\"12\" x2=\"22\" y2=\"12\"></line><line x1=\"4.93\" y1=\"19.07\" x2=\"7.76\" y2=\"16.24\"></line><line x1=\"16.24\" y1=\"7.76\" x2=\"19.07\" y2=\"4.93\"></line>","lock":"<rect x=\"3\" y=\"11\" width=\"18\" height=\"11\" rx=\"2\" ry=\"2\"></rect><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"></path>","log-in":"<path d=\"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4\"></path><polyline points=\"10 17 15 12 10 7\"></polyline><line x1=\"15\" y1=\"12\" x2=\"3\" y2=\"12\"></line>","log-out":"<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"></path><polyline points=\"16 17 21 12 16 7\"></polyline><line x1=\"21\" y1=\"12\" x2=\"9\" y2=\"12\"></line>","mail":"<path d=\"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\"></path><polyline points=\"22,6 12,13 2,6\"></polyline>","map-pin":"<path d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"></path><circle cx=\"12\" cy=\"10\" r=\"3\"></circle>","map":"<polygon points=\"1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6\"></polygon><line x1=\"8\" y1=\"2\" x2=\"8\" y2=\"18\"></line><line x1=\"16\" y1=\"6\" x2=\"16\" y2=\"22\"></line>","maximize-2":"<polyline points=\"15 3 21 3 21 9\"></polyline><polyline points=\"9 21 3 21 3 15\"></polyline><line x1=\"21\" y1=\"3\" x2=\"14\" y2=\"10\"></line><line x1=\"3\" y1=\"21\" x2=\"10\" y2=\"14\"></line>","maximize":"<path d=\"M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3\"></path>","menu":"<line x1=\"3\" y1=\"12\" x2=\"21\" y2=\"12\"></line><line x1=\"3\" y1=\"6\" x2=\"21\" y2=\"6\"></line><line x1=\"3\" y1=\"18\" x2=\"21\" y2=\"18\"></line>","message-circle":"<path d=\"M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z\"></path>","message-square":"<path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"></path>","mic-off":"<line x1=\"1\" y1=\"1\" x2=\"23\" y2=\"23\"></line><path d=\"M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6\"></path><path d=\"M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23\"></path><line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"23\"></line><line x1=\"8\" y1=\"23\" x2=\"16\" y2=\"23\"></line>","mic":"<path d=\"M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z\"></path><path d=\"M19 10v2a7 7 0 0 1-14 0v-2\"></path><line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"23\"></line><line x1=\"8\" y1=\"23\" x2=\"16\" y2=\"23\"></line>","minimize-2":"<polyline points=\"4 14 10 14 10 20\"></polyline><polyline points=\"20 10 14 10 14 4\"></polyline><line x1=\"14\" y1=\"10\" x2=\"21\" y2=\"3\"></line><line x1=\"3\" y1=\"21\" x2=\"10\" y2=\"14\"></line>","minimize":"<path d=\"M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3\"></path>","minus-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"8\" y1=\"12\" x2=\"16\" y2=\"12\"></line>","minus-square":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect><line x1=\"8\" y1=\"12\" x2=\"16\" y2=\"12\"></line>","minus":"<line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line>","monitor":"<rect x=\"2\" y=\"3\" width=\"20\" height=\"14\" rx=\"2\" ry=\"2\"></rect><line x1=\"8\" y1=\"21\" x2=\"16\" y2=\"21\"></line><line x1=\"12\" y1=\"17\" x2=\"12\" y2=\"21\"></line>","moon":"<path d=\"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z\"></path>","more-horizontal":"<circle cx=\"12\" cy=\"12\" r=\"1\"></circle><circle cx=\"19\" cy=\"12\" r=\"1\"></circle><circle cx=\"5\" cy=\"12\" r=\"1\"></circle>","more-vertical":"<circle cx=\"12\" cy=\"12\" r=\"1\"></circle><circle cx=\"12\" cy=\"5\" r=\"1\"></circle><circle cx=\"12\" cy=\"19\" r=\"1\"></circle>","move":"<polyline points=\"5 9 2 12 5 15\"></polyline><polyline points=\"9 5 12 2 15 5\"></polyline><polyline points=\"15 19 12 22 9 19\"></polyline><polyline points=\"19 9 22 12 19 15\"></polyline><line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\"></line><line x1=\"12\" y1=\"2\" x2=\"12\" y2=\"22\"></line>","music":"<path d=\"M9 17H5a2 2 0 0 0-2 2 2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm12-2h-4a2 2 0 0 0-2 2 2 2 0 0 0 2 2h2a2 2 0 0 0 2-2z\"></path><polyline points=\"9 17 9 5 21 3 21 15\"></polyline>","navigation-2":"<polygon points=\"12 2 19 21 12 17 5 21 12 2\"></polygon>","navigation":"<polygon points=\"3 11 22 2 13 21 11 13 3 11\"></polygon>","octagon":"<polygon points=\"7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2\"></polygon>","package":"<path d=\"M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z\"></path><polyline points=\"2.32 6.16 12 11 21.68 6.16\"></polyline><line x1=\"12\" y1=\"22.76\" x2=\"12\" y2=\"11\"></line><line x1=\"7\" y1=\"3.5\" x2=\"17\" y2=\"8.5\"></line>","paperclip":"<path d=\"M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48\"></path>","pause-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"10\" y1=\"15\" x2=\"10\" y2=\"9\"></line><line x1=\"14\" y1=\"15\" x2=\"14\" y2=\"9\"></line>","pause":"<rect x=\"6\" y=\"4\" width=\"4\" height=\"16\"></rect><rect x=\"14\" y=\"4\" width=\"4\" height=\"16\"></rect>","percent":"<line x1=\"19\" y1=\"5\" x2=\"5\" y2=\"19\"></line><circle cx=\"6.5\" cy=\"6.5\" r=\"2.5\"></circle><circle cx=\"17.5\" cy=\"17.5\" r=\"2.5\"></circle>","phone-call":"<path d=\"M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"></path>","phone-forwarded":"<polyline points=\"19 1 23 5 19 9\"></polyline><line x1=\"15\" y1=\"5\" x2=\"23\" y2=\"5\"></line><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"></path>","phone-incoming":"<polyline points=\"16 2 16 8 22 8\"></polyline><line x1=\"23\" y1=\"1\" x2=\"16\" y2=\"8\"></line><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"></path>","phone-missed":"<line x1=\"23\" y1=\"1\" x2=\"17\" y2=\"7\"></line><line x1=\"17\" y1=\"1\" x2=\"23\" y2=\"7\"></line><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"></path>","phone-off":"<path d=\"M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91\"></path><line x1=\"23\" y1=\"1\" x2=\"1\" y2=\"23\"></line>","phone-outgoing":"<polyline points=\"23 7 23 1 17 1\"></polyline><line x1=\"16\" y1=\"8\" x2=\"23\" y2=\"1\"></line><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"></path>","phone":"<path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"></path>","pie-chart":"<path d=\"M21.21 15.89A10 10 0 1 1 8 2.83\"></path><path d=\"M22 12A10 10 0 0 0 12 2v10z\"></path>","play-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><polygon points=\"10 8 16 12 10 16 10 8\"></polygon>","play":"<polygon points=\"5 3 19 12 5 21 5 3\"></polygon>","plus-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"16\"></line><line x1=\"8\" y1=\"12\" x2=\"16\" y2=\"12\"></line>","plus-square":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"16\"></line><line x1=\"8\" y1=\"12\" x2=\"16\" y2=\"12\"></line>","plus":"<line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"></line><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line>","pocket":"<path d=\"M4 3h16a2 2 0 0 1 2 2v6a10 10 0 0 1-10 10A10 10 0 0 1 2 11V5a2 2 0 0 1 2-2z\"></path><polyline points=\"8 10 12 14 16 10\"></polyline>","power":"<path d=\"M18.36 6.64a9 9 0 1 1-12.73 0\"></path><line x1=\"12\" y1=\"2\" x2=\"12\" y2=\"12\"></line>","printer":"<polyline points=\"6 9 6 2 18 2 18 9\"></polyline><path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\"></path><rect x=\"6\" y=\"14\" width=\"12\" height=\"8\"></rect>","radio":"<circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14\"></path>","refresh-ccw":"<polyline points=\"1 4 1 10 7 10\"></polyline><polyline points=\"23 20 23 14 17 14\"></polyline><path d=\"M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15\"></path>","refresh-cw":"<polyline points=\"23 4 23 10 17 10\"></polyline><polyline points=\"1 20 1 14 7 14\"></polyline><path d=\"M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15\"></path>","repeat":"<polyline points=\"17 1 21 5 17 9\"></polyline><path d=\"M3 11V9a4 4 0 0 1 4-4h14\"></path><polyline points=\"7 23 3 19 7 15\"></polyline><path d=\"M21 13v2a4 4 0 0 1-4 4H3\"></path>","rewind":"<polygon points=\"11 19 2 12 11 5 11 19\"></polygon><polygon points=\"22 19 13 12 22 5 22 19\"></polygon>","rotate-ccw":"<polyline points=\"1 4 1 10 7 10\"></polyline><path d=\"M3.51 15a9 9 0 1 0 2.13-9.36L1 10\"></path>","rotate-cw":"<polyline points=\"23 4 23 10 17 10\"></polyline><path d=\"M20.49 15a9 9 0 1 1-2.12-9.36L23 10\"></path>","rss":"<path d=\"M4 11a9 9 0 0 1 9 9\"></path><path d=\"M4 4a16 16 0 0 1 16 16\"></path><circle cx=\"5\" cy=\"19\" r=\"1\"></circle>","save":"<path d=\"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z\"></path><polyline points=\"17 21 17 13 7 13 7 21\"></polyline><polyline points=\"7 3 7 8 15 8\"></polyline>","scissors":"<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"6\" cy=\"18\" r=\"3\"></circle><line x1=\"20\" y1=\"4\" x2=\"8.12\" y2=\"15.88\"></line><line x1=\"14.47\" y1=\"14.48\" x2=\"20\" y2=\"20\"></line><line x1=\"8.12\" y1=\"8.12\" x2=\"12\" y2=\"12\"></line>","search":"<circle cx=\"11\" cy=\"11\" r=\"8\"></circle><line x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"></line>","send":"<line x1=\"22\" y1=\"2\" x2=\"11\" y2=\"13\"></line><polygon points=\"22 2 15 22 11 13 2 9 22 2\"></polygon>","server":"<rect x=\"2\" y=\"2\" width=\"20\" height=\"8\" rx=\"2\" ry=\"2\"></rect><rect x=\"2\" y=\"14\" width=\"20\" height=\"8\" rx=\"2\" ry=\"2\"></rect><line x1=\"6\" y1=\"6\" x2=\"6\" y2=\"6\"></line><line x1=\"6\" y1=\"18\" x2=\"6\" y2=\"18\"></line>","settings":"<circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z\"></path>","share-2":"<circle cx=\"18\" cy=\"5\" r=\"3\"></circle><circle cx=\"6\" cy=\"12\" r=\"3\"></circle><circle cx=\"18\" cy=\"19\" r=\"3\"></circle><line x1=\"8.59\" y1=\"13.51\" x2=\"15.42\" y2=\"17.49\"></line><line x1=\"15.41\" y1=\"6.51\" x2=\"8.59\" y2=\"10.49\"></line>","share":"<path d=\"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8\"></path><polyline points=\"16 6 12 2 8 6\"></polyline><line x1=\"12\" y1=\"2\" x2=\"12\" y2=\"15\"></line>","shield-off":"<path d=\"M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18\"></path><path d=\"M4.73 4.73L4 5v7c0 6 8 10 8 10a20.29 20.29 0 0 0 5.62-4.38\"></path><line x1=\"1\" y1=\"1\" x2=\"23\" y2=\"23\"></line>","shield":"<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"></path>","shopping-bag":"<path d=\"M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z\"></path><line x1=\"3\" y1=\"6\" x2=\"21\" y2=\"6\"></line><path d=\"M16 10a4 4 0 0 1-8 0\"></path>","shopping-cart":"<circle cx=\"9\" cy=\"21\" r=\"1\"></circle><circle cx=\"20\" cy=\"21\" r=\"1\"></circle><path d=\"M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6\"></path>","shuffle":"<polyline points=\"16 3 21 3 21 8\"></polyline><line x1=\"4\" y1=\"20\" x2=\"21\" y2=\"3\"></line><polyline points=\"21 16 21 21 16 21\"></polyline><line x1=\"15\" y1=\"15\" x2=\"21\" y2=\"21\"></line><line x1=\"4\" y1=\"4\" x2=\"9\" y2=\"9\"></line>","sidebar":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect><line x1=\"9\" y1=\"3\" x2=\"9\" y2=\"21\"></line>","skip-back":"<polygon points=\"19 20 9 12 19 4 19 20\"></polygon><line x1=\"5\" y1=\"19\" x2=\"5\" y2=\"5\"></line>","skip-forward":"<polygon points=\"5 4 15 12 5 20 5 4\"></polygon><line x1=\"19\" y1=\"5\" x2=\"19\" y2=\"19\"></line>","slack":"<path d=\"M22.08 9C19.81 1.41 16.54-.35 9 1.92S-.35 7.46 1.92 15 7.46 24.35 15 22.08 24.35 16.54 22.08 9z\"></path><line x1=\"12.57\" y1=\"5.99\" x2=\"16.15\" y2=\"16.39\"></line><line x1=\"7.85\" y1=\"7.61\" x2=\"11.43\" y2=\"18.01\"></line><line x1=\"16.39\" y1=\"7.85\" x2=\"5.99\" y2=\"11.43\"></line><line x1=\"18.01\" y1=\"12.57\" x2=\"7.61\" y2=\"16.15\"></line>","slash":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"4.93\" y1=\"4.93\" x2=\"19.07\" y2=\"19.07\"></line>","sliders":"<line x1=\"4\" y1=\"21\" x2=\"4\" y2=\"14\"></line><line x1=\"4\" y1=\"10\" x2=\"4\" y2=\"3\"></line><line x1=\"12\" y1=\"21\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"3\"></line><line x1=\"20\" y1=\"21\" x2=\"20\" y2=\"16\"></line><line x1=\"20\" y1=\"12\" x2=\"20\" y2=\"3\"></line><line x1=\"1\" y1=\"14\" x2=\"7\" y2=\"14\"></line><line x1=\"9\" y1=\"8\" x2=\"15\" y2=\"8\"></line><line x1=\"17\" y1=\"16\" x2=\"23\" y2=\"16\"></line>","smartphone":"<rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\" ry=\"2\"></rect><line x1=\"12\" y1=\"18\" x2=\"12\" y2=\"18\"></line>","speaker":"<rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\" ry=\"2\"></rect><circle cx=\"12\" cy=\"14\" r=\"4\"></circle><line x1=\"12\" y1=\"6\" x2=\"12\" y2=\"6\"></line>","square":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect>","star":"<polygon points=\"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2\"></polygon>","stop-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\"></rect>","sun":"<circle cx=\"12\" cy=\"12\" r=\"5\"></circle><line x1=\"12\" y1=\"1\" x2=\"12\" y2=\"3\"></line><line x1=\"12\" y1=\"21\" x2=\"12\" y2=\"23\"></line><line x1=\"4.22\" y1=\"4.22\" x2=\"5.64\" y2=\"5.64\"></line><line x1=\"18.36\" y1=\"18.36\" x2=\"19.78\" y2=\"19.78\"></line><line x1=\"1\" y1=\"12\" x2=\"3\" y2=\"12\"></line><line x1=\"21\" y1=\"12\" x2=\"23\" y2=\"12\"></line><line x1=\"4.22\" y1=\"19.78\" x2=\"5.64\" y2=\"18.36\"></line><line x1=\"18.36\" y1=\"5.64\" x2=\"19.78\" y2=\"4.22\"></line>","sunrise":"<path d=\"M17 18a5 5 0 0 0-10 0\"></path><line x1=\"12\" y1=\"2\" x2=\"12\" y2=\"9\"></line><line x1=\"4.22\" y1=\"10.22\" x2=\"5.64\" y2=\"11.64\"></line><line x1=\"1\" y1=\"18\" x2=\"3\" y2=\"18\"></line><line x1=\"21\" y1=\"18\" x2=\"23\" y2=\"18\"></line><line x1=\"18.36\" y1=\"11.64\" x2=\"19.78\" y2=\"10.22\"></line><line x1=\"23\" y1=\"22\" x2=\"1\" y2=\"22\"></line><polyline points=\"8 6 12 2 16 6\"></polyline>","sunset":"<path d=\"M17 18a5 5 0 0 0-10 0\"></path><line x1=\"12\" y1=\"9\" x2=\"12\" y2=\"2\"></line><line x1=\"4.22\" y1=\"10.22\" x2=\"5.64\" y2=\"11.64\"></line><line x1=\"1\" y1=\"18\" x2=\"3\" y2=\"18\"></line><line x1=\"21\" y1=\"18\" x2=\"23\" y2=\"18\"></line><line x1=\"18.36\" y1=\"11.64\" x2=\"19.78\" y2=\"10.22\"></line><line x1=\"23\" y1=\"22\" x2=\"1\" y2=\"22\"></line><polyline points=\"16 5 12 9 8 5\"></polyline>","tablet":"<rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\" ry=\"2\" transform=\"rotate(180 12 12)\"></rect><line x1=\"12\" y1=\"18\" x2=\"12\" y2=\"18\"></line>","tag":"<path d=\"M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z\"></path><line x1=\"7\" y1=\"7\" x2=\"7\" y2=\"7\"></line>","target":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><circle cx=\"12\" cy=\"12\" r=\"6\"></circle><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>","terminal":"<polyline points=\"4 17 10 11 4 5\"></polyline><line x1=\"12\" y1=\"19\" x2=\"20\" y2=\"19\"></line>","thermometer":"<path d=\"M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z\"></path>","thumbs-down":"<path d=\"M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17\"></path>","thumbs-up":"<path d=\"M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3\"></path>","toggle-left":"<rect x=\"1\" y=\"5\" width=\"22\" height=\"14\" rx=\"7\" ry=\"7\"></rect><circle cx=\"8\" cy=\"12\" r=\"3\"></circle>","toggle-right":"<rect x=\"1\" y=\"5\" width=\"22\" height=\"14\" rx=\"7\" ry=\"7\"></rect><circle cx=\"16\" cy=\"12\" r=\"3\"></circle>","trash-2":"<polyline points=\"3 6 5 6 21 6\"></polyline><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path><line x1=\"10\" y1=\"11\" x2=\"10\" y2=\"17\"></line><line x1=\"14\" y1=\"11\" x2=\"14\" y2=\"17\"></line>","trash":"<polyline points=\"3 6 5 6 21 6\"></polyline><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path>","trending-down":"<polyline points=\"23 18 13.5 8.5 8.5 13.5 1 6\"></polyline><polyline points=\"17 18 23 18 23 12\"></polyline>","trending-up":"<polyline points=\"23 6 13.5 15.5 8.5 10.5 1 18\"></polyline><polyline points=\"17 6 23 6 23 12\"></polyline>","triangle":"<path d=\"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z\"></path>","truck":"<rect x=\"1\" y=\"3\" width=\"15\" height=\"13\"></rect><polygon points=\"16 8 20 8 23 11 23 16 16 16 16 8\"></polygon><circle cx=\"5.5\" cy=\"18.5\" r=\"2.5\"></circle><circle cx=\"18.5\" cy=\"18.5\" r=\"2.5\"></circle>","tv":"<rect x=\"2\" y=\"7\" width=\"20\" height=\"15\" rx=\"2\" ry=\"2\"></rect><polyline points=\"17 2 12 7 7 2\"></polyline>","twitter":"<path d=\"M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z\"></path>","type":"<polyline points=\"4 7 4 4 20 4 20 7\"></polyline><line x1=\"9\" y1=\"20\" x2=\"15\" y2=\"20\"></line><line x1=\"12\" y1=\"4\" x2=\"12\" y2=\"20\"></line>","umbrella":"<path d=\"M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7\"></path>","underline":"<path d=\"M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3\"></path><line x1=\"4\" y1=\"21\" x2=\"20\" y2=\"21\"></line>","unlock":"<rect x=\"3\" y=\"11\" width=\"18\" height=\"11\" rx=\"2\" ry=\"2\"></rect><path d=\"M7 11V7a5 5 0 0 1 9.9-1\"></path>","upload-cloud":"<polyline points=\"16 16 12 12 8 16\"></polyline><line x1=\"12\" y1=\"12\" x2=\"12\" y2=\"21\"></line><path d=\"M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3\"></path><polyline points=\"16 16 12 12 8 16\"></polyline>","upload":"<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><polyline points=\"17 8 12 3 7 8\"></polyline><line x1=\"12\" y1=\"3\" x2=\"12\" y2=\"15\"></line>","user-check":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"8.5\" cy=\"7\" r=\"4\"></circle><polyline points=\"17 11 19 13 23 9\"></polyline>","user-minus":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"8.5\" cy=\"7\" r=\"4\"></circle><line x1=\"23\" y1=\"11\" x2=\"17\" y2=\"11\"></line>","user-plus":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"8.5\" cy=\"7\" r=\"4\"></circle><line x1=\"20\" y1=\"8\" x2=\"20\" y2=\"14\"></line><line x1=\"23\" y1=\"11\" x2=\"17\" y2=\"11\"></line>","user-x":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"8.5\" cy=\"7\" r=\"4\"></circle><line x1=\"18\" y1=\"8\" x2=\"23\" y2=\"13\"></line><line x1=\"23\" y1=\"8\" x2=\"18\" y2=\"13\"></line>","user":"<path d=\"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\"></path><circle cx=\"12\" cy=\"7\" r=\"4\"></circle>","users":"<path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path>","video-off":"<path d=\"M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10\"></path><line x1=\"1\" y1=\"1\" x2=\"23\" y2=\"23\"></line>","video":"<polygon points=\"23 7 16 12 23 17 23 7\"></polygon><rect x=\"1\" y=\"5\" width=\"15\" height=\"14\" rx=\"2\" ry=\"2\"></rect>","voicemail":"<circle cx=\"5.5\" cy=\"11.5\" r=\"4.5\"></circle><circle cx=\"18.5\" cy=\"11.5\" r=\"4.5\"></circle><line x1=\"5.5\" y1=\"16\" x2=\"18.5\" y2=\"16\"></line>","volume-1":"<polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"></polygon><path d=\"M15.54 8.46a5 5 0 0 1 0 7.07\"></path>","volume-2":"<polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"></polygon><path d=\"M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07\"></path>","volume-x":"<polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"></polygon><line x1=\"23\" y1=\"9\" x2=\"17\" y2=\"15\"></line><line x1=\"17\" y1=\"9\" x2=\"23\" y2=\"15\"></line>","volume":"<polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"></polygon>","watch":"<circle cx=\"12\" cy=\"12\" r=\"7\"></circle><polyline points=\"12 9 12 12 13.5 13.5\"></polyline><path d=\"M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83\"></path>","wifi-off":"<line x1=\"1\" y1=\"1\" x2=\"23\" y2=\"23\"></line><path d=\"M16.72 11.06A10.94 10.94 0 0 1 19 12.55\"></path><path d=\"M5 12.55a10.94 10.94 0 0 1 5.17-2.39\"></path><path d=\"M10.71 5.05A16 16 0 0 1 22.58 9\"></path><path d=\"M1.42 9a15.91 15.91 0 0 1 4.7-2.88\"></path><path d=\"M8.53 16.11a6 6 0 0 1 6.95 0\"></path><line x1=\"12\" y1=\"20\" x2=\"12\" y2=\"20\"></line>","wifi":"<path d=\"M5 12.55a11 11 0 0 1 14.08 0\"></path><path d=\"M1.42 9a16 16 0 0 1 21.16 0\"></path><path d=\"M8.53 16.11a6 6 0 0 1 6.95 0\"></path><line x1=\"12\" y1=\"20\" x2=\"12\" y2=\"20\"></line>","wind":"<path d=\"M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2\"></path>","x-circle":"<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"15\" y1=\"9\" x2=\"9\" y2=\"15\"></line><line x1=\"9\" y1=\"9\" x2=\"15\" y2=\"15\"></line>","x-square":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect><line x1=\"9\" y1=\"9\" x2=\"15\" y2=\"15\"></line><line x1=\"15\" y1=\"9\" x2=\"9\" y2=\"15\"></line>","x":"<line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line>","youtube":"<path d=\"M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z\"></path><polygon points=\"9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02\"></polygon>","zap-off":"<polyline points=\"12.41 6.75 13 2 10.57 4.92\"></polyline><polyline points=\"18.57 12.91 21 10 15.66 10\"></polyline><polyline points=\"8 8 3 14 12 14 11 22 16 16\"></polyline><line x1=\"1\" y1=\"1\" x2=\"23\" y2=\"23\"></line>","zap":"<polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon>","zoom-in":"<circle cx=\"11\" cy=\"11\" r=\"8\"></circle><line x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"></line><line x1=\"11\" y1=\"8\" x2=\"11\" y2=\"14\"></line><line x1=\"8\" y1=\"11\" x2=\"14\" y2=\"11\"></line>","zoom-out":"<circle cx=\"11\" cy=\"11\" r=\"8\"></circle><line x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"></line><line x1=\"8\" y1=\"11\" x2=\"14\" y2=\"11\"></line>"};

/***/ }),

/***/ "./node_modules/classnames/dedupe.js":
/*!*******************************************!*\
  !*** ./node_modules/classnames/dedupe.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
  Copyright (c) 2016 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var classNames = (function () {
		// don't inherit from Object so we can skip hasOwnProperty check later
		// http://stackoverflow.com/questions/15518328/creating-js-object-with-object-createnull#answer-21079232
		function StorageObject() {}
		StorageObject.prototype = Object.create(null);

		function _parseArray (resultSet, array) {
			var length = array.length;

			for (var i = 0; i < length; ++i) {
				_parse(resultSet, array[i]);
			}
		}

		var hasOwn = {}.hasOwnProperty;

		function _parseNumber (resultSet, num) {
			resultSet[num] = true;
		}

		function _parseObject (resultSet, object) {
			for (var k in object) {
				if (hasOwn.call(object, k)) {
					// set value to false instead of deleting it to avoid changing object structure
					// https://www.smashingmagazine.com/2012/11/writing-fast-memory-efficient-javascript/#de-referencing-misconceptions
					resultSet[k] = !!object[k];
				}
			}
		}

		var SPACE = /\s+/;
		function _parseString (resultSet, str) {
			var array = str.split(SPACE);
			var length = array.length;

			for (var i = 0; i < length; ++i) {
				resultSet[array[i]] = true;
			}
		}

		function _parse (resultSet, arg) {
			if (!arg) return;
			var argType = typeof arg;

			// 'foo bar'
			if (argType === 'string') {
				_parseString(resultSet, arg);

			// ['foo', 'bar', ...]
			} else if (Array.isArray(arg)) {
				_parseArray(resultSet, arg);

			// { 'foo': true, ... }
			} else if (argType === 'object') {
				_parseObject(resultSet, arg);

			// '130'
			} else if (argType === 'number') {
				_parseNumber(resultSet, arg);
			}
		}

		function _classNames () {
			// don't leak arguments
			// https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
			var len = arguments.length;
			var args = Array(len);
			for (var i = 0; i < len; i++) {
				args[i] = arguments[i];
			}

			var classSet = new StorageObject();
			_parseArray(classSet, args);

			var list = [];

			for (var k in classSet) {
				if (classSet[k]) {
					list.push(k)
				}
			}

			return list.join(' ');
		}

		return _classNames;
	})();

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else if (true) {
		// register as 'classnames', consistent with npm package name
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
			return classNames;
		}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}());


/***/ }),

/***/ "./node_modules/core-js/fn/array/from.js":
/*!***********************************************!*\
  !*** ./node_modules/core-js/fn/array/from.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ../../modules/es6.string.iterator */ "./node_modules/core-js/modules/es6.string.iterator.js");
__webpack_require__(/*! ../../modules/es6.array.from */ "./node_modules/core-js/modules/es6.array.from.js");
module.exports = __webpack_require__(/*! ../../modules/_core */ "./node_modules/core-js/modules/_core.js").Array.from;


/***/ }),

/***/ "./node_modules/core-js/modules/_a-function.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/modules/_a-function.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),

/***/ "./node_modules/core-js/modules/_an-object.js":
/*!****************************************************!*\
  !*** ./node_modules/core-js/modules/_an-object.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ./_is-object */ "./node_modules/core-js/modules/_is-object.js");
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),

/***/ "./node_modules/core-js/modules/_array-includes.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/modules/_array-includes.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__(/*! ./_to-iobject */ "./node_modules/core-js/modules/_to-iobject.js");
var toLength = __webpack_require__(/*! ./_to-length */ "./node_modules/core-js/modules/_to-length.js");
var toAbsoluteIndex = __webpack_require__(/*! ./_to-absolute-index */ "./node_modules/core-js/modules/_to-absolute-index.js");
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ }),

/***/ "./node_modules/core-js/modules/_classof.js":
/*!**************************************************!*\
  !*** ./node_modules/core-js/modules/_classof.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = __webpack_require__(/*! ./_cof */ "./node_modules/core-js/modules/_cof.js");
var TAG = __webpack_require__(/*! ./_wks */ "./node_modules/core-js/modules/_wks.js")('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};


/***/ }),

/***/ "./node_modules/core-js/modules/_cof.js":
/*!**********************************************!*\
  !*** ./node_modules/core-js/modules/_cof.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),

/***/ "./node_modules/core-js/modules/_core.js":
/*!***********************************************!*\
  !*** ./node_modules/core-js/modules/_core.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var core = module.exports = { version: '2.5.3' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),

/***/ "./node_modules/core-js/modules/_create-property.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/modules/_create-property.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $defineProperty = __webpack_require__(/*! ./_object-dp */ "./node_modules/core-js/modules/_object-dp.js");
var createDesc = __webpack_require__(/*! ./_property-desc */ "./node_modules/core-js/modules/_property-desc.js");

module.exports = function (object, index, value) {
  if (index in object) $defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};


/***/ }),

/***/ "./node_modules/core-js/modules/_ctx.js":
/*!**********************************************!*\
  !*** ./node_modules/core-js/modules/_ctx.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(/*! ./_a-function */ "./node_modules/core-js/modules/_a-function.js");
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),

/***/ "./node_modules/core-js/modules/_defined.js":
/*!**************************************************!*\
  !*** ./node_modules/core-js/modules/_defined.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};


/***/ }),

/***/ "./node_modules/core-js/modules/_descriptors.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/modules/_descriptors.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(/*! ./_fails */ "./node_modules/core-js/modules/_fails.js")(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ "./node_modules/core-js/modules/_dom-create.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/modules/_dom-create.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ./_is-object */ "./node_modules/core-js/modules/_is-object.js");
var document = __webpack_require__(/*! ./_global */ "./node_modules/core-js/modules/_global.js").document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),

/***/ "./node_modules/core-js/modules/_enum-bug-keys.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/modules/_enum-bug-keys.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ }),

/***/ "./node_modules/core-js/modules/_export.js":
/*!*************************************************!*\
  !*** ./node_modules/core-js/modules/_export.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ./_global */ "./node_modules/core-js/modules/_global.js");
var core = __webpack_require__(/*! ./_core */ "./node_modules/core-js/modules/_core.js");
var hide = __webpack_require__(/*! ./_hide */ "./node_modules/core-js/modules/_hide.js");
var redefine = __webpack_require__(/*! ./_redefine */ "./node_modules/core-js/modules/_redefine.js");
var ctx = __webpack_require__(/*! ./_ctx */ "./node_modules/core-js/modules/_ctx.js");
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),

/***/ "./node_modules/core-js/modules/_fails.js":
/*!************************************************!*\
  !*** ./node_modules/core-js/modules/_fails.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),

/***/ "./node_modules/core-js/modules/_global.js":
/*!*************************************************!*\
  !*** ./node_modules/core-js/modules/_global.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),

/***/ "./node_modules/core-js/modules/_has.js":
/*!**********************************************!*\
  !*** ./node_modules/core-js/modules/_has.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),

/***/ "./node_modules/core-js/modules/_hide.js":
/*!***********************************************!*\
  !*** ./node_modules/core-js/modules/_hide.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(/*! ./_object-dp */ "./node_modules/core-js/modules/_object-dp.js");
var createDesc = __webpack_require__(/*! ./_property-desc */ "./node_modules/core-js/modules/_property-desc.js");
module.exports = __webpack_require__(/*! ./_descriptors */ "./node_modules/core-js/modules/_descriptors.js") ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ "./node_modules/core-js/modules/_html.js":
/*!***********************************************!*\
  !*** ./node_modules/core-js/modules/_html.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var document = __webpack_require__(/*! ./_global */ "./node_modules/core-js/modules/_global.js").document;
module.exports = document && document.documentElement;


/***/ }),

/***/ "./node_modules/core-js/modules/_ie8-dom-define.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/modules/_ie8-dom-define.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(/*! ./_descriptors */ "./node_modules/core-js/modules/_descriptors.js") && !__webpack_require__(/*! ./_fails */ "./node_modules/core-js/modules/_fails.js")(function () {
  return Object.defineProperty(__webpack_require__(/*! ./_dom-create */ "./node_modules/core-js/modules/_dom-create.js")('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ "./node_modules/core-js/modules/_iobject.js":
/*!**************************************************!*\
  !*** ./node_modules/core-js/modules/_iobject.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(/*! ./_cof */ "./node_modules/core-js/modules/_cof.js");
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),

/***/ "./node_modules/core-js/modules/_is-array-iter.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/modules/_is-array-iter.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// check on default Array iterator
var Iterators = __webpack_require__(/*! ./_iterators */ "./node_modules/core-js/modules/_iterators.js");
var ITERATOR = __webpack_require__(/*! ./_wks */ "./node_modules/core-js/modules/_wks.js")('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};


/***/ }),

/***/ "./node_modules/core-js/modules/_is-object.js":
/*!****************************************************!*\
  !*** ./node_modules/core-js/modules/_is-object.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),

/***/ "./node_modules/core-js/modules/_iter-call.js":
/*!****************************************************!*\
  !*** ./node_modules/core-js/modules/_iter-call.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// call something on iterator step with safe closing on error
var anObject = __webpack_require__(/*! ./_an-object */ "./node_modules/core-js/modules/_an-object.js");
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};


/***/ }),

/***/ "./node_modules/core-js/modules/_iter-create.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/modules/_iter-create.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var create = __webpack_require__(/*! ./_object-create */ "./node_modules/core-js/modules/_object-create.js");
var descriptor = __webpack_require__(/*! ./_property-desc */ "./node_modules/core-js/modules/_property-desc.js");
var setToStringTag = __webpack_require__(/*! ./_set-to-string-tag */ "./node_modules/core-js/modules/_set-to-string-tag.js");
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
__webpack_require__(/*! ./_hide */ "./node_modules/core-js/modules/_hide.js")(IteratorPrototype, __webpack_require__(/*! ./_wks */ "./node_modules/core-js/modules/_wks.js")('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};


/***/ }),

/***/ "./node_modules/core-js/modules/_iter-define.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/modules/_iter-define.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY = __webpack_require__(/*! ./_library */ "./node_modules/core-js/modules/_library.js");
var $export = __webpack_require__(/*! ./_export */ "./node_modules/core-js/modules/_export.js");
var redefine = __webpack_require__(/*! ./_redefine */ "./node_modules/core-js/modules/_redefine.js");
var hide = __webpack_require__(/*! ./_hide */ "./node_modules/core-js/modules/_hide.js");
var has = __webpack_require__(/*! ./_has */ "./node_modules/core-js/modules/_has.js");
var Iterators = __webpack_require__(/*! ./_iterators */ "./node_modules/core-js/modules/_iterators.js");
var $iterCreate = __webpack_require__(/*! ./_iter-create */ "./node_modules/core-js/modules/_iter-create.js");
var setToStringTag = __webpack_require__(/*! ./_set-to-string-tag */ "./node_modules/core-js/modules/_set-to-string-tag.js");
var getPrototypeOf = __webpack_require__(/*! ./_object-gpo */ "./node_modules/core-js/modules/_object-gpo.js");
var ITERATOR = __webpack_require__(/*! ./_wks */ "./node_modules/core-js/modules/_wks.js")('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = (!BUGGY && $native) || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};


/***/ }),

/***/ "./node_modules/core-js/modules/_iter-detect.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/modules/_iter-detect.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var ITERATOR = __webpack_require__(/*! ./_wks */ "./node_modules/core-js/modules/_wks.js")('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};


/***/ }),

/***/ "./node_modules/core-js/modules/_iterators.js":
/*!****************************************************!*\
  !*** ./node_modules/core-js/modules/_iterators.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),

/***/ "./node_modules/core-js/modules/_library.js":
/*!**************************************************!*\
  !*** ./node_modules/core-js/modules/_library.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = false;


/***/ }),

/***/ "./node_modules/core-js/modules/_object-create.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/modules/_object-create.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = __webpack_require__(/*! ./_an-object */ "./node_modules/core-js/modules/_an-object.js");
var dPs = __webpack_require__(/*! ./_object-dps */ "./node_modules/core-js/modules/_object-dps.js");
var enumBugKeys = __webpack_require__(/*! ./_enum-bug-keys */ "./node_modules/core-js/modules/_enum-bug-keys.js");
var IE_PROTO = __webpack_require__(/*! ./_shared-key */ "./node_modules/core-js/modules/_shared-key.js")('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = __webpack_require__(/*! ./_dom-create */ "./node_modules/core-js/modules/_dom-create.js")('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  __webpack_require__(/*! ./_html */ "./node_modules/core-js/modules/_html.js").appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};


/***/ }),

/***/ "./node_modules/core-js/modules/_object-dp.js":
/*!****************************************************!*\
  !*** ./node_modules/core-js/modules/_object-dp.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(/*! ./_an-object */ "./node_modules/core-js/modules/_an-object.js");
var IE8_DOM_DEFINE = __webpack_require__(/*! ./_ie8-dom-define */ "./node_modules/core-js/modules/_ie8-dom-define.js");
var toPrimitive = __webpack_require__(/*! ./_to-primitive */ "./node_modules/core-js/modules/_to-primitive.js");
var dP = Object.defineProperty;

exports.f = __webpack_require__(/*! ./_descriptors */ "./node_modules/core-js/modules/_descriptors.js") ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ "./node_modules/core-js/modules/_object-dps.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/modules/_object-dps.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(/*! ./_object-dp */ "./node_modules/core-js/modules/_object-dp.js");
var anObject = __webpack_require__(/*! ./_an-object */ "./node_modules/core-js/modules/_an-object.js");
var getKeys = __webpack_require__(/*! ./_object-keys */ "./node_modules/core-js/modules/_object-keys.js");

module.exports = __webpack_require__(/*! ./_descriptors */ "./node_modules/core-js/modules/_descriptors.js") ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};


/***/ }),

/***/ "./node_modules/core-js/modules/_object-gpo.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/modules/_object-gpo.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = __webpack_require__(/*! ./_has */ "./node_modules/core-js/modules/_has.js");
var toObject = __webpack_require__(/*! ./_to-object */ "./node_modules/core-js/modules/_to-object.js");
var IE_PROTO = __webpack_require__(/*! ./_shared-key */ "./node_modules/core-js/modules/_shared-key.js")('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};


/***/ }),

/***/ "./node_modules/core-js/modules/_object-keys-internal.js":
/*!***************************************************************!*\
  !*** ./node_modules/core-js/modules/_object-keys-internal.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(/*! ./_has */ "./node_modules/core-js/modules/_has.js");
var toIObject = __webpack_require__(/*! ./_to-iobject */ "./node_modules/core-js/modules/_to-iobject.js");
var arrayIndexOf = __webpack_require__(/*! ./_array-includes */ "./node_modules/core-js/modules/_array-includes.js")(false);
var IE_PROTO = __webpack_require__(/*! ./_shared-key */ "./node_modules/core-js/modules/_shared-key.js")('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),

/***/ "./node_modules/core-js/modules/_object-keys.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/modules/_object-keys.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__(/*! ./_object-keys-internal */ "./node_modules/core-js/modules/_object-keys-internal.js");
var enumBugKeys = __webpack_require__(/*! ./_enum-bug-keys */ "./node_modules/core-js/modules/_enum-bug-keys.js");

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ }),

/***/ "./node_modules/core-js/modules/_property-desc.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/modules/_property-desc.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),

/***/ "./node_modules/core-js/modules/_redefine.js":
/*!***************************************************!*\
  !*** ./node_modules/core-js/modules/_redefine.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ./_global */ "./node_modules/core-js/modules/_global.js");
var hide = __webpack_require__(/*! ./_hide */ "./node_modules/core-js/modules/_hide.js");
var has = __webpack_require__(/*! ./_has */ "./node_modules/core-js/modules/_has.js");
var SRC = __webpack_require__(/*! ./_uid */ "./node_modules/core-js/modules/_uid.js")('src');
var TO_STRING = 'toString';
var $toString = Function[TO_STRING];
var TPL = ('' + $toString).split(TO_STRING);

__webpack_require__(/*! ./_core */ "./node_modules/core-js/modules/_core.js").inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});


/***/ }),

/***/ "./node_modules/core-js/modules/_set-to-string-tag.js":
/*!************************************************************!*\
  !*** ./node_modules/core-js/modules/_set-to-string-tag.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var def = __webpack_require__(/*! ./_object-dp */ "./node_modules/core-js/modules/_object-dp.js").f;
var has = __webpack_require__(/*! ./_has */ "./node_modules/core-js/modules/_has.js");
var TAG = __webpack_require__(/*! ./_wks */ "./node_modules/core-js/modules/_wks.js")('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};


/***/ }),

/***/ "./node_modules/core-js/modules/_shared-key.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/modules/_shared-key.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(/*! ./_shared */ "./node_modules/core-js/modules/_shared.js")('keys');
var uid = __webpack_require__(/*! ./_uid */ "./node_modules/core-js/modules/_uid.js");
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ }),

/***/ "./node_modules/core-js/modules/_shared.js":
/*!*************************************************!*\
  !*** ./node_modules/core-js/modules/_shared.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ./_global */ "./node_modules/core-js/modules/_global.js");
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});
module.exports = function (key) {
  return store[key] || (store[key] = {});
};


/***/ }),

/***/ "./node_modules/core-js/modules/_string-at.js":
/*!****************************************************!*\
  !*** ./node_modules/core-js/modules/_string-at.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(/*! ./_to-integer */ "./node_modules/core-js/modules/_to-integer.js");
var defined = __webpack_require__(/*! ./_defined */ "./node_modules/core-js/modules/_defined.js");
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};


/***/ }),

/***/ "./node_modules/core-js/modules/_to-absolute-index.js":
/*!************************************************************!*\
  !*** ./node_modules/core-js/modules/_to-absolute-index.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(/*! ./_to-integer */ "./node_modules/core-js/modules/_to-integer.js");
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ }),

/***/ "./node_modules/core-js/modules/_to-integer.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/modules/_to-integer.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),

/***/ "./node_modules/core-js/modules/_to-iobject.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/modules/_to-iobject.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__(/*! ./_iobject */ "./node_modules/core-js/modules/_iobject.js");
var defined = __webpack_require__(/*! ./_defined */ "./node_modules/core-js/modules/_defined.js");
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ }),

/***/ "./node_modules/core-js/modules/_to-length.js":
/*!****************************************************!*\
  !*** ./node_modules/core-js/modules/_to-length.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__(/*! ./_to-integer */ "./node_modules/core-js/modules/_to-integer.js");
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),

/***/ "./node_modules/core-js/modules/_to-object.js":
/*!****************************************************!*\
  !*** ./node_modules/core-js/modules/_to-object.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__(/*! ./_defined */ "./node_modules/core-js/modules/_defined.js");
module.exports = function (it) {
  return Object(defined(it));
};


/***/ }),

/***/ "./node_modules/core-js/modules/_to-primitive.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/modules/_to-primitive.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(/*! ./_is-object */ "./node_modules/core-js/modules/_is-object.js");
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ "./node_modules/core-js/modules/_uid.js":
/*!**********************************************!*\
  !*** ./node_modules/core-js/modules/_uid.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),

/***/ "./node_modules/core-js/modules/_wks.js":
/*!**********************************************!*\
  !*** ./node_modules/core-js/modules/_wks.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(/*! ./_shared */ "./node_modules/core-js/modules/_shared.js")('wks');
var uid = __webpack_require__(/*! ./_uid */ "./node_modules/core-js/modules/_uid.js");
var Symbol = __webpack_require__(/*! ./_global */ "./node_modules/core-js/modules/_global.js").Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ }),

/***/ "./node_modules/core-js/modules/core.get-iterator-method.js":
/*!******************************************************************!*\
  !*** ./node_modules/core-js/modules/core.get-iterator-method.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(/*! ./_classof */ "./node_modules/core-js/modules/_classof.js");
var ITERATOR = __webpack_require__(/*! ./_wks */ "./node_modules/core-js/modules/_wks.js")('iterator');
var Iterators = __webpack_require__(/*! ./_iterators */ "./node_modules/core-js/modules/_iterators.js");
module.exports = __webpack_require__(/*! ./_core */ "./node_modules/core-js/modules/_core.js").getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};


/***/ }),

/***/ "./node_modules/core-js/modules/es6.array.from.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/modules/es6.array.from.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ctx = __webpack_require__(/*! ./_ctx */ "./node_modules/core-js/modules/_ctx.js");
var $export = __webpack_require__(/*! ./_export */ "./node_modules/core-js/modules/_export.js");
var toObject = __webpack_require__(/*! ./_to-object */ "./node_modules/core-js/modules/_to-object.js");
var call = __webpack_require__(/*! ./_iter-call */ "./node_modules/core-js/modules/_iter-call.js");
var isArrayIter = __webpack_require__(/*! ./_is-array-iter */ "./node_modules/core-js/modules/_is-array-iter.js");
var toLength = __webpack_require__(/*! ./_to-length */ "./node_modules/core-js/modules/_to-length.js");
var createProperty = __webpack_require__(/*! ./_create-property */ "./node_modules/core-js/modules/_create-property.js");
var getIterFn = __webpack_require__(/*! ./core.get-iterator-method */ "./node_modules/core-js/modules/core.get-iterator-method.js");

$export($export.S + $export.F * !__webpack_require__(/*! ./_iter-detect */ "./node_modules/core-js/modules/_iter-detect.js")(function (iter) { Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = getIterFn(O);
    var length, result, step, iterator;
    if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for (result = new C(length); length > index; index++) {
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});


/***/ }),

/***/ "./node_modules/core-js/modules/es6.string.iterator.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/modules/es6.string.iterator.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $at = __webpack_require__(/*! ./_string-at */ "./node_modules/core-js/modules/_string-at.js")(true);

// 21.1.3.27 String.prototype[@@iterator]()
__webpack_require__(/*! ./_iter-define */ "./node_modules/core-js/modules/_iter-define.js")(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});


/***/ }),

/***/ "./src/default-attrs.json":
/*!********************************!*\
  !*** ./src/default-attrs.json ***!
  \********************************/
/*! exports provided: xmlns, width, height, viewBox, fill, stroke, stroke-width, stroke-linecap, stroke-linejoin, default */
/***/ (function(module) {

module.exports = {"xmlns":"http://www.w3.org/2000/svg","width":24,"height":24,"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};

/***/ }),

/***/ "./src/icon.js":
/*!*********************!*\
  !*** ./src/icon.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dedupe = __webpack_require__(/*! classnames/dedupe */ "./node_modules/classnames/dedupe.js");

var _dedupe2 = _interopRequireDefault(_dedupe);

var _defaultAttrs = __webpack_require__(/*! ./default-attrs.json */ "./src/default-attrs.json");

var _defaultAttrs2 = _interopRequireDefault(_defaultAttrs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Icon = function () {
  function Icon(name, contents) {
    var tags = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    _classCallCheck(this, Icon);

    this.name = name;
    this.contents = contents;
    this.tags = tags;
    this.attrs = _extends({}, _defaultAttrs2.default, { class: 'feather feather-' + name });
  }

  /**
   * Create an SVG string.
   * @param {Object} attrs
   * @returns {string}
   */


  _createClass(Icon, [{
    key: 'toSvg',
    value: function toSvg() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var combinedAttrs = _extends({}, this.attrs, attrs, { class: (0, _dedupe2.default)(this.attrs.class, attrs.class) });

      return '<svg ' + attrsToString(combinedAttrs) + '>' + this.contents + '</svg>';
    }

    /**
     * Return string representation of an `Icon`.
     *
     * Added for backward compatibility. If old code expects `feather.icons.<name>`
     * to be a string, `toString()` will get implicitly called.
     *
     * @returns {string}
     */

  }, {
    key: 'toString',
    value: function toString() {
      return this.contents;
    }
  }]);

  return Icon;
}();

/**
 * Convert attributes object to string of HTML attributes.
 * @param {Object} attrs
 * @returns {string}
 */


function attrsToString(attrs) {
  return Object.keys(attrs).map(function (key) {
    return key + '="' + attrs[key] + '"';
  }).join(' ');
}

exports.default = Icon;

/***/ }),

/***/ "./src/icons.js":
/*!**********************!*\
  !*** ./src/icons.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _icon = __webpack_require__(/*! ./icon */ "./src/icon.js");

var _icon2 = _interopRequireDefault(_icon);

var _icons = __webpack_require__(/*! ../dist/icons.json */ "./dist/icons.json");

var _icons2 = _interopRequireDefault(_icons);

var _tags = __webpack_require__(/*! ./tags.json */ "./src/tags.json");

var _tags2 = _interopRequireDefault(_tags);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = Object.keys(_icons2.default).map(function (key) {
  return new _icon2.default(key, _icons2.default[key], _tags2.default[key]);
}).reduce(function (object, icon) {
  object[icon.name] = icon;
  return object;
}, {});

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _icons = __webpack_require__(/*! ./icons */ "./src/icons.js");

var _icons2 = _interopRequireDefault(_icons);

var _toSvg = __webpack_require__(/*! ./to-svg */ "./src/to-svg.js");

var _toSvg2 = _interopRequireDefault(_toSvg);

var _replace = __webpack_require__(/*! ./replace */ "./src/replace.js");

var _replace2 = _interopRequireDefault(_replace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = { icons: _icons2.default, toSvg: _toSvg2.default, replace: _replace2.default };

/***/ }),

/***/ "./src/replace.js":
/*!************************!*\
  !*** ./src/replace.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-env browser */


var _dedupe = __webpack_require__(/*! classnames/dedupe */ "./node_modules/classnames/dedupe.js");

var _dedupe2 = _interopRequireDefault(_dedupe);

var _icons = __webpack_require__(/*! ./icons */ "./src/icons.js");

var _icons2 = _interopRequireDefault(_icons);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Replace all HTML elements that have a `data-feather` attribute with SVG markup
 * corresponding to the element's `data-feather` attribute value.
 * @param {Object} attrs
 */
function replace() {
  var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (typeof document === 'undefined') {
    throw new Error('`feather.replace()` only works in a browser environment.');
  }

  var elementsToReplace = document.querySelectorAll('[data-feather]');

  Array.from(elementsToReplace).forEach(function (element) {
    return replaceElement(element, attrs);
  });
}

/**
 * Replace a single HTML element with SVG markup
 * corresponding to the element's `data-feather` attribute value.
 * @param {HTMLElement} element
 * @param {Object} attrs
 */
function replaceElement(element) {
  var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var elementAttrs = getAttrs(element);
  var name = elementAttrs['data-feather'];
  delete elementAttrs['data-feather'];

  var svgString = _icons2.default[name].toSvg(_extends({}, attrs, elementAttrs, { class: (0, _dedupe2.default)(attrs.class, elementAttrs.class) }));
  var svgDocument = new DOMParser().parseFromString(svgString, 'image/svg+xml');
  var svgElement = svgDocument.querySelector('svg');

  element.parentNode.replaceChild(svgElement, element);
}

/**
 * Get the attributes of an HTML element.
 * @param {HTMLElement} element
 * @returns {Object}
 */
function getAttrs(element) {
  return Array.from(element.attributes).reduce(function (attrs, attr) {
    attrs[attr.name] = attr.value;
    return attrs;
  }, {});
}

exports.default = replace;

/***/ }),

/***/ "./src/tags.json":
/*!***********************!*\
  !*** ./src/tags.json ***!
  \***********************/
/*! exports provided: activity, airplay, alert-circle, alert-octagon, alert-triangle, at-sign, award, aperture, bell, bell-off, bluetooth, book-open, book, bookmark, briefcase, clipboard, clock, cloud-drizzle, cloud-lightning, cloud-rain, cloud-snow, cloud, codepen, command, compass, copy, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, credit-card, crop, crosshair, database, delete, disc, dollar-sign, droplet, edit, edit-2, edit-3, eye, eye-off, external-link, facebook, fast-forward, film, folder-minus, folder-plus, folder, gift, git-branch, git-commit, git-merge, git-pull-request, github, gitlab, global, hard-drive, hash, headphones, heart, help-circle, home, image, inbox, instagram, life-bouy, linkedin, lock, log-in, log-out, mail, map-pin, map, maximize, maximize-2, menu, message-circle, message-square, mic-off, mic, minimize, minimize-2, monitor, moon, more-horizontal, more-vertical, move, navigation, navigation-2, octagon, package, paperclip, pause, pause-circle, play, play-circle, plus, plus-circle, plus-square, pocket, power, radio, rewind, rss, save, send, settings, shield, shield-off, shopping-bag, shopping-cart, shuffle, skip-back, skip-forward, slash, sliders, speaker, star, sun, sunrise, sunset, tag, target, terminal, thumbs-down, thumbs-up, toggle-left, toggle-right, trash, trash-2, triangle, truck, twitter, umbrella, video-off, video, voicemail, volume, volume-1, volume-2, volume-x, watch, wind, x-circle, x-square, x, youtube, zap-off, zap, default */
/***/ (function(module) {

module.exports = {"activity":["pulse","health","action","motion"],"airplay":["stream","cast","mirroring"],"alert-circle":["warning"],"alert-octagon":["warning"],"alert-triangle":["warning"],"at-sign":["mention"],"award":["achievement","badge"],"aperture":["camera","photo"],"bell":["alarm","notification"],"bell-off":["alarm","notification","silent"],"bluetooth":["wireless"],"book-open":["read"],"book":["read","dictionary","booklet","magazine"],"bookmark":["read","clip","marker","tag"],"briefcase":["work","bag","baggage","folder"],"clipboard":["copy"],"clock":["time","watch","alarm"],"cloud-drizzle":["weather","shower"],"cloud-lightning":["weather","bolt"],"cloud-rain":["weather"],"cloud-snow":["weather","blizzard"],"cloud":["weather"],"codepen":["logo"],"command":["keyboard","cmd"],"compass":["navigation","safari","travel"],"copy":["clone","duplicate"],"corner-down-left":["arrow"],"corner-down-right":["arrow"],"corner-left-down":["arrow"],"corner-left-up":["arrow"],"corner-right-down":["arrow"],"corner-right-up":["arrow"],"corner-up-left":["arrow"],"corner-up-right":["arrow"],"credit-card":["purchase","payment","cc"],"crop":["photo","image"],"crosshair":["aim","target"],"database":["storage"],"delete":["remove"],"disc":["album","cd","dvd","music"],"dollar-sign":["currency","money","payment"],"droplet":["water"],"edit":["pencil","change"],"edit-2":["pencil","change"],"edit-3":["pencil","change"],"eye":["view","watch"],"eye-off":["view","watch"],"external-link":["outbound"],"facebook":["logo"],"fast-forward":["music"],"film":["movie","video"],"folder-minus":["directory"],"folder-plus":["directory"],"folder":["directory"],"gift":["present","box","birthday","party"],"git-branch":["code","version control"],"git-commit":["code","version control"],"git-merge":["code","version control"],"git-pull-request":["code","version control"],"github":["logo","version control"],"gitlab":["logo","version control"],"global":["world","browser","language","translate"],"hard-drive":["computer","server"],"hash":["hashtag","number","pound"],"headphones":["music","audio"],"heart":["like","love"],"help-circle":["question mark"],"home":["house"],"image":["picture"],"inbox":["email"],"instagram":["logo","camera"],"life-bouy":["help","life ring","support"],"linkedin":["logo"],"lock":["security","password"],"log-in":["sign in","arrow"],"log-out":["sign out","arrow"],"mail":["email"],"map-pin":["location","navigation","travel","marker"],"map":["location","navigation","travel"],"maximize":["fullscreen"],"maximize-2":["fullscreen","arrows"],"menu":["bars","navigation","hamburger"],"message-circle":["comment","chat"],"message-square":["comment","chat"],"mic-off":["record"],"mic":["record"],"minimize":["exit fullscreen"],"minimize-2":["exit fullscreen","arrows"],"monitor":["tv"],"moon":["dark","night"],"more-horizontal":["ellipsis"],"more-vertical":["ellipsis"],"move":["arrows"],"navigation":["location","travel"],"navigation-2":["location","travel"],"octagon":["stop"],"package":["box"],"paperclip":["attachment"],"pause":["music","stop"],"pause-circle":["music","stop"],"play":["music","start"],"play-circle":["music","start"],"plus":["add","new"],"plus-circle":["add","new"],"plus-square":["add","new"],"pocket":["logo","save"],"power":["on","off"],"radio":["signal"],"rewind":["music"],"rss":["feed","subscribe"],"save":["floppy disk"],"send":["message","mail","paper airplane"],"settings":["cog","edit","gear","preferences"],"shield":["security"],"shield-off":["security"],"shopping-bag":["ecommerce","cart","purchase","store"],"shopping-cart":["ecommerce","cart","purchase","store"],"shuffle":["music"],"skip-back":["music"],"skip-forward":["music"],"slash":["ban","no"],"sliders":["settings","controls"],"speaker":["music"],"star":["bookmark","favorite","like"],"sun":["brightness","weather","light"],"sunrise":["weather"],"sunset":["weather"],"tag":["label"],"target":["bullseye"],"terminal":["code","command line"],"thumbs-down":["dislike","bad"],"thumbs-up":["like","good"],"toggle-left":["on","off","switch"],"toggle-right":["on","off","switch"],"trash":["garbage","delete","remove"],"trash-2":["garbage","delete","remove"],"triangle":["delta"],"truck":["delivery","van","shipping"],"twitter":["logo"],"umbrella":["rain","weather"],"video-off":["camera","movie","film"],"video":["camera","movie","film"],"voicemail":["phone"],"volume":["music","sound","mute"],"volume-1":["music","sound"],"volume-2":["music","sound"],"volume-x":["music","sound","mute"],"watch":["clock","time"],"wind":["weather","air"],"x-circle":["cancel","close","delete","remove","times"],"x-square":["cancel","close","delete","remove","times"],"x":["cancel","close","delete","remove","times"],"youtube":["logo","video","play"],"zap-off":["flash","camera","lightning"],"zap":["flash","camera","lightning"]};

/***/ }),

/***/ "./src/to-svg.js":
/*!***********************!*\
  !*** ./src/to-svg.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _icons = __webpack_require__(/*! ./icons */ "./src/icons.js");

var _icons2 = _interopRequireDefault(_icons);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create an SVG string.
 * @deprecated
 * @param {string} name
 * @param {Object} attrs
 * @returns {string}
 */
function toSvg(name) {
  var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  console.warn('feather.toSvg() is deprecated. Please use feather.icons[name].toSvg() instead.');

  if (!name) {
    throw new Error('The required `key` (icon name) parameter is missing.');
  }

  if (!_icons2.default[name]) {
    throw new Error('No icon matching \'' + name + '\'. See the complete list of icons at https://feathericons.com');
  }

  return _icons2.default[name].toSvg(attrs);
}

exports.default = toSvg;

/***/ }),

/***/ 0:
/*!**************************************************!*\
  !*** multi core-js/fn/array/from ./src/index.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! core-js/fn/array/from */"./node_modules/core-js/fn/array/from.js");
module.exports = __webpack_require__(/*! /home/travis/build/feathericons/feather/src/index.js */"./src/index.js");


/***/ })

/******/ });
});

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMtc3JjL2pzL21vZHVsZXMvYXV0b2ZpbGwuanMiLCJhc3NldHMtc3JjL2pzL21vZHVsZXMvZnJvbnRlbmQtZm9ybS5qcyIsImFzc2V0cy1zcmMvanMvbW9kdWxlcy9pbWFnZS1kcm9wLmpzIiwiYXNzZXRzLXNyYy9qcy9tb2R1bGVzL21heGxlbmd0aC5qcyIsImFzc2V0cy1zcmMvanMvcmFoLWFjZi1mcm9udGVuZC1mb3Jtcy5qcyIsIm5vZGVfbW9kdWxlcy9hdXRvc2l6ZS9kaXN0L2F1dG9zaXplLmpzIiwibm9kZV9tb2R1bGVzL2ZlYXRoZXItaWNvbnMvZGlzdC9mZWF0aGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUNDQSxPQUFPLE1BQVAsR0FBZ0IsSUFBSSxPQUFPLE1BQTNCOztBQUVBLE9BQU8sV0FBUCxHQUFxQixZQUFtQjtBQUFBLE1BQVQsRUFBUyx1RUFBSixDQUFJOzs7QUFFdEMsTUFBSSxTQUFTLEVBQUUsV0FBRixDQUFiOztBQUVBLE1BQUksQ0FBQyxPQUFPLE1BQVosRUFBcUI7QUFDbkI7QUFDRDs7QUFFRCxNQUFJLFNBQVMsT0FBTyxpQkFBcEI7QUFDQSxNQUFJLFFBQU8sTUFBUCx5Q0FBTyxNQUFQLE9BQWtCLFFBQXRCLEVBQWlDO0FBQy9CLFlBQVEsSUFBUixDQUFhLHlDQUFiO0FBQ0E7QUFDRDtBQUNELFdBQVMsT0FBTyxFQUFQLENBQVQ7O0FBRUEsTUFBSSxZQUFZLEVBQUUsUUFBRixFQUFZLFNBQVosRUFBaEI7O0FBRUEsU0FBTyxJQUFQLENBQVksVUFBQyxDQUFELEVBQUksRUFBSixFQUFXO0FBQ3JCLFFBQUksUUFBUSxFQUFFLEVBQUYsQ0FBWjtBQUNBLFVBQU0sUUFBTixDQUFlLGVBQWY7O0FBRUEsVUFBTSxJQUFOLENBQVcsMkJBQVgsRUFBd0MsS0FBeEM7QUFDQSxlQUFZLEtBQVosRUFBbUIsTUFBbkI7O0FBRUEs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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9SQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcclxuZ2xvYmFsLmpRdWVyeSA9ICQgPSB3aW5kb3cualF1ZXJ5O1xyXG5cclxud2luZG93LmFjZkF1dG9GaWxsID0gZnVuY3Rpb24oIGlkID0gMCApIHtcclxuXHJcbiAgbGV0ICRmb3JtcyA9ICQoJy5hY2YtZm9ybScpO1xyXG4gIFxyXG4gIGlmKCAhJGZvcm1zLmxlbmd0aCApIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGxldCB2YWx1ZXMgPSB3aW5kb3cuYWNmQXV0b2ZpbGxWYWx1ZXM7XHJcbiAgaWYoIHR5cGVvZiB2YWx1ZXMgIT09ICdvYmplY3QnICkge1xyXG4gICAgY29uc29sZS53YXJuKCd3aW5kb3cuYWNmQXV0b2ZpbGxWYWx1ZXMgaXMgbm90IGRlZmluZWQnKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgdmFsdWVzID0gdmFsdWVzW2lkXTtcclxuXHJcbiAgbGV0IHNjcm9sbFRvcCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpO1xyXG5cclxuICAkZm9ybXMuZWFjaCgoaSwgZWwpID0+IHtcclxuICAgIGxldCAkZm9ybSA9ICQoZWwpO1xyXG4gICAgJGZvcm0uYWRkQ2xhc3MoJ2lzLWF1dG9maWxsZWQnKTtcclxuXHJcbiAgICAkZm9ybS5maW5kKCcuZmlsbC1wYXNzd29yZC1zdWdnZXN0aW9uJykuY2xpY2soKTtcclxuICAgIGZpbGxGaWVsZHMoICRmb3JtLCB2YWx1ZXMgKTtcclxuICAgIFxyXG4gICAgJGZvcm0uZmluZCgndGV4dGFyZWEnKS5lYWNoKChpLCB0YSkgPT4ge1xyXG4gICAgICAkKHRhKS50cmlnZ2VyKCdtYXhsZW5ndGg6dXBkYXRlJyk7XHJcbiAgICAgIHZhciBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcclxuICAgICAgZXZ0LmluaXRFdmVudCgnYXV0b3NpemU6dXBkYXRlJywgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgICB0YS5kaXNwYXRjaEV2ZW50KGV2dCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkZm9ybS50cmlnZ2VyKCdhdXRvZmlsbGVkJyk7XHJcblxyXG4gIH0pO1xyXG5cclxuICBcclxuICBcclxuXHJcbiAgJCgnaHRtbCxib2R5JykuYW5pbWF0ZSh7XHJcbiAgICBzY3JvbGxUb3A6IHNjcm9sbFRvcFxyXG4gIH0sIDApO1xyXG4gXHJcbiAgZnVuY3Rpb24gbGVhZGluZ1plcm8oIG51bWJlciApIHtcclxuICAgIGlmKCBudW1iZXIgPCAxMCApIHtcclxuICAgICAgcmV0dXJuICcwJytudW1iZXI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVtYmVyO1xyXG4gIH1cclxuIFxyXG4gXHJcbiAgZnVuY3Rpb24gZmlsbEZpZWxkcyggJHdyYXAsIHZhbHVlcyApIHtcclxuICAgICQuZWFjaCggdmFsdWVzLCAoa2V5LCB2YWx1ZSkgPT4ge1xyXG4gICAgICBsZXQgJGZpZWxkcyA9ICR3cmFwLmZpbmQoYC5hY2YtZmllbGRbZGF0YS1uYW1lPVwiJHtrZXl9XCJdYCk7XHJcblxyXG5cclxuICAgICAgaWYoICEkZmllbGRzLmxlbmd0aCApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgJGZpZWxkcy5lYWNoKChpLCBlbCkgPT4ge1xyXG4gICAgICAgIGxldCAkZmllbGQgPSAkKGVsKTtcclxuXHJcbiAgICAgICAgaWYoIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgISh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpICkge1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAkLmVhY2goIHZhbHVlLCAoa2V5LCB2YWwpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGlmKCB0eXBlb2Yga2V5ID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgIGlmKCBrZXkgPiAwICkge1xyXG4gICAgICAgICAgICAgICAgJGZpZWxkLmZpbmQoJ1tkYXRhLWV2ZW50PVwiYWRkLXJvd1wiXTpsYXN0JykuY2xpY2soKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgbGV0ICRmaWVsZHMgPSAkZmllbGQuZmluZCgnLmFjZi1maWVsZHMnKS5lcShrZXkpO1xyXG4gICAgICAgICAgICAgIGZpbGxGaWVsZHMoICRmaWVsZHMsIHZhbCApXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgZmlsbEZpZWxkcyggJGZpZWxkLCB2YWwgKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KVxyXG4gXHJcbiAgICAgICAgfSBlbHNlIHtcclxuIFxyXG4gICAgICAgICAgbGV0ICRpbnB1dHMgPSAkZmllbGQuZmluZCgnaW5wdXQsIHNlbGVjdCwgY2hlY2tib3gsIHRleHRhcmVhJyk7XHJcbiAgICAgICAgICBmaWxsRmllbGQoICRpbnB1dHMsIHZhbHVlICk7XHJcbiAgICAgICAgICBcclxuICAgICAgICB9XHJcbiBcclxuICAgICAgfSk7XHJcbiBcclxuICAgIH0pXHJcbiAgfVxyXG4gXHJcbiAgZnVuY3Rpb24gZmlsbEZpZWxkKCAkaW5wdXRzLCB2YWx1ZSApIHtcclxuXHJcbiAgICAkaW5wdXRzLmVhY2goKGksIGVsKSA9PiB7XHJcbiAgICAgIGxldCAkaW5wdXQgPSAkKGVsKTtcclxuICAgICAgbGV0IHR5cGUgPSAkaW5wdXQuYXR0cigndHlwZScpO1xyXG4gXHJcbiAgICAgIGlmKCB0eXBlID09PSAnaGlkZGVuJ1xyXG4gICAgICAgICAgfHwgJGlucHV0Lmhhc0NsYXNzKCdzZWxlY3QyLXNlYXJjaF9fZmllbGQnKVxyXG4gICAgICAgICAgfHwgdHlwZSA9PT0gJ2ZpbGUnXHJcbiAgICAgICAgICB8fCAkaW5wdXQucGFyZW50cygnLmFjZi1jbG9uZScpLmxlbmd0aCBcclxuICAgICAgICApIHtcclxuICAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuIFxyXG4gICAgICBpZiggdHlwZW9mICRpbnB1dC5kYXRhKCdzZWxlY3QyJykgIT09ICd1bmRlZmluZWQnICkge1xyXG4gICAgICAgICRpbnB1dC5zZWxlY3QyKFwidHJpZ2dlclwiLCBcInNlbGVjdFwiLCB7XHJcbiAgICAgICAgICAgIGRhdGE6IHZhbHVlXHJcbiAgICAgICAgfSkudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHN3aXRjaCggdHlwZSApIHtcclxuIFxyXG4gICAgICAgIGNhc2UgJ2NoZWNrYm94JzpcclxuICAgICAgICAkaW5wdXQucHJvcCgnY2hlY2tlZCcsIHZhbHVlKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICd0cnVlX2ZhbHNlJzpcclxuICAgICAgICAkaW5wdXQucHJvcCgnY2hlY2tlZCcsIHZhbHVlKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuIFxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBpZiggJGlucHV0Lmhhc0NsYXNzKCdoYXNEYXRlcGlja2VyJykgKSB7XHJcbiAgICAgICAgJGlucHV0LmRhdGVwaWNrZXIoIFwic2V0RGF0ZVwiLCB2YWx1ZSApLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiBcclxuICAgICAgLy8gZGVmYXVsdFxyXG4gICAgICAkaW5wdXQudmFsKCB2YWx1ZSApLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICBcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iLCJcclxuLyoqXHJcbiAqIEFDRiBGcm9udGVuZCBGb3JtXHJcbiAqIFZlcnNpb246IDEuMFxyXG4gKi9cclxuXHJcbmdsb2JhbC5qUXVlcnkgPSAkID0gd2luZG93LmpRdWVyeTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFDRkZyb250ZW5kRm9ybSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCAkZm9ybSwganNPcHRpb25zID0ge30gKSB7XHJcblxyXG4gICAgLy8gcmV0dXJuIGlmIHRoZXJlIGlzIG5vIGZvcm0gZWxlbWVudFxyXG4gICAgaWYoICEkZm9ybS5sZW5ndGggKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybiggJ0Zvcm0gZWxlbWVudCBkb2VzblxcJ3QgZXhpc3QnICk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIC8vIHJldHVybiBpZiBnbG9iYWwgYWNmIG9iamVjdCBkb2Vzbid0IGV4aXN0XHJcbiAgICBpZiggdHlwZW9mIGFjZiA9PT0gJ3VuZGVmaW5lZCcgKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybiggJ1RoZSBnbG9iYWwgYWNmIG9iamVjdCBpcyBub3QgZGVmaW5lZCcgKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgLy8gcmV0dXJuIGlmIGZvcm0gaGFzIGFscmVhZHkgYmVlbiBpbml0aWFsaXplZFxyXG4gICAgaWYoICRmb3JtLmhhc0NsYXNzKCdyYWgtaXMtaW5pdGlhbGl6ZWQnKSApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgJGZvcm0uYWRkQ2xhc3MoJ3JhaC1pcy1pbml0aWFsaXplZCcpO1xyXG5cclxuICAgIGxldCBkZWZhdWx0T3B0aW9ucyA9IHtcclxuICAgICAgYWpheFN1Ym1pdDogdHJ1ZSxcclxuICAgICAgd2FpdEFmdGVyU3VibWl0OiAxMDAwLFxyXG4gICAgICByZXNldEFmdGVyU3VibWl0OiB0cnVlLFxyXG4gICAgICBzdWJtaXRPbkNoYW5nZTogZmFsc2VcclxuICAgIH07XHJcblxyXG4gICAgbGV0IGRhdGFPcHRpb25zID0gJGZvcm0uZGF0YSgncmFoLW9wdGlvbnMnKSB8fCB7fTtcclxuXHJcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCggZGVmYXVsdE9wdGlvbnMsIGRhdGFPcHRpb25zLCBqc09wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLiRmb3JtID0gJGZvcm07XHJcblxyXG4gICAgYWNmLmRvQWN0aW9uKCdhcHBlbmQnLCAkZm9ybSk7XHJcbiAgICBhY2YudmFsaWRhdGlvbi5lbmFibGUoKTtcclxuICAgIFxyXG4gICAgdGhpcy4kZm9ybS5maW5kKCcuYWNmLWZpZWxkIGlucHV0JykuZWFjaCgoaSwgZWwpID0+IHtcclxuICAgICAgdGhpcy5hZGp1c3RIYXNWYWx1ZUNsYXNzKCAkKGVsKSApO1xyXG4gICAgfSlcclxuXHJcbiAgICB0aGlzLmNyZWF0ZUFqYXhSZXNwb25zZSgpO1xyXG4gICAgdGhpcy5zZXR1cEZvcm0oKTtcclxuICAgIHRoaXMuc2V0dXBJbnB1dHMoKTtcclxuICAgIHRoaXMuaGlkZUNvbmRpdGlvbmFsRmllbGRzKCk7XHJcblxyXG4gICAgdGhpcy4kZm9ybS5kYXRhKCdSQUhGcm9udGVuZEZvcm0nLCB0aGlzKTtcclxuICB9XHJcblxyXG4gIHNldHVwRm9ybSgpIHtcclxuICAgIFxyXG4gICAgaWYoIHRoaXMub3B0aW9ucy5hamF4U3VibWl0ICkge1xyXG4gICAgICB0aGlzLiRmb3JtLmFkZENsYXNzKCdpcy1hamF4LXN1Ym1pdCcpO1xyXG4gICAgICB0aGlzLiRmb3JtLm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy4kZm9ybS5maW5kKCdbZGF0YS1ldmVudD1cImFkZC1yb3dcIl0nKS5yZW1vdmVDbGFzcygnYWNmLWljb24nKTtcclxuXHJcbiAgICAvLyBkaXNhYmxlIHRoZSBjb25maXJtYXRpb24gZm9yIHJlcGVhdGVyIHJlbW92ZS1yb3cgYnV0dG9uc1xyXG4gICAgdGhpcy4kZm9ybS5vbignY2xpY2snLCAnW2RhdGEtZXZlbnQ9XCJyZW1vdmUtcm93XCJdJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAkKHRoaXMpLmNsaWNrKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgfVxyXG5cclxuICBkb0FqYXhTdWJtaXQoKSB7XHJcblxyXG4gICAgLy8gRml4IGZvciBTYWZhcmkgV2Via2l0IOKAkyBlbXB0eSBmaWxlIGlucHV0c1xyXG4gICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzQ5ODI3NDI2LzU4NjgyM1xyXG4gICAgbGV0ICRmaWxlSW5wdXRzID0gJCgnaW5wdXRbdHlwZT1cImZpbGVcIl06bm90KFtkaXNhYmxlZF0pJywgdGhpcy4kZm9ybSlcclxuICAgICRmaWxlSW5wdXRzLmVhY2goZnVuY3Rpb24oaSwgaW5wdXQpIHtcclxuICAgICAgaWYoIGlucHV0LmZpbGVzLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgICQoaW5wdXQpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XHJcbiAgICB9KVxyXG4gICAgXHJcbiAgICB2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoIHRoaXMuJGZvcm1bMF0gKTtcclxuXHJcbiAgICAvLyBSZS1lbmFibGUgZW1wdHkgZmlsZSAkZmlsZUlucHV0c1xyXG4gICAgJGZpbGVJbnB1dHMucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XHJcblxyXG4gICAgYWNmLnZhbGlkYXRpb24ubG9ja0Zvcm0oIHRoaXMuJGZvcm0gKTtcclxuICAgIHRoaXMuJGZvcm0uYWRkQ2xhc3MoJ3JhaC1pcy1sb2NrZWQnKTtcclxuXHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICB1cmw6IHdpbmRvdy5sb2NhdGlvbi5ocmVmLFxyXG4gICAgICBtZXRob2Q6ICdwb3N0JyxcclxuICAgICAgZGF0YTogZm9ybURhdGEsXHJcbiAgICAgIGNhY2hlOiBmYWxzZSxcclxuICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxyXG4gICAgICBjb250ZW50VHlwZTogZmFsc2VcclxuICAgIH0pLmRvbmUocmVzcG9uc2UgPT4ge1xyXG4gICAgICB0aGlzLmhhbmRsZUFqYXhSZXNwb25zZSggcmVzcG9uc2UgKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgaGFuZGxlQWpheFJlc3BvbnNlKCByZXNwb25zZSApIHtcclxuICAgIGFjZi52YWxpZGF0aW9uLmhpZGVTcGlubmVyKCk7XHJcbiAgICB0aGlzLnNob3dBamF4UmVzcG9uc2UoIHJlc3BvbnNlICk7XHJcbiAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuJGZvcm0ucmVtb3ZlQ2xhc3MoJ3Nob3ctYWpheC1yZXNwb25zZScpO1xyXG4gICAgICBhY2YudmFsaWRhdGlvbi51bmxvY2tGb3JtKCB0aGlzLiRmb3JtICk7XHJcbiAgICAgIHRoaXMuJGZvcm0ucmVtb3ZlQ2xhc3MoJ3JhaC1pcy1sb2NrZWQnKTtcclxuICAgICAgaWYoIHRoaXMub3B0aW9ucy5yZXNldEFmdGVyU3VibWl0ICkge1xyXG4gICAgICAgIHRoaXMucmVzZXRGb3JtKCk7XHJcbiAgICAgIH1cclxuICAgIH0sIHRoaXMub3B0aW9ucy53YWl0QWZ0ZXJTdWJtaXQgKTtcclxuICB9XHJcblxyXG4gIGNyZWF0ZUFqYXhSZXNwb25zZSgpIHtcclxuICAgIHRoaXMuJGFqYXhSZXNwb25zZSA9ICQoJzxkaXYgY2xhc3M9XCJhY2YtYWpheC1yZXNwb25zZVwiPjwvZGl2PicpO1xyXG4gICAgdGhpcy4kZm9ybS5maW5kKCcuYWNmLWZvcm0tc3VibWl0JykuYXBwZW5kKCB0aGlzLiRhamF4UmVzcG9uc2UgKTtcclxuICB9XHJcblxyXG4gIHNob3dBamF4UmVzcG9uc2UoIHJlc3BvbnNlICkge1xyXG4gICAgbGV0IG1lc3NhZ2UgPSByZXNwb25zZS5kYXRhLm1lc3NhZ2U7XHJcbiAgICB0aGlzLiRhamF4UmVzcG9uc2VcclxuICAgICAgLnRleHQoIG1lc3NhZ2UgKVxyXG4gICAgICAudG9nZ2xlQ2xhc3MoJ2lzLS1lcnJvcicsIHJlc3BvbnNlLnN1Y2Nlc3MgPT09IGZhbHNlKTtcclxuICAgIFxyXG4gICAgdGhpcy4kZm9ybS5hZGRDbGFzcygnc2hvdy1hamF4LXJlc3BvbnNlJyk7XHJcbiAgfVxyXG5cclxuICByZXNldEZvcm0oKSB7XHJcbiAgICB0aGlzLiRmb3JtLmdldCgwKS5yZXNldCgpO1xyXG4gICAgdGhpcy4kZm9ybS5maW5kKCcuYWNmLWZpZWxkJykuZmluZCgnaW5wdXQsdGV4dGFyZWEsc2VsZWN0JykudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICB0aGlzLiRmb3JtLmZpbmQoJy5hY2YtZmllbGQnKS5yZW1vdmVDbGFzcygnaGFzLXZhbHVlIGhhcy1mb2N1cycpO1xyXG4gIH1cclxuXHJcbiAgaW5pdEltYWdlRHJvcHMoKSB7XHJcbiAgICAkKCcuYWNmLWZpZWxkLWltYWdlJykuZWFjaCgoaSwgZWwpID0+IHtcclxuICAgICAgbmV3IEltYWdlRHJvcCggJChlbCkgKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgaGlkZUNvbmRpdGlvbmFsRmllbGRzKCkge1xyXG4gICAgdGhpcy4kZm9ybS5maW5kKCcuYWNmLWZpZWxkLmhpZGRlbi1ieS1jb25kaXRpb25hbC1sb2dpYycpLmhpZGUoKTtcclxuICB9XHJcblxyXG4gIHNldHVwSW5wdXRzKCkge1xyXG4gICAgbGV0IHNlbGVjdG9yID0gJ2lucHV0LHRleHRhcmVhLHNlbGVjdCc7XHJcbiAgICB0aGlzLiRmb3JtLm9uKCAna2V5dXAga2V5ZG93biBjaGFuZ2UnLCBzZWxlY3RvciwgZSA9PiB0aGlzLmFkanVzdEhhc1ZhbHVlQ2xhc3MoICQoZS5jdXJyZW50VGFyZ2V0KSApICk7XHJcbiAgICB0aGlzLiRmb3JtLm9uKCAnY2hhbmdlJywgc2VsZWN0b3IsIGUgPT4gdGhpcy5tYXliZVN1Ym1pdEZvcm0oKSApO1xyXG4gICAgdGhpcy4kZm9ybS5vbiggJ2ZvY3VzJywgc2VsZWN0b3IsIGUgPT4gdGhpcy5vbklucHV0Rm9jdXMoIGUuY3VycmVudFRhcmdldCApICk7XHJcbiAgICB0aGlzLiRmb3JtLm9uKCAnYmx1cicsIHNlbGVjdG9yLCBlID0+IHRoaXMub25JbnB1dEJsdXIoIGUuY3VycmVudFRhcmdldCApICk7XHJcbiAgICAgIFxyXG4gIH1cclxuICBhZGp1c3RIYXNWYWx1ZUNsYXNzKCAkaW5wdXQgKSB7XHJcblxyXG4gICAgbGV0ICRmaWVsZCA9ICRpbnB1dC5wYXJlbnRzKCcuYWNmLWZpZWxkOmZpcnN0Jyk7XHJcbiAgICBsZXQgZmllbGQgPSBhY2YuZ2V0SW5zdGFuY2UoICRmaWVsZCApO1xyXG4gICAgaWYoIHR5cGVvZiBmaWVsZCA9PT0gJ3VuZGVmaW5lZCcgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGxldCB0eXBlID0gJGlucHV0LmF0dHIoJ3R5cGUnKTtcclxuICAgIGxldCB2YWwgPSAkaW5wdXQudmFsKCk7XHJcblxyXG4gICAgbGV0IGVuYWJsZWRJbnB1dHMgPSBbXHJcbiAgICAgICd0ZXh0JyxcclxuICAgICAgJ3Bhc3N3b3JkJyxcclxuICAgICAgJ3VybCcsXHJcbiAgICAgICdlbWFpbCcsXHJcbiAgICAgICd0ZXh0YXJlYScsXHJcbiAgICAgICdzZWxlY3QnLFxyXG4gICAgICAndHJ1ZV9mYWxzZScsXHJcbiAgICAgICdkYXRlX3BpY2tlcicsXHJcbiAgICAgICd0aW1lX3BpY2tlcicsXHJcbiAgICAgICdkYXRlX3RpbWVfcGlja2VyJyxcclxuICAgICAgJ29lbWJlZCdcclxuICAgIF07XHJcbiAgICBpZiggJC5pbkFycmF5KCBmaWVsZC5nZXQoJ3R5cGUnKSwgZW5hYmxlZElucHV0cyApID09PSAtMSApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYoIHR5cGUgPT09ICdjaGVja2JveCcgKSB7XHJcbiAgICAgIHZhbCA9ICRpbnB1dC5wcm9wKCdjaGVja2VkJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmKCB2YWwgKSB7XHJcbiAgICAgICRmaWVsZC5hZGRDbGFzcygnaGFzLXZhbHVlJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkZmllbGQucmVtb3ZlQ2xhc3MoJ2hhcy12YWx1ZScpO1xyXG4gICAgfVxyXG4gIH1cclxuICBtYXliZVN1Ym1pdEZvcm0oKSB7XHJcbiAgICBpZiggdGhpcy5vcHRpb25zLnN1Ym1pdE9uQ2hhbmdlICkge1xyXG4gICAgICB0aGlzLiRmb3JtLmZpbmQoJ1t0eXBlPVwic3VibWl0XCJdJykuY2xpY2soKTtcclxuICAgIH1cclxuICB9XHJcbiAgb25JbnB1dEZvY3VzKCBlbCApIHtcclxuICAgIHRoaXMuJGZpZWxkKCBlbCApLmFkZENsYXNzKCdoYXMtZm9jdXMnKTtcclxuICB9XHJcbiAgb25JbnB1dEJsdXIoIGVsICkge1xyXG4gICAgdGhpcy4kZmllbGQoIGVsICkucmVtb3ZlQ2xhc3MoJ2hhcy1mb2N1cycpO1xyXG4gIH1cclxuICAkZmllbGQoIGlucHV0ICkge1xyXG4gICAgcmV0dXJuICQoaW5wdXQpLnBhcmVudHMoJy5hY2YtZmllbGQ6Zmlyc3QnKTtcclxuICB9XHJcblxyXG59XHJcblxyXG4iLCJcclxuZ2xvYmFsLmpRdWVyeSA9ICQgPSB3aW5kb3cualF1ZXJ5O1xyXG5cclxuaW1wb3J0IGZlYXRoZXIgZnJvbSAnZmVhdGhlci1pY29ucyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbWFnZURyb3Age1xyXG4gIFxyXG4gIGNvbnN0cnVjdG9yKCBhY2ZGaWVsZCApIHtcclxuICAgIC8vIHZhcnNcclxuICAgIHRoaXMuYWNmRmllbGQgPSBhY2ZGaWVsZDtcclxuXHJcbiAgICB0aGlzLiRlbCA9IGFjZkZpZWxkLiRlbDtcclxuICAgIFxyXG4gICAgdGhpcy4kaW5wdXQgPSB0aGlzLiRlbC5maW5kKCdpbnB1dFt0eXBlPVwiZmlsZVwiXScpO1xyXG4gICAgdGhpcy4kaW1hZ2VQcmV2aWV3ID0gdGhpcy4kZWwuZmluZCgnLmltYWdlLXdyYXAnKTtcclxuICAgIHRoaXMuJGltYWdlID0gdGhpcy4kaW1hZ2VQcmV2aWV3LmZpbmQoJ2ltZycpO1xyXG4gICAgdGhpcy4kY2xlYXIgPSB0aGlzLiRlbC5maW5kKCdbZGF0YS1uYW1lPVwicmVtb3ZlXCJdJyk7XHJcbiAgICB0aGlzLiRjbGVhci5odG1sKGZlYXRoZXIuaWNvbnNbJ3gtY2lyY2xlJ10udG9TdmcoKSk7XHJcbiAgICBcclxuICAgIHRoaXMuJGltYWdlVXBsb2FkZXIgPSB0aGlzLiRlbC5maW5kKCcuYWNmLWltYWdlLXVwbG9hZGVyJyk7XHJcbiAgICB0aGlzLiRpbnN0cnVjdGlvbnMgPSB0aGlzLiRlbC5maW5kKCcuaW5zdHJ1Y3Rpb25zJyk7XHJcbiAgICB0aGlzLiRpbnN0cnVjdGlvbnMuYXBwZW5kVG8oIHRoaXMuJGltYWdlVXBsb2FkZXIgKTtcclxuICAgIHRoaXMuZGF0YVNldHRpbmdzID0gdGhpcy4kaW5zdHJ1Y3Rpb25zLmRhdGEoJ3NldHRpbmdzJyk7XHJcbiAgICB0aGlzLm1heEZpbGVTaXplID0gdGhpcy5tYXliZUdldCggJ21heF9zaXplJywgdGhpcy5kYXRhU2V0dGluZ3MsIGZhbHNlICk7XHJcblxyXG4gICAgdGhpcy4kZWwuYWRkQ2xhc3MoJ2ltYWdlLWRyb3AnKTtcclxuICAgIHRoaXMuc2V0dXBFdmVudHMoKTtcclxuICAgIHRoaXMucmVuZGVySW1hZ2UoIHRoaXMuJGltYWdlLmF0dHIoJ3NyYycpICk7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIG1heWJlR2V0KCBrZXksIG9iamVjdCwgZmFsbGJhY2sgKSB7XHJcbiAgICBsZXQgdmFsdWUgPSBvYmplY3Rba2V5XTtcclxuICAgIGlmKCB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnICkge1xyXG4gICAgICB2YWx1ZSA9IGZhbGxiYWNrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc2V0dXBFdmVudHMoKSB7XHJcbiAgICBcclxuICAgIGlmKCAkLmluQXJyYXkoICdkYXRhVHJhbnNmZXInLCAkLmV2ZW50LnByb3BzICkgPT09IC0xICkge1xyXG4gICAgICAkLmV2ZW50LnByb3BzLnB1c2goJ2RhdGFUcmFuc2ZlcicpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuJGltYWdlVXBsb2FkZXIub24oJ2RyYWdvdmVyJywgKGUpID0+IHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB0aGlzLiRpbWFnZVVwbG9hZGVyLmFkZENsYXNzKCdpcy1kcmFnb3ZlcicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kaW1hZ2VVcGxvYWRlci5vbignZHJhZ2xlYXZlJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLiRpbWFnZVVwbG9hZGVyLnJlbW92ZUNsYXNzKCdpcy1kcmFnb3ZlcicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kaW1hZ2VVcGxvYWRlci5vbignZHJvcCcsIChlKSA9PiB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgdGhpcy4kaW1hZ2VVcGxvYWRlci5yZW1vdmVDbGFzcygnaXMtZHJhZ292ZXInKTtcclxuICAgICAgdGhpcy4kaW5wdXQuZ2V0KDApLmZpbGVzID0gZS5kYXRhVHJhbnNmZXIuZmlsZXM7XHJcbiAgICAgIHRoaXMuJGlucHV0LnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAvLyB0aGlzLnBhcnNlRmlsZSggZS5kYXRhVHJhbnNmZXIuZmlsZXNbMF0gKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJGNsZWFyLnVuYmluZCgpLmNsaWNrKChlKSA9PiB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgfSlcclxuXHJcbiAgICB0aGlzLmN1cnJlbnRJbWFnZVNyYyA9IHRoaXMuJGltYWdlLmF0dHIoJ3NyYycpO1xyXG5cclxuICAgIHRoaXMubGFzdElucHV0VmFsID0gdGhpcy4kaW5wdXQudmFsKCk7XHJcbiAgICB0aGlzLiRpbnB1dC5jaGFuZ2UoIGUgPT4gdGhpcy5vbklucHV0Q2hhbmdlKCB0aGlzLiRpbnB1dCApICk7XHJcbiAgfVxyXG4gIFxyXG5cclxuICByZW5kZXJJbWFnZSggc3JjICkge1xyXG5cclxuICAgIGlmKCB0eXBlb2Ygc3JjID09PSAndW5kZWZpbmVkJyB8fCAhc3JjLmxlbmd0aCApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBpbWcgPSBuZXcgSW1hZ2U7XHJcbiAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICBsZXQgcmF0aW8gPSBpbWcuaGVpZ2h0IC8gaW1nLndpZHRoO1xyXG4gICAgICBpZiggcmF0aW8gPCAwLjUgKSB7XHJcbiAgICAgICAgdGhpcy5jbGVhciggW2BUaGUgaW1hZ2UgY2FuJ3QgYmUgbW9yZSB0aGFuIHR3aWNlIHRoZSB3aWR0aCBvZiBpdCdzIGhlaWdodGBdICk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9IGVsc2UgaWYoIHJhdGlvID4gMiApIHtcclxuICAgICAgICB0aGlzLmNsZWFyKCBbYFRoZSBpbWFnZSBjYW4ndCBiZSBtb3JlIHRoYW4gdHdpY2UgdGhlIGhlaWdodCBvZiBpdCdzIHdpZHRoYF0gKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgbGV0IHBhZGRpbmdCb3R0b20gPSBNYXRoLmZsb29yKCByYXRpbyAqIDEwMCApO1xyXG4gICAgICB0aGlzLiRpbWFnZVVwbG9hZGVyLmNzcyh7XHJcbiAgICAgICAgcGFkZGluZ0JvdHRvbTogYCR7cGFkZGluZ0JvdHRvbX0lYCxcclxuICAgICAgfSlcclxuXHJcbiAgICAgIHRoaXMuJGltYWdlLmF0dHIoJ3NyYycsIHNyYyk7XHJcbiAgICAgIHRoaXMuJGltYWdlVXBsb2FkZXIuYWRkQ2xhc3MoJ2hhcy12YWx1ZScpO1xyXG5cclxuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigncmFoL2FjZi1mb3JtLXJlc2l6ZWQnKTtcclxuXHJcbiAgICB9XHJcbiAgICBpbWcuc3JjID0gc3JjO1xyXG4gIH1cclxuXHJcbiAgY2xlYXIoIGVycm9ycyA9IGZhbHNlICkge1xyXG4gICAgdGhpcy5hY2ZGaWVsZC5yZW1vdmVBdHRhY2htZW50KCk7XHJcbiAgICB0aGlzLiRpbnB1dC52YWwoJycpO1xyXG4gICAgdGhpcy5sYXN0SW5wdXRWYWwgPSB0aGlzLiRpbnB1dC52YWwoKTtcclxuICAgIHRoaXMuJGltYWdlVXBsb2FkZXIuY3NzKHsgcGFkZGluZ0JvdHRvbTogJycgfSk7XHJcbiAgICBpZiggZXJyb3JzICkge1xyXG4gICAgICB0aGlzLmFjZkZpZWxkLnNob3dFcnJvciggZXJyb3JzLmpvaW4oJzxicj4nKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgb25JbnB1dENoYW5nZSggJGlucHV0ICkge1xyXG4gICAgaWYoIHRoaXMubGFzdElucHV0VmFsID09PSAkaW5wdXQudmFsKCkgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMubGFzdElucHV0VmFsID0gJGlucHV0LnZhbCgpO1xyXG4gICAgaWYoICRpbnB1dC52YWwoKSApIHtcclxuICAgICAgdGhpcy5wYXJzZUZpbGUoICRpbnB1dFswXS5maWxlc1swXSApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcGFyc2VGaWxlKCBmaWxlICkge1xyXG4gICAgbGV0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICByZWFkZXIub25sb2FkID0gKGUpID0+IHtcclxuICAgICAgbGV0IGVycm9ycyA9IHRoaXMuZ2V0RXJyb3JzKCBmaWxlICk7XHJcbiAgICAgIGlmKCAhZXJyb3JzICkge1xyXG4gICAgICAgIHRoaXMucmVuZGVySW1hZ2UoIGUudGFyZ2V0LnJlc3VsdCApO1xyXG4gICAgICAgIHRoaXMuYWNmRmllbGQucmVtb3ZlRXJyb3IoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmNsZWFyKCBlcnJvcnMgKTtcclxuICAgICAgICB0aGlzLnJlbmRlckltYWdlKCB0aGlzLmN1cnJlbnRJbWFnZVNyYyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZWFkZXIucmVhZEFzRGF0YVVSTCggZmlsZSApO1xyXG4gIH1cclxuXHJcbiAgZ2V0RXJyb3JzKCBmaWxlICkge1xyXG4gICAgbGV0IGVycm9ycyA9IFtdO1xyXG5cclxuICAgIC8vIENoZWNrIGZvciBtYXggc2l6ZVxyXG4gICAgbGV0IG1heFNpemUgPSB0aGlzLm1heWJlR2V0KCAnbWF4X3NpemUnLCB0aGlzLmRhdGFTZXR0aW5ncy5yZXN0cmljdGlvbnMsIGZhbHNlIClcclxuICAgIGlmKCBtYXhTaXplICYmIGZpbGUuc2l6ZSAvIDEwMDAwMDAgPiBtYXhTaXplLnZhbHVlICkge1xyXG4gICAgICBlcnJvcnMucHVzaCggbWF4U2l6ZS5lcnJvciApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGZvciBtaW1lIHR5cGVcclxuICAgIGxldCBtaW1lVHlwZXMgPSB0aGlzLm1heWJlR2V0KCAnbWltZV90eXBlcycsIHRoaXMuZGF0YVNldHRpbmdzLnJlc3RyaWN0aW9ucywgZmFsc2UgKVxyXG4gICAgaWYoIG1pbWVUeXBlcyApIHtcclxuICAgICAgbGV0IGV4dGVuc2lvbiA9IGZpbGUubmFtZS5zcGxpdCgnLicpLnBvcCgpLnRvTG93ZXJDYXNlKCk7ICAvLyBmaWxlIGV4dGVuc2lvbiBmcm9tIGlucHV0IGZpbGVcclxuICAgICAgbGV0IGlzVmFsaWRNaW1lVHlwZSA9ICQuaW5BcnJheSggZXh0ZW5zaW9uLCBtaW1lVHlwZXMudmFsdWUgKSA+IC0xOyAgLy8gaXMgZXh0ZW5zaW9uIGluIGFjY2VwdGFibGUgdHlwZXNcclxuICAgICAgaWYoICFpc1ZhbGlkTWltZVR5cGUgKSB7XHJcbiAgICAgICAgZXJyb3JzLnB1c2goIG1pbWVUeXBlcy5lcnJvciApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGVycm9ycy5sZW5ndGggPyBlcnJvcnMgOiBmYWxzZTtcclxuICB9XHJcblxyXG4gIFxyXG59XHJcbiIsIlxyXG5nbG9iYWwualF1ZXJ5ID0gJCA9IHdpbmRvdy5qUXVlcnk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXhMZW5ndGgge1xyXG4gIFxyXG4gIGNvbnN0cnVjdG9yKCBmaWVsZCApIHtcclxuICAgIGxldCAkZWwgPSBmaWVsZC4kZWw7XHJcbiAgICB0aGlzLiRpbmZvID0gJGVsLmZpbmQoJy5tYXhsZW5ndGgtaW5mbycpO1xyXG4gICAgdGhpcy5tYXggPSBwYXJzZUludCggdGhpcy4kaW5mby5hdHRyKCdkYXRhLW1heGxlbmd0aCcpLCAxMCApO1xyXG4gICAgdGhpcy4kcmVtYWluaW5nQ291bnQgPSAkZWwuZmluZCgnLnJlbWFpbmluZy1jb3VudCcpO1xyXG4gICAgdGhpcy4kaW5wdXQgPSBmaWVsZC4kaW5wdXQoKTtcclxuICAgIHRoaXMuJGlucHV0Lm9uKCAnaW5wdXQgbWF4bGVuZ3RoOnVwZGF0ZScsICgpID0+IHRoaXMudXBkYXRlKCkgKTtcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUoKSB7XHJcbiAgICBsZXQgdmFsdWUgPSB0aGlzLiRpbnB1dC52YWwoKTtcclxuICAgIGxldCByZW1haW5pbmcgPSB0aGlzLm1heCAtIHZhbHVlLmxlbmd0aDtcclxuICAgIHJlbWFpbmluZyA9IE1hdGgubWF4KCAwLCByZW1haW5pbmcgKTtcclxuICAgIGlmKCByZW1haW5pbmcgPCAyMCApIHtcclxuICAgICAgdGhpcy4kaW5mby5hZGRDbGFzcygnaXMtd2FybmluZycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy4kaW5mby5yZW1vdmVDbGFzcygnaXMtd2FybmluZycpO1xyXG4gICAgfVxyXG4gICAgdGhpcy4kcmVtYWluaW5nQ291bnQudGV4dCggcmVtYWluaW5nICk7XHJcbiAgICB0aGlzLiRpbnB1dC52YWwoIHZhbHVlLnN1YnN0cmluZyggMCwgdGhpcy5tYXggKSApO1xyXG4gIH1cclxuXHJcbn1cclxuIiwiXHJcbi8qKlxyXG4gKiBBQ0YgRnJvbnRlbmQgRm9ybXNcclxuICogVmVyc2lvbjogMS4wXHJcbiAqL1xyXG5cclxuZ2xvYmFsLmpRdWVyeSA9ICQgPSB3aW5kb3cualF1ZXJ5O1xyXG5cclxuaW1wb3J0ICcuL21vZHVsZXMvYXV0b2ZpbGwnO1xyXG5pbXBvcnQgQUNGRnJvbnRlbmRGb3JtIGZyb20gJy4vbW9kdWxlcy9mcm9udGVuZC1mb3JtJztcclxuaW1wb3J0IEltYWdlRHJvcCBmcm9tICcuL21vZHVsZXMvaW1hZ2UtZHJvcCc7XHJcbmltcG9ydCBNYXhMZW5ndGggZnJvbSAnLi9tb2R1bGVzL21heGxlbmd0aCc7XHJcbmltcG9ydCBhdXRvc2l6ZSBmcm9tICdhdXRvc2l6ZSc7XHJcblxyXG53aW5kb3cucmFoID0gd2luZG93LnJhaCB8fCB7fTtcclxuXHJcbndpbmRvdy5yYWguYWNmRm9ybSA9IGZ1bmN0aW9uKCAkZm9ybSwgb3B0aW9ucyA9IHt9ICkge1xyXG4gIGxldCBpbnN0YW5jZSA9ICRmb3JtLmRhdGEoJ1JBSEZyb250ZW5kRm9ybScpO1xyXG4gIHJldHVybiBpbnN0YW5jZSB8fCBuZXcgQUNGRnJvbnRlbmRGb3JtKCAkZm9ybSwgb3B0aW9ucyApO1xyXG59XHJcblxyXG5jbGFzcyBBcHAge1xyXG4gIFxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIGlmKCB0eXBlb2YgYWNmID09PSAndW5kZWZpbmVkJyApIHtcclxuICAgICAgY29uc29sZS53YXJuKCAnVGhlIGdsb2JhbCBhY2Ygb2JqZWN0IGlzIG5vdCBkZWZpbmVkJyApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMuc2V0dXAoKTtcclxuICAgIHRoaXMuc2V0dXBBamF4U3VibWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXR1cCBnbG9iYWwgYWNmIGZ1bmN0aW9ucyBhbmQgaG9va3NcclxuICAgKi9cclxuICBzZXR1cCgpIHtcclxuICAgIFxyXG4gICAgLy8gYWRkIGluaXRpYWxpemVkIGNsYXNzIHRvIGZpZWxkcyBvbiBpbml0aWFsaXphdGlvblxyXG4gICAgYWNmLmFkZEFjdGlvbignbmV3X2ZpZWxkJywgKCBmaWVsZCApID0+IHtcclxuICAgICAgZmllbGQuJGVsLmFkZENsYXNzKCdyYWgtaXMtaW5pdGlhbGl6ZWQnKTtcclxuICAgICAgdGhpcy5pbml0TWF4SW5wdXRJbmZvKCBmaWVsZCApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgYWNmLmFkZEFjdGlvbignbmV3X2ZpZWxkL3R5cGU9aW1hZ2UnLCAoIGZpZWxkICkgPT4ge1xyXG4gICAgICBuZXcgSW1hZ2VEcm9wKCBmaWVsZCApO1xyXG4gICAgfSlcclxuXHJcbiAgICBhY2YuYWRkQWN0aW9uKCduZXdfZmllbGQvdHlwZT10ZXh0YXJlYScsICggZmllbGQgKSA9PiB7XHJcbiAgICAgIHRoaXMuaW5pdEF1dG9zaXplKCBmaWVsZCApO1xyXG4gICAgfSlcclxuXHJcbiAgICAvLyBmdW5jdGlvbnNcclxuICAgIGFjZi52YWxpZGF0aW9uLnNob3dfc3Bpbm5lciA9IGFjZi52YWxpZGF0aW9uLnNob3dTcGlubmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICQoJ2h0bWwnKS5hZGRDbGFzcygnaXMtbG9hZGluZy1mb3JtJyk7XHJcbiAgICB9XHJcbiAgICBhY2YudmFsaWRhdGlvbi5oaWRlX3NwaW5uZXIgPSBhY2YudmFsaWRhdGlvbi5oaWRlU3Bpbm5lciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKCdodG1sJykucmVtb3ZlQ2xhc3MoJ2lzLWxvYWRpbmctZm9ybScpO1xyXG4gICAgfVxyXG4gICAgYWNmLmFkZEFjdGlvbigncmVtb3ZlJywgKCAkZWwgKSA9PiB7XHJcbiAgICAgIGxldCAkcmVwZWF0ZXIgPSAkZWwuY2xvc2VzdCgnLmFjZi1yZXBlYXRlcicpXHJcbiAgICAgICRlbC5yZW1vdmUoKTtcclxuICAgICAgdGhpcy5hZGp1c3RSZXBlYXRlciggJGVsLCAkcmVwZWF0ZXIsICdyZW1vdmUnICk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBhY2YuYWRkQWN0aW9uKCAnYXBwZW5kJywgKCAkZWwgKSA9PiB7XHJcbiAgICAgIHRoaXMuYWRqdXN0UmVwZWF0ZXIoICRlbCwgJGVsLmNsb3Nlc3QoJy5hY2YtcmVwZWF0ZXInKSwgJ2FwcGVuZCcgKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0dXAgdGhlIGFqYXggc3VibWl0XHJcbiAgICovXHJcbiAgc2V0dXBBamF4U3VibWl0KCkge1xyXG5cclxuICAgIGFjZi5hZGRBY3Rpb24oJ3N1Ym1pdCcsICggJGZvcm0gKSA9PiB7XHJcblxyXG4gICAgICBpZiggISRmb3JtLmhhc0NsYXNzKCdpcy1hamF4LXN1Ym1pdCcpICkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmdldEluc3RhbmNlKCAkZm9ybSApLmRvQWpheFN1Ym1pdCgpO1xyXG5cclxuICAgIH0pO1xyXG5cclxuICB9XHJcblxyXG4gIGdldEluc3RhbmNlKCAkZm9ybSApIHtcclxuICAgIHJldHVybiAkZm9ybS5kYXRhKCdSQUhGcm9udGVuZEZvcm0nKTtcclxuICB9XHJcblxyXG4gIGluaXRNYXhJbnB1dEluZm8oIGZpZWxkICkge1xyXG4gICAgbGV0ICRpbmZvID0gZmllbGQuJGVsLmZpbmQoJy5tYXhsZW5ndGgtaW5mbycpO1xyXG4gICAgaWYoICRpbmZvLmxlbmd0aCApIHtcclxuICAgICAgbmV3IE1heExlbmd0aCggZmllbGQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGluaXRBdXRvc2l6ZSggZmllbGQgKSB7XHJcbiAgICBsZXQgJGlucHV0ID0gZmllbGQuJGlucHV0KCk7XHJcbiAgICBcclxuICAgICRpbnB1dC5lYWNoKGZ1bmN0aW9uKCl7XHJcbiAgICAgIGF1dG9zaXplKHRoaXMpO1xyXG4gICAgfSkub24oJ2F1dG9zaXplOnJlc2l6ZWQnLCBmdW5jdGlvbigpe1xyXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdyYWgvYWNmLWZvcm0tcmVzaXplZCcpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBhZGp1c3RSZXBlYXRlciggJGVsLCAkcmVwZWF0ZXIsIGFjdGlvbiApIHtcclxuICAgIGlmKCAhJHJlcGVhdGVyLmxlbmd0aCApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgLy8gYWRqdXN0IGRpc2FibGVkIGNsYXNzXHJcbiAgICBsZXQgbyA9IGFjZi5nZXRfZGF0YSggJHJlcGVhdGVyICk7XHJcbiAgICBsZXQgJHJvd3MgPSAkcmVwZWF0ZXIuZmluZCgnLmFjZi1yb3c6bm90KC5hY2YtY2xvbmUpJyk7XHJcbiAgICBsZXQgJGxhc3RSb3cgPSAkcm93cy5sYXN0KCk7XHJcbiAgICBsZXQgJGFkZFJvdyA9ICRsYXN0Um93LmZpbmQoJ1tkYXRhLWV2ZW50PVwiYWRkLXJvd1wiXScpO1xyXG4gICAgJGFkZFJvdy50b2dnbGVDbGFzcygnaXMtZGlzYWJsZWQnLCBvLm1heCA+IDAgJiYgJHJvd3MubGVuZ3RoID49IG8ubWF4KTtcclxuXHJcbiAgICBzd2l0Y2goIGFjdGlvbiApIHtcclxuICAgICAgY2FzZSAnYXBwZW5kJzpcclxuICAgICAgdGhpcy5mb2N1c0ZpcnN0SW5wdXQoICRsYXN0Um93ICk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdyZW1vdmUnOlxyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdyYWgvYWNmLWZvcm0tcmVzaXplZCcpO1xyXG4gIH1cclxuXHJcbiAgZm9jdXNGaXJzdElucHV0KCAkZWwgKSB7XHJcbiAgICAvLyBmb2N1cyB0aGUgZmlyc3QgaW5wdXQgb2YgdGhlIG5ldyByb3dcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBsZXQgJGlucHV0ID0gJGVsLmZpbmQoJ2lucHV0OmZpcnN0Jyk7XHJcbiAgICAgIGlmKCAhJGlucHV0Lmxlbmd0aCApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgJGlucHV0LmZvY3VzKCk7XHJcbiAgICB9LCAxKTtcclxuICB9XHJcblxyXG59XHJcblxyXG5uZXcgQXBwKCk7XHJcbiIsIi8qIVxuXHRhdXRvc2l6ZSA0LjAuMlxuXHRsaWNlbnNlOiBNSVRcblx0aHR0cDovL3d3dy5qYWNrbG1vb3JlLmNvbS9hdXRvc2l6ZVxuKi9cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShbJ21vZHVsZScsICdleHBvcnRzJ10sIGZhY3RvcnkpO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0ZmFjdG9yeShtb2R1bGUsIGV4cG9ydHMpO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBtb2QgPSB7XG5cdFx0XHRleHBvcnRzOiB7fVxuXHRcdH07XG5cdFx0ZmFjdG9yeShtb2QsIG1vZC5leHBvcnRzKTtcblx0XHRnbG9iYWwuYXV0b3NpemUgPSBtb2QuZXhwb3J0cztcblx0fVxufSkodGhpcywgZnVuY3Rpb24gKG1vZHVsZSwgZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIG1hcCA9IHR5cGVvZiBNYXAgPT09IFwiZnVuY3Rpb25cIiA/IG5ldyBNYXAoKSA6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIga2V5cyA9IFtdO1xuXHRcdHZhciB2YWx1ZXMgPSBbXTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRoYXM6IGZ1bmN0aW9uIGhhcyhrZXkpIHtcblx0XHRcdFx0cmV0dXJuIGtleXMuaW5kZXhPZihrZXkpID4gLTE7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoa2V5KSB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZXNba2V5cy5pbmRleE9mKGtleSldO1xuXHRcdFx0fSxcblx0XHRcdHNldDogZnVuY3Rpb24gc2V0KGtleSwgdmFsdWUpIHtcblx0XHRcdFx0aWYgKGtleXMuaW5kZXhPZihrZXkpID09PSAtMSkge1xuXHRcdFx0XHRcdGtleXMucHVzaChrZXkpO1xuXHRcdFx0XHRcdHZhbHVlcy5wdXNoKHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGRlbGV0ZTogZnVuY3Rpb24gX2RlbGV0ZShrZXkpIHtcblx0XHRcdFx0dmFyIGluZGV4ID0ga2V5cy5pbmRleE9mKGtleSk7XG5cdFx0XHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHRcdFx0a2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdFx0XHRcdHZhbHVlcy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0fSgpO1xuXG5cdHZhciBjcmVhdGVFdmVudCA9IGZ1bmN0aW9uIGNyZWF0ZUV2ZW50KG5hbWUpIHtcblx0XHRyZXR1cm4gbmV3IEV2ZW50KG5hbWUsIHsgYnViYmxlczogdHJ1ZSB9KTtcblx0fTtcblx0dHJ5IHtcblx0XHRuZXcgRXZlbnQoJ3Rlc3QnKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdC8vIElFIGRvZXMgbm90IHN1cHBvcnQgYG5ldyBFdmVudCgpYFxuXHRcdGNyZWF0ZUV2ZW50ID0gZnVuY3Rpb24gY3JlYXRlRXZlbnQobmFtZSkge1xuXHRcdFx0dmFyIGV2dCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuXHRcdFx0ZXZ0LmluaXRFdmVudChuYW1lLCB0cnVlLCBmYWxzZSk7XG5cdFx0XHRyZXR1cm4gZXZ0O1xuXHRcdH07XG5cdH1cblxuXHRmdW5jdGlvbiBhc3NpZ24odGEpIHtcblx0XHRpZiAoIXRhIHx8ICF0YS5ub2RlTmFtZSB8fCB0YS5ub2RlTmFtZSAhPT0gJ1RFWFRBUkVBJyB8fCBtYXAuaGFzKHRhKSkgcmV0dXJuO1xuXG5cdFx0dmFyIGhlaWdodE9mZnNldCA9IG51bGw7XG5cdFx0dmFyIGNsaWVudFdpZHRoID0gbnVsbDtcblx0XHR2YXIgY2FjaGVkSGVpZ2h0ID0gbnVsbDtcblxuXHRcdGZ1bmN0aW9uIGluaXQoKSB7XG5cdFx0XHR2YXIgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YSwgbnVsbCk7XG5cblx0XHRcdGlmIChzdHlsZS5yZXNpemUgPT09ICd2ZXJ0aWNhbCcpIHtcblx0XHRcdFx0dGEuc3R5bGUucmVzaXplID0gJ25vbmUnO1xuXHRcdFx0fSBlbHNlIGlmIChzdHlsZS5yZXNpemUgPT09ICdib3RoJykge1xuXHRcdFx0XHR0YS5zdHlsZS5yZXNpemUgPSAnaG9yaXpvbnRhbCc7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChzdHlsZS5ib3hTaXppbmcgPT09ICdjb250ZW50LWJveCcpIHtcblx0XHRcdFx0aGVpZ2h0T2Zmc2V0ID0gLShwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdUb3ApICsgcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nQm90dG9tKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRoZWlnaHRPZmZzZXQgPSBwYXJzZUZsb2F0KHN0eWxlLmJvcmRlclRvcFdpZHRoKSArIHBhcnNlRmxvYXQoc3R5bGUuYm9yZGVyQm90dG9tV2lkdGgpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gRml4IHdoZW4gYSB0ZXh0YXJlYSBpcyBub3Qgb24gZG9jdW1lbnQgYm9keSBhbmQgaGVpZ2h0T2Zmc2V0IGlzIE5vdCBhIE51bWJlclxuXHRcdFx0aWYgKGlzTmFOKGhlaWdodE9mZnNldCkpIHtcblx0XHRcdFx0aGVpZ2h0T2Zmc2V0ID0gMDtcblx0XHRcdH1cblxuXHRcdFx0dXBkYXRlKCk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gY2hhbmdlT3ZlcmZsb3codmFsdWUpIHtcblx0XHRcdHtcblx0XHRcdFx0Ly8gQ2hyb21lL1NhZmFyaS1zcGVjaWZpYyBmaXg6XG5cdFx0XHRcdC8vIFdoZW4gdGhlIHRleHRhcmVhIHktb3ZlcmZsb3cgaXMgaGlkZGVuLCBDaHJvbWUvU2FmYXJpIGRvIG5vdCByZWZsb3cgdGhlIHRleHQgdG8gYWNjb3VudCBmb3IgdGhlIHNwYWNlXG5cdFx0XHRcdC8vIG1hZGUgYXZhaWxhYmxlIGJ5IHJlbW92aW5nIHRoZSBzY3JvbGxiYXIuIFRoZSBmb2xsb3dpbmcgZm9yY2VzIHRoZSBuZWNlc3NhcnkgdGV4dCByZWZsb3cuXG5cdFx0XHRcdHZhciB3aWR0aCA9IHRhLnN0eWxlLndpZHRoO1xuXHRcdFx0XHR0YS5zdHlsZS53aWR0aCA9ICcwcHgnO1xuXHRcdFx0XHQvLyBGb3JjZSByZWZsb3c6XG5cdFx0XHRcdC8qIGpzaGludCBpZ25vcmU6c3RhcnQgKi9cblx0XHRcdFx0dGEub2Zmc2V0V2lkdGg7XG5cdFx0XHRcdC8qIGpzaGludCBpZ25vcmU6ZW5kICovXG5cdFx0XHRcdHRhLnN0eWxlLndpZHRoID0gd2lkdGg7XG5cdFx0XHR9XG5cblx0XHRcdHRhLnN0eWxlLm92ZXJmbG93WSA9IHZhbHVlO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGdldFBhcmVudE92ZXJmbG93cyhlbCkge1xuXHRcdFx0dmFyIGFyciA9IFtdO1xuXG5cdFx0XHR3aGlsZSAoZWwgJiYgZWwucGFyZW50Tm9kZSAmJiBlbC5wYXJlbnROb2RlIGluc3RhbmNlb2YgRWxlbWVudCkge1xuXHRcdFx0XHRpZiAoZWwucGFyZW50Tm9kZS5zY3JvbGxUb3ApIHtcblx0XHRcdFx0XHRhcnIucHVzaCh7XG5cdFx0XHRcdFx0XHRub2RlOiBlbC5wYXJlbnROb2RlLFxuXHRcdFx0XHRcdFx0c2Nyb2xsVG9wOiBlbC5wYXJlbnROb2RlLnNjcm9sbFRvcFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsID0gZWwucGFyZW50Tm9kZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGFycjtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiByZXNpemUoKSB7XG5cdFx0XHRpZiAodGEuc2Nyb2xsSGVpZ2h0ID09PSAwKSB7XG5cdFx0XHRcdC8vIElmIHRoZSBzY3JvbGxIZWlnaHQgaXMgMCwgdGhlbiB0aGUgZWxlbWVudCBwcm9iYWJseSBoYXMgZGlzcGxheTpub25lIG9yIGlzIGRldGFjaGVkIGZyb20gdGhlIERPTS5cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgb3ZlcmZsb3dzID0gZ2V0UGFyZW50T3ZlcmZsb3dzKHRhKTtcblx0XHRcdHZhciBkb2NUb3AgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDsgLy8gTmVlZGVkIGZvciBNb2JpbGUgSUUgKHRpY2tldCAjMjQwKVxuXG5cdFx0XHR0YS5zdHlsZS5oZWlnaHQgPSAnJztcblx0XHRcdHRhLnN0eWxlLmhlaWdodCA9IHRhLnNjcm9sbEhlaWdodCArIGhlaWdodE9mZnNldCArICdweCc7XG5cblx0XHRcdC8vIHVzZWQgdG8gY2hlY2sgaWYgYW4gdXBkYXRlIGlzIGFjdHVhbGx5IG5lY2Vzc2FyeSBvbiB3aW5kb3cucmVzaXplXG5cdFx0XHRjbGllbnRXaWR0aCA9IHRhLmNsaWVudFdpZHRoO1xuXG5cdFx0XHQvLyBwcmV2ZW50cyBzY3JvbGwtcG9zaXRpb24ganVtcGluZ1xuXHRcdFx0b3ZlcmZsb3dzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG5cdFx0XHRcdGVsLm5vZGUuc2Nyb2xsVG9wID0gZWwuc2Nyb2xsVG9wO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmIChkb2NUb3ApIHtcblx0XHRcdFx0ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCA9IGRvY1RvcDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmdW5jdGlvbiB1cGRhdGUoKSB7XG5cdFx0XHRyZXNpemUoKTtcblxuXHRcdFx0dmFyIHN0eWxlSGVpZ2h0ID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KHRhLnN0eWxlLmhlaWdodCkpO1xuXHRcdFx0dmFyIGNvbXB1dGVkID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGEsIG51bGwpO1xuXG5cdFx0XHQvLyBVc2luZyBvZmZzZXRIZWlnaHQgYXMgYSByZXBsYWNlbWVudCBmb3IgY29tcHV0ZWQuaGVpZ2h0IGluIElFLCBiZWNhdXNlIElFIGRvZXMgbm90IGFjY291bnQgdXNlIG9mIGJvcmRlci1ib3hcblx0XHRcdHZhciBhY3R1YWxIZWlnaHQgPSBjb21wdXRlZC5ib3hTaXppbmcgPT09ICdjb250ZW50LWJveCcgPyBNYXRoLnJvdW5kKHBhcnNlRmxvYXQoY29tcHV0ZWQuaGVpZ2h0KSkgOiB0YS5vZmZzZXRIZWlnaHQ7XG5cblx0XHRcdC8vIFRoZSBhY3R1YWwgaGVpZ2h0IG5vdCBtYXRjaGluZyB0aGUgc3R5bGUgaGVpZ2h0IChzZXQgdmlhIHRoZSByZXNpemUgbWV0aG9kKSBpbmRpY2F0ZXMgdGhhdCBcblx0XHRcdC8vIHRoZSBtYXgtaGVpZ2h0IGhhcyBiZWVuIGV4Y2VlZGVkLCBpbiB3aGljaCBjYXNlIHRoZSBvdmVyZmxvdyBzaG91bGQgYmUgYWxsb3dlZC5cblx0XHRcdGlmIChhY3R1YWxIZWlnaHQgPCBzdHlsZUhlaWdodCkge1xuXHRcdFx0XHRpZiAoY29tcHV0ZWQub3ZlcmZsb3dZID09PSAnaGlkZGVuJykge1xuXHRcdFx0XHRcdGNoYW5nZU92ZXJmbG93KCdzY3JvbGwnKTtcblx0XHRcdFx0XHRyZXNpemUoKTtcblx0XHRcdFx0XHRhY3R1YWxIZWlnaHQgPSBjb21wdXRlZC5ib3hTaXppbmcgPT09ICdjb250ZW50LWJveCcgPyBNYXRoLnJvdW5kKHBhcnNlRmxvYXQod2luZG93LmdldENvbXB1dGVkU3R5bGUodGEsIG51bGwpLmhlaWdodCkpIDogdGEub2Zmc2V0SGVpZ2h0O1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBOb3JtYWxseSBrZWVwIG92ZXJmbG93IHNldCB0byBoaWRkZW4sIHRvIGF2b2lkIGZsYXNoIG9mIHNjcm9sbGJhciBhcyB0aGUgdGV4dGFyZWEgZXhwYW5kcy5cblx0XHRcdFx0aWYgKGNvbXB1dGVkLm92ZXJmbG93WSAhPT0gJ2hpZGRlbicpIHtcblx0XHRcdFx0XHRjaGFuZ2VPdmVyZmxvdygnaGlkZGVuJyk7XG5cdFx0XHRcdFx0cmVzaXplKCk7XG5cdFx0XHRcdFx0YWN0dWFsSGVpZ2h0ID0gY29tcHV0ZWQuYm94U2l6aW5nID09PSAnY29udGVudC1ib3gnID8gTWF0aC5yb3VuZChwYXJzZUZsb2F0KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRhLCBudWxsKS5oZWlnaHQpKSA6IHRhLm9mZnNldEhlaWdodDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY2FjaGVkSGVpZ2h0ICE9PSBhY3R1YWxIZWlnaHQpIHtcblx0XHRcdFx0Y2FjaGVkSGVpZ2h0ID0gYWN0dWFsSGVpZ2h0O1xuXHRcdFx0XHR2YXIgZXZ0ID0gY3JlYXRlRXZlbnQoJ2F1dG9zaXplOnJlc2l6ZWQnKTtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR0YS5kaXNwYXRjaEV2ZW50KGV2dCk7XG5cdFx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdC8vIEZpcmVmb3ggd2lsbCB0aHJvdyBhbiBlcnJvciBvbiBkaXNwYXRjaEV2ZW50IGZvciBhIGRldGFjaGVkIGVsZW1lbnRcblx0XHRcdFx0XHQvLyBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD04ODkzNzZcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHZhciBwYWdlUmVzaXplID0gZnVuY3Rpb24gcGFnZVJlc2l6ZSgpIHtcblx0XHRcdGlmICh0YS5jbGllbnRXaWR0aCAhPT0gY2xpZW50V2lkdGgpIHtcblx0XHRcdFx0dXBkYXRlKCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBkZXN0cm95ID0gZnVuY3Rpb24gKHN0eWxlKSB7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcGFnZVJlc2l6ZSwgZmFsc2UpO1xuXHRcdFx0dGEucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB1cGRhdGUsIGZhbHNlKTtcblx0XHRcdHRhLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdXBkYXRlLCBmYWxzZSk7XG5cdFx0XHR0YS5yZW1vdmVFdmVudExpc3RlbmVyKCdhdXRvc2l6ZTpkZXN0cm95JywgZGVzdHJveSwgZmFsc2UpO1xuXHRcdFx0dGEucmVtb3ZlRXZlbnRMaXN0ZW5lcignYXV0b3NpemU6dXBkYXRlJywgdXBkYXRlLCBmYWxzZSk7XG5cblx0XHRcdE9iamVjdC5rZXlzKHN0eWxlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0dGEuc3R5bGVba2V5XSA9IHN0eWxlW2tleV07XG5cdFx0XHR9KTtcblxuXHRcdFx0bWFwLmRlbGV0ZSh0YSk7XG5cdFx0fS5iaW5kKHRhLCB7XG5cdFx0XHRoZWlnaHQ6IHRhLnN0eWxlLmhlaWdodCxcblx0XHRcdHJlc2l6ZTogdGEuc3R5bGUucmVzaXplLFxuXHRcdFx0b3ZlcmZsb3dZOiB0YS5zdHlsZS5vdmVyZmxvd1ksXG5cdFx0XHRvdmVyZmxvd1g6IHRhLnN0eWxlLm92ZXJmbG93WCxcblx0XHRcdHdvcmRXcmFwOiB0YS5zdHlsZS53b3JkV3JhcFxuXHRcdH0pO1xuXG5cdFx0dGEuYWRkRXZlbnRMaXN0ZW5lcignYXV0b3NpemU6ZGVzdHJveScsIGRlc3Ryb3ksIGZhbHNlKTtcblxuXHRcdC8vIElFOSBkb2VzIG5vdCBmaXJlIG9ucHJvcGVydHljaGFuZ2Ugb3Igb25pbnB1dCBmb3IgZGVsZXRpb25zLFxuXHRcdC8vIHNvIGJpbmRpbmcgdG8gb25rZXl1cCB0byBjYXRjaCBtb3N0IG9mIHRob3NlIGV2ZW50cy5cblx0XHQvLyBUaGVyZSBpcyBubyB3YXkgdGhhdCBJIGtub3cgb2YgdG8gZGV0ZWN0IHNvbWV0aGluZyBsaWtlICdjdXQnIGluIElFOS5cblx0XHRpZiAoJ29ucHJvcGVydHljaGFuZ2UnIGluIHRhICYmICdvbmlucHV0JyBpbiB0YSkge1xuXHRcdFx0dGEuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cGRhdGUsIGZhbHNlKTtcblx0XHR9XG5cblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcGFnZVJlc2l6ZSwgZmFsc2UpO1xuXHRcdHRhLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdXBkYXRlLCBmYWxzZSk7XG5cdFx0dGEuYWRkRXZlbnRMaXN0ZW5lcignYXV0b3NpemU6dXBkYXRlJywgdXBkYXRlLCBmYWxzZSk7XG5cdFx0dGEuc3R5bGUub3ZlcmZsb3dYID0gJ2hpZGRlbic7XG5cdFx0dGEuc3R5bGUud29yZFdyYXAgPSAnYnJlYWstd29yZCc7XG5cblx0XHRtYXAuc2V0KHRhLCB7XG5cdFx0XHRkZXN0cm95OiBkZXN0cm95LFxuXHRcdFx0dXBkYXRlOiB1cGRhdGVcblx0XHR9KTtcblxuXHRcdGluaXQoKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlc3Ryb3kodGEpIHtcblx0XHR2YXIgbWV0aG9kcyA9IG1hcC5nZXQodGEpO1xuXHRcdGlmIChtZXRob2RzKSB7XG5cdFx0XHRtZXRob2RzLmRlc3Ryb3koKTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiB1cGRhdGUodGEpIHtcblx0XHR2YXIgbWV0aG9kcyA9IG1hcC5nZXQodGEpO1xuXHRcdGlmIChtZXRob2RzKSB7XG5cdFx0XHRtZXRob2RzLnVwZGF0ZSgpO1xuXHRcdH1cblx0fVxuXG5cdHZhciBhdXRvc2l6ZSA9IG51bGw7XG5cblx0Ly8gRG8gbm90aGluZyBpbiBOb2RlLmpzIGVudmlyb25tZW50IGFuZCBJRTggKG9yIGxvd2VyKVxuXHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0YXV0b3NpemUgPSBmdW5jdGlvbiBhdXRvc2l6ZShlbCkge1xuXHRcdFx0cmV0dXJuIGVsO1xuXHRcdH07XG5cdFx0YXV0b3NpemUuZGVzdHJveSA9IGZ1bmN0aW9uIChlbCkge1xuXHRcdFx0cmV0dXJuIGVsO1xuXHRcdH07XG5cdFx0YXV0b3NpemUudXBkYXRlID0gZnVuY3Rpb24gKGVsKSB7XG5cdFx0XHRyZXR1cm4gZWw7XG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHRhdXRvc2l6ZSA9IGZ1bmN0aW9uIGF1dG9zaXplKGVsLCBvcHRpb25zKSB7XG5cdFx0XHRpZiAoZWwpIHtcblx0XHRcdFx0QXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChlbC5sZW5ndGggPyBlbCA6IFtlbF0sIGZ1bmN0aW9uICh4KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGFzc2lnbih4LCBvcHRpb25zKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZWw7XG5cdFx0fTtcblx0XHRhdXRvc2l6ZS5kZXN0cm95ID0gZnVuY3Rpb24gKGVsKSB7XG5cdFx0XHRpZiAoZWwpIHtcblx0XHRcdFx0QXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChlbC5sZW5ndGggPyBlbCA6IFtlbF0sIGRlc3Ryb3kpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGVsO1xuXHRcdH07XG5cdFx0YXV0b3NpemUudXBkYXRlID0gZnVuY3Rpb24gKGVsKSB7XG5cdFx0XHRpZiAoZWwpIHtcblx0XHRcdFx0QXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChlbC5sZW5ndGggPyBlbCA6IFtlbF0sIHVwZGF0ZSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZWw7XG5cdFx0fTtcblx0fVxuXG5cdGV4cG9ydHMuZGVmYXVsdCA9IGF1dG9zaXplO1xuXHRtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbn0pOyIsIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcImZlYXRoZXJcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiZmVhdGhlclwiXSA9IGZhY3RvcnkoKTtcbn0pKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiAvKioqKioqLyAoZnVuY3Rpb24obW9kdWxlcykgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbi8qKioqKiovIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuLyoqKioqKi8gXHRcdH1cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdGk6IG1vZHVsZUlkLFxuLyoqKioqKi8gXHRcdFx0bDogZmFsc2UsXG4vKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fVxuLyoqKioqKi8gXHRcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuLyoqKioqKi8gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4vKioqKioqLyBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbi8qKioqKiovIFx0fVxuLyoqKioqKi9cbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuLyoqKioqKi8gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbi8qKioqKiovIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4vKioqKioqLyBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4vKioqKioqLyBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4vKioqKioqLyBcdFx0XHRcdGdldDogZ2V0dGVyXG4vKioqKioqLyBcdFx0XHR9KTtcbi8qKioqKiovIFx0XHR9XG4vKioqKioqLyBcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbi8qKioqKiovIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyoqKioqKi8gXHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4vKioqKioqLyBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4vKioqKioqLyBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuLyoqKioqKi8gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4vKioqKioqLyBcdFx0cmV0dXJuIGdldHRlcjtcbi8qKioqKiovIFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuLyoqKioqKi9cbi8qKioqKiovXG4vKioqKioqLyBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAwKTtcbi8qKioqKiovIH0pXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gKHtcblxuLyoqKi8gXCIuL2Rpc3QvaWNvbnMuanNvblwiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL2Rpc3QvaWNvbnMuanNvbiAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBleHBvcnRzIHByb3ZpZGVkOiBhY3Rpdml0eSwgYWlycGxheSwgYWxlcnQtY2lyY2xlLCBhbGVydC1vY3RhZ29uLCBhbGVydC10cmlhbmdsZSwgYWxpZ24tY2VudGVyLCBhbGlnbi1qdXN0aWZ5LCBhbGlnbi1sZWZ0LCBhbGlnbi1yaWdodCwgYW5jaG9yLCBhcGVydHVyZSwgYXJjaGl2ZSwgYXJyb3ctZG93bi1jaXJjbGUsIGFycm93LWRvd24tbGVmdCwgYXJyb3ctZG93bi1yaWdodCwgYXJyb3ctZG93biwgYXJyb3ctbGVmdC1jaXJjbGUsIGFycm93LWxlZnQsIGFycm93LXJpZ2h0LWNpcmNsZSwgYXJyb3ctcmlnaHQsIGFycm93LXVwLWNpcmNsZSwgYXJyb3ctdXAtbGVmdCwgYXJyb3ctdXAtcmlnaHQsIGFycm93LXVwLCBhdC1zaWduLCBhd2FyZCwgYmFyLWNoYXJ0LTIsIGJhci1jaGFydCwgYmF0dGVyeS1jaGFyZ2luZywgYmF0dGVyeSwgYmVsbC1vZmYsIGJlbGwsIGJsdWV0b290aCwgYm9sZCwgYm9vay1vcGVuLCBib29rLCBib29rbWFyaywgYm94LCBicmllZmNhc2UsIGNhbGVuZGFyLCBjYW1lcmEtb2ZmLCBjYW1lcmEsIGNhc3QsIGNoZWNrLWNpcmNsZSwgY2hlY2stc3F1YXJlLCBjaGVjaywgY2hldnJvbi1kb3duLCBjaGV2cm9uLWxlZnQsIGNoZXZyb24tcmlnaHQsIGNoZXZyb24tdXAsIGNoZXZyb25zLWRvd24sIGNoZXZyb25zLWxlZnQsIGNoZXZyb25zLXJpZ2h0LCBjaGV2cm9ucy11cCwgY2hyb21lLCBjaXJjbGUsIGNsaXBib2FyZCwgY2xvY2ssIGNsb3VkLWRyaXp6bGUsIGNsb3VkLWxpZ2h0bmluZywgY2xvdWQtb2ZmLCBjbG91ZC1yYWluLCBjbG91ZC1zbm93LCBjbG91ZCwgY29kZSwgY29kZXBlbiwgY29tbWFuZCwgY29tcGFzcywgY29weSwgY29ybmVyLWRvd24tbGVmdCwgY29ybmVyLWRvd24tcmlnaHQsIGNvcm5lci1sZWZ0LWRvd24sIGNvcm5lci1sZWZ0LXVwLCBjb3JuZXItcmlnaHQtZG93biwgY29ybmVyLXJpZ2h0LXVwLCBjb3JuZXItdXAtbGVmdCwgY29ybmVyLXVwLXJpZ2h0LCBjcHUsIGNyZWRpdC1jYXJkLCBjcm9wLCBjcm9zc2hhaXIsIGRhdGFiYXNlLCBkZWxldGUsIGRpc2MsIGRvbGxhci1zaWduLCBkb3dubG9hZC1jbG91ZCwgZG93bmxvYWQsIGRyb3BsZXQsIGVkaXQtMiwgZWRpdC0zLCBlZGl0LCBleHRlcm5hbC1saW5rLCBleWUtb2ZmLCBleWUsIGZhY2Vib29rLCBmYXN0LWZvcndhcmQsIGZlYXRoZXIsIGZpbGUtbWludXMsIGZpbGUtcGx1cywgZmlsZS10ZXh0LCBmaWxlLCBmaWxtLCBmaWx0ZXIsIGZsYWcsIGZvbGRlci1taW51cywgZm9sZGVyLXBsdXMsIGZvbGRlciwgZ2lmdCwgZ2l0LWJyYW5jaCwgZ2l0LWNvbW1pdCwgZ2l0LW1lcmdlLCBnaXQtcHVsbC1yZXF1ZXN0LCBnaXRodWIsIGdpdGxhYiwgZ2xvYmUsIGdyaWQsIGhhcmQtZHJpdmUsIGhhc2gsIGhlYWRwaG9uZXMsIGhlYXJ0LCBoZWxwLWNpcmNsZSwgaG9tZSwgaW1hZ2UsIGluYm94LCBpbmZvLCBpbnN0YWdyYW0sIGl0YWxpYywgbGF5ZXJzLCBsYXlvdXQsIGxpZmUtYnVveSwgbGluay0yLCBsaW5rLCBsaW5rZWRpbiwgbGlzdCwgbG9hZGVyLCBsb2NrLCBsb2ctaW4sIGxvZy1vdXQsIG1haWwsIG1hcC1waW4sIG1hcCwgbWF4aW1pemUtMiwgbWF4aW1pemUsIG1lbnUsIG1lc3NhZ2UtY2lyY2xlLCBtZXNzYWdlLXNxdWFyZSwgbWljLW9mZiwgbWljLCBtaW5pbWl6ZS0yLCBtaW5pbWl6ZSwgbWludXMtY2lyY2xlLCBtaW51cy1zcXVhcmUsIG1pbnVzLCBtb25pdG9yLCBtb29uLCBtb3JlLWhvcml6b250YWwsIG1vcmUtdmVydGljYWwsIG1vdmUsIG11c2ljLCBuYXZpZ2F0aW9uLTIsIG5hdmlnYXRpb24sIG9jdGFnb24sIHBhY2thZ2UsIHBhcGVyY2xpcCwgcGF1c2UtY2lyY2xlLCBwYXVzZSwgcGVyY2VudCwgcGhvbmUtY2FsbCwgcGhvbmUtZm9yd2FyZGVkLCBwaG9uZS1pbmNvbWluZywgcGhvbmUtbWlzc2VkLCBwaG9uZS1vZmYsIHBob25lLW91dGdvaW5nLCBwaG9uZSwgcGllLWNoYXJ0LCBwbGF5LWNpcmNsZSwgcGxheSwgcGx1cy1jaXJjbGUsIHBsdXMtc3F1YXJlLCBwbHVzLCBwb2NrZXQsIHBvd2VyLCBwcmludGVyLCByYWRpbywgcmVmcmVzaC1jY3csIHJlZnJlc2gtY3csIHJlcGVhdCwgcmV3aW5kLCByb3RhdGUtY2N3LCByb3RhdGUtY3csIHJzcywgc2F2ZSwgc2Npc3NvcnMsIHNlYXJjaCwgc2VuZCwgc2VydmVyLCBzZXR0aW5ncywgc2hhcmUtMiwgc2hhcmUsIHNoaWVsZC1vZmYsIHNoaWVsZCwgc2hvcHBpbmctYmFnLCBzaG9wcGluZy1jYXJ0LCBzaHVmZmxlLCBzaWRlYmFyLCBza2lwLWJhY2ssIHNraXAtZm9yd2FyZCwgc2xhY2ssIHNsYXNoLCBzbGlkZXJzLCBzbWFydHBob25lLCBzcGVha2VyLCBzcXVhcmUsIHN0YXIsIHN0b3AtY2lyY2xlLCBzdW4sIHN1bnJpc2UsIHN1bnNldCwgdGFibGV0LCB0YWcsIHRhcmdldCwgdGVybWluYWwsIHRoZXJtb21ldGVyLCB0aHVtYnMtZG93biwgdGh1bWJzLXVwLCB0b2dnbGUtbGVmdCwgdG9nZ2xlLXJpZ2h0LCB0cmFzaC0yLCB0cmFzaCwgdHJlbmRpbmctZG93biwgdHJlbmRpbmctdXAsIHRyaWFuZ2xlLCB0cnVjaywgdHYsIHR3aXR0ZXIsIHR5cGUsIHVtYnJlbGxhLCB1bmRlcmxpbmUsIHVubG9jaywgdXBsb2FkLWNsb3VkLCB1cGxvYWQsIHVzZXItY2hlY2ssIHVzZXItbWludXMsIHVzZXItcGx1cywgdXNlci14LCB1c2VyLCB1c2VycywgdmlkZW8tb2ZmLCB2aWRlbywgdm9pY2VtYWlsLCB2b2x1bWUtMSwgdm9sdW1lLTIsIHZvbHVtZS14LCB2b2x1bWUsIHdhdGNoLCB3aWZpLW9mZiwgd2lmaSwgd2luZCwgeC1jaXJjbGUsIHgtc3F1YXJlLCB4LCB5b3V0dWJlLCB6YXAtb2ZmLCB6YXAsIHpvb20taW4sIHpvb20tb3V0LCBkZWZhdWx0ICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlKSB7XG5cbm1vZHVsZS5leHBvcnRzID0ge1wiYWN0aXZpdHlcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjIyIDEyIDE4IDEyIDE1IDIxIDkgMyA2IDEyIDIgMTJcXFwiPjwvcG9seWxpbmU+XCIsXCJhaXJwbGF5XCI6XCI8cGF0aCBkPVxcXCJNNSAxN0g0YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDE2YTIgMiAwIDAgMSAyIDJ2MTBhMiAyIDAgMCAxLTIgMmgtMVxcXCI+PC9wYXRoPjxwb2x5Z29uIHBvaW50cz1cXFwiMTIgMTUgMTcgMjEgNyAyMSAxMiAxNVxcXCI+PC9wb2x5Z29uPlwiLFwiYWxlcnQtY2lyY2xlXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxMFxcXCI+PC9jaXJjbGU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiOFxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIxNlxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTZcXFwiPjwvbGluZT5cIixcImFsZXJ0LW9jdGFnb25cIjpcIjxwb2x5Z29uIHBvaW50cz1cXFwiNy44NiAyIDE2LjE0IDIgMjIgNy44NiAyMiAxNi4xNCAxNi4xNCAyMiA3Ljg2IDIyIDIgMTYuMTQgMiA3Ljg2IDcuODYgMlxcXCI+PC9wb2x5Z29uPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjhcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMTZcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjE2XFxcIj48L2xpbmU+XCIsXCJhbGVydC10cmlhbmdsZVwiOlwiPHBhdGggZD1cXFwiTTEwLjI5IDMuODZMMS44MiAxOGEyIDIgMCAwIDAgMS43MSAzaDE2Ljk0YTIgMiAwIDAgMCAxLjcxLTNMMTMuNzEgMy44NmEyIDIgMCAwIDAtMy40MiAwelxcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjlcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjEzXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMTdcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjE3XFxcIj48L2xpbmU+XCIsXCJhbGlnbi1jZW50ZXJcIjpcIjxsaW5lIHgxPVxcXCIxOFxcXCIgeTE9XFxcIjEwXFxcIiB4Mj1cXFwiNlxcXCIgeTI9XFxcIjEwXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjIxXFxcIiB5MT1cXFwiNlxcXCIgeDI9XFxcIjNcXFwiIHkyPVxcXCI2XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjIxXFxcIiB5MT1cXFwiMTRcXFwiIHgyPVxcXCIzXFxcIiB5Mj1cXFwiMTRcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMThcXFwiIHkxPVxcXCIxOFxcXCIgeDI9XFxcIjZcXFwiIHkyPVxcXCIxOFxcXCI+PC9saW5lPlwiLFwiYWxpZ24tanVzdGlmeVwiOlwiPGxpbmUgeDE9XFxcIjIxXFxcIiB5MT1cXFwiMTBcXFwiIHgyPVxcXCIzXFxcIiB5Mj1cXFwiMTBcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMjFcXFwiIHkxPVxcXCI2XFxcIiB4Mj1cXFwiM1xcXCIgeTI9XFxcIjZcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMjFcXFwiIHkxPVxcXCIxNFxcXCIgeDI9XFxcIjNcXFwiIHkyPVxcXCIxNFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIyMVxcXCIgeTE9XFxcIjE4XFxcIiB4Mj1cXFwiM1xcXCIgeTI9XFxcIjE4XFxcIj48L2xpbmU+XCIsXCJhbGlnbi1sZWZ0XCI6XCI8bGluZSB4MT1cXFwiMTdcXFwiIHkxPVxcXCIxMFxcXCIgeDI9XFxcIjNcXFwiIHkyPVxcXCIxMFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIyMVxcXCIgeTE9XFxcIjZcXFwiIHgyPVxcXCIzXFxcIiB5Mj1cXFwiNlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIyMVxcXCIgeTE9XFxcIjE0XFxcIiB4Mj1cXFwiM1xcXCIgeTI9XFxcIjE0XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE3XFxcIiB5MT1cXFwiMThcXFwiIHgyPVxcXCIzXFxcIiB5Mj1cXFwiMThcXFwiPjwvbGluZT5cIixcImFsaWduLXJpZ2h0XCI6XCI8bGluZSB4MT1cXFwiMjFcXFwiIHkxPVxcXCIxMFxcXCIgeDI9XFxcIjdcXFwiIHkyPVxcXCIxMFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIyMVxcXCIgeTE9XFxcIjZcXFwiIHgyPVxcXCIzXFxcIiB5Mj1cXFwiNlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIyMVxcXCIgeTE9XFxcIjE0XFxcIiB4Mj1cXFwiM1xcXCIgeTI9XFxcIjE0XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjIxXFxcIiB5MT1cXFwiMThcXFwiIHgyPVxcXCI3XFxcIiB5Mj1cXFwiMThcXFwiPjwvbGluZT5cIixcImFuY2hvclwiOlwiPGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCI1XFxcIiByPVxcXCIzXFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIyMlxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiOFxcXCI+PC9saW5lPjxwYXRoIGQ9XFxcIk01IDEySDJhMTAgMTAgMCAwIDAgMjAgMGgtM1xcXCI+PC9wYXRoPlwiLFwiYXBlcnR1cmVcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjEwXFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiMTQuMzFcXFwiIHkxPVxcXCI4XFxcIiB4Mj1cXFwiMjAuMDVcXFwiIHkyPVxcXCIxNy45NFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI5LjY5XFxcIiB5MT1cXFwiOFxcXCIgeDI9XFxcIjIxLjE3XFxcIiB5Mj1cXFwiOFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI3LjM4XFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCIxMy4xMlxcXCIgeTI9XFxcIjIuMDZcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiOS42OVxcXCIgeTE9XFxcIjE2XFxcIiB4Mj1cXFwiMy45NVxcXCIgeTI9XFxcIjYuMDZcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTQuMzFcXFwiIHkxPVxcXCIxNlxcXCIgeDI9XFxcIjIuODNcXFwiIHkyPVxcXCIxNlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNi42MlxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiMTAuODhcXFwiIHkyPVxcXCIyMS45NFxcXCI+PC9saW5lPlwiLFwiYXJjaGl2ZVwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMjEgOCAyMSAyMSAzIDIxIDMgOFxcXCI+PC9wb2x5bGluZT48cmVjdCB4PVxcXCIxXFxcIiB5PVxcXCIzXFxcIiB3aWR0aD1cXFwiMjJcXFwiIGhlaWdodD1cXFwiNVxcXCI+PC9yZWN0PjxsaW5lIHgxPVxcXCIxMFxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiMTRcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPlwiLFwiYXJyb3ctZG93bi1jaXJjbGVcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjEwXFxcIj48L2NpcmNsZT48cG9seWxpbmUgcG9pbnRzPVxcXCI4IDEyIDEyIDE2IDE2IDEyXFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjhcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjE2XFxcIj48L2xpbmU+XCIsXCJhcnJvdy1kb3duLWxlZnRcIjpcIjxsaW5lIHgxPVxcXCIxN1xcXCIgeTE9XFxcIjdcXFwiIHgyPVxcXCI3XFxcIiB5Mj1cXFwiMTdcXFwiPjwvbGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCIxNyAxNyA3IDE3IDcgN1xcXCI+PC9wb2x5bGluZT5cIixcImFycm93LWRvd24tcmlnaHRcIjpcIjxsaW5lIHgxPVxcXCI3XFxcIiB5MT1cXFwiN1xcXCIgeDI9XFxcIjE3XFxcIiB5Mj1cXFwiMTdcXFwiPjwvbGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCIxNyA3IDE3IDE3IDcgMTdcXFwiPjwvcG9seWxpbmU+XCIsXCJhcnJvdy1kb3duXCI6XCI8bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCI1XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIxOVxcXCI+PC9saW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjE5IDEyIDEyIDE5IDUgMTJcXFwiPjwvcG9seWxpbmU+XCIsXCJhcnJvdy1sZWZ0LWNpcmNsZVwiOlwiPGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiMTBcXFwiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9XFxcIjEyIDggOCAxMiAxMiAxNlxcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMTZcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjhcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPlwiLFwiYXJyb3ctbGVmdFwiOlwiPGxpbmUgeDE9XFxcIjE5XFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCI1XFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCIxMiAxOSA1IDEyIDEyIDVcXFwiPjwvcG9seWxpbmU+XCIsXCJhcnJvdy1yaWdodC1jaXJjbGVcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjEwXFxcIj48L2NpcmNsZT48cG9seWxpbmUgcG9pbnRzPVxcXCIxMiAxNiAxNiAxMiAxMiA4XFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCI4XFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCIxNlxcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+XCIsXCJhcnJvdy1yaWdodFwiOlwiPGxpbmUgeDE9XFxcIjVcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjE5XFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCIxMiA1IDE5IDEyIDEyIDE5XFxcIj48L3BvbHlsaW5lPlwiLFwiYXJyb3ctdXAtY2lyY2xlXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxMFxcXCI+PC9jaXJjbGU+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTYgMTIgMTIgOCA4IDEyXFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjE2XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCI4XFxcIj48L2xpbmU+XCIsXCJhcnJvdy11cC1sZWZ0XCI6XCI8bGluZSB4MT1cXFwiMTdcXFwiIHkxPVxcXCIxN1xcXCIgeDI9XFxcIjdcXFwiIHkyPVxcXCI3XFxcIj48L2xpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiNyAxNyA3IDcgMTcgN1xcXCI+PC9wb2x5bGluZT5cIixcImFycm93LXVwLXJpZ2h0XCI6XCI8bGluZSB4MT1cXFwiN1xcXCIgeTE9XFxcIjE3XFxcIiB4Mj1cXFwiMTdcXFwiIHkyPVxcXCI3XFxcIj48L2xpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiNyA3IDE3IDcgMTcgMTdcXFwiPjwvcG9seWxpbmU+XCIsXCJhcnJvdy11cFwiOlwiPGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMTlcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjVcXFwiPjwvbGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCI1IDEyIDEyIDUgMTkgMTJcXFwiPjwvcG9seWxpbmU+XCIsXCJhdC1zaWduXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCI0XFxcIj48L2NpcmNsZT48cGF0aCBkPVxcXCJNMTYgOHY1YTMgMyAwIDAgMCA2IDB2LTFhMTAgMTAgMCAxIDAtMy45MiA3Ljk0XFxcIj48L3BhdGg+XCIsXCJhd2FyZFwiOlwiPGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCI4XFxcIiByPVxcXCI3XFxcIj48L2NpcmNsZT48cG9seWxpbmUgcG9pbnRzPVxcXCI4LjIxIDEzLjg5IDcgMjMgMTIgMjAgMTcgMjMgMTUuNzkgMTMuODhcXFwiPjwvcG9seWxpbmU+XCIsXCJiYXItY2hhcnQtMlwiOlwiPGxpbmUgeDE9XFxcIjE4XFxcIiB5MT1cXFwiMjBcXFwiIHgyPVxcXCIxOFxcXCIgeTI9XFxcIjEwXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMjBcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjRcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiNlxcXCIgeTE9XFxcIjIwXFxcIiB4Mj1cXFwiNlxcXCIgeTI9XFxcIjE0XFxcIj48L2xpbmU+XCIsXCJiYXItY2hhcnRcIjpcIjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjIwXFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIxMFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxOFxcXCIgeTE9XFxcIjIwXFxcIiB4Mj1cXFwiMThcXFwiIHkyPVxcXCI0XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjZcXFwiIHkxPVxcXCIyMFxcXCIgeDI9XFxcIjZcXFwiIHkyPVxcXCIxNlxcXCI+PC9saW5lPlwiLFwiYmF0dGVyeS1jaGFyZ2luZ1wiOlwiPHBhdGggZD1cXFwiTTUgMThIM2EyIDIgMCAwIDEtMi0yVjhhMiAyIDAgMCAxIDItMmgzLjE5TTE1IDZoMmEyIDIgMCAwIDEgMiAydjhhMiAyIDAgMCAxLTIgMmgtMy4xOVxcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCIyM1xcXCIgeTE9XFxcIjEzXFxcIiB4Mj1cXFwiMjNcXFwiIHkyPVxcXCIxMVxcXCI+PC9saW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjExIDYgNyAxMiAxMyAxMiA5IDE4XFxcIj48L3BvbHlsaW5lPlwiLFwiYmF0dGVyeVwiOlwiPHJlY3QgeD1cXFwiMVxcXCIgeT1cXFwiNlxcXCIgd2lkdGg9XFxcIjE4XFxcIiBoZWlnaHQ9XFxcIjEyXFxcIiByeD1cXFwiMlxcXCIgcnk9XFxcIjJcXFwiPjwvcmVjdD48bGluZSB4MT1cXFwiMjNcXFwiIHkxPVxcXCIxM1xcXCIgeDI9XFxcIjIzXFxcIiB5Mj1cXFwiMTFcXFwiPjwvbGluZT5cIixcImJlbGwtb2ZmXCI6XCI8cGF0aCBkPVxcXCJNOC41NiAyLjlBNyA3IDAgMCAxIDE5IDl2NG0tMiA0SDJhMyAzIDAgMCAwIDMtM1Y5YTcgNyAwIDAgMSAuNzgtMy4yMk0xMy43MyAyMWEyIDIgMCAwIDEtMy40NiAwXFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjFcXFwiIHkxPVxcXCIxXFxcIiB4Mj1cXFwiMjNcXFwiIHkyPVxcXCIyM1xcXCI+PC9saW5lPlwiLFwiYmVsbFwiOlwiPHBhdGggZD1cXFwiTTIyIDE3SDJhMyAzIDAgMCAwIDMtM1Y5YTcgNyAwIDAgMSAxNCAwdjVhMyAzIDAgMCAwIDMgM3ptLTguMjcgNGEyIDIgMCAwIDEtMy40NiAwXFxcIj48L3BhdGg+XCIsXCJibHVldG9vdGhcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjYuNSA2LjUgMTcuNSAxNy41IDEyIDIzIDEyIDEgMTcuNSA2LjUgNi41IDE3LjVcXFwiPjwvcG9seWxpbmU+XCIsXCJib2xkXCI6XCI8cGF0aCBkPVxcXCJNNiA0aDhhNCA0IDAgMCAxIDQgNCA0IDQgMCAwIDEtNCA0SDZ6XFxcIj48L3BhdGg+PHBhdGggZD1cXFwiTTYgMTJoOWE0IDQgMCAwIDEgNCA0IDQgNCAwIDAgMS00IDRINnpcXFwiPjwvcGF0aD5cIixcImJvb2stb3BlblwiOlwiPHBhdGggZD1cXFwiTTIgM2g2YTQgNCAwIDAgMSA0IDR2MTRhMyAzIDAgMCAwLTMtM0gyelxcXCI+PC9wYXRoPjxwYXRoIGQ9XFxcIk0yMiAzaC02YTQgNCAwIDAgMC00IDR2MTRhMyAzIDAgMCAxIDMtM2g3elxcXCI+PC9wYXRoPlwiLFwiYm9va1wiOlwiPHBhdGggZD1cXFwiTTQgMTkuNUEyLjUgMi41IDAgMCAxIDYuNSAxN0gyMFxcXCI+PC9wYXRoPjxwYXRoIGQ9XFxcIk02LjUgMkgyMHYyMEg2LjVBMi41IDIuNSAwIDAgMSA0IDE5LjV2LTE1QTIuNSAyLjUgMCAwIDEgNi41IDJ6XFxcIj48L3BhdGg+XCIsXCJib29rbWFya1wiOlwiPHBhdGggZD1cXFwiTTE5IDIxbC03LTUtNyA1VjVhMiAyIDAgMCAxIDItMmgxMGEyIDIgMCAwIDEgMiAyelxcXCI+PC9wYXRoPlwiLFwiYm94XCI6XCI8cGF0aCBkPVxcXCJNMTIuODkgMS40NWw4IDRBMiAyIDAgMCAxIDIyIDcuMjR2OS41M2EyIDIgMCAwIDEtMS4xMSAxLjc5bC04IDRhMiAyIDAgMCAxLTEuNzkgMGwtOC00YTIgMiAwIDAgMS0xLjEtMS44VjcuMjRhMiAyIDAgMCAxIDEuMTEtMS43OWw4LTRhMiAyIDAgMCAxIDEuNzggMHpcXFwiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPVxcXCIyLjMyIDYuMTYgMTIgMTEgMjEuNjggNi4xNlxcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIyMi43NlxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTFcXFwiPjwvbGluZT5cIixcImJyaWVmY2FzZVwiOlwiPHJlY3QgeD1cXFwiMlxcXCIgeT1cXFwiN1xcXCIgd2lkdGg9XFxcIjIwXFxcIiBoZWlnaHQ9XFxcIjE0XFxcIiByeD1cXFwiMlxcXCIgcnk9XFxcIjJcXFwiPjwvcmVjdD48cGF0aCBkPVxcXCJNMTYgMjFWNWEyIDIgMCAwIDAtMi0yaC00YTIgMiAwIDAgMC0yIDJ2MTZcXFwiPjwvcGF0aD5cIixcImNhbGVuZGFyXCI6XCI8cmVjdCB4PVxcXCIzXFxcIiB5PVxcXCI0XFxcIiB3aWR0aD1cXFwiMThcXFwiIGhlaWdodD1cXFwiMThcXFwiIHJ4PVxcXCIyXFxcIiByeT1cXFwiMlxcXCI+PC9yZWN0PjxsaW5lIHgxPVxcXCIxNlxcXCIgeTE9XFxcIjJcXFwiIHgyPVxcXCIxNlxcXCIgeTI9XFxcIjZcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiOFxcXCIgeTE9XFxcIjJcXFwiIHgyPVxcXCI4XFxcIiB5Mj1cXFwiNlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIzXFxcIiB5MT1cXFwiMTBcXFwiIHgyPVxcXCIyMVxcXCIgeTI9XFxcIjEwXFxcIj48L2xpbmU+XCIsXCJjYW1lcmEtb2ZmXCI6XCI8bGluZSB4MT1cXFwiMVxcXCIgeTE9XFxcIjFcXFwiIHgyPVxcXCIyM1xcXCIgeTI9XFxcIjIzXFxcIj48L2xpbmU+PHBhdGggZD1cXFwiTTIxIDIxSDNhMiAyIDAgMCAxLTItMlY4YTIgMiAwIDAgMSAyLTJoM20zLTNoNmwyIDNoNGEyIDIgMCAwIDEgMiAydjkuMzRtLTcuNzItMi4wNmE0IDQgMCAxIDEtNS41Ni01LjU2XFxcIj48L3BhdGg+XCIsXCJjYW1lcmFcIjpcIjxwYXRoIGQ9XFxcIk0yMyAxOWEyIDIgMCAwIDEtMiAySDNhMiAyIDAgMCAxLTItMlY4YTIgMiAwIDAgMSAyLTJoNGwyLTNoNmwyIDNoNGEyIDIgMCAwIDEgMiAyelxcXCI+PC9wYXRoPjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTNcXFwiIHI9XFxcIjRcXFwiPjwvY2lyY2xlPlwiLFwiY2FzdFwiOlwiPHBhdGggZD1cXFwiTTIgMTYuMUE1IDUgMCAwIDEgNS45IDIwTTIgMTIuMDVBOSA5IDAgMCAxIDkuOTUgMjBNMiA4VjZhMiAyIDAgMCAxIDItMmgxNmEyIDIgMCAwIDEgMiAydjEyYTIgMiAwIDAgMS0yIDJoLTZcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiMlxcXCIgeTE9XFxcIjIwXFxcIiB4Mj1cXFwiMlxcXCIgeTI9XFxcIjIwXFxcIj48L2xpbmU+XCIsXCJjaGVjay1jaXJjbGVcIjpcIjxwYXRoIGQ9XFxcIk0yMiAxMS4wOFYxMmExMCAxMCAwIDEgMS01LjkzLTkuMTRcXFwiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPVxcXCIyMiA0IDEyIDE0LjAxIDkgMTEuMDFcXFwiPjwvcG9seWxpbmU+XCIsXCJjaGVjay1zcXVhcmVcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjkgMTEgMTIgMTQgMjIgNFxcXCI+PC9wb2x5bGluZT48cGF0aCBkPVxcXCJNMjEgMTJ2N2EyIDIgMCAwIDEtMiAySDVhMiAyIDAgMCAxLTItMlY1YTIgMiAwIDAgMSAyLTJoMTFcXFwiPjwvcGF0aD5cIixcImNoZWNrXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIyMCA2IDkgMTcgNCAxMlxcXCI+PC9wb2x5bGluZT5cIixcImNoZXZyb24tZG93blwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiNiA5IDEyIDE1IDE4IDlcXFwiPjwvcG9seWxpbmU+XCIsXCJjaGV2cm9uLWxlZnRcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjE1IDE4IDkgMTIgMTUgNlxcXCI+PC9wb2x5bGluZT5cIixcImNoZXZyb24tcmlnaHRcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjkgMTggMTUgMTIgOSA2XFxcIj48L3BvbHlsaW5lPlwiLFwiY2hldnJvbi11cFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMTggMTUgMTIgOSA2IDE1XFxcIj48L3BvbHlsaW5lPlwiLFwiY2hldnJvbnMtZG93blwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiNyAxMyAxMiAxOCAxNyAxM1xcXCI+PC9wb2x5bGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCI3IDYgMTIgMTEgMTcgNlxcXCI+PC9wb2x5bGluZT5cIixcImNoZXZyb25zLWxlZnRcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjExIDE3IDYgMTIgMTEgN1xcXCI+PC9wb2x5bGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCIxOCAxNyAxMyAxMiAxOCA3XFxcIj48L3BvbHlsaW5lPlwiLFwiY2hldnJvbnMtcmlnaHRcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjEzIDE3IDE4IDEyIDEzIDdcXFwiPjwvcG9seWxpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiNiAxNyAxMSAxMiA2IDdcXFwiPjwvcG9seWxpbmU+XCIsXCJjaGV2cm9ucy11cFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMTcgMTEgMTIgNiA3IDExXFxcIj48L3BvbHlsaW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjE3IDE4IDEyIDEzIDcgMThcXFwiPjwvcG9seWxpbmU+XCIsXCJjaHJvbWVcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjEwXFxcIj48L2NpcmNsZT48Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCI0XFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiMjEuMTdcXFwiIHkxPVxcXCI4XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCI4XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjMuOTVcXFwiIHkxPVxcXCI2LjA2XFxcIiB4Mj1cXFwiOC41NFxcXCIgeTI9XFxcIjE0XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjEwLjg4XFxcIiB5MT1cXFwiMjEuOTRcXFwiIHgyPVxcXCIxNS40NlxcXCIgeTI9XFxcIjE0XFxcIj48L2xpbmU+XCIsXCJjaXJjbGVcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjEwXFxcIj48L2NpcmNsZT5cIixcImNsaXBib2FyZFwiOlwiPHBhdGggZD1cXFwiTTE2IDRoMmEyIDIgMCAwIDEgMiAydjE0YTIgMiAwIDAgMS0yIDJINmEyIDIgMCAwIDEtMi0yVjZhMiAyIDAgMCAxIDItMmgyXFxcIj48L3BhdGg+PHJlY3QgeD1cXFwiOFxcXCIgeT1cXFwiMlxcXCIgd2lkdGg9XFxcIjhcXFwiIGhlaWdodD1cXFwiNFxcXCIgcng9XFxcIjFcXFwiIHJ5PVxcXCIxXFxcIj48L3JlY3Q+XCIsXCJjbG9ja1wiOlwiPGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiMTBcXFwiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9XFxcIjEyIDYgMTIgMTIgMTYgMTRcXFwiPjwvcG9seWxpbmU+XCIsXCJjbG91ZC1kcml6emxlXCI6XCI8bGluZSB4MT1cXFwiOFxcXCIgeTE9XFxcIjE5XFxcIiB4Mj1cXFwiOFxcXCIgeTI9XFxcIjIxXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjhcXFwiIHkxPVxcXCIxM1xcXCIgeDI9XFxcIjhcXFwiIHkyPVxcXCIxNVxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNlxcXCIgeTE9XFxcIjE5XFxcIiB4Mj1cXFwiMTZcXFwiIHkyPVxcXCIyMVxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNlxcXCIgeTE9XFxcIjEzXFxcIiB4Mj1cXFwiMTZcXFwiIHkyPVxcXCIxNVxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjIxXFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIyM1xcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjE1XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIxN1xcXCI+PC9saW5lPjxwYXRoIGQ9XFxcIk0yMCAxNi41OEE1IDUgMCAwIDAgMTggN2gtMS4yNkE4IDggMCAxIDAgNCAxNS4yNVxcXCI+PC9wYXRoPlwiLFwiY2xvdWQtbGlnaHRuaW5nXCI6XCI8cGF0aCBkPVxcXCJNMTkgMTYuOUE1IDUgMCAwIDAgMTggN2gtMS4yNmE4IDggMCAxIDAtMTEuNjIgOVxcXCI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9XFxcIjEzIDExIDkgMTcgMTUgMTcgMTEgMjNcXFwiPjwvcG9seWxpbmU+XCIsXCJjbG91ZC1vZmZcIjpcIjxwYXRoIGQ9XFxcIk0yMi42MSAxNi45NUE1IDUgMCAwIDAgMTggMTBoLTEuMjZhOCA4IDAgMCAwLTcuMDUtNk01IDVhOCA4IDAgMCAwIDQgMTVoOWE1IDUgMCAwIDAgMS43LS4zXFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjFcXFwiIHkxPVxcXCIxXFxcIiB4Mj1cXFwiMjNcXFwiIHkyPVxcXCIyM1xcXCI+PC9saW5lPlwiLFwiY2xvdWQtcmFpblwiOlwiPGxpbmUgeDE9XFxcIjE2XFxcIiB5MT1cXFwiMTNcXFwiIHgyPVxcXCIxNlxcXCIgeTI9XFxcIjIxXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjhcXFwiIHkxPVxcXCIxM1xcXCIgeDI9XFxcIjhcXFwiIHkyPVxcXCIyMVxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjE1XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIyM1xcXCI+PC9saW5lPjxwYXRoIGQ9XFxcIk0yMCAxNi41OEE1IDUgMCAwIDAgMTggN2gtMS4yNkE4IDggMCAxIDAgNCAxNS4yNVxcXCI+PC9wYXRoPlwiLFwiY2xvdWQtc25vd1wiOlwiPHBhdGggZD1cXFwiTTIwIDE3LjU4QTUgNSAwIDAgMCAxOCA4aC0xLjI2QTggOCAwIDEgMCA0IDE2LjI1XFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjhcXFwiIHkxPVxcXCIxNlxcXCIgeDI9XFxcIjhcXFwiIHkyPVxcXCIxNlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI4XFxcIiB5MT1cXFwiMjBcXFwiIHgyPVxcXCI4XFxcIiB5Mj1cXFwiMjBcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIxOFxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMThcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIyMlxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMjJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTZcXFwiIHkxPVxcXCIxNlxcXCIgeDI9XFxcIjE2XFxcIiB5Mj1cXFwiMTZcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTZcXFwiIHkxPVxcXCIyMFxcXCIgeDI9XFxcIjE2XFxcIiB5Mj1cXFwiMjBcXFwiPjwvbGluZT5cIixcImNsb3VkXCI6XCI8cGF0aCBkPVxcXCJNMTggMTBoLTEuMjZBOCA4IDAgMSAwIDkgMjBoOWE1IDUgMCAwIDAgMC0xMHpcXFwiPjwvcGF0aD5cIixcImNvZGVcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjE2IDE4IDIyIDEyIDE2IDZcXFwiPjwvcG9seWxpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiOCA2IDIgMTIgOCAxOFxcXCI+PC9wb2x5bGluZT5cIixcImNvZGVwZW5cIjpcIjxwb2x5Z29uIHBvaW50cz1cXFwiMTIgMiAyMiA4LjUgMjIgMTUuNSAxMiAyMiAyIDE1LjUgMiA4LjUgMTIgMlxcXCI+PC9wb2x5Z29uPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjIyXFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIxNS41XFxcIj48L2xpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiMjIgOC41IDEyIDE1LjUgMiA4LjVcXFwiPjwvcG9seWxpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiMiAxNS41IDEyIDguNSAyMiAxNS41XFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjJcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjguNVxcXCI+PC9saW5lPlwiLFwiY29tbWFuZFwiOlwiPHBhdGggZD1cXFwiTTE4IDNhMyAzIDAgMCAwLTMgM3YxMmEzIDMgMCAwIDAgMyAzIDMgMyAwIDAgMCAzLTMgMyAzIDAgMCAwLTMtM0g2YTMgMyAwIDAgMC0zIDMgMyAzIDAgMCAwIDMgMyAzIDMgMCAwIDAgMy0zVjZhMyAzIDAgMCAwLTMtMyAzIDMgMCAwIDAtMyAzIDMgMyAwIDAgMCAzIDNoMTJhMyAzIDAgMCAwIDMtMyAzIDMgMCAwIDAtMy0zelxcXCI+PC9wYXRoPlwiLFwiY29tcGFzc1wiOlwiPGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiMTBcXFwiPjwvY2lyY2xlPjxwb2x5Z29uIHBvaW50cz1cXFwiMTYuMjQgNy43NiAxNC4xMiAxNC4xMiA3Ljc2IDE2LjI0IDkuODggOS44OCAxNi4yNCA3Ljc2XFxcIj48L3BvbHlnb24+XCIsXCJjb3B5XCI6XCI8cmVjdCB4PVxcXCI5XFxcIiB5PVxcXCI5XFxcIiB3aWR0aD1cXFwiMTNcXFwiIGhlaWdodD1cXFwiMTNcXFwiIHJ4PVxcXCIyXFxcIiByeT1cXFwiMlxcXCI+PC9yZWN0PjxwYXRoIGQ9XFxcIk01IDE1SDRhMiAyIDAgMCAxLTItMlY0YTIgMiAwIDAgMSAyLTJoOWEyIDIgMCAwIDEgMiAydjFcXFwiPjwvcGF0aD5cIixcImNvcm5lci1kb3duLWxlZnRcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjkgMTAgNCAxNSA5IDIwXFxcIj48L3BvbHlsaW5lPjxwYXRoIGQ9XFxcIk0yMCA0djdhNCA0IDAgMCAxLTQgNEg0XFxcIj48L3BhdGg+XCIsXCJjb3JuZXItZG93bi1yaWdodFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMTUgMTAgMjAgMTUgMTUgMjBcXFwiPjwvcG9seWxpbmU+PHBhdGggZD1cXFwiTTQgNHY3YTQgNCAwIDAgMCA0IDRoMTJcXFwiPjwvcGF0aD5cIixcImNvcm5lci1sZWZ0LWRvd25cIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjE0IDE1IDkgMjAgNCAxNVxcXCI+PC9wb2x5bGluZT48cGF0aCBkPVxcXCJNMjAgNGgtN2E0IDQgMCAwIDAtNCA0djEyXFxcIj48L3BhdGg+XCIsXCJjb3JuZXItbGVmdC11cFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMTQgOSA5IDQgNCA5XFxcIj48L3BvbHlsaW5lPjxwYXRoIGQ9XFxcIk0yMCAyMGgtN2E0IDQgMCAwIDEtNC00VjRcXFwiPjwvcGF0aD5cIixcImNvcm5lci1yaWdodC1kb3duXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIxMCAxNSAxNSAyMCAyMCAxNVxcXCI+PC9wb2x5bGluZT48cGF0aCBkPVxcXCJNNCA0aDdhNCA0IDAgMCAxIDQgNHYxMlxcXCI+PC9wYXRoPlwiLFwiY29ybmVyLXJpZ2h0LXVwXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIxMCA5IDE1IDQgMjAgOVxcXCI+PC9wb2x5bGluZT48cGF0aCBkPVxcXCJNNCAyMGg3YTQgNCAwIDAgMCA0LTRWNFxcXCI+PC9wYXRoPlwiLFwiY29ybmVyLXVwLWxlZnRcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjkgMTQgNCA5IDkgNFxcXCI+PC9wb2x5bGluZT48cGF0aCBkPVxcXCJNMjAgMjB2LTdhNCA0IDAgMCAwLTQtNEg0XFxcIj48L3BhdGg+XCIsXCJjb3JuZXItdXAtcmlnaHRcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjE1IDE0IDIwIDkgMTUgNFxcXCI+PC9wb2x5bGluZT48cGF0aCBkPVxcXCJNNCAyMHYtN2E0IDQgMCAwIDEgNC00aDEyXFxcIj48L3BhdGg+XCIsXCJjcHVcIjpcIjxyZWN0IHg9XFxcIjRcXFwiIHk9XFxcIjRcXFwiIHdpZHRoPVxcXCIxNlxcXCIgaGVpZ2h0PVxcXCIxNlxcXCIgcng9XFxcIjJcXFwiIHJ5PVxcXCIyXFxcIj48L3JlY3Q+PHJlY3QgeD1cXFwiOVxcXCIgeT1cXFwiOVxcXCIgd2lkdGg9XFxcIjZcXFwiIGhlaWdodD1cXFwiNlxcXCI+PC9yZWN0PjxsaW5lIHgxPVxcXCI5XFxcIiB5MT1cXFwiMVxcXCIgeDI9XFxcIjlcXFwiIHkyPVxcXCI0XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE1XFxcIiB5MT1cXFwiMVxcXCIgeDI9XFxcIjE1XFxcIiB5Mj1cXFwiNFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI5XFxcIiB5MT1cXFwiMjBcXFwiIHgyPVxcXCI5XFxcIiB5Mj1cXFwiMjNcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTVcXFwiIHkxPVxcXCIyMFxcXCIgeDI9XFxcIjE1XFxcIiB5Mj1cXFwiMjNcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMjBcXFwiIHkxPVxcXCI5XFxcIiB4Mj1cXFwiMjNcXFwiIHkyPVxcXCI5XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjIwXFxcIiB5MT1cXFwiMTRcXFwiIHgyPVxcXCIyM1xcXCIgeTI9XFxcIjE0XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjFcXFwiIHkxPVxcXCI5XFxcIiB4Mj1cXFwiNFxcXCIgeTI9XFxcIjlcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMVxcXCIgeTE9XFxcIjE0XFxcIiB4Mj1cXFwiNFxcXCIgeTI9XFxcIjE0XFxcIj48L2xpbmU+XCIsXCJjcmVkaXQtY2FyZFwiOlwiPHJlY3QgeD1cXFwiMVxcXCIgeT1cXFwiNFxcXCIgd2lkdGg9XFxcIjIyXFxcIiBoZWlnaHQ9XFxcIjE2XFxcIiByeD1cXFwiMlxcXCIgcnk9XFxcIjJcXFwiPjwvcmVjdD48bGluZSB4MT1cXFwiMVxcXCIgeTE9XFxcIjEwXFxcIiB4Mj1cXFwiMjNcXFwiIHkyPVxcXCIxMFxcXCI+PC9saW5lPlwiLFwiY3JvcFwiOlwiPHBhdGggZD1cXFwiTTYuMTMgMUw2IDE2YTIgMiAwIDAgMCAyIDJoMTVcXFwiPjwvcGF0aD48cGF0aCBkPVxcXCJNMSA2LjEzTDE2IDZhMiAyIDAgMCAxIDIgMnYxNVxcXCI+PC9wYXRoPlwiLFwiY3Jvc3NoYWlyXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxMFxcXCI+PC9jaXJjbGU+PGxpbmUgeDE9XFxcIjIyXFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCIxOFxcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjZcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjJcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjZcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIyMlxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMThcXFwiPjwvbGluZT5cIixcImRhdGFiYXNlXCI6XCI8ZWxsaXBzZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCI1XFxcIiByeD1cXFwiOVxcXCIgcnk9XFxcIjNcXFwiPjwvZWxsaXBzZT48cGF0aCBkPVxcXCJNMjEgMTJjMCAxLjY2LTQgMy05IDNzLTktMS4zNC05LTNcXFwiPjwvcGF0aD48cGF0aCBkPVxcXCJNMyA1djE0YzAgMS42NiA0IDMgOSAzczktMS4zNCA5LTNWNVxcXCI+PC9wYXRoPlwiLFwiZGVsZXRlXCI6XCI8cGF0aCBkPVxcXCJNMjEgNEg4bC03IDggNyA4aDEzYTIgMiAwIDAgMCAyLTJWNmEyIDIgMCAwIDAtMi0yelxcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCIxOFxcXCIgeTE9XFxcIjlcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjE1XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiOVxcXCIgeDI9XFxcIjE4XFxcIiB5Mj1cXFwiMTVcXFwiPjwvbGluZT5cIixcImRpc2NcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjEwXFxcIj48L2NpcmNsZT48Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIzXFxcIj48L2NpcmNsZT5cIixcImRvbGxhci1zaWduXCI6XCI8bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIxXFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIyM1xcXCI+PC9saW5lPjxwYXRoIGQ9XFxcIk0xNyA1SDkuNWEzLjUgMy41IDAgMCAwIDAgN2g1YTMuNSAzLjUgMCAwIDEgMCA3SDZcXFwiPjwvcGF0aD5cIixcImRvd25sb2FkLWNsb3VkXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCI4IDE3IDEyIDIxIDE2IDE3XFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIyMVxcXCI+PC9saW5lPjxwYXRoIGQ9XFxcIk0yMC44OCAxOC4wOUE1IDUgMCAwIDAgMTggOWgtMS4yNkE4IDggMCAxIDAgMyAxNi4yOVxcXCI+PC9wYXRoPlwiLFwiZG93bmxvYWRcIjpcIjxwYXRoIGQ9XFxcIk0yMSAxNXY0YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0ydi00XFxcIj48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz1cXFwiNyAxMCAxMiAxNSAxNyAxMFxcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIxNVxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiM1xcXCI+PC9saW5lPlwiLFwiZHJvcGxldFwiOlwiPHBhdGggZD1cXFwiTTEyIDIuNjlsNS42NiA1LjY2YTggOCAwIDEgMS0xMS4zMSAwelxcXCI+PC9wYXRoPlwiLFwiZWRpdC0yXCI6XCI8cG9seWdvbiBwb2ludHM9XFxcIjE2IDMgMjEgOCA4IDIxIDMgMjEgMyAxNiAxNiAzXFxcIj48L3BvbHlnb24+XCIsXCJlZGl0LTNcIjpcIjxwb2x5Z29uIHBvaW50cz1cXFwiMTQgMiAxOCA2IDcgMTcgMyAxNyAzIDEzIDE0IDJcXFwiPjwvcG9seWdvbj48bGluZSB4MT1cXFwiM1xcXCIgeTE9XFxcIjIyXFxcIiB4Mj1cXFwiMjFcXFwiIHkyPVxcXCIyMlxcXCI+PC9saW5lPlwiLFwiZWRpdFwiOlwiPHBhdGggZD1cXFwiTTIwIDE0LjY2VjIwYTIgMiAwIDAgMS0yIDJINGEyIDIgMCAwIDEtMi0yVjZhMiAyIDAgMCAxIDItMmg1LjM0XFxcIj48L3BhdGg+PHBvbHlnb24gcG9pbnRzPVxcXCIxOCAyIDIyIDYgMTIgMTYgOCAxNiA4IDEyIDE4IDJcXFwiPjwvcG9seWdvbj5cIixcImV4dGVybmFsLWxpbmtcIjpcIjxwYXRoIGQ9XFxcIk0xOCAxM3Y2YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0yVjhhMiAyIDAgMCAxIDItMmg2XFxcIj48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTUgMyAyMSAzIDIxIDlcXFwiPjwvcG9seWxpbmU+PGxpbmUgeDE9XFxcIjEwXFxcIiB5MT1cXFwiMTRcXFwiIHgyPVxcXCIyMVxcXCIgeTI9XFxcIjNcXFwiPjwvbGluZT5cIixcImV5ZS1vZmZcIjpcIjxwYXRoIGQ9XFxcIk0xNy45NCAxNy45NEExMC4wNyAxMC4wNyAwIDAgMSAxMiAyMGMtNyAwLTExLTgtMTEtOGExOC40NSAxOC40NSAwIDAgMSA1LjA2LTUuOTRNOS45IDQuMjRBOS4xMiA5LjEyIDAgMCAxIDEyIDRjNyAwIDExIDggMTEgOGExOC41IDE4LjUgMCAwIDEtMi4xNiAzLjE5bS02LjcyLTEuMDdhMyAzIDAgMSAxLTQuMjQtNC4yNFxcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCIxXFxcIiB5MT1cXFwiMVxcXCIgeDI9XFxcIjIzXFxcIiB5Mj1cXFwiMjNcXFwiPjwvbGluZT5cIixcImV5ZVwiOlwiPHBhdGggZD1cXFwiTTEgMTJzNC04IDExLTggMTEgOCAxMSA4LTQgOC0xMSA4LTExLTgtMTEtOHpcXFwiPjwvcGF0aD48Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIzXFxcIj48L2NpcmNsZT5cIixcImZhY2Vib29rXCI6XCI8cGF0aCBkPVxcXCJNMTggMmgtM2E1IDUgMCAwIDAtNSA1djNIN3Y0aDN2OGg0di04aDNsMS00aC00VjdhMSAxIDAgMCAxIDEtMWgzelxcXCI+PC9wYXRoPlwiLFwiZmFzdC1mb3J3YXJkXCI6XCI8cG9seWdvbiBwb2ludHM9XFxcIjEzIDE5IDIyIDEyIDEzIDUgMTMgMTlcXFwiPjwvcG9seWdvbj48cG9seWdvbiBwb2ludHM9XFxcIjIgMTkgMTEgMTIgMiA1IDIgMTlcXFwiPjwvcG9seWdvbj5cIixcImZlYXRoZXJcIjpcIjxwYXRoIGQ9XFxcIk0yMC4yNCAxMi4yNGE2IDYgMCAwIDAtOC40OS04LjQ5TDUgMTAuNVYxOWg4LjV6XFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjE2XFxcIiB5MT1cXFwiOFxcXCIgeDI9XFxcIjJcXFwiIHkyPVxcXCIyMlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxN1xcXCIgeTE9XFxcIjE1XFxcIiB4Mj1cXFwiOVxcXCIgeTI9XFxcIjE1XFxcIj48L2xpbmU+XCIsXCJmaWxlLW1pbnVzXCI6XCI8cGF0aCBkPVxcXCJNMTQgMkg2YTIgMiAwIDAgMC0yIDJ2MTZhMiAyIDAgMCAwIDIgMmgxMmEyIDIgMCAwIDAgMi0yVjh6XFxcIj48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTQgMiAxNCA4IDIwIDhcXFwiPjwvcG9seWxpbmU+PGxpbmUgeDE9XFxcIjlcXFwiIHkxPVxcXCIxNVxcXCIgeDI9XFxcIjE1XFxcIiB5Mj1cXFwiMTVcXFwiPjwvbGluZT5cIixcImZpbGUtcGx1c1wiOlwiPHBhdGggZD1cXFwiTTE0IDJINmEyIDIgMCAwIDAtMiAydjE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY4elxcXCI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9XFxcIjE0IDIgMTQgOCAyMCA4XFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjE4XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI5XFxcIiB5MT1cXFwiMTVcXFwiIHgyPVxcXCIxNVxcXCIgeTI9XFxcIjE1XFxcIj48L2xpbmU+XCIsXCJmaWxlLXRleHRcIjpcIjxwYXRoIGQ9XFxcIk0xNCAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWOHpcXFwiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPVxcXCIxNCAyIDE0IDggMjAgOFxcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMTZcXFwiIHkxPVxcXCIxM1xcXCIgeDI9XFxcIjhcXFwiIHkyPVxcXCIxM1xcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNlxcXCIgeTE9XFxcIjE3XFxcIiB4Mj1cXFwiOFxcXCIgeTI9XFxcIjE3XFxcIj48L2xpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTAgOSA5IDkgOCA5XFxcIj48L3BvbHlsaW5lPlwiLFwiZmlsZVwiOlwiPHBhdGggZD1cXFwiTTEzIDJINmEyIDIgMCAwIDAtMiAydjE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY5elxcXCI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9XFxcIjEzIDIgMTMgOSAyMCA5XFxcIj48L3BvbHlsaW5lPlwiLFwiZmlsbVwiOlwiPHJlY3QgeD1cXFwiMlxcXCIgeT1cXFwiMlxcXCIgd2lkdGg9XFxcIjIwXFxcIiBoZWlnaHQ9XFxcIjIwXFxcIiByeD1cXFwiMi4xOFxcXCIgcnk9XFxcIjIuMThcXFwiPjwvcmVjdD48bGluZSB4MT1cXFwiN1xcXCIgeTE9XFxcIjJcXFwiIHgyPVxcXCI3XFxcIiB5Mj1cXFwiMjJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTdcXFwiIHkxPVxcXCIyXFxcIiB4Mj1cXFwiMTdcXFwiIHkyPVxcXCIyMlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIyXFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCIyMlxcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjJcXFwiIHkxPVxcXCI3XFxcIiB4Mj1cXFwiN1xcXCIgeTI9XFxcIjdcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMlxcXCIgeTE9XFxcIjE3XFxcIiB4Mj1cXFwiN1xcXCIgeTI9XFxcIjE3XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE3XFxcIiB5MT1cXFwiMTdcXFwiIHgyPVxcXCIyMlxcXCIgeTI9XFxcIjE3XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE3XFxcIiB5MT1cXFwiN1xcXCIgeDI9XFxcIjIyXFxcIiB5Mj1cXFwiN1xcXCI+PC9saW5lPlwiLFwiZmlsdGVyXCI6XCI8cG9seWdvbiBwb2ludHM9XFxcIjIyIDMgMiAzIDEwIDEyLjQ2IDEwIDE5IDE0IDIxIDE0IDEyLjQ2IDIyIDNcXFwiPjwvcG9seWdvbj5cIixcImZsYWdcIjpcIjxwYXRoIGQ9XFxcIk00IDE1czEtMSA0LTEgNSAyIDggMiA0LTEgNC0xVjNzLTEgMS00IDEtNS0yLTgtMi00IDEtNCAxelxcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCI0XFxcIiB5MT1cXFwiMjJcXFwiIHgyPVxcXCI0XFxcIiB5Mj1cXFwiMTVcXFwiPjwvbGluZT5cIixcImZvbGRlci1taW51c1wiOlwiPHBhdGggZD1cXFwiTTIyIDE5YTIgMiAwIDAgMS0yIDJINGEyIDIgMCAwIDEtMi0yVjVhMiAyIDAgMCAxIDItMmg1bDIgM2g5YTIgMiAwIDAgMSAyIDJ6XFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjlcXFwiIHkxPVxcXCIxNFxcXCIgeDI9XFxcIjE1XFxcIiB5Mj1cXFwiMTRcXFwiPjwvbGluZT5cIixcImZvbGRlci1wbHVzXCI6XCI8cGF0aCBkPVxcXCJNMjIgMTlhMiAyIDAgMCAxLTIgMkg0YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDVsMiAzaDlhMiAyIDAgMCAxIDIgMnpcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIxMVxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTdcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiOVxcXCIgeTE9XFxcIjE0XFxcIiB4Mj1cXFwiMTVcXFwiIHkyPVxcXCIxNFxcXCI+PC9saW5lPlwiLFwiZm9sZGVyXCI6XCI8cGF0aCBkPVxcXCJNMjIgMTlhMiAyIDAgMCAxLTIgMkg0YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDVsMiAzaDlhMiAyIDAgMCAxIDIgMnpcXFwiPjwvcGF0aD5cIixcImdpZnRcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjIwIDEyIDIwIDIyIDQgMjIgNCAxMlxcXCI+PC9wb2x5bGluZT48cmVjdCB4PVxcXCIyXFxcIiB5PVxcXCI3XFxcIiB3aWR0aD1cXFwiMjBcXFwiIGhlaWdodD1cXFwiNVxcXCI+PC9yZWN0PjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjIyXFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCI3XFxcIj48L2xpbmU+PHBhdGggZD1cXFwiTTEyIDdINy41YTIuNSAyLjUgMCAwIDEgMC01QzExIDIgMTIgNyAxMiA3elxcXCI+PC9wYXRoPjxwYXRoIGQ9XFxcIk0xMiA3aDQuNWEyLjUgMi41IDAgMCAwIDAtNUMxMyAyIDEyIDcgMTIgN3pcXFwiPjwvcGF0aD5cIixcImdpdC1icmFuY2hcIjpcIjxsaW5lIHgxPVxcXCI2XFxcIiB5MT1cXFwiM1xcXCIgeDI9XFxcIjZcXFwiIHkyPVxcXCIxNVxcXCI+PC9saW5lPjxjaXJjbGUgY3g9XFxcIjE4XFxcIiBjeT1cXFwiNlxcXCIgcj1cXFwiM1xcXCI+PC9jaXJjbGU+PGNpcmNsZSBjeD1cXFwiNlxcXCIgY3k9XFxcIjE4XFxcIiByPVxcXCIzXFxcIj48L2NpcmNsZT48cGF0aCBkPVxcXCJNMTggOWE5IDkgMCAwIDEtOSA5XFxcIj48L3BhdGg+XCIsXCJnaXQtY29tbWl0XCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCI0XFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiMS4wNVxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiN1xcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE3LjAxXFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCIyMi45NlxcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+XCIsXCJnaXQtbWVyZ2VcIjpcIjxjaXJjbGUgY3g9XFxcIjE4XFxcIiBjeT1cXFwiMThcXFwiIHI9XFxcIjNcXFwiPjwvY2lyY2xlPjxjaXJjbGUgY3g9XFxcIjZcXFwiIGN5PVxcXCI2XFxcIiByPVxcXCIzXFxcIj48L2NpcmNsZT48cGF0aCBkPVxcXCJNNiAyMVY5YTkgOSAwIDAgMCA5IDlcXFwiPjwvcGF0aD5cIixcImdpdC1wdWxsLXJlcXVlc3RcIjpcIjxjaXJjbGUgY3g9XFxcIjE4XFxcIiBjeT1cXFwiMThcXFwiIHI9XFxcIjNcXFwiPjwvY2lyY2xlPjxjaXJjbGUgY3g9XFxcIjZcXFwiIGN5PVxcXCI2XFxcIiByPVxcXCIzXFxcIj48L2NpcmNsZT48cGF0aCBkPVxcXCJNMTMgNmgzYTIgMiAwIDAgMSAyIDJ2N1xcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCI2XFxcIiB5MT1cXFwiOVxcXCIgeDI9XFxcIjZcXFwiIHkyPVxcXCIyMVxcXCI+PC9saW5lPlwiLFwiZ2l0aHViXCI6XCI8cGF0aCBkPVxcXCJNOSAxOWMtNSAxLjUtNS0yLjUtNy0zbTE0IDZ2LTMuODdhMy4zNyAzLjM3IDAgMCAwLS45NC0yLjYxYzMuMTQtLjM1IDYuNDQtMS41NCA2LjQ0LTdBNS40NCA1LjQ0IDAgMCAwIDIwIDQuNzcgNS4wNyA1LjA3IDAgMCAwIDE5LjkxIDFTMTguNzMuNjUgMTYgMi40OGExMy4zOCAxMy4zOCAwIDAgMC03IDBDNi4yNy42NSA1LjA5IDEgNS4wOSAxQTUuMDcgNS4wNyAwIDAgMCA1IDQuNzdhNS40NCA1LjQ0IDAgMCAwLTEuNSAzLjc4YzAgNS40MiAzLjMgNi42MSA2LjQ0IDdBMy4zNyAzLjM3IDAgMCAwIDkgMTguMTNWMjJcXFwiPjwvcGF0aD5cIixcImdpdGxhYlwiOlwiPHBhdGggZD1cXFwiTTIyLjY1IDE0LjM5TDEyIDIyLjEzIDEuMzUgMTQuMzlhLjg0Ljg0IDAgMCAxLS4zLS45NGwxLjIyLTMuNzggMi40NC03LjUxQS40Mi40MiAwIDAgMSA0LjgyIDJhLjQzLjQzIDAgMCAxIC41OCAwIC40Mi40MiAwIDAgMSAuMTEuMThsMi40NCA3LjQ5aDguMWwyLjQ0LTcuNTFBLjQyLjQyIDAgMCAxIDE4LjYgMmEuNDMuNDMgMCAwIDEgLjU4IDAgLjQyLjQyIDAgMCAxIC4xMS4xOGwyLjQ0IDcuNTFMMjMgMTMuNDVhLjg0Ljg0IDAgMCAxLS4zNS45NHpcXFwiPjwvcGF0aD5cIixcImdsb2JlXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxMFxcXCI+PC9jaXJjbGU+PGxpbmUgeDE9XFxcIjJcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjIyXFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT48cGF0aCBkPVxcXCJNMTIgMmExNS4zIDE1LjMgMCAwIDEgNCAxMCAxNS4zIDE1LjMgMCAwIDEtNCAxMCAxNS4zIDE1LjMgMCAwIDEtNC0xMCAxNS4zIDE1LjMgMCAwIDEgNC0xMHpcXFwiPjwvcGF0aD5cIixcImdyaWRcIjpcIjxyZWN0IHg9XFxcIjNcXFwiIHk9XFxcIjNcXFwiIHdpZHRoPVxcXCI3XFxcIiBoZWlnaHQ9XFxcIjdcXFwiPjwvcmVjdD48cmVjdCB4PVxcXCIxNFxcXCIgeT1cXFwiM1xcXCIgd2lkdGg9XFxcIjdcXFwiIGhlaWdodD1cXFwiN1xcXCI+PC9yZWN0PjxyZWN0IHg9XFxcIjE0XFxcIiB5PVxcXCIxNFxcXCIgd2lkdGg9XFxcIjdcXFwiIGhlaWdodD1cXFwiN1xcXCI+PC9yZWN0PjxyZWN0IHg9XFxcIjNcXFwiIHk9XFxcIjE0XFxcIiB3aWR0aD1cXFwiN1xcXCIgaGVpZ2h0PVxcXCI3XFxcIj48L3JlY3Q+XCIsXCJoYXJkLWRyaXZlXCI6XCI8bGluZSB4MT1cXFwiMjJcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjJcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPjxwYXRoIGQ9XFxcIk01LjQ1IDUuMTFMMiAxMnY2YTIgMiAwIDAgMCAyIDJoMTZhMiAyIDAgMCAwIDItMnYtNmwtMy40NS02Ljg5QTIgMiAwIDAgMCAxNi43NiA0SDcuMjRhMiAyIDAgMCAwLTEuNzkgMS4xMXpcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiNlxcXCIgeTE9XFxcIjE2XFxcIiB4Mj1cXFwiNlxcXCIgeTI9XFxcIjE2XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjEwXFxcIiB5MT1cXFwiMTZcXFwiIHgyPVxcXCIxMFxcXCIgeTI9XFxcIjE2XFxcIj48L2xpbmU+XCIsXCJoYXNoXCI6XCI8bGluZSB4MT1cXFwiNFxcXCIgeTE9XFxcIjlcXFwiIHgyPVxcXCIyMFxcXCIgeTI9XFxcIjlcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiNFxcXCIgeTE9XFxcIjE1XFxcIiB4Mj1cXFwiMjBcXFwiIHkyPVxcXCIxNVxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxMFxcXCIgeTE9XFxcIjNcXFwiIHgyPVxcXCI4XFxcIiB5Mj1cXFwiMjFcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTZcXFwiIHkxPVxcXCIzXFxcIiB4Mj1cXFwiMTRcXFwiIHkyPVxcXCIyMVxcXCI+PC9saW5lPlwiLFwiaGVhZHBob25lc1wiOlwiPHBhdGggZD1cXFwiTTMgMTh2LTZhOSA5IDAgMCAxIDE4IDB2NlxcXCI+PC9wYXRoPjxwYXRoIGQ9XFxcIk0yMSAxOWEyIDIgMCAwIDEtMiAyaC0xYTIgMiAwIDAgMS0yLTJ2LTNhMiAyIDAgMCAxIDItMmgzek0zIDE5YTIgMiAwIDAgMCAyIDJoMWEyIDIgMCAwIDAgMi0ydi0zYTIgMiAwIDAgMC0yLTJIM3pcXFwiPjwvcGF0aD5cIixcImhlYXJ0XCI6XCI8cGF0aCBkPVxcXCJNMjAuODQgNC42MWE1LjUgNS41IDAgMCAwLTcuNzggMEwxMiA1LjY3bC0xLjA2LTEuMDZhNS41IDUuNSAwIDAgMC03Ljc4IDcuNzhsMS4wNiAxLjA2TDEyIDIxLjIzbDcuNzgtNy43OCAxLjA2LTEuMDZhNS41IDUuNSAwIDAgMCAwLTcuNzh6XFxcIj48L3BhdGg+XCIsXCJoZWxwLWNpcmNsZVwiOlwiPGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiMTBcXFwiPjwvY2lyY2xlPjxwYXRoIGQ9XFxcIk05LjA5IDlhMyAzIDAgMCAxIDUuODMgMWMwIDItMyAzLTMgM1xcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjE3XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIxN1xcXCI+PC9saW5lPlwiLFwiaG9tZVwiOlwiPHBhdGggZD1cXFwiTTMgOWw5LTcgOSA3djExYTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0yelxcXCI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9XFxcIjkgMjIgOSAxMiAxNSAxMiAxNSAyMlxcXCI+PC9wb2x5bGluZT5cIixcImltYWdlXCI6XCI8cmVjdCB4PVxcXCIzXFxcIiB5PVxcXCIzXFxcIiB3aWR0aD1cXFwiMThcXFwiIGhlaWdodD1cXFwiMThcXFwiIHJ4PVxcXCIyXFxcIiByeT1cXFwiMlxcXCI+PC9yZWN0PjxjaXJjbGUgY3g9XFxcIjguNVxcXCIgY3k9XFxcIjguNVxcXCIgcj1cXFwiMS41XFxcIj48L2NpcmNsZT48cG9seWxpbmUgcG9pbnRzPVxcXCIyMSAxNSAxNiAxMCA1IDIxXFxcIj48L3BvbHlsaW5lPlwiLFwiaW5ib3hcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjIyIDEyIDE2IDEyIDE0IDE1IDEwIDE1IDggMTIgMiAxMlxcXCI+PC9wb2x5bGluZT48cGF0aCBkPVxcXCJNNS40NSA1LjExTDIgMTJ2NmEyIDIgMCAwIDAgMiAyaDE2YTIgMiAwIDAgMCAyLTJ2LTZsLTMuNDUtNi44OUEyIDIgMCAwIDAgMTYuNzYgNEg3LjI0YTIgMiAwIDAgMC0xLjc5IDEuMTF6XFxcIj48L3BhdGg+XCIsXCJpbmZvXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxMFxcXCI+PC9jaXJjbGU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMTZcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiOFxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiOFxcXCI+PC9saW5lPlwiLFwiaW5zdGFncmFtXCI6XCI8cmVjdCB4PVxcXCIyXFxcIiB5PVxcXCIyXFxcIiB3aWR0aD1cXFwiMjBcXFwiIGhlaWdodD1cXFwiMjBcXFwiIHJ4PVxcXCI1XFxcIiByeT1cXFwiNVxcXCI+PC9yZWN0PjxwYXRoIGQ9XFxcIk0xNiAxMS4zN0E0IDQgMCAxIDEgMTIuNjMgOCA0IDQgMCAwIDEgMTYgMTEuMzd6XFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjE3LjVcXFwiIHkxPVxcXCI2LjVcXFwiIHgyPVxcXCIxNy41XFxcIiB5Mj1cXFwiNi41XFxcIj48L2xpbmU+XCIsXCJpdGFsaWNcIjpcIjxsaW5lIHgxPVxcXCIxOVxcXCIgeTE9XFxcIjRcXFwiIHgyPVxcXCIxMFxcXCIgeTI9XFxcIjRcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTRcXFwiIHkxPVxcXCIyMFxcXCIgeDI9XFxcIjVcXFwiIHkyPVxcXCIyMFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNVxcXCIgeTE9XFxcIjRcXFwiIHgyPVxcXCI5XFxcIiB5Mj1cXFwiMjBcXFwiPjwvbGluZT5cIixcImxheWVyc1wiOlwiPHBvbHlnb24gcG9pbnRzPVxcXCIxMiAyIDIgNyAxMiAxMiAyMiA3IDEyIDJcXFwiPjwvcG9seWdvbj48cG9seWxpbmUgcG9pbnRzPVxcXCIyIDE3IDEyIDIyIDIyIDE3XFxcIj48L3BvbHlsaW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjIgMTIgMTIgMTcgMjIgMTJcXFwiPjwvcG9seWxpbmU+XCIsXCJsYXlvdXRcIjpcIjxyZWN0IHg9XFxcIjNcXFwiIHk9XFxcIjNcXFwiIHdpZHRoPVxcXCIxOFxcXCIgaGVpZ2h0PVxcXCIxOFxcXCIgcng9XFxcIjJcXFwiIHJ5PVxcXCIyXFxcIj48L3JlY3Q+PGxpbmUgeDE9XFxcIjNcXFwiIHkxPVxcXCI5XFxcIiB4Mj1cXFwiMjFcXFwiIHkyPVxcXCI5XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjlcXFwiIHkxPVxcXCIyMVxcXCIgeDI9XFxcIjlcXFwiIHkyPVxcXCI5XFxcIj48L2xpbmU+XCIsXCJsaWZlLWJ1b3lcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjEwXFxcIj48L2NpcmNsZT48Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCI0XFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiNC45M1xcXCIgeTE9XFxcIjQuOTNcXFwiIHgyPVxcXCI5LjE3XFxcIiB5Mj1cXFwiOS4xN1xcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNC44M1xcXCIgeTE9XFxcIjE0LjgzXFxcIiB4Mj1cXFwiMTkuMDdcXFwiIHkyPVxcXCIxOS4wN1xcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNC44M1xcXCIgeTE9XFxcIjkuMTdcXFwiIHgyPVxcXCIxOS4wN1xcXCIgeTI9XFxcIjQuOTNcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTQuODNcXFwiIHkxPVxcXCI5LjE3XFxcIiB4Mj1cXFwiMTguMzZcXFwiIHkyPVxcXCI1LjY0XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjQuOTNcXFwiIHkxPVxcXCIxOS4wN1xcXCIgeDI9XFxcIjkuMTdcXFwiIHkyPVxcXCIxNC44M1xcXCI+PC9saW5lPlwiLFwibGluay0yXCI6XCI8cGF0aCBkPVxcXCJNMTUgN2gzYTUgNSAwIDAgMSA1IDUgNSA1IDAgMCAxLTUgNWgtM20tNiAwSDZhNSA1IDAgMCAxLTUtNSA1IDUgMCAwIDEgNS01aDNcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiOFxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiMTZcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPlwiLFwibGlua1wiOlwiPHBhdGggZD1cXFwiTTEwIDEzYTUgNSAwIDAgMCA3LjU0LjU0bDMtM2E1IDUgMCAwIDAtNy4wNy03LjA3bC0xLjcyIDEuNzFcXFwiPjwvcGF0aD48cGF0aCBkPVxcXCJNMTQgMTFhNSA1IDAgMCAwLTcuNTQtLjU0bC0zIDNhNSA1IDAgMCAwIDcuMDcgNy4wN2wxLjcxLTEuNzFcXFwiPjwvcGF0aD5cIixcImxpbmtlZGluXCI6XCI8cGF0aCBkPVxcXCJNMTYgOGE2IDYgMCAwIDEgNiA2djdoLTR2LTdhMiAyIDAgMCAwLTItMiAyIDIgMCAwIDAtMiAydjdoLTR2LTdhNiA2IDAgMCAxIDYtNnpcXFwiPjwvcGF0aD48cmVjdCB4PVxcXCIyXFxcIiB5PVxcXCI5XFxcIiB3aWR0aD1cXFwiNFxcXCIgaGVpZ2h0PVxcXCIxMlxcXCI+PC9yZWN0PjxjaXJjbGUgY3g9XFxcIjRcXFwiIGN5PVxcXCI0XFxcIiByPVxcXCIyXFxcIj48L2NpcmNsZT5cIixcImxpc3RcIjpcIjxsaW5lIHgxPVxcXCI4XFxcIiB5MT1cXFwiNlxcXCIgeDI9XFxcIjIxXFxcIiB5Mj1cXFwiNlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI4XFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCIyMVxcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjhcXFwiIHkxPVxcXCIxOFxcXCIgeDI9XFxcIjIxXFxcIiB5Mj1cXFwiMThcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiM1xcXCIgeTE9XFxcIjZcXFwiIHgyPVxcXCIzXFxcIiB5Mj1cXFwiNlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIzXFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCIzXFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiM1xcXCIgeTE9XFxcIjE4XFxcIiB4Mj1cXFwiM1xcXCIgeTI9XFxcIjE4XFxcIj48L2xpbmU+XCIsXCJsb2FkZXJcIjpcIjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjJcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjZcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIxOFxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMjJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiNC45M1xcXCIgeTE9XFxcIjQuOTNcXFwiIHgyPVxcXCI3Ljc2XFxcIiB5Mj1cXFwiNy43NlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNi4yNFxcXCIgeTE9XFxcIjE2LjI0XFxcIiB4Mj1cXFwiMTkuMDdcXFwiIHkyPVxcXCIxOS4wN1xcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIyXFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCI2XFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMThcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjIyXFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiNC45M1xcXCIgeTE9XFxcIjE5LjA3XFxcIiB4Mj1cXFwiNy43NlxcXCIgeTI9XFxcIjE2LjI0XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE2LjI0XFxcIiB5MT1cXFwiNy43NlxcXCIgeDI9XFxcIjE5LjA3XFxcIiB5Mj1cXFwiNC45M1xcXCI+PC9saW5lPlwiLFwibG9ja1wiOlwiPHJlY3QgeD1cXFwiM1xcXCIgeT1cXFwiMTFcXFwiIHdpZHRoPVxcXCIxOFxcXCIgaGVpZ2h0PVxcXCIxMVxcXCIgcng9XFxcIjJcXFwiIHJ5PVxcXCIyXFxcIj48L3JlY3Q+PHBhdGggZD1cXFwiTTcgMTFWN2E1IDUgMCAwIDEgMTAgMHY0XFxcIj48L3BhdGg+XCIsXCJsb2ctaW5cIjpcIjxwYXRoIGQ9XFxcIk0xNSAzaDRhMiAyIDAgMCAxIDIgMnYxNGEyIDIgMCAwIDEtMiAyaC00XFxcIj48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTAgMTcgMTUgMTIgMTAgN1xcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMTVcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjNcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPlwiLFwibG9nLW91dFwiOlwiPHBhdGggZD1cXFwiTTkgMjFINWEyIDIgMCAwIDEtMi0yVjVhMiAyIDAgMCAxIDItMmg0XFxcIj48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTYgMTcgMjEgMTIgMTYgN1xcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMjFcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjlcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPlwiLFwibWFpbFwiOlwiPHBhdGggZD1cXFwiTTQgNGgxNmMxLjEgMCAyIC45IDIgMnYxMmMwIDEuMS0uOSAyLTIgMkg0Yy0xLjEgMC0yLS45LTItMlY2YzAtMS4xLjktMiAyLTJ6XFxcIj48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz1cXFwiMjIsNiAxMiwxMyAyLDZcXFwiPjwvcG9seWxpbmU+XCIsXCJtYXAtcGluXCI6XCI8cGF0aCBkPVxcXCJNMjEgMTBjMCA3LTkgMTMtOSAxM3MtOS02LTktMTNhOSA5IDAgMCAxIDE4IDB6XFxcIj48L3BhdGg+PGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMFxcXCIgcj1cXFwiM1xcXCI+PC9jaXJjbGU+XCIsXCJtYXBcIjpcIjxwb2x5Z29uIHBvaW50cz1cXFwiMSA2IDEgMjIgOCAxOCAxNiAyMiAyMyAxOCAyMyAyIDE2IDYgOCAyIDEgNlxcXCI+PC9wb2x5Z29uPjxsaW5lIHgxPVxcXCI4XFxcIiB5MT1cXFwiMlxcXCIgeDI9XFxcIjhcXFwiIHkyPVxcXCIxOFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNlxcXCIgeTE9XFxcIjZcXFwiIHgyPVxcXCIxNlxcXCIgeTI9XFxcIjIyXFxcIj48L2xpbmU+XCIsXCJtYXhpbWl6ZS0yXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIxNSAzIDIxIDMgMjEgOVxcXCI+PC9wb2x5bGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCI5IDIxIDMgMjEgMyAxNVxcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMjFcXFwiIHkxPVxcXCIzXFxcIiB4Mj1cXFwiMTRcXFwiIHkyPVxcXCIxMFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIzXFxcIiB5MT1cXFwiMjFcXFwiIHgyPVxcXCIxMFxcXCIgeTI9XFxcIjE0XFxcIj48L2xpbmU+XCIsXCJtYXhpbWl6ZVwiOlwiPHBhdGggZD1cXFwiTTggM0g1YTIgMiAwIDAgMC0yIDJ2M20xOCAwVjVhMiAyIDAgMCAwLTItMmgtM20wIDE4aDNhMiAyIDAgMCAwIDItMnYtM00zIDE2djNhMiAyIDAgMCAwIDIgMmgzXFxcIj48L3BhdGg+XCIsXCJtZW51XCI6XCI8bGluZSB4MT1cXFwiM1xcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiMjFcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIzXFxcIiB5MT1cXFwiNlxcXCIgeDI9XFxcIjIxXFxcIiB5Mj1cXFwiNlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIzXFxcIiB5MT1cXFwiMThcXFwiIHgyPVxcXCIyMVxcXCIgeTI9XFxcIjE4XFxcIj48L2xpbmU+XCIsXCJtZXNzYWdlLWNpcmNsZVwiOlwiPHBhdGggZD1cXFwiTTIxIDExLjVhOC4zOCA4LjM4IDAgMCAxLS45IDMuOCA4LjUgOC41IDAgMCAxLTcuNiA0LjcgOC4zOCA4LjM4IDAgMCAxLTMuOC0uOUwzIDIxbDEuOS01LjdhOC4zOCA4LjM4IDAgMCAxLS45LTMuOCA4LjUgOC41IDAgMCAxIDQuNy03LjYgOC4zOCA4LjM4IDAgMCAxIDMuOC0uOWguNWE4LjQ4IDguNDggMCAwIDEgOCA4di41elxcXCI+PC9wYXRoPlwiLFwibWVzc2FnZS1zcXVhcmVcIjpcIjxwYXRoIGQ9XFxcIk0yMSAxNWEyIDIgMCAwIDEtMiAySDdsLTQgNFY1YTIgMiAwIDAgMSAyLTJoMTRhMiAyIDAgMCAxIDIgMnpcXFwiPjwvcGF0aD5cIixcIm1pYy1vZmZcIjpcIjxsaW5lIHgxPVxcXCIxXFxcIiB5MT1cXFwiMVxcXCIgeDI9XFxcIjIzXFxcIiB5Mj1cXFwiMjNcXFwiPjwvbGluZT48cGF0aCBkPVxcXCJNOSA5djNhMyAzIDAgMCAwIDUuMTIgMi4xMk0xNSA5LjM0VjRhMyAzIDAgMCAwLTUuOTQtLjZcXFwiPjwvcGF0aD48cGF0aCBkPVxcXCJNMTcgMTYuOTVBNyA3IDAgMCAxIDUgMTJ2LTJtMTQgMHYyYTcgNyAwIDAgMS0uMTEgMS4yM1xcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjE5XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIyM1xcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI4XFxcIiB5MT1cXFwiMjNcXFwiIHgyPVxcXCIxNlxcXCIgeTI9XFxcIjIzXFxcIj48L2xpbmU+XCIsXCJtaWNcIjpcIjxwYXRoIGQ9XFxcIk0xMiAxYTMgMyAwIDAgMC0zIDN2OGEzIDMgMCAwIDAgNiAwVjRhMyAzIDAgMCAwLTMtM3pcXFwiPjwvcGF0aD48cGF0aCBkPVxcXCJNMTkgMTB2MmE3IDcgMCAwIDEtMTQgMHYtMlxcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjE5XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIyM1xcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI4XFxcIiB5MT1cXFwiMjNcXFwiIHgyPVxcXCIxNlxcXCIgeTI9XFxcIjIzXFxcIj48L2xpbmU+XCIsXCJtaW5pbWl6ZS0yXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCI0IDE0IDEwIDE0IDEwIDIwXFxcIj48L3BvbHlsaW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjIwIDEwIDE0IDEwIDE0IDRcXFwiPjwvcG9seWxpbmU+PGxpbmUgeDE9XFxcIjE0XFxcIiB5MT1cXFwiMTBcXFwiIHgyPVxcXCIyMVxcXCIgeTI9XFxcIjNcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiM1xcXCIgeTE9XFxcIjIxXFxcIiB4Mj1cXFwiMTBcXFwiIHkyPVxcXCIxNFxcXCI+PC9saW5lPlwiLFwibWluaW1pemVcIjpcIjxwYXRoIGQ9XFxcIk04IDN2M2EyIDIgMCAwIDEtMiAySDNtMTggMGgtM2EyIDIgMCAwIDEtMi0yVjNtMCAxOHYtM2EyIDIgMCAwIDEgMi0yaDNNMyAxNmgzYTIgMiAwIDAgMSAyIDJ2M1xcXCI+PC9wYXRoPlwiLFwibWludXMtY2lyY2xlXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxMFxcXCI+PC9jaXJjbGU+PGxpbmUgeDE9XFxcIjhcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjE2XFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT5cIixcIm1pbnVzLXNxdWFyZVwiOlwiPHJlY3QgeD1cXFwiM1xcXCIgeT1cXFwiM1xcXCIgd2lkdGg9XFxcIjE4XFxcIiBoZWlnaHQ9XFxcIjE4XFxcIiByeD1cXFwiMlxcXCIgcnk9XFxcIjJcXFwiPjwvcmVjdD48bGluZSB4MT1cXFwiOFxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiMTZcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPlwiLFwibWludXNcIjpcIjxsaW5lIHgxPVxcXCI1XFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCIxOVxcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+XCIsXCJtb25pdG9yXCI6XCI8cmVjdCB4PVxcXCIyXFxcIiB5PVxcXCIzXFxcIiB3aWR0aD1cXFwiMjBcXFwiIGhlaWdodD1cXFwiMTRcXFwiIHJ4PVxcXCIyXFxcIiByeT1cXFwiMlxcXCI+PC9yZWN0PjxsaW5lIHgxPVxcXCI4XFxcIiB5MT1cXFwiMjFcXFwiIHgyPVxcXCIxNlxcXCIgeTI9XFxcIjIxXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMTdcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjIxXFxcIj48L2xpbmU+XCIsXCJtb29uXCI6XCI8cGF0aCBkPVxcXCJNMjEgMTIuNzlBOSA5IDAgMSAxIDExLjIxIDMgNyA3IDAgMCAwIDIxIDEyLjc5elxcXCI+PC9wYXRoPlwiLFwibW9yZS1ob3Jpem9udGFsXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxXFxcIj48L2NpcmNsZT48Y2lyY2xlIGN4PVxcXCIxOVxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxXFxcIj48L2NpcmNsZT48Y2lyY2xlIGN4PVxcXCI1XFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjFcXFwiPjwvY2lyY2xlPlwiLFwibW9yZS12ZXJ0aWNhbFwiOlwiPGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiMVxcXCI+PC9jaXJjbGU+PGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCI1XFxcIiByPVxcXCIxXFxcIj48L2NpcmNsZT48Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjE5XFxcIiByPVxcXCIxXFxcIj48L2NpcmNsZT5cIixcIm1vdmVcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjUgOSAyIDEyIDUgMTVcXFwiPjwvcG9seWxpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiOSA1IDEyIDIgMTUgNVxcXCI+PC9wb2x5bGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCIxNSAxOSAxMiAyMiA5IDE5XFxcIj48L3BvbHlsaW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjE5IDkgMjIgMTIgMTkgMTVcXFwiPjwvcG9seWxpbmU+PGxpbmUgeDE9XFxcIjJcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjIyXFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIyXFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIyMlxcXCI+PC9saW5lPlwiLFwibXVzaWNcIjpcIjxwYXRoIGQ9XFxcIk05IDE3SDVhMiAyIDAgMCAwLTIgMiAyIDIgMCAwIDAgMiAyaDJhMiAyIDAgMCAwIDItMnptMTItMmgtNGEyIDIgMCAwIDAtMiAyIDIgMiAwIDAgMCAyIDJoMmEyIDIgMCAwIDAgMi0yelxcXCI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9XFxcIjkgMTcgOSA1IDIxIDMgMjEgMTVcXFwiPjwvcG9seWxpbmU+XCIsXCJuYXZpZ2F0aW9uLTJcIjpcIjxwb2x5Z29uIHBvaW50cz1cXFwiMTIgMiAxOSAyMSAxMiAxNyA1IDIxIDEyIDJcXFwiPjwvcG9seWdvbj5cIixcIm5hdmlnYXRpb25cIjpcIjxwb2x5Z29uIHBvaW50cz1cXFwiMyAxMSAyMiAyIDEzIDIxIDExIDEzIDMgMTFcXFwiPjwvcG9seWdvbj5cIixcIm9jdGFnb25cIjpcIjxwb2x5Z29uIHBvaW50cz1cXFwiNy44NiAyIDE2LjE0IDIgMjIgNy44NiAyMiAxNi4xNCAxNi4xNCAyMiA3Ljg2IDIyIDIgMTYuMTQgMiA3Ljg2IDcuODYgMlxcXCI+PC9wb2x5Z29uPlwiLFwicGFja2FnZVwiOlwiPHBhdGggZD1cXFwiTTEyLjg5IDEuNDVsOCA0QTIgMiAwIDAgMSAyMiA3LjI0djkuNTNhMiAyIDAgMCAxLTEuMTEgMS43OWwtOCA0YTIgMiAwIDAgMS0xLjc5IDBsLTgtNGEyIDIgMCAwIDEtMS4xLTEuOFY3LjI0YTIgMiAwIDAgMSAxLjExLTEuNzlsOC00YTIgMiAwIDAgMSAxLjc4IDB6XFxcIj48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz1cXFwiMi4zMiA2LjE2IDEyIDExIDIxLjY4IDYuMTZcXFwiPjwvcG9seWxpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMjIuNzZcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjExXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjdcXFwiIHkxPVxcXCIzLjVcXFwiIHgyPVxcXCIxN1xcXCIgeTI9XFxcIjguNVxcXCI+PC9saW5lPlwiLFwicGFwZXJjbGlwXCI6XCI8cGF0aCBkPVxcXCJNMjEuNDQgMTEuMDVsLTkuMTkgOS4xOWE2IDYgMCAwIDEtOC40OS04LjQ5bDkuMTktOS4xOWE0IDQgMCAwIDEgNS42NiA1LjY2bC05LjIgOS4xOWEyIDIgMCAwIDEtMi44My0yLjgzbDguNDktOC40OFxcXCI+PC9wYXRoPlwiLFwicGF1c2UtY2lyY2xlXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxMFxcXCI+PC9jaXJjbGU+PGxpbmUgeDE9XFxcIjEwXFxcIiB5MT1cXFwiMTVcXFwiIHgyPVxcXCIxMFxcXCIgeTI9XFxcIjlcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTRcXFwiIHkxPVxcXCIxNVxcXCIgeDI9XFxcIjE0XFxcIiB5Mj1cXFwiOVxcXCI+PC9saW5lPlwiLFwicGF1c2VcIjpcIjxyZWN0IHg9XFxcIjZcXFwiIHk9XFxcIjRcXFwiIHdpZHRoPVxcXCI0XFxcIiBoZWlnaHQ9XFxcIjE2XFxcIj48L3JlY3Q+PHJlY3QgeD1cXFwiMTRcXFwiIHk9XFxcIjRcXFwiIHdpZHRoPVxcXCI0XFxcIiBoZWlnaHQ9XFxcIjE2XFxcIj48L3JlY3Q+XCIsXCJwZXJjZW50XCI6XCI8bGluZSB4MT1cXFwiMTlcXFwiIHkxPVxcXCI1XFxcIiB4Mj1cXFwiNVxcXCIgeTI9XFxcIjE5XFxcIj48L2xpbmU+PGNpcmNsZSBjeD1cXFwiNi41XFxcIiBjeT1cXFwiNi41XFxcIiByPVxcXCIyLjVcXFwiPjwvY2lyY2xlPjxjaXJjbGUgY3g9XFxcIjE3LjVcXFwiIGN5PVxcXCIxNy41XFxcIiByPVxcXCIyLjVcXFwiPjwvY2lyY2xlPlwiLFwicGhvbmUtY2FsbFwiOlwiPHBhdGggZD1cXFwiTTE1LjA1IDVBNSA1IDAgMCAxIDE5IDguOTVNMTUuMDUgMUE5IDkgMCAwIDEgMjMgOC45NG0tMSA3Ljk4djNhMiAyIDAgMCAxLTIuMTggMiAxOS43OSAxOS43OSAwIDAgMS04LjYzLTMuMDcgMTkuNSAxOS41IDAgMCAxLTYtNiAxOS43OSAxOS43OSAwIDAgMS0zLjA3LTguNjdBMiAyIDAgMCAxIDQuMTEgMmgzYTIgMiAwIDAgMSAyIDEuNzIgMTIuODQgMTIuODQgMCAwIDAgLjcgMi44MSAyIDIgMCAwIDEtLjQ1IDIuMTFMOC4wOSA5LjkxYTE2IDE2IDAgMCAwIDYgNmwxLjI3LTEuMjdhMiAyIDAgMCAxIDIuMTEtLjQ1IDEyLjg0IDEyLjg0IDAgMCAwIDIuODEuN0EyIDIgMCAwIDEgMjIgMTYuOTJ6XFxcIj48L3BhdGg+XCIsXCJwaG9uZS1mb3J3YXJkZWRcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjE5IDEgMjMgNSAxOSA5XFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCIxNVxcXCIgeTE9XFxcIjVcXFwiIHgyPVxcXCIyM1xcXCIgeTI9XFxcIjVcXFwiPjwvbGluZT48cGF0aCBkPVxcXCJNMjIgMTYuOTJ2M2EyIDIgMCAwIDEtMi4xOCAyIDE5Ljc5IDE5Ljc5IDAgMCAxLTguNjMtMy4wNyAxOS41IDE5LjUgMCAwIDEtNi02IDE5Ljc5IDE5Ljc5IDAgMCAxLTMuMDctOC42N0EyIDIgMCAwIDEgNC4xMSAyaDNhMiAyIDAgMCAxIDIgMS43MiAxMi44NCAxMi44NCAwIDAgMCAuNyAyLjgxIDIgMiAwIDAgMS0uNDUgMi4xMUw4LjA5IDkuOTFhMTYgMTYgMCAwIDAgNiA2bDEuMjctMS4yN2EyIDIgMCAwIDEgMi4xMS0uNDUgMTIuODQgMTIuODQgMCAwIDAgMi44MS43QTIgMiAwIDAgMSAyMiAxNi45MnpcXFwiPjwvcGF0aD5cIixcInBob25lLWluY29taW5nXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIxNiAyIDE2IDggMjIgOFxcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMjNcXFwiIHkxPVxcXCIxXFxcIiB4Mj1cXFwiMTZcXFwiIHkyPVxcXCI4XFxcIj48L2xpbmU+PHBhdGggZD1cXFwiTTIyIDE2LjkydjNhMiAyIDAgMCAxLTIuMTggMiAxOS43OSAxOS43OSAwIDAgMS04LjYzLTMuMDcgMTkuNSAxOS41IDAgMCAxLTYtNiAxOS43OSAxOS43OSAwIDAgMS0zLjA3LTguNjdBMiAyIDAgMCAxIDQuMTEgMmgzYTIgMiAwIDAgMSAyIDEuNzIgMTIuODQgMTIuODQgMCAwIDAgLjcgMi44MSAyIDIgMCAwIDEtLjQ1IDIuMTFMOC4wOSA5LjkxYTE2IDE2IDAgMCAwIDYgNmwxLjI3LTEuMjdhMiAyIDAgMCAxIDIuMTEtLjQ1IDEyLjg0IDEyLjg0IDAgMCAwIDIuODEuN0EyIDIgMCAwIDEgMjIgMTYuOTJ6XFxcIj48L3BhdGg+XCIsXCJwaG9uZS1taXNzZWRcIjpcIjxsaW5lIHgxPVxcXCIyM1xcXCIgeTE9XFxcIjFcXFwiIHgyPVxcXCIxN1xcXCIgeTI9XFxcIjdcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTdcXFwiIHkxPVxcXCIxXFxcIiB4Mj1cXFwiMjNcXFwiIHkyPVxcXCI3XFxcIj48L2xpbmU+PHBhdGggZD1cXFwiTTIyIDE2LjkydjNhMiAyIDAgMCAxLTIuMTggMiAxOS43OSAxOS43OSAwIDAgMS04LjYzLTMuMDcgMTkuNSAxOS41IDAgMCAxLTYtNiAxOS43OSAxOS43OSAwIDAgMS0zLjA3LTguNjdBMiAyIDAgMCAxIDQuMTEgMmgzYTIgMiAwIDAgMSAyIDEuNzIgMTIuODQgMTIuODQgMCAwIDAgLjcgMi44MSAyIDIgMCAwIDEtLjQ1IDIuMTFMOC4wOSA5LjkxYTE2IDE2IDAgMCAwIDYgNmwxLjI3LTEuMjdhMiAyIDAgMCAxIDIuMTEtLjQ1IDEyLjg0IDEyLjg0IDAgMCAwIDIuODEuN0EyIDIgMCAwIDEgMjIgMTYuOTJ6XFxcIj48L3BhdGg+XCIsXCJwaG9uZS1vZmZcIjpcIjxwYXRoIGQ9XFxcIk0xMC42OCAxMy4zMWExNiAxNiAwIDAgMCAzLjQxIDIuNmwxLjI3LTEuMjdhMiAyIDAgMCAxIDIuMTEtLjQ1IDEyLjg0IDEyLjg0IDAgMCAwIDIuODEuNyAyIDIgMCAwIDEgMS43MiAydjNhMiAyIDAgMCAxLTIuMTggMiAxOS43OSAxOS43OSAwIDAgMS04LjYzLTMuMDcgMTkuNDIgMTkuNDIgMCAwIDEtMy4zMy0yLjY3bS0yLjY3LTMuMzRhMTkuNzkgMTkuNzkgMCAwIDEtMy4wNy04LjYzQTIgMiAwIDAgMSA0LjExIDJoM2EyIDIgMCAwIDEgMiAxLjcyIDEyLjg0IDEyLjg0IDAgMCAwIC43IDIuODEgMiAyIDAgMCAxLS40NSAyLjExTDguMDkgOS45MVxcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCIyM1xcXCIgeTE9XFxcIjFcXFwiIHgyPVxcXCIxXFxcIiB5Mj1cXFwiMjNcXFwiPjwvbGluZT5cIixcInBob25lLW91dGdvaW5nXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIyMyA3IDIzIDEgMTcgMVxcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMTZcXFwiIHkxPVxcXCI4XFxcIiB4Mj1cXFwiMjNcXFwiIHkyPVxcXCIxXFxcIj48L2xpbmU+PHBhdGggZD1cXFwiTTIyIDE2LjkydjNhMiAyIDAgMCAxLTIuMTggMiAxOS43OSAxOS43OSAwIDAgMS04LjYzLTMuMDcgMTkuNSAxOS41IDAgMCAxLTYtNiAxOS43OSAxOS43OSAwIDAgMS0zLjA3LTguNjdBMiAyIDAgMCAxIDQuMTEgMmgzYTIgMiAwIDAgMSAyIDEuNzIgMTIuODQgMTIuODQgMCAwIDAgLjcgMi44MSAyIDIgMCAwIDEtLjQ1IDIuMTFMOC4wOSA5LjkxYTE2IDE2IDAgMCAwIDYgNmwxLjI3LTEuMjdhMiAyIDAgMCAxIDIuMTEtLjQ1IDEyLjg0IDEyLjg0IDAgMCAwIDIuODEuN0EyIDIgMCAwIDEgMjIgMTYuOTJ6XFxcIj48L3BhdGg+XCIsXCJwaG9uZVwiOlwiPHBhdGggZD1cXFwiTTIyIDE2LjkydjNhMiAyIDAgMCAxLTIuMTggMiAxOS43OSAxOS43OSAwIDAgMS04LjYzLTMuMDcgMTkuNSAxOS41IDAgMCAxLTYtNiAxOS43OSAxOS43OSAwIDAgMS0zLjA3LTguNjdBMiAyIDAgMCAxIDQuMTEgMmgzYTIgMiAwIDAgMSAyIDEuNzIgMTIuODQgMTIuODQgMCAwIDAgLjcgMi44MSAyIDIgMCAwIDEtLjQ1IDIuMTFMOC4wOSA5LjkxYTE2IDE2IDAgMCAwIDYgNmwxLjI3LTEuMjdhMiAyIDAgMCAxIDIuMTEtLjQ1IDEyLjg0IDEyLjg0IDAgMCAwIDIuODEuN0EyIDIgMCAwIDEgMjIgMTYuOTJ6XFxcIj48L3BhdGg+XCIsXCJwaWUtY2hhcnRcIjpcIjxwYXRoIGQ9XFxcIk0yMS4yMSAxNS44OUExMCAxMCAwIDEgMSA4IDIuODNcXFwiPjwvcGF0aD48cGF0aCBkPVxcXCJNMjIgMTJBMTAgMTAgMCAwIDAgMTIgMnYxMHpcXFwiPjwvcGF0aD5cIixcInBsYXktY2lyY2xlXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxMFxcXCI+PC9jaXJjbGU+PHBvbHlnb24gcG9pbnRzPVxcXCIxMCA4IDE2IDEyIDEwIDE2IDEwIDhcXFwiPjwvcG9seWdvbj5cIixcInBsYXlcIjpcIjxwb2x5Z29uIHBvaW50cz1cXFwiNSAzIDE5IDEyIDUgMjEgNSAzXFxcIj48L3BvbHlnb24+XCIsXCJwbHVzLWNpcmNsZVwiOlwiPGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiMTBcXFwiPjwvY2lyY2xlPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjhcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjE2XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjhcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjE2XFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT5cIixcInBsdXMtc3F1YXJlXCI6XCI8cmVjdCB4PVxcXCIzXFxcIiB5PVxcXCIzXFxcIiB3aWR0aD1cXFwiMThcXFwiIGhlaWdodD1cXFwiMThcXFwiIHJ4PVxcXCIyXFxcIiByeT1cXFwiMlxcXCI+PC9yZWN0PjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjhcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjE2XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjhcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjE2XFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT5cIixcInBsdXNcIjpcIjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjVcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjE5XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjVcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjE5XFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT5cIixcInBvY2tldFwiOlwiPHBhdGggZD1cXFwiTTQgM2gxNmEyIDIgMCAwIDEgMiAydjZhMTAgMTAgMCAwIDEtMTAgMTBBMTAgMTAgMCAwIDEgMiAxMVY1YTIgMiAwIDAgMSAyLTJ6XFxcIj48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz1cXFwiOCAxMCAxMiAxNCAxNiAxMFxcXCI+PC9wb2x5bGluZT5cIixcInBvd2VyXCI6XCI8cGF0aCBkPVxcXCJNMTguMzYgNi42NGE5IDkgMCAxIDEtMTIuNzMgMFxcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjJcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+XCIsXCJwcmludGVyXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCI2IDkgNiAyIDE4IDIgMTggOVxcXCI+PC9wb2x5bGluZT48cGF0aCBkPVxcXCJNNiAxOEg0YTIgMiAwIDAgMS0yLTJ2LTVhMiAyIDAgMCAxIDItMmgxNmEyIDIgMCAwIDEgMiAydjVhMiAyIDAgMCAxLTIgMmgtMlxcXCI+PC9wYXRoPjxyZWN0IHg9XFxcIjZcXFwiIHk9XFxcIjE0XFxcIiB3aWR0aD1cXFwiMTJcXFwiIGhlaWdodD1cXFwiOFxcXCI+PC9yZWN0PlwiLFwicmFkaW9cIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjJcXFwiPjwvY2lyY2xlPjxwYXRoIGQ9XFxcIk0xNi4yNCA3Ljc2YTYgNiAwIDAgMSAwIDguNDltLTguNDgtLjAxYTYgNiAwIDAgMSAwLTguNDltMTEuMzEtMi44MmExMCAxMCAwIDAgMSAwIDE0LjE0bS0xNC4xNCAwYTEwIDEwIDAgMCAxIDAtMTQuMTRcXFwiPjwvcGF0aD5cIixcInJlZnJlc2gtY2N3XCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIxIDQgMSAxMCA3IDEwXFxcIj48L3BvbHlsaW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjIzIDIwIDIzIDE0IDE3IDE0XFxcIj48L3BvbHlsaW5lPjxwYXRoIGQ9XFxcIk0yMC40OSA5QTkgOSAwIDAgMCA1LjY0IDUuNjRMMSAxMG0yMiA0bC00LjY0IDQuMzZBOSA5IDAgMCAxIDMuNTEgMTVcXFwiPjwvcGF0aD5cIixcInJlZnJlc2gtY3dcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjIzIDQgMjMgMTAgMTcgMTBcXFwiPjwvcG9seWxpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiMSAyMCAxIDE0IDcgMTRcXFwiPjwvcG9seWxpbmU+PHBhdGggZD1cXFwiTTMuNTEgOWE5IDkgMCAwIDEgMTQuODUtMy4zNkwyMyAxME0xIDE0bDQuNjQgNC4zNkE5IDkgMCAwIDAgMjAuNDkgMTVcXFwiPjwvcGF0aD5cIixcInJlcGVhdFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMTcgMSAyMSA1IDE3IDlcXFwiPjwvcG9seWxpbmU+PHBhdGggZD1cXFwiTTMgMTFWOWE0IDQgMCAwIDEgNC00aDE0XFxcIj48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz1cXFwiNyAyMyAzIDE5IDcgMTVcXFwiPjwvcG9seWxpbmU+PHBhdGggZD1cXFwiTTIxIDEzdjJhNCA0IDAgMCAxLTQgNEgzXFxcIj48L3BhdGg+XCIsXCJyZXdpbmRcIjpcIjxwb2x5Z29uIHBvaW50cz1cXFwiMTEgMTkgMiAxMiAxMSA1IDExIDE5XFxcIj48L3BvbHlnb24+PHBvbHlnb24gcG9pbnRzPVxcXCIyMiAxOSAxMyAxMiAyMiA1IDIyIDE5XFxcIj48L3BvbHlnb24+XCIsXCJyb3RhdGUtY2N3XCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIxIDQgMSAxMCA3IDEwXFxcIj48L3BvbHlsaW5lPjxwYXRoIGQ9XFxcIk0zLjUxIDE1YTkgOSAwIDEgMCAyLjEzLTkuMzZMMSAxMFxcXCI+PC9wYXRoPlwiLFwicm90YXRlLWN3XCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIyMyA0IDIzIDEwIDE3IDEwXFxcIj48L3BvbHlsaW5lPjxwYXRoIGQ9XFxcIk0yMC40OSAxNWE5IDkgMCAxIDEtMi4xMi05LjM2TDIzIDEwXFxcIj48L3BhdGg+XCIsXCJyc3NcIjpcIjxwYXRoIGQ9XFxcIk00IDExYTkgOSAwIDAgMSA5IDlcXFwiPjwvcGF0aD48cGF0aCBkPVxcXCJNNCA0YTE2IDE2IDAgMCAxIDE2IDE2XFxcIj48L3BhdGg+PGNpcmNsZSBjeD1cXFwiNVxcXCIgY3k9XFxcIjE5XFxcIiByPVxcXCIxXFxcIj48L2NpcmNsZT5cIixcInNhdmVcIjpcIjxwYXRoIGQ9XFxcIk0xOSAyMUg1YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDExbDUgNXYxMWEyIDIgMCAwIDEtMiAyelxcXCI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9XFxcIjE3IDIxIDE3IDEzIDcgMTMgNyAyMVxcXCI+PC9wb2x5bGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCI3IDMgNyA4IDE1IDhcXFwiPjwvcG9seWxpbmU+XCIsXCJzY2lzc29yc1wiOlwiPGNpcmNsZSBjeD1cXFwiNlxcXCIgY3k9XFxcIjZcXFwiIHI9XFxcIjNcXFwiPjwvY2lyY2xlPjxjaXJjbGUgY3g9XFxcIjZcXFwiIGN5PVxcXCIxOFxcXCIgcj1cXFwiM1xcXCI+PC9jaXJjbGU+PGxpbmUgeDE9XFxcIjIwXFxcIiB5MT1cXFwiNFxcXCIgeDI9XFxcIjguMTJcXFwiIHkyPVxcXCIxNS44OFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNC40N1xcXCIgeTE9XFxcIjE0LjQ4XFxcIiB4Mj1cXFwiMjBcXFwiIHkyPVxcXCIyMFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI4LjEyXFxcIiB5MT1cXFwiOC4xMlxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT5cIixcInNlYXJjaFwiOlwiPGNpcmNsZSBjeD1cXFwiMTFcXFwiIGN5PVxcXCIxMVxcXCIgcj1cXFwiOFxcXCI+PC9jaXJjbGU+PGxpbmUgeDE9XFxcIjIxXFxcIiB5MT1cXFwiMjFcXFwiIHgyPVxcXCIxNi42NVxcXCIgeTI9XFxcIjE2LjY1XFxcIj48L2xpbmU+XCIsXCJzZW5kXCI6XCI8bGluZSB4MT1cXFwiMjJcXFwiIHkxPVxcXCIyXFxcIiB4Mj1cXFwiMTFcXFwiIHkyPVxcXCIxM1xcXCI+PC9saW5lPjxwb2x5Z29uIHBvaW50cz1cXFwiMjIgMiAxNSAyMiAxMSAxMyAyIDkgMjIgMlxcXCI+PC9wb2x5Z29uPlwiLFwic2VydmVyXCI6XCI8cmVjdCB4PVxcXCIyXFxcIiB5PVxcXCIyXFxcIiB3aWR0aD1cXFwiMjBcXFwiIGhlaWdodD1cXFwiOFxcXCIgcng9XFxcIjJcXFwiIHJ5PVxcXCIyXFxcIj48L3JlY3Q+PHJlY3QgeD1cXFwiMlxcXCIgeT1cXFwiMTRcXFwiIHdpZHRoPVxcXCIyMFxcXCIgaGVpZ2h0PVxcXCI4XFxcIiByeD1cXFwiMlxcXCIgcnk9XFxcIjJcXFwiPjwvcmVjdD48bGluZSB4MT1cXFwiNlxcXCIgeTE9XFxcIjZcXFwiIHgyPVxcXCI2XFxcIiB5Mj1cXFwiNlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI2XFxcIiB5MT1cXFwiMThcXFwiIHgyPVxcXCI2XFxcIiB5Mj1cXFwiMThcXFwiPjwvbGluZT5cIixcInNldHRpbmdzXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIzXFxcIj48L2NpcmNsZT48cGF0aCBkPVxcXCJNMTkuNCAxNWExLjY1IDEuNjUgMCAwIDAgLjMzIDEuODJsLjA2LjA2YTIgMiAwIDAgMSAwIDIuODMgMiAyIDAgMCAxLTIuODMgMGwtLjA2LS4wNmExLjY1IDEuNjUgMCAwIDAtMS44Mi0uMzMgMS42NSAxLjY1IDAgMCAwLTEgMS41MVYyMWEyIDIgMCAwIDEtMiAyIDIgMiAwIDAgMS0yLTJ2LS4wOUExLjY1IDEuNjUgMCAwIDAgOSAxOS40YTEuNjUgMS42NSAwIDAgMC0xLjgyLjMzbC0uMDYuMDZhMiAyIDAgMCAxLTIuODMgMCAyIDIgMCAwIDEgMC0yLjgzbC4wNi0uMDZhMS42NSAxLjY1IDAgMCAwIC4zMy0xLjgyIDEuNjUgMS42NSAwIDAgMC0xLjUxLTFIM2EyIDIgMCAwIDEtMi0yIDIgMiAwIDAgMSAyLTJoLjA5QTEuNjUgMS42NSAwIDAgMCA0LjYgOWExLjY1IDEuNjUgMCAwIDAtLjMzLTEuODJsLS4wNi0uMDZhMiAyIDAgMCAxIDAtMi44MyAyIDIgMCAwIDEgMi44MyAwbC4wNi4wNmExLjY1IDEuNjUgMCAwIDAgMS44Mi4zM0g5YTEuNjUgMS42NSAwIDAgMCAxLTEuNTFWM2EyIDIgMCAwIDEgMi0yIDIgMiAwIDAgMSAyIDJ2LjA5YTEuNjUgMS42NSAwIDAgMCAxIDEuNTEgMS42NSAxLjY1IDAgMCAwIDEuODItLjMzbC4wNi0uMDZhMiAyIDAgMCAxIDIuODMgMCAyIDIgMCAwIDEgMCAyLjgzbC0uMDYuMDZhMS42NSAxLjY1IDAgMCAwLS4zMyAxLjgyVjlhMS42NSAxLjY1IDAgMCAwIDEuNTEgMUgyMWEyIDIgMCAwIDEgMiAyIDIgMiAwIDAgMS0yIDJoLS4wOWExLjY1IDEuNjUgMCAwIDAtMS41MSAxelxcXCI+PC9wYXRoPlwiLFwic2hhcmUtMlwiOlwiPGNpcmNsZSBjeD1cXFwiMThcXFwiIGN5PVxcXCI1XFxcIiByPVxcXCIzXFxcIj48L2NpcmNsZT48Y2lyY2xlIGN4PVxcXCI2XFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjNcXFwiPjwvY2lyY2xlPjxjaXJjbGUgY3g9XFxcIjE4XFxcIiBjeT1cXFwiMTlcXFwiIHI9XFxcIjNcXFwiPjwvY2lyY2xlPjxsaW5lIHgxPVxcXCI4LjU5XFxcIiB5MT1cXFwiMTMuNTFcXFwiIHgyPVxcXCIxNS40MlxcXCIgeTI9XFxcIjE3LjQ5XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE1LjQxXFxcIiB5MT1cXFwiNi41MVxcXCIgeDI9XFxcIjguNTlcXFwiIHkyPVxcXCIxMC40OVxcXCI+PC9saW5lPlwiLFwic2hhcmVcIjpcIjxwYXRoIGQ9XFxcIk00IDEydjhhMiAyIDAgMCAwIDIgMmgxMmEyIDIgMCAwIDAgMi0ydi04XFxcIj48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTYgNiAxMiAyIDggNlxcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIyXFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIxNVxcXCI+PC9saW5lPlwiLFwic2hpZWxkLW9mZlwiOlwiPHBhdGggZD1cXFwiTTE5LjY5IDE0YTYuOSA2LjkgMCAwIDAgLjMxLTJWNWwtOC0zLTMuMTYgMS4xOFxcXCI+PC9wYXRoPjxwYXRoIGQ9XFxcIk00LjczIDQuNzNMNCA1djdjMCA2IDggMTAgOCAxMGEyMC4yOSAyMC4yOSAwIDAgMCA1LjYyLTQuMzhcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiMVxcXCIgeTE9XFxcIjFcXFwiIHgyPVxcXCIyM1xcXCIgeTI9XFxcIjIzXFxcIj48L2xpbmU+XCIsXCJzaGllbGRcIjpcIjxwYXRoIGQ9XFxcIk0xMiAyMnM4LTQgOC0xMFY1bC04LTMtOCAzdjdjMCA2IDggMTAgOCAxMHpcXFwiPjwvcGF0aD5cIixcInNob3BwaW5nLWJhZ1wiOlwiPHBhdGggZD1cXFwiTTYgMkwzIDZ2MTRhMiAyIDAgMCAwIDIgMmgxNGEyIDIgMCAwIDAgMi0yVjZsLTMtNHpcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiM1xcXCIgeTE9XFxcIjZcXFwiIHgyPVxcXCIyMVxcXCIgeTI9XFxcIjZcXFwiPjwvbGluZT48cGF0aCBkPVxcXCJNMTYgMTBhNCA0IDAgMCAxLTggMFxcXCI+PC9wYXRoPlwiLFwic2hvcHBpbmctY2FydFwiOlwiPGNpcmNsZSBjeD1cXFwiOVxcXCIgY3k9XFxcIjIxXFxcIiByPVxcXCIxXFxcIj48L2NpcmNsZT48Y2lyY2xlIGN4PVxcXCIyMFxcXCIgY3k9XFxcIjIxXFxcIiByPVxcXCIxXFxcIj48L2NpcmNsZT48cGF0aCBkPVxcXCJNMSAxaDRsMi42OCAxMy4zOWEyIDIgMCAwIDAgMiAxLjYxaDkuNzJhMiAyIDAgMCAwIDItMS42MUwyMyA2SDZcXFwiPjwvcGF0aD5cIixcInNodWZmbGVcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjE2IDMgMjEgMyAyMSA4XFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCI0XFxcIiB5MT1cXFwiMjBcXFwiIHgyPVxcXCIyMVxcXCIgeTI9XFxcIjNcXFwiPjwvbGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCIyMSAxNiAyMSAyMSAxNiAyMVxcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMTVcXFwiIHkxPVxcXCIxNVxcXCIgeDI9XFxcIjIxXFxcIiB5Mj1cXFwiMjFcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiNFxcXCIgeTE9XFxcIjRcXFwiIHgyPVxcXCI5XFxcIiB5Mj1cXFwiOVxcXCI+PC9saW5lPlwiLFwic2lkZWJhclwiOlwiPHJlY3QgeD1cXFwiM1xcXCIgeT1cXFwiM1xcXCIgd2lkdGg9XFxcIjE4XFxcIiBoZWlnaHQ9XFxcIjE4XFxcIiByeD1cXFwiMlxcXCIgcnk9XFxcIjJcXFwiPjwvcmVjdD48bGluZSB4MT1cXFwiOVxcXCIgeTE9XFxcIjNcXFwiIHgyPVxcXCI5XFxcIiB5Mj1cXFwiMjFcXFwiPjwvbGluZT5cIixcInNraXAtYmFja1wiOlwiPHBvbHlnb24gcG9pbnRzPVxcXCIxOSAyMCA5IDEyIDE5IDQgMTkgMjBcXFwiPjwvcG9seWdvbj48bGluZSB4MT1cXFwiNVxcXCIgeTE9XFxcIjE5XFxcIiB4Mj1cXFwiNVxcXCIgeTI9XFxcIjVcXFwiPjwvbGluZT5cIixcInNraXAtZm9yd2FyZFwiOlwiPHBvbHlnb24gcG9pbnRzPVxcXCI1IDQgMTUgMTIgNSAyMCA1IDRcXFwiPjwvcG9seWdvbj48bGluZSB4MT1cXFwiMTlcXFwiIHkxPVxcXCI1XFxcIiB4Mj1cXFwiMTlcXFwiIHkyPVxcXCIxOVxcXCI+PC9saW5lPlwiLFwic2xhY2tcIjpcIjxwYXRoIGQ9XFxcIk0yMi4wOCA5QzE5LjgxIDEuNDEgMTYuNTQtLjM1IDkgMS45MlMtLjM1IDcuNDYgMS45MiAxNSA3LjQ2IDI0LjM1IDE1IDIyLjA4IDI0LjM1IDE2LjU0IDIyLjA4IDl6XFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjEyLjU3XFxcIiB5MT1cXFwiNS45OVxcXCIgeDI9XFxcIjE2LjE1XFxcIiB5Mj1cXFwiMTYuMzlcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiNy44NVxcXCIgeTE9XFxcIjcuNjFcXFwiIHgyPVxcXCIxMS40M1xcXCIgeTI9XFxcIjE4LjAxXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE2LjM5XFxcIiB5MT1cXFwiNy44NVxcXCIgeDI9XFxcIjUuOTlcXFwiIHkyPVxcXCIxMS40M1xcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxOC4wMVxcXCIgeTE9XFxcIjEyLjU3XFxcIiB4Mj1cXFwiNy42MVxcXCIgeTI9XFxcIjE2LjE1XFxcIj48L2xpbmU+XCIsXCJzbGFzaFwiOlwiPGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiMTBcXFwiPjwvY2lyY2xlPjxsaW5lIHgxPVxcXCI0LjkzXFxcIiB5MT1cXFwiNC45M1xcXCIgeDI9XFxcIjE5LjA3XFxcIiB5Mj1cXFwiMTkuMDdcXFwiPjwvbGluZT5cIixcInNsaWRlcnNcIjpcIjxsaW5lIHgxPVxcXCI0XFxcIiB5MT1cXFwiMjFcXFwiIHgyPVxcXCI0XFxcIiB5Mj1cXFwiMTRcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiNFxcXCIgeTE9XFxcIjEwXFxcIiB4Mj1cXFwiNFxcXCIgeTI9XFxcIjNcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIyMVxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCI4XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIzXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjIwXFxcIiB5MT1cXFwiMjFcXFwiIHgyPVxcXCIyMFxcXCIgeTI9XFxcIjE2XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjIwXFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCIyMFxcXCIgeTI9XFxcIjNcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMVxcXCIgeTE9XFxcIjE0XFxcIiB4Mj1cXFwiN1xcXCIgeTI9XFxcIjE0XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjlcXFwiIHkxPVxcXCI4XFxcIiB4Mj1cXFwiMTVcXFwiIHkyPVxcXCI4XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE3XFxcIiB5MT1cXFwiMTZcXFwiIHgyPVxcXCIyM1xcXCIgeTI9XFxcIjE2XFxcIj48L2xpbmU+XCIsXCJzbWFydHBob25lXCI6XCI8cmVjdCB4PVxcXCI1XFxcIiB5PVxcXCIyXFxcIiB3aWR0aD1cXFwiMTRcXFwiIGhlaWdodD1cXFwiMjBcXFwiIHJ4PVxcXCIyXFxcIiByeT1cXFwiMlxcXCI+PC9yZWN0PjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjE4XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIxOFxcXCI+PC9saW5lPlwiLFwic3BlYWtlclwiOlwiPHJlY3QgeD1cXFwiNFxcXCIgeT1cXFwiMlxcXCIgd2lkdGg9XFxcIjE2XFxcIiBoZWlnaHQ9XFxcIjIwXFxcIiByeD1cXFwiMlxcXCIgcnk9XFxcIjJcXFwiPjwvcmVjdD48Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjE0XFxcIiByPVxcXCI0XFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCI2XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCI2XFxcIj48L2xpbmU+XCIsXCJzcXVhcmVcIjpcIjxyZWN0IHg9XFxcIjNcXFwiIHk9XFxcIjNcXFwiIHdpZHRoPVxcXCIxOFxcXCIgaGVpZ2h0PVxcXCIxOFxcXCIgcng9XFxcIjJcXFwiIHJ5PVxcXCIyXFxcIj48L3JlY3Q+XCIsXCJzdGFyXCI6XCI8cG9seWdvbiBwb2ludHM9XFxcIjEyIDIgMTUuMDkgOC4yNiAyMiA5LjI3IDE3IDE0LjE0IDE4LjE4IDIxLjAyIDEyIDE3Ljc3IDUuODIgMjEuMDIgNyAxNC4xNCAyIDkuMjcgOC45MSA4LjI2IDEyIDJcXFwiPjwvcG9seWdvbj5cIixcInN0b3AtY2lyY2xlXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxMFxcXCI+PC9jaXJjbGU+PHJlY3QgeD1cXFwiOVxcXCIgeT1cXFwiOVxcXCIgd2lkdGg9XFxcIjZcXFwiIGhlaWdodD1cXFwiNlxcXCI+PC9yZWN0PlwiLFwic3VuXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCI1XFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIxXFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIzXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMjFcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjIzXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjQuMjJcXFwiIHkxPVxcXCI0LjIyXFxcIiB4Mj1cXFwiNS42NFxcXCIgeTI9XFxcIjUuNjRcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTguMzZcXFwiIHkxPVxcXCIxOC4zNlxcXCIgeDI9XFxcIjE5Ljc4XFxcIiB5Mj1cXFwiMTkuNzhcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMVxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiM1xcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjIxXFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCIyM1xcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjQuMjJcXFwiIHkxPVxcXCIxOS43OFxcXCIgeDI9XFxcIjUuNjRcXFwiIHkyPVxcXCIxOC4zNlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxOC4zNlxcXCIgeTE9XFxcIjUuNjRcXFwiIHgyPVxcXCIxOS43OFxcXCIgeTI9XFxcIjQuMjJcXFwiPjwvbGluZT5cIixcInN1bnJpc2VcIjpcIjxwYXRoIGQ9XFxcIk0xNyAxOGE1IDUgMCAwIDAtMTAgMFxcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjJcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjlcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiNC4yMlxcXCIgeTE9XFxcIjEwLjIyXFxcIiB4Mj1cXFwiNS42NFxcXCIgeTI9XFxcIjExLjY0XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjFcXFwiIHkxPVxcXCIxOFxcXCIgeDI9XFxcIjNcXFwiIHkyPVxcXCIxOFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIyMVxcXCIgeTE9XFxcIjE4XFxcIiB4Mj1cXFwiMjNcXFwiIHkyPVxcXCIxOFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxOC4zNlxcXCIgeTE9XFxcIjExLjY0XFxcIiB4Mj1cXFwiMTkuNzhcXFwiIHkyPVxcXCIxMC4yMlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIyM1xcXCIgeTE9XFxcIjIyXFxcIiB4Mj1cXFwiMVxcXCIgeTI9XFxcIjIyXFxcIj48L2xpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiOCA2IDEyIDIgMTYgNlxcXCI+PC9wb2x5bGluZT5cIixcInN1bnNldFwiOlwiPHBhdGggZD1cXFwiTTE3IDE4YTUgNSAwIDAgMC0xMCAwXFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiOVxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI0LjIyXFxcIiB5MT1cXFwiMTAuMjJcXFwiIHgyPVxcXCI1LjY0XFxcIiB5Mj1cXFwiMTEuNjRcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMVxcXCIgeTE9XFxcIjE4XFxcIiB4Mj1cXFwiM1xcXCIgeTI9XFxcIjE4XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjIxXFxcIiB5MT1cXFwiMThcXFwiIHgyPVxcXCIyM1xcXCIgeTI9XFxcIjE4XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE4LjM2XFxcIiB5MT1cXFwiMTEuNjRcXFwiIHgyPVxcXCIxOS43OFxcXCIgeTI9XFxcIjEwLjIyXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjIzXFxcIiB5MT1cXFwiMjJcXFwiIHgyPVxcXCIxXFxcIiB5Mj1cXFwiMjJcXFwiPjwvbGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCIxNiA1IDEyIDkgOCA1XFxcIj48L3BvbHlsaW5lPlwiLFwidGFibGV0XCI6XCI8cmVjdCB4PVxcXCI0XFxcIiB5PVxcXCIyXFxcIiB3aWR0aD1cXFwiMTZcXFwiIGhlaWdodD1cXFwiMjBcXFwiIHJ4PVxcXCIyXFxcIiByeT1cXFwiMlxcXCIgdHJhbnNmb3JtPVxcXCJyb3RhdGUoMTgwIDEyIDEyKVxcXCI+PC9yZWN0PjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjE4XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIxOFxcXCI+PC9saW5lPlwiLFwidGFnXCI6XCI8cGF0aCBkPVxcXCJNMjAuNTkgMTMuNDFsLTcuMTcgNy4xN2EyIDIgMCAwIDEtMi44MyAwTDIgMTJWMmgxMGw4LjU5IDguNTlhMiAyIDAgMCAxIDAgMi44MnpcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiN1xcXCIgeTE9XFxcIjdcXFwiIHgyPVxcXCI3XFxcIiB5Mj1cXFwiN1xcXCI+PC9saW5lPlwiLFwidGFyZ2V0XCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxMFxcXCI+PC9jaXJjbGU+PGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiNlxcXCI+PC9jaXJjbGU+PGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiMlxcXCI+PC9jaXJjbGU+XCIsXCJ0ZXJtaW5hbFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiNCAxNyAxMCAxMSA0IDVcXFwiPjwvcG9seWxpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMTlcXFwiIHgyPVxcXCIyMFxcXCIgeTI9XFxcIjE5XFxcIj48L2xpbmU+XCIsXCJ0aGVybW9tZXRlclwiOlwiPHBhdGggZD1cXFwiTTE0IDE0Ljc2VjMuNWEyLjUgMi41IDAgMCAwLTUgMHYxMS4yNmE0LjUgNC41IDAgMSAwIDUgMHpcXFwiPjwvcGF0aD5cIixcInRodW1icy1kb3duXCI6XCI8cGF0aCBkPVxcXCJNMTAgMTV2NGEzIDMgMCAwIDAgMyAzbDQtOVYySDUuNzJhMiAyIDAgMCAwLTIgMS43bC0xLjM4IDlhMiAyIDAgMCAwIDIgMi4zem03LTEzaDIuNjdBMi4zMSAyLjMxIDAgMCAxIDIyIDR2N2EyLjMxIDIuMzEgMCAwIDEtMi4zMyAySDE3XFxcIj48L3BhdGg+XCIsXCJ0aHVtYnMtdXBcIjpcIjxwYXRoIGQ9XFxcIk0xNCA5VjVhMyAzIDAgMCAwLTMtM2wtNCA5djExaDExLjI4YTIgMiAwIDAgMCAyLTEuN2wxLjM4LTlhMiAyIDAgMCAwLTItMi4zek03IDIySDRhMiAyIDAgMCAxLTItMnYtN2EyIDIgMCAwIDEgMi0yaDNcXFwiPjwvcGF0aD5cIixcInRvZ2dsZS1sZWZ0XCI6XCI8cmVjdCB4PVxcXCIxXFxcIiB5PVxcXCI1XFxcIiB3aWR0aD1cXFwiMjJcXFwiIGhlaWdodD1cXFwiMTRcXFwiIHJ4PVxcXCI3XFxcIiByeT1cXFwiN1xcXCI+PC9yZWN0PjxjaXJjbGUgY3g9XFxcIjhcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiM1xcXCI+PC9jaXJjbGU+XCIsXCJ0b2dnbGUtcmlnaHRcIjpcIjxyZWN0IHg9XFxcIjFcXFwiIHk9XFxcIjVcXFwiIHdpZHRoPVxcXCIyMlxcXCIgaGVpZ2h0PVxcXCIxNFxcXCIgcng9XFxcIjdcXFwiIHJ5PVxcXCI3XFxcIj48L3JlY3Q+PGNpcmNsZSBjeD1cXFwiMTZcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiM1xcXCI+PC9jaXJjbGU+XCIsXCJ0cmFzaC0yXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIzIDYgNSA2IDIxIDZcXFwiPjwvcG9seWxpbmU+PHBhdGggZD1cXFwiTTE5IDZ2MTRhMiAyIDAgMCAxLTIgMkg3YTIgMiAwIDAgMS0yLTJWNm0zIDBWNGEyIDIgMCAwIDEgMi0yaDRhMiAyIDAgMCAxIDIgMnYyXFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjEwXFxcIiB5MT1cXFwiMTFcXFwiIHgyPVxcXCIxMFxcXCIgeTI9XFxcIjE3XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE0XFxcIiB5MT1cXFwiMTFcXFwiIHgyPVxcXCIxNFxcXCIgeTI9XFxcIjE3XFxcIj48L2xpbmU+XCIsXCJ0cmFzaFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMyA2IDUgNiAyMSA2XFxcIj48L3BvbHlsaW5lPjxwYXRoIGQ9XFxcIk0xOSA2djE0YTIgMiAwIDAgMS0yIDJIN2EyIDIgMCAwIDEtMi0yVjZtMyAwVjRhMiAyIDAgMCAxIDItMmg0YTIgMiAwIDAgMSAyIDJ2MlxcXCI+PC9wYXRoPlwiLFwidHJlbmRpbmctZG93blwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMjMgMTggMTMuNSA4LjUgOC41IDEzLjUgMSA2XFxcIj48L3BvbHlsaW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjE3IDE4IDIzIDE4IDIzIDEyXFxcIj48L3BvbHlsaW5lPlwiLFwidHJlbmRpbmctdXBcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjIzIDYgMTMuNSAxNS41IDguNSAxMC41IDEgMThcXFwiPjwvcG9seWxpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTcgNiAyMyA2IDIzIDEyXFxcIj48L3BvbHlsaW5lPlwiLFwidHJpYW5nbGVcIjpcIjxwYXRoIGQ9XFxcIk0xMC4yOSAzLjg2TDEuODIgMThhMiAyIDAgMCAwIDEuNzEgM2gxNi45NGEyIDIgMCAwIDAgMS43MS0zTDEzLjcxIDMuODZhMiAyIDAgMCAwLTMuNDIgMHpcXFwiPjwvcGF0aD5cIixcInRydWNrXCI6XCI8cmVjdCB4PVxcXCIxXFxcIiB5PVxcXCIzXFxcIiB3aWR0aD1cXFwiMTVcXFwiIGhlaWdodD1cXFwiMTNcXFwiPjwvcmVjdD48cG9seWdvbiBwb2ludHM9XFxcIjE2IDggMjAgOCAyMyAxMSAyMyAxNiAxNiAxNiAxNiA4XFxcIj48L3BvbHlnb24+PGNpcmNsZSBjeD1cXFwiNS41XFxcIiBjeT1cXFwiMTguNVxcXCIgcj1cXFwiMi41XFxcIj48L2NpcmNsZT48Y2lyY2xlIGN4PVxcXCIxOC41XFxcIiBjeT1cXFwiMTguNVxcXCIgcj1cXFwiMi41XFxcIj48L2NpcmNsZT5cIixcInR2XCI6XCI8cmVjdCB4PVxcXCIyXFxcIiB5PVxcXCI3XFxcIiB3aWR0aD1cXFwiMjBcXFwiIGhlaWdodD1cXFwiMTVcXFwiIHJ4PVxcXCIyXFxcIiByeT1cXFwiMlxcXCI+PC9yZWN0Pjxwb2x5bGluZSBwb2ludHM9XFxcIjE3IDIgMTIgNyA3IDJcXFwiPjwvcG9seWxpbmU+XCIsXCJ0d2l0dGVyXCI6XCI8cGF0aCBkPVxcXCJNMjMgM2ExMC45IDEwLjkgMCAwIDEtMy4xNCAxLjUzIDQuNDggNC40OCAwIDAgMC03Ljg2IDN2MUExMC42NiAxMC42NiAwIDAgMSAzIDRzLTQgOSA1IDEzYTExLjY0IDExLjY0IDAgMCAxLTcgMmM5IDUgMjAgMCAyMC0xMS41YTQuNSA0LjUgMCAwIDAtLjA4LS44M0E3LjcyIDcuNzIgMCAwIDAgMjMgM3pcXFwiPjwvcGF0aD5cIixcInR5cGVcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjQgNyA0IDQgMjAgNCAyMCA3XFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCI5XFxcIiB5MT1cXFwiMjBcXFwiIHgyPVxcXCIxNVxcXCIgeTI9XFxcIjIwXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiNFxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMjBcXFwiPjwvbGluZT5cIixcInVtYnJlbGxhXCI6XCI8cGF0aCBkPVxcXCJNMjMgMTJhMTEuMDUgMTEuMDUgMCAwIDAtMjIgMHptLTUgN2EzIDMgMCAwIDEtNiAwdi03XFxcIj48L3BhdGg+XCIsXCJ1bmRlcmxpbmVcIjpcIjxwYXRoIGQ9XFxcIk02IDN2N2E2IDYgMCAwIDAgNiA2IDYgNiAwIDAgMCA2LTZWM1xcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCI0XFxcIiB5MT1cXFwiMjFcXFwiIHgyPVxcXCIyMFxcXCIgeTI9XFxcIjIxXFxcIj48L2xpbmU+XCIsXCJ1bmxvY2tcIjpcIjxyZWN0IHg9XFxcIjNcXFwiIHk9XFxcIjExXFxcIiB3aWR0aD1cXFwiMThcXFwiIGhlaWdodD1cXFwiMTFcXFwiIHJ4PVxcXCIyXFxcIiByeT1cXFwiMlxcXCI+PC9yZWN0PjxwYXRoIGQ9XFxcIk03IDExVjdhNSA1IDAgMCAxIDkuOS0xXFxcIj48L3BhdGg+XCIsXCJ1cGxvYWQtY2xvdWRcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjE2IDE2IDEyIDEyIDggMTZcXFwiPjwvcG9seWxpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjIxXFxcIj48L2xpbmU+PHBhdGggZD1cXFwiTTIwLjM5IDE4LjM5QTUgNSAwIDAgMCAxOCA5aC0xLjI2QTggOCAwIDEgMCAzIDE2LjNcXFwiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPVxcXCIxNiAxNiAxMiAxMiA4IDE2XFxcIj48L3BvbHlsaW5lPlwiLFwidXBsb2FkXCI6XCI8cGF0aCBkPVxcXCJNMjEgMTV2NGEyIDIgMCAwIDEtMiAySDVhMiAyIDAgMCAxLTItMnYtNFxcXCI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9XFxcIjE3IDggMTIgMyA3IDhcXFwiPjwvcG9seWxpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiM1xcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTVcXFwiPjwvbGluZT5cIixcInVzZXItY2hlY2tcIjpcIjxwYXRoIGQ9XFxcIk0xNiAyMXYtMmE0IDQgMCAwIDAtNC00SDVhNCA0IDAgMCAwLTQgNHYyXFxcIj48L3BhdGg+PGNpcmNsZSBjeD1cXFwiOC41XFxcIiBjeT1cXFwiN1xcXCIgcj1cXFwiNFxcXCI+PC9jaXJjbGU+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTcgMTEgMTkgMTMgMjMgOVxcXCI+PC9wb2x5bGluZT5cIixcInVzZXItbWludXNcIjpcIjxwYXRoIGQ9XFxcIk0xNiAyMXYtMmE0IDQgMCAwIDAtNC00SDVhNCA0IDAgMCAwLTQgNHYyXFxcIj48L3BhdGg+PGNpcmNsZSBjeD1cXFwiOC41XFxcIiBjeT1cXFwiN1xcXCIgcj1cXFwiNFxcXCI+PC9jaXJjbGU+PGxpbmUgeDE9XFxcIjIzXFxcIiB5MT1cXFwiMTFcXFwiIHgyPVxcXCIxN1xcXCIgeTI9XFxcIjExXFxcIj48L2xpbmU+XCIsXCJ1c2VyLXBsdXNcIjpcIjxwYXRoIGQ9XFxcIk0xNiAyMXYtMmE0IDQgMCAwIDAtNC00SDVhNCA0IDAgMCAwLTQgNHYyXFxcIj48L3BhdGg+PGNpcmNsZSBjeD1cXFwiOC41XFxcIiBjeT1cXFwiN1xcXCIgcj1cXFwiNFxcXCI+PC9jaXJjbGU+PGxpbmUgeDE9XFxcIjIwXFxcIiB5MT1cXFwiOFxcXCIgeDI9XFxcIjIwXFxcIiB5Mj1cXFwiMTRcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMjNcXFwiIHkxPVxcXCIxMVxcXCIgeDI9XFxcIjE3XFxcIiB5Mj1cXFwiMTFcXFwiPjwvbGluZT5cIixcInVzZXIteFwiOlwiPHBhdGggZD1cXFwiTTE2IDIxdi0yYTQgNCAwIDAgMC00LTRINWE0IDQgMCAwIDAtNCA0djJcXFwiPjwvcGF0aD48Y2lyY2xlIGN4PVxcXCI4LjVcXFwiIGN5PVxcXCI3XFxcIiByPVxcXCI0XFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiMThcXFwiIHkxPVxcXCI4XFxcIiB4Mj1cXFwiMjNcXFwiIHkyPVxcXCIxM1xcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIyM1xcXCIgeTE9XFxcIjhcXFwiIHgyPVxcXCIxOFxcXCIgeTI9XFxcIjEzXFxcIj48L2xpbmU+XCIsXCJ1c2VyXCI6XCI8cGF0aCBkPVxcXCJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MlxcXCI+PC9wYXRoPjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiN1xcXCIgcj1cXFwiNFxcXCI+PC9jaXJjbGU+XCIsXCJ1c2Vyc1wiOlwiPHBhdGggZD1cXFwiTTE3IDIxdi0yYTQgNCAwIDAgMC00LTRINWE0IDQgMCAwIDAtNCA0djJcXFwiPjwvcGF0aD48Y2lyY2xlIGN4PVxcXCI5XFxcIiBjeT1cXFwiN1xcXCIgcj1cXFwiNFxcXCI+PC9jaXJjbGU+PHBhdGggZD1cXFwiTTIzIDIxdi0yYTQgNCAwIDAgMC0zLTMuODdcXFwiPjwvcGF0aD48cGF0aCBkPVxcXCJNMTYgMy4xM2E0IDQgMCAwIDEgMCA3Ljc1XFxcIj48L3BhdGg+XCIsXCJ2aWRlby1vZmZcIjpcIjxwYXRoIGQ9XFxcIk0xNiAxNnYxYTIgMiAwIDAgMS0yIDJIM2EyIDIgMCAwIDEtMi0yVjdhMiAyIDAgMCAxIDItMmgybTUuNjYgMEgxNGEyIDIgMCAwIDEgMiAydjMuMzRsMSAxTDIzIDd2MTBcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiMVxcXCIgeTE9XFxcIjFcXFwiIHgyPVxcXCIyM1xcXCIgeTI9XFxcIjIzXFxcIj48L2xpbmU+XCIsXCJ2aWRlb1wiOlwiPHBvbHlnb24gcG9pbnRzPVxcXCIyMyA3IDE2IDEyIDIzIDE3IDIzIDdcXFwiPjwvcG9seWdvbj48cmVjdCB4PVxcXCIxXFxcIiB5PVxcXCI1XFxcIiB3aWR0aD1cXFwiMTVcXFwiIGhlaWdodD1cXFwiMTRcXFwiIHJ4PVxcXCIyXFxcIiByeT1cXFwiMlxcXCI+PC9yZWN0PlwiLFwidm9pY2VtYWlsXCI6XCI8Y2lyY2xlIGN4PVxcXCI1LjVcXFwiIGN5PVxcXCIxMS41XFxcIiByPVxcXCI0LjVcXFwiPjwvY2lyY2xlPjxjaXJjbGUgY3g9XFxcIjE4LjVcXFwiIGN5PVxcXCIxMS41XFxcIiByPVxcXCI0LjVcXFwiPjwvY2lyY2xlPjxsaW5lIHgxPVxcXCI1LjVcXFwiIHkxPVxcXCIxNlxcXCIgeDI9XFxcIjE4LjVcXFwiIHkyPVxcXCIxNlxcXCI+PC9saW5lPlwiLFwidm9sdW1lLTFcIjpcIjxwb2x5Z29uIHBvaW50cz1cXFwiMTEgNSA2IDkgMiA5IDIgMTUgNiAxNSAxMSAxOSAxMSA1XFxcIj48L3BvbHlnb24+PHBhdGggZD1cXFwiTTE1LjU0IDguNDZhNSA1IDAgMCAxIDAgNy4wN1xcXCI+PC9wYXRoPlwiLFwidm9sdW1lLTJcIjpcIjxwb2x5Z29uIHBvaW50cz1cXFwiMTEgNSA2IDkgMiA5IDIgMTUgNiAxNSAxMSAxOSAxMSA1XFxcIj48L3BvbHlnb24+PHBhdGggZD1cXFwiTTE5LjA3IDQuOTNhMTAgMTAgMCAwIDEgMCAxNC4xNE0xNS41NCA4LjQ2YTUgNSAwIDAgMSAwIDcuMDdcXFwiPjwvcGF0aD5cIixcInZvbHVtZS14XCI6XCI8cG9seWdvbiBwb2ludHM9XFxcIjExIDUgNiA5IDIgOSAyIDE1IDYgMTUgMTEgMTkgMTEgNVxcXCI+PC9wb2x5Z29uPjxsaW5lIHgxPVxcXCIyM1xcXCIgeTE9XFxcIjlcXFwiIHgyPVxcXCIxN1xcXCIgeTI9XFxcIjE1XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE3XFxcIiB5MT1cXFwiOVxcXCIgeDI9XFxcIjIzXFxcIiB5Mj1cXFwiMTVcXFwiPjwvbGluZT5cIixcInZvbHVtZVwiOlwiPHBvbHlnb24gcG9pbnRzPVxcXCIxMSA1IDYgOSAyIDkgMiAxNSA2IDE1IDExIDE5IDExIDVcXFwiPjwvcG9seWdvbj5cIixcIndhdGNoXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCI3XFxcIj48L2NpcmNsZT48cG9seWxpbmUgcG9pbnRzPVxcXCIxMiA5IDEyIDEyIDEzLjUgMTMuNVxcXCI+PC9wb2x5bGluZT48cGF0aCBkPVxcXCJNMTYuNTEgMTcuMzVsLS4zNSAzLjgzYTIgMiAwIDAgMS0yIDEuODJIOS44M2EyIDIgMCAwIDEtMi0xLjgybC0uMzUtMy44M20uMDEtMTAuN2wuMzUtMy44M0EyIDIgMCAwIDEgOS44MyAxaDQuMzVhMiAyIDAgMCAxIDIgMS44MmwuMzUgMy44M1xcXCI+PC9wYXRoPlwiLFwid2lmaS1vZmZcIjpcIjxsaW5lIHgxPVxcXCIxXFxcIiB5MT1cXFwiMVxcXCIgeDI9XFxcIjIzXFxcIiB5Mj1cXFwiMjNcXFwiPjwvbGluZT48cGF0aCBkPVxcXCJNMTYuNzIgMTEuMDZBMTAuOTQgMTAuOTQgMCAwIDEgMTkgMTIuNTVcXFwiPjwvcGF0aD48cGF0aCBkPVxcXCJNNSAxMi41NWExMC45NCAxMC45NCAwIDAgMSA1LjE3LTIuMzlcXFwiPjwvcGF0aD48cGF0aCBkPVxcXCJNMTAuNzEgNS4wNUExNiAxNiAwIDAgMSAyMi41OCA5XFxcIj48L3BhdGg+PHBhdGggZD1cXFwiTTEuNDIgOWExNS45MSAxNS45MSAwIDAgMSA0LjctMi44OFxcXCI+PC9wYXRoPjxwYXRoIGQ9XFxcIk04LjUzIDE2LjExYTYgNiAwIDAgMSA2Ljk1IDBcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIyMFxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMjBcXFwiPjwvbGluZT5cIixcIndpZmlcIjpcIjxwYXRoIGQ9XFxcIk01IDEyLjU1YTExIDExIDAgMCAxIDE0LjA4IDBcXFwiPjwvcGF0aD48cGF0aCBkPVxcXCJNMS40MiA5YTE2IDE2IDAgMCAxIDIxLjE2IDBcXFwiPjwvcGF0aD48cGF0aCBkPVxcXCJNOC41MyAxNi4xMWE2IDYgMCAwIDEgNi45NSAwXFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMjBcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjIwXFxcIj48L2xpbmU+XCIsXCJ3aW5kXCI6XCI8cGF0aCBkPVxcXCJNOS41OSA0LjU5QTIgMiAwIDEgMSAxMSA4SDJtMTAuNTkgMTEuNDFBMiAyIDAgMSAwIDE0IDE2SDJtMTUuNzMtOC4yN0EyLjUgMi41IDAgMSAxIDE5LjUgMTJIMlxcXCI+PC9wYXRoPlwiLFwieC1jaXJjbGVcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjEwXFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiMTVcXFwiIHkxPVxcXCI5XFxcIiB4Mj1cXFwiOVxcXCIgeTI9XFxcIjE1XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjlcXFwiIHkxPVxcXCI5XFxcIiB4Mj1cXFwiMTVcXFwiIHkyPVxcXCIxNVxcXCI+PC9saW5lPlwiLFwieC1zcXVhcmVcIjpcIjxyZWN0IHg9XFxcIjNcXFwiIHk9XFxcIjNcXFwiIHdpZHRoPVxcXCIxOFxcXCIgaGVpZ2h0PVxcXCIxOFxcXCIgcng9XFxcIjJcXFwiIHJ5PVxcXCIyXFxcIj48L3JlY3Q+PGxpbmUgeDE9XFxcIjlcXFwiIHkxPVxcXCI5XFxcIiB4Mj1cXFwiMTVcXFwiIHkyPVxcXCIxNVxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNVxcXCIgeTE9XFxcIjlcXFwiIHgyPVxcXCI5XFxcIiB5Mj1cXFwiMTVcXFwiPjwvbGluZT5cIixcInhcIjpcIjxsaW5lIHgxPVxcXCIxOFxcXCIgeTE9XFxcIjZcXFwiIHgyPVxcXCI2XFxcIiB5Mj1cXFwiMThcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiNlxcXCIgeTE9XFxcIjZcXFwiIHgyPVxcXCIxOFxcXCIgeTI9XFxcIjE4XFxcIj48L2xpbmU+XCIsXCJ5b3V0dWJlXCI6XCI8cGF0aCBkPVxcXCJNMjIuNTQgNi40MmEyLjc4IDIuNzggMCAwIDAtMS45NC0yQzE4Ljg4IDQgMTIgNCAxMiA0cy02Ljg4IDAtOC42LjQ2YTIuNzggMi43OCAwIDAgMC0xLjk0IDJBMjkgMjkgMCAwIDAgMSAxMS43NWEyOSAyOSAwIDAgMCAuNDYgNS4zM0EyLjc4IDIuNzggMCAwIDAgMy40IDE5YzEuNzIuNDYgOC42LjQ2IDguNi40NnM2Ljg4IDAgOC42LS40NmEyLjc4IDIuNzggMCAwIDAgMS45NC0yIDI5IDI5IDAgMCAwIC40Ni01LjI1IDI5IDI5IDAgMCAwLS40Ni01LjMzelxcXCI+PC9wYXRoPjxwb2x5Z29uIHBvaW50cz1cXFwiOS43NSAxNS4wMiAxNS41IDExLjc1IDkuNzUgOC40OCA5Ljc1IDE1LjAyXFxcIj48L3BvbHlnb24+XCIsXCJ6YXAtb2ZmXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIxMi40MSA2Ljc1IDEzIDIgMTAuNTcgNC45MlxcXCI+PC9wb2x5bGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCIxOC41NyAxMi45MSAyMSAxMCAxNS42NiAxMFxcXCI+PC9wb2x5bGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCI4IDggMyAxNCAxMiAxNCAxMSAyMiAxNiAxNlxcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMVxcXCIgeTE9XFxcIjFcXFwiIHgyPVxcXCIyM1xcXCIgeTI9XFxcIjIzXFxcIj48L2xpbmU+XCIsXCJ6YXBcIjpcIjxwb2x5Z29uIHBvaW50cz1cXFwiMTMgMiAzIDE0IDEyIDE0IDExIDIyIDIxIDEwIDEyIDEwIDEzIDJcXFwiPjwvcG9seWdvbj5cIixcInpvb20taW5cIjpcIjxjaXJjbGUgY3g9XFxcIjExXFxcIiBjeT1cXFwiMTFcXFwiIHI9XFxcIjhcXFwiPjwvY2lyY2xlPjxsaW5lIHgxPVxcXCIyMVxcXCIgeTE9XFxcIjIxXFxcIiB4Mj1cXFwiMTYuNjVcXFwiIHkyPVxcXCIxNi42NVxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxMVxcXCIgeTE9XFxcIjhcXFwiIHgyPVxcXCIxMVxcXCIgeTI9XFxcIjE0XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjhcXFwiIHkxPVxcXCIxMVxcXCIgeDI9XFxcIjE0XFxcIiB5Mj1cXFwiMTFcXFwiPjwvbGluZT5cIixcInpvb20tb3V0XCI6XCI8Y2lyY2xlIGN4PVxcXCIxMVxcXCIgY3k9XFxcIjExXFxcIiByPVxcXCI4XFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiMjFcXFwiIHkxPVxcXCIyMVxcXCIgeDI9XFxcIjE2LjY1XFxcIiB5Mj1cXFwiMTYuNjVcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiOFxcXCIgeTE9XFxcIjExXFxcIiB4Mj1cXFwiMTRcXFwiIHkyPVxcXCIxMVxcXCI+PC9saW5lPlwifTtcblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY2xhc3NuYW1lcy9kZWR1cGUuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY2xhc3NuYW1lcy9kZWR1cGUuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxudmFyIF9fV0VCUEFDS19BTURfREVGSU5FX0FSUkFZX18sIF9fV0VCUEFDS19BTURfREVGSU5FX1JFU1VMVF9fOy8qIVxuICBDb3B5cmlnaHQgKGMpIDIwMTYgSmVkIFdhdHNvbi5cbiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIChNSVQpLCBzZWVcbiAgaHR0cDovL2plZHdhdHNvbi5naXRodWIuaW8vY2xhc3NuYW1lc1xuKi9cbi8qIGdsb2JhbCBkZWZpbmUgKi9cblxuKGZ1bmN0aW9uICgpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBjbGFzc05hbWVzID0gKGZ1bmN0aW9uICgpIHtcblx0XHQvLyBkb24ndCBpbmhlcml0IGZyb20gT2JqZWN0IHNvIHdlIGNhbiBza2lwIGhhc093blByb3BlcnR5IGNoZWNrIGxhdGVyXG5cdFx0Ly8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNTUxODMyOC9jcmVhdGluZy1qcy1vYmplY3Qtd2l0aC1vYmplY3QtY3JlYXRlbnVsbCNhbnN3ZXItMjEwNzkyMzJcblx0XHRmdW5jdGlvbiBTdG9yYWdlT2JqZWN0KCkge31cblx0XHRTdG9yYWdlT2JqZWN0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cblx0XHRmdW5jdGlvbiBfcGFyc2VBcnJheSAocmVzdWx0U2V0LCBhcnJheSkge1xuXHRcdFx0dmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuXHRcdFx0XHRfcGFyc2UocmVzdWx0U2V0LCBhcnJheVtpXSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dmFyIGhhc093biA9IHt9Lmhhc093blByb3BlcnR5O1xuXG5cdFx0ZnVuY3Rpb24gX3BhcnNlTnVtYmVyIChyZXN1bHRTZXQsIG51bSkge1xuXHRcdFx0cmVzdWx0U2V0W251bV0gPSB0cnVlO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIF9wYXJzZU9iamVjdCAocmVzdWx0U2V0LCBvYmplY3QpIHtcblx0XHRcdGZvciAodmFyIGsgaW4gb2JqZWN0KSB7XG5cdFx0XHRcdGlmIChoYXNPd24uY2FsbChvYmplY3QsIGspKSB7XG5cdFx0XHRcdFx0Ly8gc2V0IHZhbHVlIHRvIGZhbHNlIGluc3RlYWQgb2YgZGVsZXRpbmcgaXQgdG8gYXZvaWQgY2hhbmdpbmcgb2JqZWN0IHN0cnVjdHVyZVxuXHRcdFx0XHRcdC8vIGh0dHBzOi8vd3d3LnNtYXNoaW5nbWFnYXppbmUuY29tLzIwMTIvMTEvd3JpdGluZy1mYXN0LW1lbW9yeS1lZmZpY2llbnQtamF2YXNjcmlwdC8jZGUtcmVmZXJlbmNpbmctbWlzY29uY2VwdGlvbnNcblx0XHRcdFx0XHRyZXN1bHRTZXRba10gPSAhIW9iamVjdFtrXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHZhciBTUEFDRSA9IC9cXHMrLztcblx0XHRmdW5jdGlvbiBfcGFyc2VTdHJpbmcgKHJlc3VsdFNldCwgc3RyKSB7XG5cdFx0XHR2YXIgYXJyYXkgPSBzdHIuc3BsaXQoU1BBQ0UpO1xuXHRcdFx0dmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuXHRcdFx0XHRyZXN1bHRTZXRbYXJyYXlbaV1dID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBfcGFyc2UgKHJlc3VsdFNldCwgYXJnKSB7XG5cdFx0XHRpZiAoIWFyZykgcmV0dXJuO1xuXHRcdFx0dmFyIGFyZ1R5cGUgPSB0eXBlb2YgYXJnO1xuXG5cdFx0XHQvLyAnZm9vIGJhcidcblx0XHRcdGlmIChhcmdUeXBlID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRfcGFyc2VTdHJpbmcocmVzdWx0U2V0LCBhcmcpO1xuXG5cdFx0XHQvLyBbJ2ZvbycsICdiYXInLCAuLi5dXG5cdFx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoYXJnKSkge1xuXHRcdFx0XHRfcGFyc2VBcnJheShyZXN1bHRTZXQsIGFyZyk7XG5cblx0XHRcdC8vIHsgJ2Zvbyc6IHRydWUsIC4uLiB9XG5cdFx0XHR9IGVsc2UgaWYgKGFyZ1R5cGUgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdF9wYXJzZU9iamVjdChyZXN1bHRTZXQsIGFyZyk7XG5cblx0XHRcdC8vICcxMzAnXG5cdFx0XHR9IGVsc2UgaWYgKGFyZ1R5cGUgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdF9wYXJzZU51bWJlcihyZXN1bHRTZXQsIGFyZyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gX2NsYXNzTmFtZXMgKCkge1xuXHRcdFx0Ly8gZG9uJ3QgbGVhayBhcmd1bWVudHNcblx0XHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9wZXRrYWFudG9ub3YvYmx1ZWJpcmQvd2lraS9PcHRpbWl6YXRpb24ta2lsbGVycyMzMi1sZWFraW5nLWFyZ3VtZW50c1xuXHRcdFx0dmFyIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG5cdFx0XHR2YXIgYXJncyA9IEFycmF5KGxlbik7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRcdGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG5cdFx0XHR9XG5cblx0XHRcdHZhciBjbGFzc1NldCA9IG5ldyBTdG9yYWdlT2JqZWN0KCk7XG5cdFx0XHRfcGFyc2VBcnJheShjbGFzc1NldCwgYXJncyk7XG5cblx0XHRcdHZhciBsaXN0ID0gW107XG5cblx0XHRcdGZvciAodmFyIGsgaW4gY2xhc3NTZXQpIHtcblx0XHRcdFx0aWYgKGNsYXNzU2V0W2tdKSB7XG5cdFx0XHRcdFx0bGlzdC5wdXNoKGspXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGxpc3Quam9pbignICcpO1xuXHRcdH1cblxuXHRcdHJldHVybiBfY2xhc3NOYW1lcztcblx0fSkoKTtcblxuXHRpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGNsYXNzTmFtZXM7XG5cdH0gZWxzZSBpZiAodHJ1ZSkge1xuXHRcdC8vIHJlZ2lzdGVyIGFzICdjbGFzc25hbWVzJywgY29uc2lzdGVudCB3aXRoIG5wbSBwYWNrYWdlIG5hbWVcblx0XHQhKF9fV0VCUEFDS19BTURfREVGSU5FX0FSUkFZX18gPSBbXSwgX19XRUJQQUNLX0FNRF9ERUZJTkVfUkVTVUxUX18gPSAoZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGNsYXNzTmFtZXM7XG5cdFx0fSkuYXBwbHkoZXhwb3J0cywgX19XRUJQQUNLX0FNRF9ERUZJTkVfQVJSQVlfXyksXG5cdFx0XHRcdF9fV0VCUEFDS19BTURfREVGSU5FX1JFU1VMVF9fICE9PSB1bmRlZmluZWQgJiYgKG1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0FNRF9ERUZJTkVfUkVTVUxUX18pKTtcblx0fSBlbHNlIHt9XG59KCkpO1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvZm4vYXJyYXkvZnJvbS5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9mbi9hcnJheS9mcm9tLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5fX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuLi8uLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3IgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvci5qc1wiKTtcbl9fd2VicGFja19yZXF1aXJlX18oLyohIC4uLy4uL21vZHVsZXMvZXM2LmFycmF5LmZyb20gKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmZyb20uanNcIik7XG5tb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4uLy4uL21vZHVsZXMvX2NvcmUgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanNcIikuQXJyYXkuZnJvbTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2EtZnVuY3Rpb24uanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYS1mdW5jdGlvbi5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKHR5cGVvZiBpdCAhPSAnZnVuY3Rpb24nKSB0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYW4tb2JqZWN0LmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYW4tb2JqZWN0LmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbnZhciBpc09iamVjdCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2lzLW9iamVjdCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXMtb2JqZWN0LmpzXCIpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKCFpc09iamVjdChpdCkpIHRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGFuIG9iamVjdCEnKTtcbiAgcmV0dXJuIGl0O1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2FycmF5LWluY2x1ZGVzLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbi8vIGZhbHNlIC0+IEFycmF5I2luZGV4T2Zcbi8vIHRydWUgIC0+IEFycmF5I2luY2x1ZGVzXG52YXIgdG9JT2JqZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fdG8taW9iamVjdCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8taW9iamVjdC5qc1wiKTtcbnZhciB0b0xlbmd0aCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX3RvLWxlbmd0aCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8tbGVuZ3RoLmpzXCIpO1xudmFyIHRvQWJzb2x1dGVJbmRleCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX3RvLWFic29sdXRlLWluZGV4ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1hYnNvbHV0ZS1pbmRleC5qc1wiKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKElTX0lOQ0xVREVTKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoJHRoaXMsIGVsLCBmcm9tSW5kZXgpIHtcbiAgICB2YXIgTyA9IHRvSU9iamVjdCgkdGhpcyk7XG4gICAgdmFyIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKTtcbiAgICB2YXIgaW5kZXggPSB0b0Fic29sdXRlSW5kZXgoZnJvbUluZGV4LCBsZW5ndGgpO1xuICAgIHZhciB2YWx1ZTtcbiAgICAvLyBBcnJheSNpbmNsdWRlcyB1c2VzIFNhbWVWYWx1ZVplcm8gZXF1YWxpdHkgYWxnb3JpdGhtXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgIGlmIChJU19JTkNMVURFUyAmJiBlbCAhPSBlbCkgd2hpbGUgKGxlbmd0aCA+IGluZGV4KSB7XG4gICAgICB2YWx1ZSA9IE9baW5kZXgrK107XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgICBpZiAodmFsdWUgIT0gdmFsdWUpIHJldHVybiB0cnVlO1xuICAgIC8vIEFycmF5I2luZGV4T2YgaWdub3JlcyBob2xlcywgQXJyYXkjaW5jbHVkZXMgLSBub3RcbiAgICB9IGVsc2UgZm9yICg7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspIGlmIChJU19JTkNMVURFUyB8fCBpbmRleCBpbiBPKSB7XG4gICAgICBpZiAoT1tpbmRleF0gPT09IGVsKSByZXR1cm4gSVNfSU5DTFVERVMgfHwgaW5kZXggfHwgMDtcbiAgICB9IHJldHVybiAhSVNfSU5DTFVERVMgJiYgLTE7XG4gIH07XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY2xhc3NvZi5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jbGFzc29mLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG4vLyBnZXR0aW5nIHRhZyBmcm9tIDE5LjEuMy42IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcoKVxudmFyIGNvZiA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2NvZiAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY29mLmpzXCIpO1xudmFyIFRBRyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX3drcyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fd2tzLmpzXCIpKCd0b1N0cmluZ1RhZycpO1xuLy8gRVMzIHdyb25nIGhlcmVcbnZhciBBUkcgPSBjb2YoZnVuY3Rpb24gKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID09ICdBcmd1bWVudHMnO1xuXG4vLyBmYWxsYmFjayBmb3IgSUUxMSBTY3JpcHQgQWNjZXNzIERlbmllZCBlcnJvclxudmFyIHRyeUdldCA9IGZ1bmN0aW9uIChpdCwga2V5KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGl0W2tleV07XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgdmFyIE8sIFQsIEI7XG4gIHJldHVybiBpdCA9PT0gdW5kZWZpbmVkID8gJ1VuZGVmaW5lZCcgOiBpdCA9PT0gbnVsbCA/ICdOdWxsJ1xuICAgIC8vIEBAdG9TdHJpbmdUYWcgY2FzZVxuICAgIDogdHlwZW9mIChUID0gdHJ5R2V0KE8gPSBPYmplY3QoaXQpLCBUQUcpKSA9PSAnc3RyaW5nJyA/IFRcbiAgICAvLyBidWlsdGluVGFnIGNhc2VcbiAgICA6IEFSRyA/IGNvZihPKVxuICAgIC8vIEVTMyBhcmd1bWVudHMgZmFsbGJhY2tcbiAgICA6IChCID0gY29mKE8pKSA9PSAnT2JqZWN0JyAmJiB0eXBlb2YgTy5jYWxsZWUgPT0gJ2Z1bmN0aW9uJyA/ICdBcmd1bWVudHMnIDogQjtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jb2YuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jb2YuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxudmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY29yZS5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jb3JlLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG52YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0geyB2ZXJzaW9uOiAnMi41LjMnIH07XG5pZiAodHlwZW9mIF9fZSA9PSAnbnVtYmVyJykgX19lID0gY29yZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY3JlYXRlLXByb3BlcnR5LmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY3JlYXRlLXByb3BlcnR5LmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgJGRlZmluZVByb3BlcnR5ID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fb2JqZWN0LWRwICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHAuanNcIik7XG52YXIgY3JlYXRlRGVzYyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX3Byb3BlcnR5LWRlc2MgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3Byb3BlcnR5LWRlc2MuanNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iamVjdCwgaW5kZXgsIHZhbHVlKSB7XG4gIGlmIChpbmRleCBpbiBvYmplY3QpICRkZWZpbmVQcm9wZXJ0eS5mKG9iamVjdCwgaW5kZXgsIGNyZWF0ZURlc2MoMCwgdmFsdWUpKTtcbiAgZWxzZSBvYmplY3RbaW5kZXhdID0gdmFsdWU7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY3R4LmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY3R4LmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFGdW5jdGlvbiA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2EtZnVuY3Rpb24gKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2EtZnVuY3Rpb24uanNcIik7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmbiwgdGhhdCwgbGVuZ3RoKSB7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmICh0aGF0ID09PSB1bmRlZmluZWQpIHJldHVybiBmbjtcbiAgc3dpdGNoIChsZW5ndGgpIHtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbiAoYSkge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKC8qIC4uLmFyZ3MgKi8pIHtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2RlZmluZWQuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbi8vIDcuMi4xIFJlcXVpcmVPYmplY3RDb2VyY2libGUoYXJndW1lbnQpXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoaXQgPT0gdW5kZWZpbmVkKSB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kZXNjcmlwdG9ycy5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZGVzY3JpcHRvcnMuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG4vLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19mYWlscyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZmFpbHMuanNcIikoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnYScsIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiA3OyB9IH0pLmEgIT0gNztcbn0pO1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZG9tLWNyZWF0ZS5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kb20tY3JlYXRlLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgaXNPYmplY3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19pcy1vYmplY3QgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2lzLW9iamVjdC5qc1wiKTtcbnZhciBkb2N1bWVudCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2dsb2JhbCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZ2xvYmFsLmpzXCIpLmRvY3VtZW50O1xuLy8gdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCcgaW4gb2xkIElFXG52YXIgaXMgPSBpc09iamVjdChkb2N1bWVudCkgJiYgaXNPYmplY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2VudW0tYnVnLWtleXMuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZW51bS1idWcta2V5cy5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuLy8gSUUgOC0gZG9uJ3QgZW51bSBidWcga2V5c1xubW9kdWxlLmV4cG9ydHMgPSAoXG4gICdjb25zdHJ1Y3RvcixoYXNPd25Qcm9wZXJ0eSxpc1Byb3RvdHlwZU9mLHByb3BlcnR5SXNFbnVtZXJhYmxlLHRvTG9jYWxlU3RyaW5nLHRvU3RyaW5nLHZhbHVlT2YnXG4pLnNwbGl0KCcsJyk7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19leHBvcnQuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19leHBvcnQuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxudmFyIGdsb2JhbCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2dsb2JhbCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZ2xvYmFsLmpzXCIpO1xudmFyIGNvcmUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19jb3JlICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jb3JlLmpzXCIpO1xudmFyIGhpZGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19oaWRlICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzXCIpO1xudmFyIHJlZGVmaW5lID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fcmVkZWZpbmUgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3JlZGVmaW5lLmpzXCIpO1xudmFyIGN0eCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2N0eCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY3R4LmpzXCIpO1xudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG52YXIgJGV4cG9ydCA9IGZ1bmN0aW9uICh0eXBlLCBuYW1lLCBzb3VyY2UpIHtcbiAgdmFyIElTX0ZPUkNFRCA9IHR5cGUgJiAkZXhwb3J0LkY7XG4gIHZhciBJU19HTE9CQUwgPSB0eXBlICYgJGV4cG9ydC5HO1xuICB2YXIgSVNfU1RBVElDID0gdHlwZSAmICRleHBvcnQuUztcbiAgdmFyIElTX1BST1RPID0gdHlwZSAmICRleHBvcnQuUDtcbiAgdmFyIElTX0JJTkQgPSB0eXBlICYgJGV4cG9ydC5CO1xuICB2YXIgdGFyZ2V0ID0gSVNfR0xPQkFMID8gZ2xvYmFsIDogSVNfU1RBVElDID8gZ2xvYmFsW25hbWVdIHx8IChnbG9iYWxbbmFtZV0gPSB7fSkgOiAoZ2xvYmFsW25hbWVdIHx8IHt9KVtQUk9UT1RZUEVdO1xuICB2YXIgZXhwb3J0cyA9IElTX0dMT0JBTCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pO1xuICB2YXIgZXhwUHJvdG8gPSBleHBvcnRzW1BST1RPVFlQRV0gfHwgKGV4cG9ydHNbUFJPVE9UWVBFXSA9IHt9KTtcbiAgdmFyIGtleSwgb3duLCBvdXQsIGV4cDtcbiAgaWYgKElTX0dMT0JBTCkgc291cmNlID0gbmFtZTtcbiAgZm9yIChrZXkgaW4gc291cmNlKSB7XG4gICAgLy8gY29udGFpbnMgaW4gbmF0aXZlXG4gICAgb3duID0gIUlTX0ZPUkNFRCAmJiB0YXJnZXQgJiYgdGFyZ2V0W2tleV0gIT09IHVuZGVmaW5lZDtcbiAgICAvLyBleHBvcnQgbmF0aXZlIG9yIHBhc3NlZFxuICAgIG91dCA9IChvd24gPyB0YXJnZXQgOiBzb3VyY2UpW2tleV07XG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICBleHAgPSBJU19CSU5EICYmIG93biA/IGN0eChvdXQsIGdsb2JhbCkgOiBJU19QUk9UTyAmJiB0eXBlb2Ygb3V0ID09ICdmdW5jdGlvbicgPyBjdHgoRnVuY3Rpb24uY2FsbCwgb3V0KSA6IG91dDtcbiAgICAvLyBleHRlbmQgZ2xvYmFsXG4gICAgaWYgKHRhcmdldCkgcmVkZWZpbmUodGFyZ2V0LCBrZXksIG91dCwgdHlwZSAmICRleHBvcnQuVSk7XG4gICAgLy8gZXhwb3J0XG4gICAgaWYgKGV4cG9ydHNba2V5XSAhPSBvdXQpIGhpZGUoZXhwb3J0cywga2V5LCBleHApO1xuICAgIGlmIChJU19QUk9UTyAmJiBleHBQcm90b1trZXldICE9IG91dCkgZXhwUHJvdG9ba2V5XSA9IG91dDtcbiAgfVxufTtcbmdsb2JhbC5jb3JlID0gY29yZTtcbi8vIHR5cGUgYml0bWFwXG4kZXhwb3J0LkYgPSAxOyAgIC8vIGZvcmNlZFxuJGV4cG9ydC5HID0gMjsgICAvLyBnbG9iYWxcbiRleHBvcnQuUyA9IDQ7ICAgLy8gc3RhdGljXG4kZXhwb3J0LlAgPSA4OyAgIC8vIHByb3RvXG4kZXhwb3J0LkIgPSAxNjsgIC8vIGJpbmRcbiRleHBvcnQuVyA9IDMyOyAgLy8gd3JhcFxuJGV4cG9ydC5VID0gNjQ7ICAvLyBzYWZlXG4kZXhwb3J0LlIgPSAxMjg7IC8vIHJlYWwgcHJvdG8gbWV0aG9kIGZvciBgbGlicmFyeWBcbm1vZHVsZS5leHBvcnRzID0gJGV4cG9ydDtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2ZhaWxzLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19mYWlscy5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4ZWMpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gISFleGVjKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2dsb2JhbC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2dsb2JhbC5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTExNTc1OTAyOFxudmFyIGdsb2JhbCA9IG1vZHVsZS5leHBvcnRzID0gdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuTWF0aCA9PSBNYXRoXG4gID8gd2luZG93IDogdHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgJiYgc2VsZi5NYXRoID09IE1hdGggPyBzZWxmXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1uZXctZnVuY1xuICA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5pZiAodHlwZW9mIF9fZyA9PSAnbnVtYmVyJykgX19nID0gZ2xvYmFsOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oYXMuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oYXMuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxudmFyIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwga2V5KSB7XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2hpZGUuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faGlkZS5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxudmFyIGRQID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fb2JqZWN0LWRwICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHAuanNcIik7XG52YXIgY3JlYXRlRGVzYyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX3Byb3BlcnR5LWRlc2MgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3Byb3BlcnR5LWRlc2MuanNcIik7XG5tb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2Rlc2NyaXB0b3JzICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kZXNjcmlwdG9ycy5qc1wiKSA/IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIGRQLmYob2JqZWN0LCBrZXksIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbn0gOiBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faHRtbC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19odG1sLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgZG9jdW1lbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19nbG9iYWwgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2dsb2JhbC5qc1wiKS5kb2N1bWVudDtcbm1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faWU4LWRvbS1kZWZpbmUuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2llOC1kb20tZGVmaW5lLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxubW9kdWxlLmV4cG9ydHMgPSAhX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fZGVzY3JpcHRvcnMgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzXCIpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19mYWlscyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZmFpbHMuanNcIikoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2RvbS1jcmVhdGUgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2RvbS1jcmVhdGUuanNcIikoJ2RpdicpLCAnYScsIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiA3OyB9IH0pLmEgIT0gNztcbn0pO1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faW9iamVjdC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pb2JqZWN0LmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG4vLyBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIGFuZCBub24tZW51bWVyYWJsZSBvbGQgVjggc3RyaW5nc1xudmFyIGNvZiA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2NvZiAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY29mLmpzXCIpO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKSA/IE9iamVjdCA6IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gY29mKGl0KSA9PSAnU3RyaW5nJyA/IGl0LnNwbGl0KCcnKSA6IE9iamVjdChpdCk7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXMtYXJyYXktaXRlci5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pcy1hcnJheS1pdGVyLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG4vLyBjaGVjayBvbiBkZWZhdWx0IEFycmF5IGl0ZXJhdG9yXG52YXIgSXRlcmF0b3JzID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9faXRlcmF0b3JzICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pdGVyYXRvcnMuanNcIik7XG52YXIgSVRFUkFUT1IgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL193a3MgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3drcy5qc1wiKSgnaXRlcmF0b3InKTtcbnZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgIT09IHVuZGVmaW5lZCAmJiAoSXRlcmF0b3JzLkFycmF5ID09PSBpdCB8fCBBcnJheVByb3RvW0lURVJBVE9SXSA9PT0gaXQpO1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2lzLW9iamVjdC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2lzLW9iamVjdC5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gdHlwZW9mIGl0ID09PSAnb2JqZWN0JyA/IGl0ICE9PSBudWxsIDogdHlwZW9mIGl0ID09PSAnZnVuY3Rpb24nO1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXItY2FsbC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXItY2FsbC5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG4vLyBjYWxsIHNvbWV0aGluZyBvbiBpdGVyYXRvciBzdGVwIHdpdGggc2FmZSBjbG9zaW5nIG9uIGVycm9yXG52YXIgYW5PYmplY3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19hbi1vYmplY3QgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2FuLW9iamVjdC5qc1wiKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCBmbiwgdmFsdWUsIGVudHJpZXMpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZW50cmllcyA/IGZuKGFuT2JqZWN0KHZhbHVlKVswXSwgdmFsdWVbMV0pIDogZm4odmFsdWUpO1xuICAvLyA3LjQuNiBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yLCBjb21wbGV0aW9uKVxuICB9IGNhdGNoIChlKSB7XG4gICAgdmFyIHJldCA9IGl0ZXJhdG9yWydyZXR1cm4nXTtcbiAgICBpZiAocmV0ICE9PSB1bmRlZmluZWQpIGFuT2JqZWN0KHJldC5jYWxsKGl0ZXJhdG9yKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXItY3JlYXRlLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pdGVyLWNyZWF0ZS5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgY3JlYXRlID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fb2JqZWN0LWNyZWF0ZSAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWNyZWF0ZS5qc1wiKTtcbnZhciBkZXNjcmlwdG9yID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fcHJvcGVydHktZGVzYyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qc1wiKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX3NldC10by1zdHJpbmctdGFnICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zZXQtdG8tc3RyaW5nLXRhZy5qc1wiKTtcbnZhciBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuXG4vLyAyNS4xLjIuMS4xICVJdGVyYXRvclByb3RvdHlwZSVbQEBpdGVyYXRvcl0oKVxuX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9faGlkZSAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faGlkZS5qc1wiKShJdGVyYXRvclByb3RvdHlwZSwgX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fd2tzICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL193a3MuanNcIikoJ2l0ZXJhdG9yJyksIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCkge1xuICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSBjcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUsIHsgbmV4dDogZGVzY3JpcHRvcigxLCBuZXh0KSB9KTtcbiAgc2V0VG9TdHJpbmdUYWcoQ29uc3RydWN0b3IsIE5BTUUgKyAnIEl0ZXJhdG9yJyk7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXRlci1kZWZpbmUuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXItZGVmaW5lLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBMSUJSQVJZID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fbGlicmFyeSAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fbGlicmFyeS5qc1wiKTtcbnZhciAkZXhwb3J0ID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fZXhwb3J0ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19leHBvcnQuanNcIik7XG52YXIgcmVkZWZpbmUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19yZWRlZmluZSAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcmVkZWZpbmUuanNcIik7XG52YXIgaGlkZSA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2hpZGUgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2hpZGUuanNcIik7XG52YXIgaGFzID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9faGFzICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oYXMuanNcIik7XG52YXIgSXRlcmF0b3JzID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9faXRlcmF0b3JzICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pdGVyYXRvcnMuanNcIik7XG52YXIgJGl0ZXJDcmVhdGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19pdGVyLWNyZWF0ZSAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXRlci1jcmVhdGUuanNcIik7XG52YXIgc2V0VG9TdHJpbmdUYWcgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19zZXQtdG8tc3RyaW5nLXRhZyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fc2V0LXRvLXN0cmluZy10YWcuanNcIik7XG52YXIgZ2V0UHJvdG90eXBlT2YgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19vYmplY3QtZ3BvICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ3BvLmpzXCIpO1xudmFyIElURVJBVE9SID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fd2tzICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL193a3MuanNcIikoJ2l0ZXJhdG9yJyk7XG52YXIgQlVHR1kgPSAhKFtdLmtleXMgJiYgJ25leHQnIGluIFtdLmtleXMoKSk7IC8vIFNhZmFyaSBoYXMgYnVnZ3kgaXRlcmF0b3JzIHcvbyBgbmV4dGBcbnZhciBGRl9JVEVSQVRPUiA9ICdAQGl0ZXJhdG9yJztcbnZhciBLRVlTID0gJ2tleXMnO1xudmFyIFZBTFVFUyA9ICd2YWx1ZXMnO1xuXG52YXIgcmV0dXJuVGhpcyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEJhc2UsIE5BTUUsIENvbnN0cnVjdG9yLCBuZXh0LCBERUZBVUxULCBJU19TRVQsIEZPUkNFRCkge1xuICAkaXRlckNyZWF0ZShDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCk7XG4gIHZhciBnZXRNZXRob2QgPSBmdW5jdGlvbiAoa2luZCkge1xuICAgIGlmICghQlVHR1kgJiYga2luZCBpbiBwcm90bykgcmV0dXJuIHByb3RvW2tpbmRdO1xuICAgIHN3aXRjaCAoa2luZCkge1xuICAgICAgY2FzZSBLRVlTOiByZXR1cm4gZnVuY3Rpb24ga2V5cygpIHsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgICAgIGNhc2UgVkFMVUVTOiByZXR1cm4gZnVuY3Rpb24gdmFsdWVzKCkgeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICAgIH0gcmV0dXJuIGZ1bmN0aW9uIGVudHJpZXMoKSB7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gIH07XG4gIHZhciBUQUcgPSBOQU1FICsgJyBJdGVyYXRvcic7XG4gIHZhciBERUZfVkFMVUVTID0gREVGQVVMVCA9PSBWQUxVRVM7XG4gIHZhciBWQUxVRVNfQlVHID0gZmFsc2U7XG4gIHZhciBwcm90byA9IEJhc2UucHJvdG90eXBlO1xuICB2YXIgJG5hdGl2ZSA9IHByb3RvW0lURVJBVE9SXSB8fCBwcm90b1tGRl9JVEVSQVRPUl0gfHwgREVGQVVMVCAmJiBwcm90b1tERUZBVUxUXTtcbiAgdmFyICRkZWZhdWx0ID0gKCFCVUdHWSAmJiAkbmF0aXZlKSB8fCBnZXRNZXRob2QoREVGQVVMVCk7XG4gIHZhciAkZW50cmllcyA9IERFRkFVTFQgPyAhREVGX1ZBTFVFUyA/ICRkZWZhdWx0IDogZ2V0TWV0aG9kKCdlbnRyaWVzJykgOiB1bmRlZmluZWQ7XG4gIHZhciAkYW55TmF0aXZlID0gTkFNRSA9PSAnQXJyYXknID8gcHJvdG8uZW50cmllcyB8fCAkbmF0aXZlIDogJG5hdGl2ZTtcbiAgdmFyIG1ldGhvZHMsIGtleSwgSXRlcmF0b3JQcm90b3R5cGU7XG4gIC8vIEZpeCBuYXRpdmVcbiAgaWYgKCRhbnlOYXRpdmUpIHtcbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvdHlwZU9mKCRhbnlOYXRpdmUuY2FsbChuZXcgQmFzZSgpKSk7XG4gICAgaWYgKEl0ZXJhdG9yUHJvdG90eXBlICE9PSBPYmplY3QucHJvdG90eXBlICYmIEl0ZXJhdG9yUHJvdG90eXBlLm5leHQpIHtcbiAgICAgIC8vIFNldCBAQHRvU3RyaW5nVGFnIHRvIG5hdGl2ZSBpdGVyYXRvcnNcbiAgICAgIHNldFRvU3RyaW5nVGFnKEl0ZXJhdG9yUHJvdG90eXBlLCBUQUcsIHRydWUpO1xuICAgICAgLy8gZml4IGZvciBzb21lIG9sZCBlbmdpbmVzXG4gICAgICBpZiAoIUxJQlJBUlkgJiYgIWhhcyhJdGVyYXRvclByb3RvdHlwZSwgSVRFUkFUT1IpKSBoaWRlKEl0ZXJhdG9yUHJvdG90eXBlLCBJVEVSQVRPUiwgcmV0dXJuVGhpcyk7XG4gICAgfVxuICB9XG4gIC8vIGZpeCBBcnJheSN7dmFsdWVzLCBAQGl0ZXJhdG9yfS5uYW1lIGluIFY4IC8gRkZcbiAgaWYgKERFRl9WQUxVRVMgJiYgJG5hdGl2ZSAmJiAkbmF0aXZlLm5hbWUgIT09IFZBTFVFUykge1xuICAgIFZBTFVFU19CVUcgPSB0cnVlO1xuICAgICRkZWZhdWx0ID0gZnVuY3Rpb24gdmFsdWVzKCkgeyByZXR1cm4gJG5hdGl2ZS5jYWxsKHRoaXMpOyB9O1xuICB9XG4gIC8vIERlZmluZSBpdGVyYXRvclxuICBpZiAoKCFMSUJSQVJZIHx8IEZPUkNFRCkgJiYgKEJVR0dZIHx8IFZBTFVFU19CVUcgfHwgIXByb3RvW0lURVJBVE9SXSkpIHtcbiAgICBoaWRlKHByb3RvLCBJVEVSQVRPUiwgJGRlZmF1bHQpO1xuICB9XG4gIC8vIFBsdWcgZm9yIGxpYnJhcnlcbiAgSXRlcmF0b3JzW05BTUVdID0gJGRlZmF1bHQ7XG4gIEl0ZXJhdG9yc1tUQUddID0gcmV0dXJuVGhpcztcbiAgaWYgKERFRkFVTFQpIHtcbiAgICBtZXRob2RzID0ge1xuICAgICAgdmFsdWVzOiBERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoVkFMVUVTKSxcbiAgICAgIGtleXM6IElTX1NFVCA/ICRkZWZhdWx0IDogZ2V0TWV0aG9kKEtFWVMpLFxuICAgICAgZW50cmllczogJGVudHJpZXNcbiAgICB9O1xuICAgIGlmIChGT1JDRUQpIGZvciAoa2V5IGluIG1ldGhvZHMpIHtcbiAgICAgIGlmICghKGtleSBpbiBwcm90bykpIHJlZGVmaW5lKHByb3RvLCBrZXksIG1ldGhvZHNba2V5XSk7XG4gICAgfSBlbHNlICRleHBvcnQoJGV4cG9ydC5QICsgJGV4cG9ydC5GICogKEJVR0dZIHx8IFZBTFVFU19CVUcpLCBOQU1FLCBtZXRob2RzKTtcbiAgfVxuICByZXR1cm4gbWV0aG9kcztcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pdGVyLWRldGVjdC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXRlci1kZXRlY3QuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgSVRFUkFUT1IgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL193a3MgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3drcy5qc1wiKSgnaXRlcmF0b3InKTtcbnZhciBTQUZFX0NMT1NJTkcgPSBmYWxzZTtcblxudHJ5IHtcbiAgdmFyIHJpdGVyID0gWzddW0lURVJBVE9SXSgpO1xuICByaXRlclsncmV0dXJuJ10gPSBmdW5jdGlvbiAoKSB7IFNBRkVfQ0xPU0lORyA9IHRydWU7IH07XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby10aHJvdy1saXRlcmFsXG4gIEFycmF5LmZyb20ocml0ZXIsIGZ1bmN0aW9uICgpIHsgdGhyb3cgMjsgfSk7XG59IGNhdGNoIChlKSB7IC8qIGVtcHR5ICovIH1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhlYywgc2tpcENsb3NpbmcpIHtcbiAgaWYgKCFza2lwQ2xvc2luZyAmJiAhU0FGRV9DTE9TSU5HKSByZXR1cm4gZmFsc2U7XG4gIHZhciBzYWZlID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgdmFyIGFyciA9IFs3XTtcbiAgICB2YXIgaXRlciA9IGFycltJVEVSQVRPUl0oKTtcbiAgICBpdGVyLm5leHQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB7IGRvbmU6IHNhZmUgPSB0cnVlIH07IH07XG4gICAgYXJyW0lURVJBVE9SXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGl0ZXI7IH07XG4gICAgZXhlYyhhcnIpO1xuICB9IGNhdGNoIChlKSB7IC8qIGVtcHR5ICovIH1cbiAgcmV0dXJuIHNhZmU7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXRlcmF0b3JzLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXRlcmF0b3JzLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0ge307XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19saWJyYXJ5LmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2xpYnJhcnkuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0gZmFsc2U7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtY3JlYXRlLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1jcmVhdGUuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbi8vIDE5LjEuMi4yIC8gMTUuMi4zLjUgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxudmFyIGFuT2JqZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fYW4tb2JqZWN0ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanNcIik7XG52YXIgZFBzID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fb2JqZWN0LWRwcyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwcy5qc1wiKTtcbnZhciBlbnVtQnVnS2V5cyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2VudW0tYnVnLWtleXMgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2VudW0tYnVnLWtleXMuanNcIik7XG52YXIgSUVfUFJPVE8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19zaGFyZWQta2V5ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zaGFyZWQta2V5LmpzXCIpKCdJRV9QUk9UTycpO1xudmFyIEVtcHR5ID0gZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9O1xudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggZmFrZSBgbnVsbGAgcHJvdG90eXBlOiB1c2UgaWZyYW1lIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXG52YXIgY3JlYXRlRGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gVGhyYXNoLCB3YXN0ZSBhbmQgc29kb215OiBJRSBHQyBidWdcbiAgdmFyIGlmcmFtZSA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2RvbS1jcmVhdGUgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2RvbS1jcmVhdGUuanNcIikoJ2lmcmFtZScpO1xuICB2YXIgaSA9IGVudW1CdWdLZXlzLmxlbmd0aDtcbiAgdmFyIGx0ID0gJzwnO1xuICB2YXIgZ3QgPSAnPic7XG4gIHZhciBpZnJhbWVEb2N1bWVudDtcbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2h0bWwgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2h0bWwuanNcIikuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgaWZyYW1lLnNyYyA9ICdqYXZhc2NyaXB0Oic7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2NyaXB0LXVybFxuICAvLyBjcmVhdGVEaWN0ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuT2JqZWN0O1xuICAvLyBodG1sLnJlbW92ZUNoaWxkKGlmcmFtZSk7XG4gIGlmcmFtZURvY3VtZW50ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XG4gIGlmcmFtZURvY3VtZW50Lm9wZW4oKTtcbiAgaWZyYW1lRG9jdW1lbnQud3JpdGUobHQgKyAnc2NyaXB0JyArIGd0ICsgJ2RvY3VtZW50LkY9T2JqZWN0JyArIGx0ICsgJy9zY3JpcHQnICsgZ3QpO1xuICBpZnJhbWVEb2N1bWVudC5jbG9zZSgpO1xuICBjcmVhdGVEaWN0ID0gaWZyYW1lRG9jdW1lbnQuRjtcbiAgd2hpbGUgKGktLSkgZGVsZXRlIGNyZWF0ZURpY3RbUFJPVE9UWVBFXVtlbnVtQnVnS2V5c1tpXV07XG4gIHJldHVybiBjcmVhdGVEaWN0KCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gY3JlYXRlKE8sIFByb3BlcnRpZXMpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKE8gIT09IG51bGwpIHtcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gYW5PYmplY3QoTyk7XG4gICAgcmVzdWx0ID0gbmV3IEVtcHR5KCk7XG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IG51bGw7XG4gICAgLy8gYWRkIFwiX19wcm90b19fXCIgZm9yIE9iamVjdC5nZXRQcm90b3R5cGVPZiBwb2x5ZmlsbFxuICAgIHJlc3VsdFtJRV9QUk9UT10gPSBPO1xuICB9IGVsc2UgcmVzdWx0ID0gY3JlYXRlRGljdCgpO1xuICByZXR1cm4gUHJvcGVydGllcyA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogZFBzKHJlc3VsdCwgUHJvcGVydGllcyk7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbnZhciBhbk9iamVjdCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2FuLW9iamVjdCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYW4tb2JqZWN0LmpzXCIpO1xudmFyIElFOF9ET01fREVGSU5FID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9faWU4LWRvbS1kZWZpbmUgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2llOC1kb20tZGVmaW5lLmpzXCIpO1xudmFyIHRvUHJpbWl0aXZlID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fdG8tcHJpbWl0aXZlICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1wcmltaXRpdmUuanNcIik7XG52YXIgZFAgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XG5cbmV4cG9ydHMuZiA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2Rlc2NyaXB0b3JzICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kZXNjcmlwdG9ycy5qc1wiKSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpIHtcbiAgYW5PYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgYW5PYmplY3QoQXR0cmlidXRlcyk7XG4gIGlmIChJRThfRE9NX0RFRklORSkgdHJ5IHtcbiAgICByZXR1cm4gZFAoTywgUCwgQXR0cmlidXRlcyk7XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuICBpZiAoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKSB0aHJvdyBUeXBlRXJyb3IoJ0FjY2Vzc29ycyBub3Qgc3VwcG9ydGVkIScpO1xuICBpZiAoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKSBPW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcbiAgcmV0dXJuIE87XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwcy5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHBzLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgZFAgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19vYmplY3QtZHAgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1kcC5qc1wiKTtcbnZhciBhbk9iamVjdCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2FuLW9iamVjdCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYW4tb2JqZWN0LmpzXCIpO1xudmFyIGdldEtleXMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19vYmplY3Qta2V5cyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWtleXMuanNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fZGVzY3JpcHRvcnMgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzXCIpID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpIHtcbiAgYW5PYmplY3QoTyk7XG4gIHZhciBrZXlzID0gZ2V0S2V5cyhQcm9wZXJ0aWVzKTtcbiAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICB2YXIgaSA9IDA7XG4gIHZhciBQO1xuICB3aGlsZSAobGVuZ3RoID4gaSkgZFAuZihPLCBQID0ga2V5c1tpKytdLCBQcm9wZXJ0aWVzW1BdKTtcbiAgcmV0dXJuIE87XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdwby5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ3BvLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG4vLyAxOS4xLjIuOSAvIDE1LjIuMy4yIE9iamVjdC5nZXRQcm90b3R5cGVPZihPKVxudmFyIGhhcyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2hhcyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faGFzLmpzXCIpO1xudmFyIHRvT2JqZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fdG8tb2JqZWN0ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1vYmplY3QuanNcIik7XG52YXIgSUVfUFJPVE8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19zaGFyZWQta2V5ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zaGFyZWQta2V5LmpzXCIpKCdJRV9QUk9UTycpO1xudmFyIE9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YgfHwgZnVuY3Rpb24gKE8pIHtcbiAgTyA9IHRvT2JqZWN0KE8pO1xuICBpZiAoaGFzKE8sIElFX1BST1RPKSkgcmV0dXJuIE9bSUVfUFJPVE9dO1xuICBpZiAodHlwZW9mIE8uY29uc3RydWN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBPIGluc3RhbmNlb2YgTy5jb25zdHJ1Y3Rvcikge1xuICAgIHJldHVybiBPLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcbiAgfSByZXR1cm4gTyBpbnN0YW5jZW9mIE9iamVjdCA/IE9iamVjdFByb3RvIDogbnVsbDtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWtleXMtaW50ZXJuYWwuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgaGFzID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9faGFzICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oYXMuanNcIik7XG52YXIgdG9JT2JqZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fdG8taW9iamVjdCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8taW9iamVjdC5qc1wiKTtcbnZhciBhcnJheUluZGV4T2YgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19hcnJheS1pbmNsdWRlcyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYXJyYXktaW5jbHVkZXMuanNcIikoZmFsc2UpO1xudmFyIElFX1BST1RPID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fc2hhcmVkLWtleSAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLWtleS5qc1wiKSgnSUVfUFJPVE8nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lcykge1xuICB2YXIgTyA9IHRvSU9iamVjdChvYmplY3QpO1xuICB2YXIgaSA9IDA7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFyIGtleTtcbiAgZm9yIChrZXkgaW4gTykgaWYgKGtleSAhPSBJRV9QUk9UTykgaGFzKE8sIGtleSkgJiYgcmVzdWx0LnB1c2goa2V5KTtcbiAgLy8gRG9uJ3QgZW51bSBidWcgJiBoaWRkZW4ga2V5c1xuICB3aGlsZSAobmFtZXMubGVuZ3RoID4gaSkgaWYgKGhhcyhPLCBrZXkgPSBuYW1lc1tpKytdKSkge1xuICAgIH5hcnJheUluZGV4T2YocmVzdWx0LCBrZXkpIHx8IHJlc3VsdC5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWtleXMuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG4vLyAxOS4xLjIuMTQgLyAxNS4yLjMuMTQgT2JqZWN0LmtleXMoTylcbnZhciAka2V5cyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX29iamVjdC1rZXlzLWludGVybmFsICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qc1wiKTtcbnZhciBlbnVtQnVnS2V5cyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2VudW0tYnVnLWtleXMgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2VudW0tYnVnLWtleXMuanNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24ga2V5cyhPKSB7XG4gIHJldHVybiAka2V5cyhPLCBlbnVtQnVnS2V5cyk7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19wcm9wZXJ0eS1kZXNjLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChiaXRtYXAsIHZhbHVlKSB7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZTogIShiaXRtYXAgJiAxKSxcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXG4gICAgd3JpdGFibGU6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWU6IHZhbHVlXG4gIH07XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcmVkZWZpbmUuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3JlZGVmaW5lLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxudmFyIGdsb2JhbCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2dsb2JhbCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZ2xvYmFsLmpzXCIpO1xudmFyIGhpZGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19oaWRlICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzXCIpO1xudmFyIGhhcyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2hhcyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faGFzLmpzXCIpO1xudmFyIFNSQyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX3VpZCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdWlkLmpzXCIpKCdzcmMnKTtcbnZhciBUT19TVFJJTkcgPSAndG9TdHJpbmcnO1xudmFyICR0b1N0cmluZyA9IEZ1bmN0aW9uW1RPX1NUUklOR107XG52YXIgVFBMID0gKCcnICsgJHRvU3RyaW5nKS5zcGxpdChUT19TVFJJTkcpO1xuXG5fX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19jb3JlICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jb3JlLmpzXCIpLmluc3BlY3RTb3VyY2UgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuICR0b1N0cmluZy5jYWxsKGl0KTtcbn07XG5cbihtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChPLCBrZXksIHZhbCwgc2FmZSkge1xuICB2YXIgaXNGdW5jdGlvbiA9IHR5cGVvZiB2YWwgPT0gJ2Z1bmN0aW9uJztcbiAgaWYgKGlzRnVuY3Rpb24pIGhhcyh2YWwsICduYW1lJykgfHwgaGlkZSh2YWwsICduYW1lJywga2V5KTtcbiAgaWYgKE9ba2V5XSA9PT0gdmFsKSByZXR1cm47XG4gIGlmIChpc0Z1bmN0aW9uKSBoYXModmFsLCBTUkMpIHx8IGhpZGUodmFsLCBTUkMsIE9ba2V5XSA/ICcnICsgT1trZXldIDogVFBMLmpvaW4oU3RyaW5nKGtleSkpKTtcbiAgaWYgKE8gPT09IGdsb2JhbCkge1xuICAgIE9ba2V5XSA9IHZhbDtcbiAgfSBlbHNlIGlmICghc2FmZSkge1xuICAgIGRlbGV0ZSBPW2tleV07XG4gICAgaGlkZShPLCBrZXksIHZhbCk7XG4gIH0gZWxzZSBpZiAoT1trZXldKSB7XG4gICAgT1trZXldID0gdmFsO1xuICB9IGVsc2Uge1xuICAgIGhpZGUoTywga2V5LCB2YWwpO1xuICB9XG4vLyBhZGQgZmFrZSBGdW5jdGlvbiN0b1N0cmluZyBmb3IgY29ycmVjdCB3b3JrIHdyYXBwZWQgbWV0aG9kcyAvIGNvbnN0cnVjdG9ycyB3aXRoIG1ldGhvZHMgbGlrZSBMb0Rhc2ggaXNOYXRpdmVcbn0pKEZ1bmN0aW9uLnByb3RvdHlwZSwgVE9fU1RSSU5HLCBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuIHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgJiYgdGhpc1tTUkNdIHx8ICR0b1N0cmluZy5jYWxsKHRoaXMpO1xufSk7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zZXQtdG8tc3RyaW5nLXRhZy5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fc2V0LXRvLXN0cmluZy10YWcuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgZGVmID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fb2JqZWN0LWRwICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHAuanNcIikuZjtcbnZhciBoYXMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19oYXMgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2hhcy5qc1wiKTtcbnZhciBUQUcgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL193a3MgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3drcy5qc1wiKSgndG9TdHJpbmdUYWcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIHRhZywgc3RhdCkge1xuICBpZiAoaXQgJiYgIWhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSkgZGVmKGl0LCBUQUcsIHsgY29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogdGFnIH0pO1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC1rZXkuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLWtleS5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxudmFyIHNoYXJlZCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX3NoYXJlZCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLmpzXCIpKCdrZXlzJyk7XG52YXIgdWlkID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fdWlkICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL191aWQuanNcIik7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIHNoYXJlZFtrZXldIHx8IChzaGFyZWRba2V5XSA9IHVpZChrZXkpKTtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zaGFyZWQuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zaGFyZWQuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxudmFyIGdsb2JhbCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2dsb2JhbCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZ2xvYmFsLmpzXCIpO1xudmFyIFNIQVJFRCA9ICdfX2NvcmUtanNfc2hhcmVkX18nO1xudmFyIHN0b3JlID0gZ2xvYmFsW1NIQVJFRF0gfHwgKGdsb2JhbFtTSEFSRURdID0ge30pO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0ge30pO1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3N0cmluZy1hdC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3N0cmluZy1hdC5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgdG9JbnRlZ2VyID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fdG8taW50ZWdlciAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8taW50ZWdlci5qc1wiKTtcbnZhciBkZWZpbmVkID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fZGVmaW5lZCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZGVmaW5lZC5qc1wiKTtcbi8vIHRydWUgIC0+IFN0cmluZyNhdFxuLy8gZmFsc2UgLT4gU3RyaW5nI2NvZGVQb2ludEF0XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChUT19TVFJJTkcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh0aGF0LCBwb3MpIHtcbiAgICB2YXIgcyA9IFN0cmluZyhkZWZpbmVkKHRoYXQpKTtcbiAgICB2YXIgaSA9IHRvSW50ZWdlcihwb3MpO1xuICAgIHZhciBsID0gcy5sZW5ndGg7XG4gICAgdmFyIGEsIGI7XG4gICAgaWYgKGkgPCAwIHx8IGkgPj0gbCkgcmV0dXJuIFRPX1NUUklORyA/ICcnIDogdW5kZWZpbmVkO1xuICAgIGEgPSBzLmNoYXJDb2RlQXQoaSk7XG4gICAgcmV0dXJuIGEgPCAweGQ4MDAgfHwgYSA+IDB4ZGJmZiB8fCBpICsgMSA9PT0gbCB8fCAoYiA9IHMuY2hhckNvZGVBdChpICsgMSkpIDwgMHhkYzAwIHx8IGIgPiAweGRmZmZcbiAgICAgID8gVE9fU1RSSU5HID8gcy5jaGFyQXQoaSkgOiBhXG4gICAgICA6IFRPX1NUUklORyA/IHMuc2xpY2UoaSwgaSArIDIpIDogKGEgLSAweGQ4MDAgPDwgMTApICsgKGIgLSAweGRjMDApICsgMHgxMDAwMDtcbiAgfTtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1hYnNvbHV0ZS1pbmRleC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8tYWJzb2x1dGUtaW5kZXguanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgdG9JbnRlZ2VyID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fdG8taW50ZWdlciAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8taW50ZWdlci5qc1wiKTtcbnZhciBtYXggPSBNYXRoLm1heDtcbnZhciBtaW4gPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluZGV4LCBsZW5ndGgpIHtcbiAgaW5kZXggPSB0b0ludGVnZXIoaW5kZXgpO1xuICByZXR1cm4gaW5kZXggPCAwID8gbWF4KGluZGV4ICsgbGVuZ3RoLCAwKSA6IG1pbihpbmRleCwgbGVuZ3RoKTtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1pbnRlZ2VyLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWludGVnZXIuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbi8vIDcuMS40IFRvSW50ZWdlclxudmFyIGNlaWwgPSBNYXRoLmNlaWw7XG52YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGlzTmFOKGl0ID0gK2l0KSA/IDAgOiAoaXQgPiAwID8gZmxvb3IgOiBjZWlsKShpdCk7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8taW9iamVjdC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1pb2JqZWN0LmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG4vLyB0byBpbmRleGVkIG9iamVjdCwgdG9PYmplY3Qgd2l0aCBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIHN0cmluZ3NcbnZhciBJT2JqZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9faW9iamVjdCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faW9iamVjdC5qc1wiKTtcbnZhciBkZWZpbmVkID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fZGVmaW5lZCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZGVmaW5lZC5qc1wiKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBJT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1sZW5ndGguanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1sZW5ndGguanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuLy8gNy4xLjE1IFRvTGVuZ3RoXG52YXIgdG9JbnRlZ2VyID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fdG8taW50ZWdlciAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8taW50ZWdlci5qc1wiKTtcbnZhciBtaW4gPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpdCA+IDAgPyBtaW4odG9JbnRlZ2VyKGl0KSwgMHgxZmZmZmZmZmZmZmZmZikgOiAwOyAvLyBwb3coMiwgNTMpIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8tb2JqZWN0LmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8tb2JqZWN0LmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbi8vIDcuMS4xMyBUb09iamVjdChhcmd1bWVudClcbnZhciBkZWZpbmVkID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fZGVmaW5lZCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZGVmaW5lZC5qc1wiKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBPYmplY3QoZGVmaW5lZChpdCkpO1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLXByaW1pdGl2ZS5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLXByaW1pdGl2ZS5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG4vLyA3LjEuMSBUb1ByaW1pdGl2ZShpbnB1dCBbLCBQcmVmZXJyZWRUeXBlXSlcbnZhciBpc09iamVjdCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2lzLW9iamVjdCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXMtb2JqZWN0LmpzXCIpO1xuLy8gaW5zdGVhZCBvZiB0aGUgRVM2IHNwZWMgdmVyc2lvbiwgd2UgZGlkbid0IGltcGxlbWVudCBAQHRvUHJpbWl0aXZlIGNhc2Vcbi8vIGFuZCB0aGUgc2Vjb25kIGFyZ3VtZW50IC0gZmxhZyAtIHByZWZlcnJlZCB0eXBlIGlzIGEgc3RyaW5nXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgUykge1xuICBpZiAoIWlzT2JqZWN0KGl0KSkgcmV0dXJuIGl0O1xuICB2YXIgZm4sIHZhbDtcbiAgaWYgKFMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpIHJldHVybiB2YWw7XG4gIGlmICh0eXBlb2YgKGZuID0gaXQudmFsdWVPZikgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKSByZXR1cm4gdmFsO1xuICBpZiAoIVMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpIHJldHVybiB2YWw7XG4gIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNvbnZlcnQgb2JqZWN0IHRvIHByaW1pdGl2ZSB2YWx1ZVwiKTtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL191aWQuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL191aWQuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxudmFyIGlkID0gMDtcbnZhciBweCA9IE1hdGgucmFuZG9tKCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBweCkudG9TdHJpbmcoMzYpKTtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL193a3MuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL193a3MuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxudmFyIHN0b3JlID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fc2hhcmVkICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zaGFyZWQuanNcIikoJ3drcycpO1xudmFyIHVpZCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX3VpZCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdWlkLmpzXCIpO1xudmFyIFN5bWJvbCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2dsb2JhbCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZ2xvYmFsLmpzXCIpLlN5bWJvbDtcbnZhciBVU0VfU1lNQk9MID0gdHlwZW9mIFN5bWJvbCA9PSAnZnVuY3Rpb24nO1xuXG52YXIgJGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxuICAgIFVTRV9TWU1CT0wgJiYgU3ltYm9sW25hbWVdIHx8IChVU0VfU1lNQk9MID8gU3ltYm9sIDogdWlkKSgnU3ltYm9sLicgKyBuYW1lKSk7XG59O1xuXG4kZXhwb3J0cy5zdG9yZSA9IHN0b3JlO1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxudmFyIGNsYXNzb2YgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19jbGFzc29mICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jbGFzc29mLmpzXCIpO1xudmFyIElURVJBVE9SID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fd2tzICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL193a3MuanNcIikoJ2l0ZXJhdG9yJyk7XG52YXIgSXRlcmF0b3JzID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9faXRlcmF0b3JzICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pdGVyYXRvcnMuanNcIik7XG5tb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2NvcmUgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanNcIikuZ2V0SXRlcmF0b3JNZXRob2QgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKGl0ICE9IHVuZGVmaW5lZCkgcmV0dXJuIGl0W0lURVJBVE9SXVxuICAgIHx8IGl0WydAQGl0ZXJhdG9yJ11cbiAgICB8fCBJdGVyYXRvcnNbY2xhc3NvZihpdCldO1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmZyb20uanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuZnJvbS5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBjdHggPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19jdHggKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2N0eC5qc1wiKTtcbnZhciAkZXhwb3J0ID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fZXhwb3J0ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19leHBvcnQuanNcIik7XG52YXIgdG9PYmplY3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL190by1vYmplY3QgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLW9iamVjdC5qc1wiKTtcbnZhciBjYWxsID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9faXRlci1jYWxsICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pdGVyLWNhbGwuanNcIik7XG52YXIgaXNBcnJheUl0ZXIgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19pcy1hcnJheS1pdGVyICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pcy1hcnJheS1pdGVyLmpzXCIpO1xudmFyIHRvTGVuZ3RoID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fdG8tbGVuZ3RoICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1sZW5ndGguanNcIik7XG52YXIgY3JlYXRlUHJvcGVydHkgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19jcmVhdGUtcHJvcGVydHkgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NyZWF0ZS1wcm9wZXJ0eS5qc1wiKTtcbnZhciBnZXRJdGVyRm4gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QuanNcIik7XG5cbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIV9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2l0ZXItZGV0ZWN0ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pdGVyLWRldGVjdC5qc1wiKShmdW5jdGlvbiAoaXRlcikgeyBBcnJheS5mcm9tKGl0ZXIpOyB9KSwgJ0FycmF5Jywge1xuICAvLyAyMi4xLjIuMSBBcnJheS5mcm9tKGFycmF5TGlrZSwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQpXG4gIGZyb206IGZ1bmN0aW9uIGZyb20oYXJyYXlMaWtlIC8qICwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQgKi8pIHtcbiAgICB2YXIgTyA9IHRvT2JqZWN0KGFycmF5TGlrZSk7XG4gICAgdmFyIEMgPSB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nID8gdGhpcyA6IEFycmF5O1xuICAgIHZhciBhTGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB2YXIgbWFwZm4gPSBhTGVuID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcbiAgICB2YXIgbWFwcGluZyA9IG1hcGZuICE9PSB1bmRlZmluZWQ7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgaXRlckZuID0gZ2V0SXRlckZuKE8pO1xuICAgIHZhciBsZW5ndGgsIHJlc3VsdCwgc3RlcCwgaXRlcmF0b3I7XG4gICAgaWYgKG1hcHBpbmcpIG1hcGZuID0gY3R4KG1hcGZuLCBhTGVuID4gMiA/IGFyZ3VtZW50c1syXSA6IHVuZGVmaW5lZCwgMik7XG4gICAgLy8gaWYgb2JqZWN0IGlzbid0IGl0ZXJhYmxlIG9yIGl0J3MgYXJyYXkgd2l0aCBkZWZhdWx0IGl0ZXJhdG9yIC0gdXNlIHNpbXBsZSBjYXNlXG4gICAgaWYgKGl0ZXJGbiAhPSB1bmRlZmluZWQgJiYgIShDID09IEFycmF5ICYmIGlzQXJyYXlJdGVyKGl0ZXJGbikpKSB7XG4gICAgICBmb3IgKGl0ZXJhdG9yID0gaXRlckZuLmNhbGwoTyksIHJlc3VsdCA9IG5ldyBDKCk7ICEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZTsgaW5kZXgrKykge1xuICAgICAgICBjcmVhdGVQcm9wZXJ0eShyZXN1bHQsIGluZGV4LCBtYXBwaW5nID8gY2FsbChpdGVyYXRvciwgbWFwZm4sIFtzdGVwLnZhbHVlLCBpbmRleF0sIHRydWUpIDogc3RlcC52YWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKTtcbiAgICAgIGZvciAocmVzdWx0ID0gbmV3IEMobGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4KyspIHtcbiAgICAgICAgY3JlYXRlUHJvcGVydHkocmVzdWx0LCBpbmRleCwgbWFwcGluZyA/IG1hcGZuKE9baW5kZXhdLCBpbmRleCkgOiBPW2luZGV4XSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdC5sZW5ndGggPSBpbmRleDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59KTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvci5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvci5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyICRhdCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX3N0cmluZy1hdCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fc3RyaW5nLWF0LmpzXCIpKHRydWUpO1xuXG4vLyAyMS4xLjMuMjcgU3RyaW5nLnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5fX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19pdGVyLWRlZmluZSAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXRlci1kZWZpbmUuanNcIikoU3RyaW5nLCAnU3RyaW5nJywgZnVuY3Rpb24gKGl0ZXJhdGVkKSB7XG4gIHRoaXMuX3QgPSBTdHJpbmcoaXRlcmF0ZWQpOyAvLyB0YXJnZXRcbiAgdGhpcy5faSA9IDA7ICAgICAgICAgICAgICAgIC8vIG5leHQgaW5kZXhcbi8vIDIxLjEuNS4yLjEgJVN0cmluZ0l0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcbn0sIGZ1bmN0aW9uICgpIHtcbiAgdmFyIE8gPSB0aGlzLl90O1xuICB2YXIgaW5kZXggPSB0aGlzLl9pO1xuICB2YXIgcG9pbnQ7XG4gIGlmIChpbmRleCA+PSBPLmxlbmd0aCkgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICBwb2ludCA9ICRhdChPLCBpbmRleCk7XG4gIHRoaXMuX2kgKz0gcG9pbnQubGVuZ3RoO1xuICByZXR1cm4geyB2YWx1ZTogcG9pbnQsIGRvbmU6IGZhbHNlIH07XG59KTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL3NyYy9kZWZhdWx0LWF0dHJzLmpzb25cIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vc3JjL2RlZmF1bHQtYXR0cnMuanNvbiAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgZXhwb3J0cyBwcm92aWRlZDogeG1sbnMsIHdpZHRoLCBoZWlnaHQsIHZpZXdCb3gsIGZpbGwsIHN0cm9rZSwgc3Ryb2tlLXdpZHRoLCBzdHJva2UtbGluZWNhcCwgc3Ryb2tlLWxpbmVqb2luLCBkZWZhdWx0ICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlKSB7XG5cbm1vZHVsZS5leHBvcnRzID0ge1wieG1sbnNcIjpcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXCJ3aWR0aFwiOjI0LFwiaGVpZ2h0XCI6MjQsXCJ2aWV3Qm94XCI6XCIwIDAgMjQgMjRcIixcImZpbGxcIjpcIm5vbmVcIixcInN0cm9rZVwiOlwiY3VycmVudENvbG9yXCIsXCJzdHJva2Utd2lkdGhcIjoyLFwic3Ryb2tlLWxpbmVjYXBcIjpcInJvdW5kXCIsXCJzdHJva2UtbGluZWpvaW5cIjpcInJvdW5kXCJ9O1xuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL3NyYy9pY29uLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9zcmMvaWNvbi5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfZGVkdXBlID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgY2xhc3NuYW1lcy9kZWR1cGUgKi8gXCIuL25vZGVfbW9kdWxlcy9jbGFzc25hbWVzL2RlZHVwZS5qc1wiKTtcblxudmFyIF9kZWR1cGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZGVkdXBlKTtcblxudmFyIF9kZWZhdWx0QXR0cnMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL2RlZmF1bHQtYXR0cnMuanNvbiAqLyBcIi4vc3JjL2RlZmF1bHQtYXR0cnMuanNvblwiKTtcblxudmFyIF9kZWZhdWx0QXR0cnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZGVmYXVsdEF0dHJzKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIEljb24gPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIEljb24obmFtZSwgY29udGVudHMpIHtcbiAgICB2YXIgdGFncyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogW107XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgSWNvbik7XG5cbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuY29udGVudHMgPSBjb250ZW50cztcbiAgICB0aGlzLnRhZ3MgPSB0YWdzO1xuICAgIHRoaXMuYXR0cnMgPSBfZXh0ZW5kcyh7fSwgX2RlZmF1bHRBdHRyczIuZGVmYXVsdCwgeyBjbGFzczogJ2ZlYXRoZXIgZmVhdGhlci0nICsgbmFtZSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gU1ZHIHN0cmluZy5cbiAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuXG5cbiAgX2NyZWF0ZUNsYXNzKEljb24sIFt7XG4gICAga2V5OiAndG9TdmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0b1N2ZygpIHtcbiAgICAgIHZhciBhdHRycyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG5cbiAgICAgIHZhciBjb21iaW5lZEF0dHJzID0gX2V4dGVuZHMoe30sIHRoaXMuYXR0cnMsIGF0dHJzLCB7IGNsYXNzOiAoMCwgX2RlZHVwZTIuZGVmYXVsdCkodGhpcy5hdHRycy5jbGFzcywgYXR0cnMuY2xhc3MpIH0pO1xuXG4gICAgICByZXR1cm4gJzxzdmcgJyArIGF0dHJzVG9TdHJpbmcoY29tYmluZWRBdHRycykgKyAnPicgKyB0aGlzLmNvbnRlbnRzICsgJzwvc3ZnPic7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhbiBgSWNvbmAuXG4gICAgICpcbiAgICAgKiBBZGRlZCBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eS4gSWYgb2xkIGNvZGUgZXhwZWN0cyBgZmVhdGhlci5pY29ucy48bmFtZT5gXG4gICAgICogdG8gYmUgYSBzdHJpbmcsIGB0b1N0cmluZygpYCB3aWxsIGdldCBpbXBsaWNpdGx5IGNhbGxlZC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ3RvU3RyaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250ZW50cztcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gSWNvbjtcbn0oKTtcblxuLyoqXG4gKiBDb252ZXJ0IGF0dHJpYnV0ZXMgb2JqZWN0IHRvIHN0cmluZyBvZiBIVE1MIGF0dHJpYnV0ZXMuXG4gKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cblxuXG5mdW5jdGlvbiBhdHRyc1RvU3RyaW5nKGF0dHJzKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhhdHRycykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4ga2V5ICsgJz1cIicgKyBhdHRyc1trZXldICsgJ1wiJztcbiAgfSkuam9pbignICcpO1xufVxuXG5leHBvcnRzLmRlZmF1bHQgPSBJY29uO1xuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL3NyYy9pY29ucy5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL3NyYy9pY29ucy5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2ljb24gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL2ljb24gKi8gXCIuL3NyYy9pY29uLmpzXCIpO1xuXG52YXIgX2ljb24yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaWNvbik7XG5cbnZhciBfaWNvbnMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuLi9kaXN0L2ljb25zLmpzb24gKi8gXCIuL2Rpc3QvaWNvbnMuanNvblwiKTtcblxudmFyIF9pY29uczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pY29ucyk7XG5cbnZhciBfdGFncyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vdGFncy5qc29uICovIFwiLi9zcmMvdGFncy5qc29uXCIpO1xuXG52YXIgX3RhZ3MyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdGFncyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuZGVmYXVsdCA9IE9iamVjdC5rZXlzKF9pY29uczIuZGVmYXVsdCkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIG5ldyBfaWNvbjIuZGVmYXVsdChrZXksIF9pY29uczIuZGVmYXVsdFtrZXldLCBfdGFnczIuZGVmYXVsdFtrZXldKTtcbn0pLnJlZHVjZShmdW5jdGlvbiAob2JqZWN0LCBpY29uKSB7XG4gIG9iamVjdFtpY29uLm5hbWVdID0gaWNvbjtcbiAgcmV0dXJuIG9iamVjdDtcbn0sIHt9KTtcblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9zcmMvaW5kZXguanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9zcmMvaW5kZXguanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxudmFyIF9pY29ucyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vaWNvbnMgKi8gXCIuL3NyYy9pY29ucy5qc1wiKTtcblxudmFyIF9pY29uczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pY29ucyk7XG5cbnZhciBfdG9TdmcgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL3RvLXN2ZyAqLyBcIi4vc3JjL3RvLXN2Zy5qc1wiKTtcblxudmFyIF90b1N2ZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF90b1N2Zyk7XG5cbnZhciBfcmVwbGFjZSA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vcmVwbGFjZSAqLyBcIi4vc3JjL3JlcGxhY2UuanNcIik7XG5cbnZhciBfcmVwbGFjZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZXBsYWNlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxubW9kdWxlLmV4cG9ydHMgPSB7IGljb25zOiBfaWNvbnMyLmRlZmF1bHQsIHRvU3ZnOiBfdG9TdmcyLmRlZmF1bHQsIHJlcGxhY2U6IF9yZXBsYWNlMi5kZWZhdWx0IH07XG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vc3JjL3JlcGxhY2UuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL3NyYy9yZXBsYWNlLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTsgLyogZXNsaW50LWVudiBicm93c2VyICovXG5cblxudmFyIF9kZWR1cGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISBjbGFzc25hbWVzL2RlZHVwZSAqLyBcIi4vbm9kZV9tb2R1bGVzL2NsYXNzbmFtZXMvZGVkdXBlLmpzXCIpO1xuXG52YXIgX2RlZHVwZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9kZWR1cGUpO1xuXG52YXIgX2ljb25zID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9pY29ucyAqLyBcIi4vc3JjL2ljb25zLmpzXCIpO1xuXG52YXIgX2ljb25zMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ljb25zKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuLyoqXG4gKiBSZXBsYWNlIGFsbCBIVE1MIGVsZW1lbnRzIHRoYXQgaGF2ZSBhIGBkYXRhLWZlYXRoZXJgIGF0dHJpYnV0ZSB3aXRoIFNWRyBtYXJrdXBcbiAqIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGVsZW1lbnQncyBgZGF0YS1mZWF0aGVyYCBhdHRyaWJ1dGUgdmFsdWUuXG4gKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAqL1xuZnVuY3Rpb24gcmVwbGFjZSgpIHtcbiAgdmFyIGF0dHJzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcblxuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgIHRocm93IG5ldyBFcnJvcignYGZlYXRoZXIucmVwbGFjZSgpYCBvbmx5IHdvcmtzIGluIGEgYnJvd3NlciBlbnZpcm9ubWVudC4nKTtcbiAgfVxuXG4gIHZhciBlbGVtZW50c1RvUmVwbGFjZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWZlYXRoZXJdJyk7XG5cbiAgQXJyYXkuZnJvbShlbGVtZW50c1RvUmVwbGFjZSkuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHJldHVybiByZXBsYWNlRWxlbWVudChlbGVtZW50LCBhdHRycyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJlcGxhY2UgYSBzaW5nbGUgSFRNTCBlbGVtZW50IHdpdGggU1ZHIG1hcmt1cFxuICogY29ycmVzcG9uZGluZyB0byB0aGUgZWxlbWVudCdzIGBkYXRhLWZlYXRoZXJgIGF0dHJpYnV0ZSB2YWx1ZS5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICovXG5mdW5jdGlvbiByZXBsYWNlRWxlbWVudChlbGVtZW50KSB7XG4gIHZhciBhdHRycyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG5cbiAgdmFyIGVsZW1lbnRBdHRycyA9IGdldEF0dHJzKGVsZW1lbnQpO1xuICB2YXIgbmFtZSA9IGVsZW1lbnRBdHRyc1snZGF0YS1mZWF0aGVyJ107XG4gIGRlbGV0ZSBlbGVtZW50QXR0cnNbJ2RhdGEtZmVhdGhlciddO1xuXG4gIHZhciBzdmdTdHJpbmcgPSBfaWNvbnMyLmRlZmF1bHRbbmFtZV0udG9TdmcoX2V4dGVuZHMoe30sIGF0dHJzLCBlbGVtZW50QXR0cnMsIHsgY2xhc3M6ICgwLCBfZGVkdXBlMi5kZWZhdWx0KShhdHRycy5jbGFzcywgZWxlbWVudEF0dHJzLmNsYXNzKSB9KSk7XG4gIHZhciBzdmdEb2N1bWVudCA9IG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcoc3ZnU3RyaW5nLCAnaW1hZ2Uvc3ZnK3htbCcpO1xuICB2YXIgc3ZnRWxlbWVudCA9IHN2Z0RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3N2ZycpO1xuXG4gIGVsZW1lbnQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoc3ZnRWxlbWVudCwgZWxlbWVudCk7XG59XG5cbi8qKlxuICogR2V0IHRoZSBhdHRyaWJ1dGVzIG9mIGFuIEhUTUwgZWxlbWVudC5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGdldEF0dHJzKGVsZW1lbnQpIHtcbiAgcmV0dXJuIEFycmF5LmZyb20oZWxlbWVudC5hdHRyaWJ1dGVzKS5yZWR1Y2UoZnVuY3Rpb24gKGF0dHJzLCBhdHRyKSB7XG4gICAgYXR0cnNbYXR0ci5uYW1lXSA9IGF0dHIudmFsdWU7XG4gICAgcmV0dXJuIGF0dHJzO1xuICB9LCB7fSk7XG59XG5cbmV4cG9ydHMuZGVmYXVsdCA9IHJlcGxhY2U7XG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vc3JjL3RhZ3MuanNvblwiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9zcmMvdGFncy5qc29uICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBleHBvcnRzIHByb3ZpZGVkOiBhY3Rpdml0eSwgYWlycGxheSwgYWxlcnQtY2lyY2xlLCBhbGVydC1vY3RhZ29uLCBhbGVydC10cmlhbmdsZSwgYXQtc2lnbiwgYXdhcmQsIGFwZXJ0dXJlLCBiZWxsLCBiZWxsLW9mZiwgYmx1ZXRvb3RoLCBib29rLW9wZW4sIGJvb2ssIGJvb2ttYXJrLCBicmllZmNhc2UsIGNsaXBib2FyZCwgY2xvY2ssIGNsb3VkLWRyaXp6bGUsIGNsb3VkLWxpZ2h0bmluZywgY2xvdWQtcmFpbiwgY2xvdWQtc25vdywgY2xvdWQsIGNvZGVwZW4sIGNvbW1hbmQsIGNvbXBhc3MsIGNvcHksIGNvcm5lci1kb3duLWxlZnQsIGNvcm5lci1kb3duLXJpZ2h0LCBjb3JuZXItbGVmdC1kb3duLCBjb3JuZXItbGVmdC11cCwgY29ybmVyLXJpZ2h0LWRvd24sIGNvcm5lci1yaWdodC11cCwgY29ybmVyLXVwLWxlZnQsIGNvcm5lci11cC1yaWdodCwgY3JlZGl0LWNhcmQsIGNyb3AsIGNyb3NzaGFpciwgZGF0YWJhc2UsIGRlbGV0ZSwgZGlzYywgZG9sbGFyLXNpZ24sIGRyb3BsZXQsIGVkaXQsIGVkaXQtMiwgZWRpdC0zLCBleWUsIGV5ZS1vZmYsIGV4dGVybmFsLWxpbmssIGZhY2Vib29rLCBmYXN0LWZvcndhcmQsIGZpbG0sIGZvbGRlci1taW51cywgZm9sZGVyLXBsdXMsIGZvbGRlciwgZ2lmdCwgZ2l0LWJyYW5jaCwgZ2l0LWNvbW1pdCwgZ2l0LW1lcmdlLCBnaXQtcHVsbC1yZXF1ZXN0LCBnaXRodWIsIGdpdGxhYiwgZ2xvYmFsLCBoYXJkLWRyaXZlLCBoYXNoLCBoZWFkcGhvbmVzLCBoZWFydCwgaGVscC1jaXJjbGUsIGhvbWUsIGltYWdlLCBpbmJveCwgaW5zdGFncmFtLCBsaWZlLWJvdXksIGxpbmtlZGluLCBsb2NrLCBsb2ctaW4sIGxvZy1vdXQsIG1haWwsIG1hcC1waW4sIG1hcCwgbWF4aW1pemUsIG1heGltaXplLTIsIG1lbnUsIG1lc3NhZ2UtY2lyY2xlLCBtZXNzYWdlLXNxdWFyZSwgbWljLW9mZiwgbWljLCBtaW5pbWl6ZSwgbWluaW1pemUtMiwgbW9uaXRvciwgbW9vbiwgbW9yZS1ob3Jpem9udGFsLCBtb3JlLXZlcnRpY2FsLCBtb3ZlLCBuYXZpZ2F0aW9uLCBuYXZpZ2F0aW9uLTIsIG9jdGFnb24sIHBhY2thZ2UsIHBhcGVyY2xpcCwgcGF1c2UsIHBhdXNlLWNpcmNsZSwgcGxheSwgcGxheS1jaXJjbGUsIHBsdXMsIHBsdXMtY2lyY2xlLCBwbHVzLXNxdWFyZSwgcG9ja2V0LCBwb3dlciwgcmFkaW8sIHJld2luZCwgcnNzLCBzYXZlLCBzZW5kLCBzZXR0aW5ncywgc2hpZWxkLCBzaGllbGQtb2ZmLCBzaG9wcGluZy1iYWcsIHNob3BwaW5nLWNhcnQsIHNodWZmbGUsIHNraXAtYmFjaywgc2tpcC1mb3J3YXJkLCBzbGFzaCwgc2xpZGVycywgc3BlYWtlciwgc3Rhciwgc3VuLCBzdW5yaXNlLCBzdW5zZXQsIHRhZywgdGFyZ2V0LCB0ZXJtaW5hbCwgdGh1bWJzLWRvd24sIHRodW1icy11cCwgdG9nZ2xlLWxlZnQsIHRvZ2dsZS1yaWdodCwgdHJhc2gsIHRyYXNoLTIsIHRyaWFuZ2xlLCB0cnVjaywgdHdpdHRlciwgdW1icmVsbGEsIHZpZGVvLW9mZiwgdmlkZW8sIHZvaWNlbWFpbCwgdm9sdW1lLCB2b2x1bWUtMSwgdm9sdW1lLTIsIHZvbHVtZS14LCB3YXRjaCwgd2luZCwgeC1jaXJjbGUsIHgtc3F1YXJlLCB4LCB5b3V0dWJlLCB6YXAtb2ZmLCB6YXAsIGRlZmF1bHQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUpIHtcblxubW9kdWxlLmV4cG9ydHMgPSB7XCJhY3Rpdml0eVwiOltcInB1bHNlXCIsXCJoZWFsdGhcIixcImFjdGlvblwiLFwibW90aW9uXCJdLFwiYWlycGxheVwiOltcInN0cmVhbVwiLFwiY2FzdFwiLFwibWlycm9yaW5nXCJdLFwiYWxlcnQtY2lyY2xlXCI6W1wid2FybmluZ1wiXSxcImFsZXJ0LW9jdGFnb25cIjpbXCJ3YXJuaW5nXCJdLFwiYWxlcnQtdHJpYW5nbGVcIjpbXCJ3YXJuaW5nXCJdLFwiYXQtc2lnblwiOltcIm1lbnRpb25cIl0sXCJhd2FyZFwiOltcImFjaGlldmVtZW50XCIsXCJiYWRnZVwiXSxcImFwZXJ0dXJlXCI6W1wiY2FtZXJhXCIsXCJwaG90b1wiXSxcImJlbGxcIjpbXCJhbGFybVwiLFwibm90aWZpY2F0aW9uXCJdLFwiYmVsbC1vZmZcIjpbXCJhbGFybVwiLFwibm90aWZpY2F0aW9uXCIsXCJzaWxlbnRcIl0sXCJibHVldG9vdGhcIjpbXCJ3aXJlbGVzc1wiXSxcImJvb2stb3BlblwiOltcInJlYWRcIl0sXCJib29rXCI6W1wicmVhZFwiLFwiZGljdGlvbmFyeVwiLFwiYm9va2xldFwiLFwibWFnYXppbmVcIl0sXCJib29rbWFya1wiOltcInJlYWRcIixcImNsaXBcIixcIm1hcmtlclwiLFwidGFnXCJdLFwiYnJpZWZjYXNlXCI6W1wid29ya1wiLFwiYmFnXCIsXCJiYWdnYWdlXCIsXCJmb2xkZXJcIl0sXCJjbGlwYm9hcmRcIjpbXCJjb3B5XCJdLFwiY2xvY2tcIjpbXCJ0aW1lXCIsXCJ3YXRjaFwiLFwiYWxhcm1cIl0sXCJjbG91ZC1kcml6emxlXCI6W1wid2VhdGhlclwiLFwic2hvd2VyXCJdLFwiY2xvdWQtbGlnaHRuaW5nXCI6W1wid2VhdGhlclwiLFwiYm9sdFwiXSxcImNsb3VkLXJhaW5cIjpbXCJ3ZWF0aGVyXCJdLFwiY2xvdWQtc25vd1wiOltcIndlYXRoZXJcIixcImJsaXp6YXJkXCJdLFwiY2xvdWRcIjpbXCJ3ZWF0aGVyXCJdLFwiY29kZXBlblwiOltcImxvZ29cIl0sXCJjb21tYW5kXCI6W1wia2V5Ym9hcmRcIixcImNtZFwiXSxcImNvbXBhc3NcIjpbXCJuYXZpZ2F0aW9uXCIsXCJzYWZhcmlcIixcInRyYXZlbFwiXSxcImNvcHlcIjpbXCJjbG9uZVwiLFwiZHVwbGljYXRlXCJdLFwiY29ybmVyLWRvd24tbGVmdFwiOltcImFycm93XCJdLFwiY29ybmVyLWRvd24tcmlnaHRcIjpbXCJhcnJvd1wiXSxcImNvcm5lci1sZWZ0LWRvd25cIjpbXCJhcnJvd1wiXSxcImNvcm5lci1sZWZ0LXVwXCI6W1wiYXJyb3dcIl0sXCJjb3JuZXItcmlnaHQtZG93blwiOltcImFycm93XCJdLFwiY29ybmVyLXJpZ2h0LXVwXCI6W1wiYXJyb3dcIl0sXCJjb3JuZXItdXAtbGVmdFwiOltcImFycm93XCJdLFwiY29ybmVyLXVwLXJpZ2h0XCI6W1wiYXJyb3dcIl0sXCJjcmVkaXQtY2FyZFwiOltcInB1cmNoYXNlXCIsXCJwYXltZW50XCIsXCJjY1wiXSxcImNyb3BcIjpbXCJwaG90b1wiLFwiaW1hZ2VcIl0sXCJjcm9zc2hhaXJcIjpbXCJhaW1cIixcInRhcmdldFwiXSxcImRhdGFiYXNlXCI6W1wic3RvcmFnZVwiXSxcImRlbGV0ZVwiOltcInJlbW92ZVwiXSxcImRpc2NcIjpbXCJhbGJ1bVwiLFwiY2RcIixcImR2ZFwiLFwibXVzaWNcIl0sXCJkb2xsYXItc2lnblwiOltcImN1cnJlbmN5XCIsXCJtb25leVwiLFwicGF5bWVudFwiXSxcImRyb3BsZXRcIjpbXCJ3YXRlclwiXSxcImVkaXRcIjpbXCJwZW5jaWxcIixcImNoYW5nZVwiXSxcImVkaXQtMlwiOltcInBlbmNpbFwiLFwiY2hhbmdlXCJdLFwiZWRpdC0zXCI6W1wicGVuY2lsXCIsXCJjaGFuZ2VcIl0sXCJleWVcIjpbXCJ2aWV3XCIsXCJ3YXRjaFwiXSxcImV5ZS1vZmZcIjpbXCJ2aWV3XCIsXCJ3YXRjaFwiXSxcImV4dGVybmFsLWxpbmtcIjpbXCJvdXRib3VuZFwiXSxcImZhY2Vib29rXCI6W1wibG9nb1wiXSxcImZhc3QtZm9yd2FyZFwiOltcIm11c2ljXCJdLFwiZmlsbVwiOltcIm1vdmllXCIsXCJ2aWRlb1wiXSxcImZvbGRlci1taW51c1wiOltcImRpcmVjdG9yeVwiXSxcImZvbGRlci1wbHVzXCI6W1wiZGlyZWN0b3J5XCJdLFwiZm9sZGVyXCI6W1wiZGlyZWN0b3J5XCJdLFwiZ2lmdFwiOltcInByZXNlbnRcIixcImJveFwiLFwiYmlydGhkYXlcIixcInBhcnR5XCJdLFwiZ2l0LWJyYW5jaFwiOltcImNvZGVcIixcInZlcnNpb24gY29udHJvbFwiXSxcImdpdC1jb21taXRcIjpbXCJjb2RlXCIsXCJ2ZXJzaW9uIGNvbnRyb2xcIl0sXCJnaXQtbWVyZ2VcIjpbXCJjb2RlXCIsXCJ2ZXJzaW9uIGNvbnRyb2xcIl0sXCJnaXQtcHVsbC1yZXF1ZXN0XCI6W1wiY29kZVwiLFwidmVyc2lvbiBjb250cm9sXCJdLFwiZ2l0aHViXCI6W1wibG9nb1wiLFwidmVyc2lvbiBjb250cm9sXCJdLFwiZ2l0bGFiXCI6W1wibG9nb1wiLFwidmVyc2lvbiBjb250cm9sXCJdLFwiZ2xvYmFsXCI6W1wid29ybGRcIixcImJyb3dzZXJcIixcImxhbmd1YWdlXCIsXCJ0cmFuc2xhdGVcIl0sXCJoYXJkLWRyaXZlXCI6W1wiY29tcHV0ZXJcIixcInNlcnZlclwiXSxcImhhc2hcIjpbXCJoYXNodGFnXCIsXCJudW1iZXJcIixcInBvdW5kXCJdLFwiaGVhZHBob25lc1wiOltcIm11c2ljXCIsXCJhdWRpb1wiXSxcImhlYXJ0XCI6W1wibGlrZVwiLFwibG92ZVwiXSxcImhlbHAtY2lyY2xlXCI6W1wicXVlc3Rpb24gbWFya1wiXSxcImhvbWVcIjpbXCJob3VzZVwiXSxcImltYWdlXCI6W1wicGljdHVyZVwiXSxcImluYm94XCI6W1wiZW1haWxcIl0sXCJpbnN0YWdyYW1cIjpbXCJsb2dvXCIsXCJjYW1lcmFcIl0sXCJsaWZlLWJvdXlcIjpbXCJoZWxwXCIsXCJsaWZlIHJpbmdcIixcInN1cHBvcnRcIl0sXCJsaW5rZWRpblwiOltcImxvZ29cIl0sXCJsb2NrXCI6W1wic2VjdXJpdHlcIixcInBhc3N3b3JkXCJdLFwibG9nLWluXCI6W1wic2lnbiBpblwiLFwiYXJyb3dcIl0sXCJsb2ctb3V0XCI6W1wic2lnbiBvdXRcIixcImFycm93XCJdLFwibWFpbFwiOltcImVtYWlsXCJdLFwibWFwLXBpblwiOltcImxvY2F0aW9uXCIsXCJuYXZpZ2F0aW9uXCIsXCJ0cmF2ZWxcIixcIm1hcmtlclwiXSxcIm1hcFwiOltcImxvY2F0aW9uXCIsXCJuYXZpZ2F0aW9uXCIsXCJ0cmF2ZWxcIl0sXCJtYXhpbWl6ZVwiOltcImZ1bGxzY3JlZW5cIl0sXCJtYXhpbWl6ZS0yXCI6W1wiZnVsbHNjcmVlblwiLFwiYXJyb3dzXCJdLFwibWVudVwiOltcImJhcnNcIixcIm5hdmlnYXRpb25cIixcImhhbWJ1cmdlclwiXSxcIm1lc3NhZ2UtY2lyY2xlXCI6W1wiY29tbWVudFwiLFwiY2hhdFwiXSxcIm1lc3NhZ2Utc3F1YXJlXCI6W1wiY29tbWVudFwiLFwiY2hhdFwiXSxcIm1pYy1vZmZcIjpbXCJyZWNvcmRcIl0sXCJtaWNcIjpbXCJyZWNvcmRcIl0sXCJtaW5pbWl6ZVwiOltcImV4aXQgZnVsbHNjcmVlblwiXSxcIm1pbmltaXplLTJcIjpbXCJleGl0IGZ1bGxzY3JlZW5cIixcImFycm93c1wiXSxcIm1vbml0b3JcIjpbXCJ0dlwiXSxcIm1vb25cIjpbXCJkYXJrXCIsXCJuaWdodFwiXSxcIm1vcmUtaG9yaXpvbnRhbFwiOltcImVsbGlwc2lzXCJdLFwibW9yZS12ZXJ0aWNhbFwiOltcImVsbGlwc2lzXCJdLFwibW92ZVwiOltcImFycm93c1wiXSxcIm5hdmlnYXRpb25cIjpbXCJsb2NhdGlvblwiLFwidHJhdmVsXCJdLFwibmF2aWdhdGlvbi0yXCI6W1wibG9jYXRpb25cIixcInRyYXZlbFwiXSxcIm9jdGFnb25cIjpbXCJzdG9wXCJdLFwicGFja2FnZVwiOltcImJveFwiXSxcInBhcGVyY2xpcFwiOltcImF0dGFjaG1lbnRcIl0sXCJwYXVzZVwiOltcIm11c2ljXCIsXCJzdG9wXCJdLFwicGF1c2UtY2lyY2xlXCI6W1wibXVzaWNcIixcInN0b3BcIl0sXCJwbGF5XCI6W1wibXVzaWNcIixcInN0YXJ0XCJdLFwicGxheS1jaXJjbGVcIjpbXCJtdXNpY1wiLFwic3RhcnRcIl0sXCJwbHVzXCI6W1wiYWRkXCIsXCJuZXdcIl0sXCJwbHVzLWNpcmNsZVwiOltcImFkZFwiLFwibmV3XCJdLFwicGx1cy1zcXVhcmVcIjpbXCJhZGRcIixcIm5ld1wiXSxcInBvY2tldFwiOltcImxvZ29cIixcInNhdmVcIl0sXCJwb3dlclwiOltcIm9uXCIsXCJvZmZcIl0sXCJyYWRpb1wiOltcInNpZ25hbFwiXSxcInJld2luZFwiOltcIm11c2ljXCJdLFwicnNzXCI6W1wiZmVlZFwiLFwic3Vic2NyaWJlXCJdLFwic2F2ZVwiOltcImZsb3BweSBkaXNrXCJdLFwic2VuZFwiOltcIm1lc3NhZ2VcIixcIm1haWxcIixcInBhcGVyIGFpcnBsYW5lXCJdLFwic2V0dGluZ3NcIjpbXCJjb2dcIixcImVkaXRcIixcImdlYXJcIixcInByZWZlcmVuY2VzXCJdLFwic2hpZWxkXCI6W1wic2VjdXJpdHlcIl0sXCJzaGllbGQtb2ZmXCI6W1wic2VjdXJpdHlcIl0sXCJzaG9wcGluZy1iYWdcIjpbXCJlY29tbWVyY2VcIixcImNhcnRcIixcInB1cmNoYXNlXCIsXCJzdG9yZVwiXSxcInNob3BwaW5nLWNhcnRcIjpbXCJlY29tbWVyY2VcIixcImNhcnRcIixcInB1cmNoYXNlXCIsXCJzdG9yZVwiXSxcInNodWZmbGVcIjpbXCJtdXNpY1wiXSxcInNraXAtYmFja1wiOltcIm11c2ljXCJdLFwic2tpcC1mb3J3YXJkXCI6W1wibXVzaWNcIl0sXCJzbGFzaFwiOltcImJhblwiLFwibm9cIl0sXCJzbGlkZXJzXCI6W1wic2V0dGluZ3NcIixcImNvbnRyb2xzXCJdLFwic3BlYWtlclwiOltcIm11c2ljXCJdLFwic3RhclwiOltcImJvb2ttYXJrXCIsXCJmYXZvcml0ZVwiLFwibGlrZVwiXSxcInN1blwiOltcImJyaWdodG5lc3NcIixcIndlYXRoZXJcIixcImxpZ2h0XCJdLFwic3VucmlzZVwiOltcIndlYXRoZXJcIl0sXCJzdW5zZXRcIjpbXCJ3ZWF0aGVyXCJdLFwidGFnXCI6W1wibGFiZWxcIl0sXCJ0YXJnZXRcIjpbXCJidWxsc2V5ZVwiXSxcInRlcm1pbmFsXCI6W1wiY29kZVwiLFwiY29tbWFuZCBsaW5lXCJdLFwidGh1bWJzLWRvd25cIjpbXCJkaXNsaWtlXCIsXCJiYWRcIl0sXCJ0aHVtYnMtdXBcIjpbXCJsaWtlXCIsXCJnb29kXCJdLFwidG9nZ2xlLWxlZnRcIjpbXCJvblwiLFwib2ZmXCIsXCJzd2l0Y2hcIl0sXCJ0b2dnbGUtcmlnaHRcIjpbXCJvblwiLFwib2ZmXCIsXCJzd2l0Y2hcIl0sXCJ0cmFzaFwiOltcImdhcmJhZ2VcIixcImRlbGV0ZVwiLFwicmVtb3ZlXCJdLFwidHJhc2gtMlwiOltcImdhcmJhZ2VcIixcImRlbGV0ZVwiLFwicmVtb3ZlXCJdLFwidHJpYW5nbGVcIjpbXCJkZWx0YVwiXSxcInRydWNrXCI6W1wiZGVsaXZlcnlcIixcInZhblwiLFwic2hpcHBpbmdcIl0sXCJ0d2l0dGVyXCI6W1wibG9nb1wiXSxcInVtYnJlbGxhXCI6W1wicmFpblwiLFwid2VhdGhlclwiXSxcInZpZGVvLW9mZlwiOltcImNhbWVyYVwiLFwibW92aWVcIixcImZpbG1cIl0sXCJ2aWRlb1wiOltcImNhbWVyYVwiLFwibW92aWVcIixcImZpbG1cIl0sXCJ2b2ljZW1haWxcIjpbXCJwaG9uZVwiXSxcInZvbHVtZVwiOltcIm11c2ljXCIsXCJzb3VuZFwiLFwibXV0ZVwiXSxcInZvbHVtZS0xXCI6W1wibXVzaWNcIixcInNvdW5kXCJdLFwidm9sdW1lLTJcIjpbXCJtdXNpY1wiLFwic291bmRcIl0sXCJ2b2x1bWUteFwiOltcIm11c2ljXCIsXCJzb3VuZFwiLFwibXV0ZVwiXSxcIndhdGNoXCI6W1wiY2xvY2tcIixcInRpbWVcIl0sXCJ3aW5kXCI6W1wid2VhdGhlclwiLFwiYWlyXCJdLFwieC1jaXJjbGVcIjpbXCJjYW5jZWxcIixcImNsb3NlXCIsXCJkZWxldGVcIixcInJlbW92ZVwiLFwidGltZXNcIl0sXCJ4LXNxdWFyZVwiOltcImNhbmNlbFwiLFwiY2xvc2VcIixcImRlbGV0ZVwiLFwicmVtb3ZlXCIsXCJ0aW1lc1wiXSxcInhcIjpbXCJjYW5jZWxcIixcImNsb3NlXCIsXCJkZWxldGVcIixcInJlbW92ZVwiLFwidGltZXNcIl0sXCJ5b3V0dWJlXCI6W1wibG9nb1wiLFwidmlkZW9cIixcInBsYXlcIl0sXCJ6YXAtb2ZmXCI6W1wiZmxhc2hcIixcImNhbWVyYVwiLFwibGlnaHRuaW5nXCJdLFwiemFwXCI6W1wiZmxhc2hcIixcImNhbWVyYVwiLFwibGlnaHRuaW5nXCJdfTtcblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9zcmMvdG8tc3ZnLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL3NyYy90by1zdmcuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfaWNvbnMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL2ljb25zICovIFwiLi9zcmMvaWNvbnMuanNcIik7XG5cbnZhciBfaWNvbnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaWNvbnMpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG4vKipcbiAqIENyZWF0ZSBhbiBTVkcgc3RyaW5nLlxuICogQGRlcHJlY2F0ZWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHRvU3ZnKG5hbWUpIHtcbiAgdmFyIGF0dHJzID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcblxuICBjb25zb2xlLndhcm4oJ2ZlYXRoZXIudG9TdmcoKSBpcyBkZXByZWNhdGVkLiBQbGVhc2UgdXNlIGZlYXRoZXIuaWNvbnNbbmFtZV0udG9TdmcoKSBpbnN0ZWFkLicpO1xuXG4gIGlmICghbmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhlIHJlcXVpcmVkIGBrZXlgIChpY29uIG5hbWUpIHBhcmFtZXRlciBpcyBtaXNzaW5nLicpO1xuICB9XG5cbiAgaWYgKCFfaWNvbnMyLmRlZmF1bHRbbmFtZV0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGljb24gbWF0Y2hpbmcgXFwnJyArIG5hbWUgKyAnXFwnLiBTZWUgdGhlIGNvbXBsZXRlIGxpc3Qgb2YgaWNvbnMgYXQgaHR0cHM6Ly9mZWF0aGVyaWNvbnMuY29tJyk7XG4gIH1cblxuICByZXR1cm4gX2ljb25zMi5kZWZhdWx0W25hbWVdLnRvU3ZnKGF0dHJzKTtcbn1cblxuZXhwb3J0cy5kZWZhdWx0ID0gdG9Tdmc7XG5cbi8qKiovIH0pLFxuXG4vKioqLyAwOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogbXVsdGkgY29yZS1qcy9mbi9hcnJheS9mcm9tIC4vc3JjL2luZGV4LmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5fX3dlYnBhY2tfcmVxdWlyZV9fKC8qISBjb3JlLWpzL2ZuL2FycmF5L2Zyb20gKi9cIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvZm4vYXJyYXkvZnJvbS5qc1wiKTtcbm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgL2hvbWUvdHJhdmlzL2J1aWxkL2ZlYXRoZXJpY29ucy9mZWF0aGVyL3NyYy9pbmRleC5qcyAqL1wiLi9zcmMvaW5kZXguanNcIik7XG5cblxuLyoqKi8gfSlcblxuLyoqKioqKi8gfSk7XG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZlYXRoZXIuanMubWFwIl19
