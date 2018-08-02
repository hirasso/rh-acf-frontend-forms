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
      acf.addAction('remove', function ($target) {
        $target.remove();
        $(document).trigger('rah/acf-form-resized');
      });

      acf.addAction('append', function ($el) {
        var $repeater = $el.parents('.acf-repeater');
        if (!$repeater.length) {
          return;
        }
        // adjust disabled class
        var o = acf.get_data($repeater);
        var count = $repeater.find('.acf-row').length - 1;
        if (o.max > 0 && count >= o.max) {
          $el.find('[data-event="add-row"]').addClass('is-disabled');
        }
        // focus the first input of the new row
        setTimeout(function () {
          var $input = $el.find('input:first');
          if (!$input.length) {
            return;
          }
          $input.focus();
        }, 1);

        $(document).trigger('rah/acf-form-resized');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMtc3JjL2pzL21vZHVsZXMvYXV0b2ZpbGwuanMiLCJhc3NldHMtc3JjL2pzL21vZHVsZXMvZnJvbnRlbmQtZm9ybS5qcyIsImFzc2V0cy1zcmMvanMvbW9kdWxlcy9pbWFnZS1kcm9wLmpzIiwiYXNzZXRzLXNyYy9qcy9tb2R1bGVzL21heGxlbmd0aC5qcyIsImFzc2V0cy1zcmMvanMvcmFoLWFjZi1mcm9udGVuZC1mb3Jtcy5qcyIsIm5vZGVfbW9kdWxlcy9hdXRvc2l6ZS9kaXN0L2F1dG9zaXplLmpzIiwibm9kZV9tb2R1bGVzL2ZlYXRoZXItaWNvbnMvZGlzdC9mZWF0aGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUNDQSxPQUFPLE1BQVAsR0FBZ0IsSUFBSSxPQUFPLE1BQTNCOztBQUVBLE9BQU8sV0FBUCxHQUFxQixZQUFtQjtBQUFBLE1BQVQsRUFBUyx1RUFBSixDQUFJOzs7QUFFdEMsTUFBSSxTQUFTLEVBQUUsV0FBRixDQUFiOztBQUVBLE1BQUksQ0FBQyxPQUFPLE1BQVosRUFBcUI7QUFDbkI7QUFDRDs7QUFFRCxNQUFJLFNBQVMsT0FBTyxpQkFBcEI7QUFDQSxNQUFJLFFBQU8sTUFBUCx5Q0FBTyxNQUFQLE9BQWtCLFFBQXRCLEVBQWlDO0FBQy9CLFlBQVEsSUFBUixDQUFhLHlDQUFiO0FBQ0E7QUFDRDtBQUNELFdBQVMsT0FBTyxFQUFQLENBQVQ7O0FBRUEsTUFBSSxZQUFZLEVBQUUsUUFBRixFQUFZLFNBQVosRUFBaEI7O0FBRUEsU0FBTyxJQUFQLENBQVksVUFBQyxDQUFELEVBQUksRUFBSixFQUFXO0FBQ3JCLFFBQUksUUFBUSxFQUFFLEVBQUYsQ0FBWjtBQUNBLFVBQU0sUUFBTixDQUFlLGVBQWY7O0FBRUEsVUFBTSxJQUFOLENBQVcsMkJBQVgsRUFBd0MsS0FBeEM7QUFDQSxlQUFZLEtBQVosRUFBbUIsTUFBbkI7O0FBRUEs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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXHJcbmdsb2JhbC5qUXVlcnkgPSAkID0gd2luZG93LmpRdWVyeTtcclxuXHJcbndpbmRvdy5hY2ZBdXRvRmlsbCA9IGZ1bmN0aW9uKCBpZCA9IDAgKSB7XHJcblxyXG4gIGxldCAkZm9ybXMgPSAkKCcuYWNmLWZvcm0nKTtcclxuICBcclxuICBpZiggISRmb3Jtcy5sZW5ndGggKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBsZXQgdmFsdWVzID0gd2luZG93LmFjZkF1dG9maWxsVmFsdWVzO1xyXG4gIGlmKCB0eXBlb2YgdmFsdWVzICE9PSAnb2JqZWN0JyApIHtcclxuICAgIGNvbnNvbGUud2Fybignd2luZG93LmFjZkF1dG9maWxsVmFsdWVzIGlzIG5vdCBkZWZpbmVkJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG4gIHZhbHVlcyA9IHZhbHVlc1tpZF07XHJcblxyXG4gIGxldCBzY3JvbGxUb3AgPSAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKTtcclxuXHJcbiAgJGZvcm1zLmVhY2goKGksIGVsKSA9PiB7XHJcbiAgICBsZXQgJGZvcm0gPSAkKGVsKTtcclxuICAgICRmb3JtLmFkZENsYXNzKCdpcy1hdXRvZmlsbGVkJyk7XHJcblxyXG4gICAgJGZvcm0uZmluZCgnLmZpbGwtcGFzc3dvcmQtc3VnZ2VzdGlvbicpLmNsaWNrKCk7XHJcbiAgICBmaWxsRmllbGRzKCAkZm9ybSwgdmFsdWVzICk7XHJcbiAgICBcclxuICAgICRmb3JtLmZpbmQoJ3RleHRhcmVhJykuZWFjaCgoaSwgdGEpID0+IHtcclxuICAgICAgJCh0YSkudHJpZ2dlcignbWF4bGVuZ3RoOnVwZGF0ZScpO1xyXG4gICAgICB2YXIgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XHJcbiAgICAgIGV2dC5pbml0RXZlbnQoJ2F1dG9zaXplOnVwZGF0ZScsIHRydWUsIGZhbHNlKTtcclxuICAgICAgdGEuZGlzcGF0Y2hFdmVudChldnQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJGZvcm0udHJpZ2dlcignYXV0b2ZpbGxlZCcpO1xyXG5cclxuICB9KTtcclxuXHJcbiAgXHJcbiAgXHJcblxyXG4gICQoJ2h0bWwsYm9keScpLmFuaW1hdGUoe1xyXG4gICAgc2Nyb2xsVG9wOiBzY3JvbGxUb3BcclxuICB9LCAwKTtcclxuIFxyXG4gIGZ1bmN0aW9uIGxlYWRpbmdaZXJvKCBudW1iZXIgKSB7XHJcbiAgICBpZiggbnVtYmVyIDwgMTAgKSB7XHJcbiAgICAgIHJldHVybiAnMCcrbnVtYmVyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bWJlcjtcclxuICB9XHJcbiBcclxuIFxyXG4gIGZ1bmN0aW9uIGZpbGxGaWVsZHMoICR3cmFwLCB2YWx1ZXMgKSB7XHJcbiAgICAkLmVhY2goIHZhbHVlcywgKGtleSwgdmFsdWUpID0+IHtcclxuICAgICAgbGV0ICRmaWVsZHMgPSAkd3JhcC5maW5kKGAuYWNmLWZpZWxkW2RhdGEtbmFtZT1cIiR7a2V5fVwiXWApO1xyXG5cclxuXHJcbiAgICAgIGlmKCAhJGZpZWxkcy5sZW5ndGggKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgICRmaWVsZHMuZWFjaCgoaSwgZWwpID0+IHtcclxuICAgICAgICBsZXQgJGZpZWxkID0gJChlbCk7XHJcblxyXG4gICAgICAgIGlmKCB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICEodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSApIHtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgJC5lYWNoKCB2YWx1ZSwgKGtleSwgdmFsKSA9PiB7XHJcblxyXG4gICAgICAgICAgICBpZiggdHlwZW9mIGtleSA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICBpZigga2V5ID4gMCApIHtcclxuICAgICAgICAgICAgICAgICRmaWVsZC5maW5kKCdbZGF0YS1ldmVudD1cImFkZC1yb3dcIl06bGFzdCcpLmNsaWNrKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGxldCAkZmllbGRzID0gJGZpZWxkLmZpbmQoJy5hY2YtZmllbGRzJykuZXEoa2V5KTtcclxuICAgICAgICAgICAgICBmaWxsRmllbGRzKCAkZmllbGRzLCB2YWwgKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGZpbGxGaWVsZHMoICRmaWVsZCwgdmFsIClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSlcclxuIFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiBcclxuICAgICAgICAgIGxldCAkaW5wdXRzID0gJGZpZWxkLmZpbmQoJ2lucHV0LCBzZWxlY3QsIGNoZWNrYm94LCB0ZXh0YXJlYScpO1xyXG4gICAgICAgICAgZmlsbEZpZWxkKCAkaW5wdXRzLCB2YWx1ZSApO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gXHJcbiAgICAgIH0pO1xyXG4gXHJcbiAgICB9KVxyXG4gIH1cclxuIFxyXG4gIGZ1bmN0aW9uIGZpbGxGaWVsZCggJGlucHV0cywgdmFsdWUgKSB7XHJcblxyXG4gICAgJGlucHV0cy5lYWNoKChpLCBlbCkgPT4ge1xyXG4gICAgICBsZXQgJGlucHV0ID0gJChlbCk7XHJcbiAgICAgIGxldCB0eXBlID0gJGlucHV0LmF0dHIoJ3R5cGUnKTtcclxuIFxyXG4gICAgICBpZiggdHlwZSA9PT0gJ2hpZGRlbidcclxuICAgICAgICAgIHx8ICRpbnB1dC5oYXNDbGFzcygnc2VsZWN0Mi1zZWFyY2hfX2ZpZWxkJylcclxuICAgICAgICAgIHx8IHR5cGUgPT09ICdmaWxlJ1xyXG4gICAgICAgICAgfHwgJGlucHV0LnBhcmVudHMoJy5hY2YtY2xvbmUnKS5sZW5ndGggXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiBcclxuICAgICAgaWYoIHR5cGVvZiAkaW5wdXQuZGF0YSgnc2VsZWN0MicpICE9PSAndW5kZWZpbmVkJyApIHtcclxuICAgICAgICAkaW5wdXQuc2VsZWN0MihcInRyaWdnZXJcIiwgXCJzZWxlY3RcIiwge1xyXG4gICAgICAgICAgICBkYXRhOiB2YWx1ZVxyXG4gICAgICAgIH0pLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzd2l0Y2goIHR5cGUgKSB7XHJcbiBcclxuICAgICAgICBjYXNlICdjaGVja2JveCc6XHJcbiAgICAgICAgJGlucHV0LnByb3AoJ2NoZWNrZWQnLCB2YWx1ZSkudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAndHJ1ZV9mYWxzZSc6XHJcbiAgICAgICAgJGlucHV0LnByb3AoJ2NoZWNrZWQnLCB2YWx1ZSkudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiBcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgaWYoICRpbnB1dC5oYXNDbGFzcygnaGFzRGF0ZXBpY2tlcicpICkge1xyXG4gICAgICAgICRpbnB1dC5kYXRlcGlja2VyKCBcInNldERhdGVcIiwgdmFsdWUgKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gXHJcbiAgICAgIC8vIGRlZmF1bHRcclxuICAgICAgJGlucHV0LnZhbCggdmFsdWUgKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuIiwiXHJcbi8qKlxyXG4gKiBBQ0YgRnJvbnRlbmQgRm9ybVxyXG4gKiBWZXJzaW9uOiAxLjBcclxuICovXHJcblxyXG5nbG9iYWwualF1ZXJ5ID0gJCA9IHdpbmRvdy5qUXVlcnk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBQ0ZGcm9udGVuZEZvcm0ge1xyXG5cclxuICBjb25zdHJ1Y3RvciggJGZvcm0sIGpzT3B0aW9ucyA9IHt9ICkge1xyXG5cclxuICAgIC8vIHJldHVybiBpZiB0aGVyZSBpcyBubyBmb3JtIGVsZW1lbnRcclxuICAgIGlmKCAhJGZvcm0ubGVuZ3RoICkge1xyXG4gICAgICBjb25zb2xlLndhcm4oICdGb3JtIGVsZW1lbnQgZG9lc25cXCd0IGV4aXN0JyApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAvLyByZXR1cm4gaWYgZ2xvYmFsIGFjZiBvYmplY3QgZG9lc24ndCBleGlzdFxyXG4gICAgaWYoIHR5cGVvZiBhY2YgPT09ICd1bmRlZmluZWQnICkge1xyXG4gICAgICBjb25zb2xlLndhcm4oICdUaGUgZ2xvYmFsIGFjZiBvYmplY3QgaXMgbm90IGRlZmluZWQnICk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIC8vIHJldHVybiBpZiBmb3JtIGhhcyBhbHJlYWR5IGJlZW4gaW5pdGlhbGl6ZWRcclxuICAgIGlmKCAkZm9ybS5oYXNDbGFzcygncmFoLWlzLWluaXRpYWxpemVkJykgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgICRmb3JtLmFkZENsYXNzKCdyYWgtaXMtaW5pdGlhbGl6ZWQnKTtcclxuXHJcbiAgICBsZXQgZGVmYXVsdE9wdGlvbnMgPSB7XHJcbiAgICAgIGFqYXhTdWJtaXQ6IHRydWUsXHJcbiAgICAgIHdhaXRBZnRlclN1Ym1pdDogMTAwMCxcclxuICAgICAgcmVzZXRBZnRlclN1Ym1pdDogdHJ1ZSxcclxuICAgICAgc3VibWl0T25DaGFuZ2U6IGZhbHNlXHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBkYXRhT3B0aW9ucyA9ICRmb3JtLmRhdGEoJ3JhaC1vcHRpb25zJykgfHwge307XHJcblxyXG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoIGRlZmF1bHRPcHRpb25zLCBkYXRhT3B0aW9ucywganNPcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy4kZm9ybSA9ICRmb3JtO1xyXG5cclxuICAgIGFjZi5kb0FjdGlvbignYXBwZW5kJywgJGZvcm0pO1xyXG4gICAgYWNmLnZhbGlkYXRpb24uZW5hYmxlKCk7XHJcbiAgICBcclxuICAgIHRoaXMuJGZvcm0uZmluZCgnLmFjZi1maWVsZCBpbnB1dCcpLmVhY2goKGksIGVsKSA9PiB7XHJcbiAgICAgIHRoaXMuYWRqdXN0SGFzVmFsdWVDbGFzcyggJChlbCkgKTtcclxuICAgIH0pXHJcblxyXG4gICAgdGhpcy5jcmVhdGVBamF4UmVzcG9uc2UoKTtcclxuICAgIHRoaXMuc2V0dXBGb3JtKCk7XHJcbiAgICB0aGlzLnNldHVwSW5wdXRzKCk7XHJcbiAgICB0aGlzLmhpZGVDb25kaXRpb25hbEZpZWxkcygpO1xyXG5cclxuICAgIHRoaXMuJGZvcm0uZGF0YSgnUkFIRnJvbnRlbmRGb3JtJywgdGhpcyk7XHJcbiAgfVxyXG5cclxuICBzZXR1cEZvcm0oKSB7XHJcbiAgICBcclxuICAgIGlmKCB0aGlzLm9wdGlvbnMuYWpheFN1Ym1pdCApIHtcclxuICAgICAgdGhpcy4kZm9ybS5hZGRDbGFzcygnaXMtYWpheC1zdWJtaXQnKTtcclxuICAgICAgdGhpcy4kZm9ybS5vbignc3VibWl0JywgKGUpID0+IHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuJGZvcm0uZmluZCgnW2RhdGEtZXZlbnQ9XCJhZGQtcm93XCJdJykucmVtb3ZlQ2xhc3MoJ2FjZi1pY29uJyk7XHJcblxyXG4gICAgLy8gZGlzYWJsZSB0aGUgY29uZmlybWF0aW9uIGZvciByZXBlYXRlciByZW1vdmUtcm93IGJ1dHRvbnNcclxuICAgIHRoaXMuJGZvcm0ub24oJ2NsaWNrJywgJ1tkYXRhLWV2ZW50PVwicmVtb3ZlLXJvd1wiXScsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgJCh0aGlzKS5jbGljaygpO1xyXG4gICAgfSk7XHJcblxyXG4gIH1cclxuXHJcbiAgZG9BamF4U3VibWl0KCkge1xyXG5cclxuICAgIC8vIEZpeCBmb3IgU2FmYXJpIFdlYmtpdCDigJMgZW1wdHkgZmlsZSBpbnB1dHNcclxuICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS80OTgyNzQyNi81ODY4MjNcclxuICAgIGxldCAkZmlsZUlucHV0cyA9ICQoJ2lucHV0W3R5cGU9XCJmaWxlXCJdOm5vdChbZGlzYWJsZWRdKScsIHRoaXMuJGZvcm0pXHJcbiAgICAkZmlsZUlucHV0cy5lYWNoKGZ1bmN0aW9uKGksIGlucHV0KSB7XHJcbiAgICAgIGlmKCBpbnB1dC5maWxlcy5sZW5ndGggPiAwICkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICAkKGlucHV0KS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xyXG4gICAgfSlcclxuICAgIFxyXG4gICAgdmFyIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCB0aGlzLiRmb3JtWzBdICk7XHJcblxyXG4gICAgLy8gUmUtZW5hYmxlIGVtcHR5IGZpbGUgJGZpbGVJbnB1dHNcclxuICAgICRmaWxlSW5wdXRzLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xyXG5cclxuICAgIGFjZi52YWxpZGF0aW9uLmxvY2tGb3JtKCB0aGlzLiRmb3JtICk7XHJcbiAgICB0aGlzLiRmb3JtLmFkZENsYXNzKCdyYWgtaXMtbG9ja2VkJyk7XHJcblxyXG4gICAgJC5hamF4KHtcclxuICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcclxuICAgICAgbWV0aG9kOiAncG9zdCcsXHJcbiAgICAgIGRhdGE6IGZvcm1EYXRhLFxyXG4gICAgICBjYWNoZTogZmFsc2UsXHJcbiAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcclxuICAgICAgY29udGVudFR5cGU6IGZhbHNlXHJcbiAgICB9KS5kb25lKHJlc3BvbnNlID0+IHtcclxuICAgICAgdGhpcy5oYW5kbGVBamF4UmVzcG9uc2UoIHJlc3BvbnNlICk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGhhbmRsZUFqYXhSZXNwb25zZSggcmVzcG9uc2UgKSB7XHJcbiAgICBhY2YudmFsaWRhdGlvbi5oaWRlU3Bpbm5lcigpO1xyXG4gICAgdGhpcy5zaG93QWpheFJlc3BvbnNlKCByZXNwb25zZSApO1xyXG4gICAgc2V0VGltZW91dCggKCkgPT4ge1xyXG4gICAgICB0aGlzLiRmb3JtLnJlbW92ZUNsYXNzKCdzaG93LWFqYXgtcmVzcG9uc2UnKTtcclxuICAgICAgYWNmLnZhbGlkYXRpb24udW5sb2NrRm9ybSggdGhpcy4kZm9ybSApO1xyXG4gICAgICB0aGlzLiRmb3JtLnJlbW92ZUNsYXNzKCdyYWgtaXMtbG9ja2VkJyk7XHJcbiAgICAgIGlmKCB0aGlzLm9wdGlvbnMucmVzZXRBZnRlclN1Ym1pdCApIHtcclxuICAgICAgICB0aGlzLnJlc2V0Rm9ybSgpO1xyXG4gICAgICB9XHJcbiAgICB9LCB0aGlzLm9wdGlvbnMud2FpdEFmdGVyU3VibWl0ICk7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVBamF4UmVzcG9uc2UoKSB7XHJcbiAgICB0aGlzLiRhamF4UmVzcG9uc2UgPSAkKCc8ZGl2IGNsYXNzPVwiYWNmLWFqYXgtcmVzcG9uc2VcIj48L2Rpdj4nKTtcclxuICAgIHRoaXMuJGZvcm0uZmluZCgnLmFjZi1mb3JtLXN1Ym1pdCcpLmFwcGVuZCggdGhpcy4kYWpheFJlc3BvbnNlICk7XHJcbiAgfVxyXG5cclxuICBzaG93QWpheFJlc3BvbnNlKCByZXNwb25zZSApIHtcclxuICAgIGxldCBtZXNzYWdlID0gcmVzcG9uc2UuZGF0YS5tZXNzYWdlO1xyXG4gICAgdGhpcy4kYWpheFJlc3BvbnNlXHJcbiAgICAgIC50ZXh0KCBtZXNzYWdlIClcclxuICAgICAgLnRvZ2dsZUNsYXNzKCdpcy0tZXJyb3InLCByZXNwb25zZS5zdWNjZXNzID09PSBmYWxzZSk7XHJcbiAgICBcclxuICAgIHRoaXMuJGZvcm0uYWRkQ2xhc3MoJ3Nob3ctYWpheC1yZXNwb25zZScpO1xyXG4gIH1cclxuXHJcbiAgcmVzZXRGb3JtKCkge1xyXG4gICAgdGhpcy4kZm9ybS5nZXQoMCkucmVzZXQoKTtcclxuICAgIHRoaXMuJGZvcm0uZmluZCgnLmFjZi1maWVsZCcpLmZpbmQoJ2lucHV0LHRleHRhcmVhLHNlbGVjdCcpLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgdGhpcy4kZm9ybS5maW5kKCcuYWNmLWZpZWxkJykucmVtb3ZlQ2xhc3MoJ2hhcy12YWx1ZSBoYXMtZm9jdXMnKTtcclxuICB9XHJcblxyXG4gIGluaXRJbWFnZURyb3BzKCkge1xyXG4gICAgJCgnLmFjZi1maWVsZC1pbWFnZScpLmVhY2goKGksIGVsKSA9PiB7XHJcbiAgICAgIG5ldyBJbWFnZURyb3AoICQoZWwpICk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGhpZGVDb25kaXRpb25hbEZpZWxkcygpIHtcclxuICAgIHRoaXMuJGZvcm0uZmluZCgnLmFjZi1maWVsZC5oaWRkZW4tYnktY29uZGl0aW9uYWwtbG9naWMnKS5oaWRlKCk7XHJcbiAgfVxyXG5cclxuICBzZXR1cElucHV0cygpIHtcclxuICAgIGxldCBzZWxlY3RvciA9ICdpbnB1dCx0ZXh0YXJlYSxzZWxlY3QnO1xyXG4gICAgdGhpcy4kZm9ybS5vbiggJ2tleXVwIGtleWRvd24gY2hhbmdlJywgc2VsZWN0b3IsIGUgPT4gdGhpcy5hZGp1c3RIYXNWYWx1ZUNsYXNzKCAkKGUuY3VycmVudFRhcmdldCkgKSApO1xyXG4gICAgdGhpcy4kZm9ybS5vbiggJ2NoYW5nZScsIHNlbGVjdG9yLCBlID0+IHRoaXMubWF5YmVTdWJtaXRGb3JtKCkgKTtcclxuICAgIHRoaXMuJGZvcm0ub24oICdmb2N1cycsIHNlbGVjdG9yLCBlID0+IHRoaXMub25JbnB1dEZvY3VzKCBlLmN1cnJlbnRUYXJnZXQgKSApO1xyXG4gICAgdGhpcy4kZm9ybS5vbiggJ2JsdXInLCBzZWxlY3RvciwgZSA9PiB0aGlzLm9uSW5wdXRCbHVyKCBlLmN1cnJlbnRUYXJnZXQgKSApO1xyXG4gICAgICBcclxuICB9XHJcbiAgYWRqdXN0SGFzVmFsdWVDbGFzcyggJGlucHV0ICkge1xyXG5cclxuICAgIGxldCAkZmllbGQgPSAkaW5wdXQucGFyZW50cygnLmFjZi1maWVsZDpmaXJzdCcpO1xyXG4gICAgbGV0IGZpZWxkID0gYWNmLmdldEluc3RhbmNlKCAkZmllbGQgKTtcclxuICAgIGlmKCB0eXBlb2YgZmllbGQgPT09ICd1bmRlZmluZWQnICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBsZXQgdHlwZSA9ICRpbnB1dC5hdHRyKCd0eXBlJyk7XHJcbiAgICBsZXQgdmFsID0gJGlucHV0LnZhbCgpO1xyXG5cclxuICAgIGxldCBlbmFibGVkSW5wdXRzID0gW1xyXG4gICAgICAndGV4dCcsXHJcbiAgICAgICdwYXNzd29yZCcsXHJcbiAgICAgICd1cmwnLFxyXG4gICAgICAnZW1haWwnLFxyXG4gICAgICAndGV4dGFyZWEnLFxyXG4gICAgICAnc2VsZWN0JyxcclxuICAgICAgJ3RydWVfZmFsc2UnLFxyXG4gICAgICAnZGF0ZV9waWNrZXInLFxyXG4gICAgICAndGltZV9waWNrZXInLFxyXG4gICAgICAnZGF0ZV90aW1lX3BpY2tlcicsXHJcbiAgICAgICdvZW1iZWQnXHJcbiAgICBdO1xyXG4gICAgaWYoICQuaW5BcnJheSggZmllbGQuZ2V0KCd0eXBlJyksIGVuYWJsZWRJbnB1dHMgKSA9PT0gLTEgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmKCB0eXBlID09PSAnY2hlY2tib3gnICkge1xyXG4gICAgICB2YWwgPSAkaW5wdXQucHJvcCgnY2hlY2tlZCcpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiggdmFsICkge1xyXG4gICAgICAkZmllbGQuYWRkQ2xhc3MoJ2hhcy12YWx1ZScpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJGZpZWxkLnJlbW92ZUNsYXNzKCdoYXMtdmFsdWUnKTtcclxuICAgIH1cclxuICB9XHJcbiAgbWF5YmVTdWJtaXRGb3JtKCkge1xyXG4gICAgaWYoIHRoaXMub3B0aW9ucy5zdWJtaXRPbkNoYW5nZSApIHtcclxuICAgICAgdGhpcy4kZm9ybS5maW5kKCdbdHlwZT1cInN1Ym1pdFwiXScpLmNsaWNrKCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIG9uSW5wdXRGb2N1cyggZWwgKSB7XHJcbiAgICB0aGlzLiRmaWVsZCggZWwgKS5hZGRDbGFzcygnaGFzLWZvY3VzJyk7XHJcbiAgfVxyXG4gIG9uSW5wdXRCbHVyKCBlbCApIHtcclxuICAgIHRoaXMuJGZpZWxkKCBlbCApLnJlbW92ZUNsYXNzKCdoYXMtZm9jdXMnKTtcclxuICB9XHJcbiAgJGZpZWxkKCBpbnB1dCApIHtcclxuICAgIHJldHVybiAkKGlucHV0KS5wYXJlbnRzKCcuYWNmLWZpZWxkOmZpcnN0Jyk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuIiwiXHJcbmdsb2JhbC5qUXVlcnkgPSAkID0gd2luZG93LmpRdWVyeTtcclxuXHJcbmltcG9ydCBmZWF0aGVyIGZyb20gJ2ZlYXRoZXItaWNvbnMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW1hZ2VEcm9wIHtcclxuICBcclxuICBjb25zdHJ1Y3RvciggYWNmRmllbGQgKSB7XHJcbiAgICAvLyB2YXJzXHJcbiAgICB0aGlzLmFjZkZpZWxkID0gYWNmRmllbGQ7XHJcblxyXG4gICAgdGhpcy4kZWwgPSBhY2ZGaWVsZC4kZWw7XHJcbiAgICBcclxuICAgIHRoaXMuJGlucHV0ID0gdGhpcy4kZWwuZmluZCgnaW5wdXRbdHlwZT1cImZpbGVcIl0nKTtcclxuICAgIHRoaXMuJGltYWdlUHJldmlldyA9IHRoaXMuJGVsLmZpbmQoJy5pbWFnZS13cmFwJyk7XHJcbiAgICB0aGlzLiRpbWFnZSA9IHRoaXMuJGltYWdlUHJldmlldy5maW5kKCdpbWcnKTtcclxuICAgIHRoaXMuJGNsZWFyID0gdGhpcy4kZWwuZmluZCgnW2RhdGEtbmFtZT1cInJlbW92ZVwiXScpO1xyXG4gICAgdGhpcy4kY2xlYXIuaHRtbChmZWF0aGVyLmljb25zWyd4LWNpcmNsZSddLnRvU3ZnKCkpO1xyXG4gICAgXHJcbiAgICB0aGlzLiRpbWFnZVVwbG9hZGVyID0gdGhpcy4kZWwuZmluZCgnLmFjZi1pbWFnZS11cGxvYWRlcicpO1xyXG4gICAgdGhpcy4kaW5zdHJ1Y3Rpb25zID0gdGhpcy4kZWwuZmluZCgnLmluc3RydWN0aW9ucycpO1xyXG4gICAgdGhpcy4kaW5zdHJ1Y3Rpb25zLmFwcGVuZFRvKCB0aGlzLiRpbWFnZVVwbG9hZGVyICk7XHJcbiAgICB0aGlzLmRhdGFTZXR0aW5ncyA9IHRoaXMuJGluc3RydWN0aW9ucy5kYXRhKCdzZXR0aW5ncycpO1xyXG4gICAgdGhpcy5tYXhGaWxlU2l6ZSA9IHRoaXMubWF5YmVHZXQoICdtYXhfc2l6ZScsIHRoaXMuZGF0YVNldHRpbmdzLCBmYWxzZSApO1xyXG5cclxuICAgIHRoaXMuJGVsLmFkZENsYXNzKCdpbWFnZS1kcm9wJyk7XHJcbiAgICB0aGlzLnNldHVwRXZlbnRzKCk7XHJcbiAgICB0aGlzLnJlbmRlckltYWdlKCB0aGlzLiRpbWFnZS5hdHRyKCdzcmMnKSApO1xyXG4gICAgXHJcbiAgfVxyXG5cclxuICBtYXliZUdldCgga2V5LCBvYmplY3QsIGZhbGxiYWNrICkge1xyXG4gICAgbGV0IHZhbHVlID0gb2JqZWN0W2tleV07XHJcbiAgICBpZiggdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJyApIHtcclxuICAgICAgdmFsdWUgPSBmYWxsYmFjaztcclxuICAgIH1cclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHNldHVwRXZlbnRzKCkge1xyXG4gICAgXHJcbiAgICBpZiggJC5pbkFycmF5KCAnZGF0YVRyYW5zZmVyJywgJC5ldmVudC5wcm9wcyApID09PSAtMSApIHtcclxuICAgICAgJC5ldmVudC5wcm9wcy5wdXNoKCdkYXRhVHJhbnNmZXInKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLiRpbWFnZVVwbG9hZGVyLm9uKCdkcmFnb3ZlcicsIChlKSA9PiB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgdGhpcy4kaW1hZ2VVcGxvYWRlci5hZGRDbGFzcygnaXMtZHJhZ292ZXInKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJGltYWdlVXBsb2FkZXIub24oJ2RyYWdsZWF2ZScsICgpID0+IHtcclxuICAgICAgdGhpcy4kaW1hZ2VVcGxvYWRlci5yZW1vdmVDbGFzcygnaXMtZHJhZ292ZXInKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJGltYWdlVXBsb2FkZXIub24oJ2Ryb3AnLCAoZSkgPT4ge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIHRoaXMuJGltYWdlVXBsb2FkZXIucmVtb3ZlQ2xhc3MoJ2lzLWRyYWdvdmVyJyk7XHJcbiAgICAgIHRoaXMuJGlucHV0LmdldCgwKS5maWxlcyA9IGUuZGF0YVRyYW5zZmVyLmZpbGVzO1xyXG4gICAgICB0aGlzLiRpbnB1dC50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgLy8gdGhpcy5wYXJzZUZpbGUoIGUuZGF0YVRyYW5zZmVyLmZpbGVzWzBdICk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRjbGVhci51bmJpbmQoKS5jbGljaygoZSkgPT4ge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIHRoaXMuY2xlYXIoKTtcclxuICAgIH0pXHJcblxyXG4gICAgdGhpcy5jdXJyZW50SW1hZ2VTcmMgPSB0aGlzLiRpbWFnZS5hdHRyKCdzcmMnKTtcclxuXHJcbiAgICB0aGlzLmxhc3RJbnB1dFZhbCA9IHRoaXMuJGlucHV0LnZhbCgpO1xyXG4gICAgdGhpcy4kaW5wdXQuY2hhbmdlKCBlID0+IHRoaXMub25JbnB1dENoYW5nZSggdGhpcy4kaW5wdXQgKSApO1xyXG4gIH1cclxuICBcclxuXHJcbiAgcmVuZGVySW1hZ2UoIHNyYyApIHtcclxuXHJcbiAgICBpZiggdHlwZW9mIHNyYyA9PT0gJ3VuZGVmaW5lZCcgfHwgIXNyYy5sZW5ndGggKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgaW1nID0gbmV3IEltYWdlO1xyXG4gICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgbGV0IHJhdGlvID0gaW1nLmhlaWdodCAvIGltZy53aWR0aDtcclxuICAgICAgaWYoIHJhdGlvIDwgMC41ICkge1xyXG4gICAgICAgIHRoaXMuY2xlYXIoIFtgVGhlIGltYWdlIGNhbid0IGJlIG1vcmUgdGhhbiB0d2ljZSB0aGUgd2lkdGggb2YgaXQncyBoZWlnaHRgXSApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfSBlbHNlIGlmKCByYXRpbyA+IDIgKSB7XHJcbiAgICAgICAgdGhpcy5jbGVhciggW2BUaGUgaW1hZ2UgY2FuJ3QgYmUgbW9yZSB0aGFuIHR3aWNlIHRoZSBoZWlnaHQgb2YgaXQncyB3aWR0aGBdICk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGxldCBwYWRkaW5nQm90dG9tID0gTWF0aC5mbG9vciggcmF0aW8gKiAxMDAgKTtcclxuICAgICAgdGhpcy4kaW1hZ2VVcGxvYWRlci5jc3Moe1xyXG4gICAgICAgIHBhZGRpbmdCb3R0b206IGAke3BhZGRpbmdCb3R0b219JWAsXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICB0aGlzLiRpbWFnZS5hdHRyKCdzcmMnLCBzcmMpO1xyXG4gICAgICB0aGlzLiRpbWFnZVVwbG9hZGVyLmFkZENsYXNzKCdoYXMtdmFsdWUnKTtcclxuXHJcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3JhaC9hY2YtZm9ybS1yZXNpemVkJyk7XHJcblxyXG4gICAgfVxyXG4gICAgaW1nLnNyYyA9IHNyYztcclxuICB9XHJcblxyXG4gIGNsZWFyKCBlcnJvcnMgPSBmYWxzZSApIHtcclxuICAgIHRoaXMuYWNmRmllbGQucmVtb3ZlQXR0YWNobWVudCgpO1xyXG4gICAgdGhpcy4kaW5wdXQudmFsKCcnKTtcclxuICAgIHRoaXMubGFzdElucHV0VmFsID0gdGhpcy4kaW5wdXQudmFsKCk7XHJcbiAgICB0aGlzLiRpbWFnZVVwbG9hZGVyLmNzcyh7IHBhZGRpbmdCb3R0b206ICcnIH0pO1xyXG4gICAgaWYoIGVycm9ycyApIHtcclxuICAgICAgdGhpcy5hY2ZGaWVsZC5zaG93RXJyb3IoIGVycm9ycy5qb2luKCc8YnI+JykgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG9uSW5wdXRDaGFuZ2UoICRpbnB1dCApIHtcclxuICAgIGlmKCB0aGlzLmxhc3RJbnB1dFZhbCA9PT0gJGlucHV0LnZhbCgpICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLmxhc3RJbnB1dFZhbCA9ICRpbnB1dC52YWwoKTtcclxuICAgIGlmKCAkaW5wdXQudmFsKCkgKSB7XHJcbiAgICAgIHRoaXMucGFyc2VGaWxlKCAkaW5wdXRbMF0uZmlsZXNbMF0gKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuY2xlYXIoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHBhcnNlRmlsZSggZmlsZSApIHtcclxuICAgIGxldCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gICAgcmVhZGVyLm9ubG9hZCA9IChlKSA9PiB7XHJcbiAgICAgIGxldCBlcnJvcnMgPSB0aGlzLmdldEVycm9ycyggZmlsZSApO1xyXG4gICAgICBpZiggIWVycm9ycyApIHtcclxuICAgICAgICB0aGlzLnJlbmRlckltYWdlKCBlLnRhcmdldC5yZXN1bHQgKTtcclxuICAgICAgICB0aGlzLmFjZkZpZWxkLnJlbW92ZUVycm9yKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5jbGVhciggZXJyb3JzICk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJJbWFnZSggdGhpcy5jdXJyZW50SW1hZ2VTcmMgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoIGZpbGUgKTtcclxuICB9XHJcblxyXG4gIGdldEVycm9ycyggZmlsZSApIHtcclxuICAgIGxldCBlcnJvcnMgPSBbXTtcclxuXHJcbiAgICAvLyBDaGVjayBmb3IgbWF4IHNpemVcclxuICAgIGxldCBtYXhTaXplID0gdGhpcy5tYXliZUdldCggJ21heF9zaXplJywgdGhpcy5kYXRhU2V0dGluZ3MucmVzdHJpY3Rpb25zLCBmYWxzZSApXHJcbiAgICBpZiggbWF4U2l6ZSAmJiBmaWxlLnNpemUgLyAxMDAwMDAwID4gbWF4U2l6ZS52YWx1ZSApIHtcclxuICAgICAgZXJyb3JzLnB1c2goIG1heFNpemUuZXJyb3IgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBmb3IgbWltZSB0eXBlXHJcbiAgICBsZXQgbWltZVR5cGVzID0gdGhpcy5tYXliZUdldCggJ21pbWVfdHlwZXMnLCB0aGlzLmRhdGFTZXR0aW5ncy5yZXN0cmljdGlvbnMsIGZhbHNlIClcclxuICAgIGlmKCBtaW1lVHlwZXMgKSB7XHJcbiAgICAgIGxldCBleHRlbnNpb24gPSBmaWxlLm5hbWUuc3BsaXQoJy4nKS5wb3AoKS50b0xvd2VyQ2FzZSgpOyAgLy8gZmlsZSBleHRlbnNpb24gZnJvbSBpbnB1dCBmaWxlXHJcbiAgICAgIGxldCBpc1ZhbGlkTWltZVR5cGUgPSAkLmluQXJyYXkoIGV4dGVuc2lvbiwgbWltZVR5cGVzLnZhbHVlICkgPiAtMTsgIC8vIGlzIGV4dGVuc2lvbiBpbiBhY2NlcHRhYmxlIHR5cGVzXHJcbiAgICAgIGlmKCAhaXNWYWxpZE1pbWVUeXBlICkge1xyXG4gICAgICAgIGVycm9ycy5wdXNoKCBtaW1lVHlwZXMuZXJyb3IgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBlcnJvcnMubGVuZ3RoID8gZXJyb3JzIDogZmFsc2U7XHJcbiAgfVxyXG5cclxuICBcclxufVxyXG4iLCJcclxuZ2xvYmFsLmpRdWVyeSA9ICQgPSB3aW5kb3cualF1ZXJ5O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWF4TGVuZ3RoIHtcclxuICBcclxuICBjb25zdHJ1Y3RvciggZmllbGQgKSB7XHJcbiAgICBsZXQgJGVsID0gZmllbGQuJGVsO1xyXG4gICAgdGhpcy4kaW5mbyA9ICRlbC5maW5kKCcubWF4bGVuZ3RoLWluZm8nKTtcclxuICAgIHRoaXMubWF4ID0gcGFyc2VJbnQoIHRoaXMuJGluZm8uYXR0cignZGF0YS1tYXhsZW5ndGgnKSwgMTAgKTtcclxuICAgIHRoaXMuJHJlbWFpbmluZ0NvdW50ID0gJGVsLmZpbmQoJy5yZW1haW5pbmctY291bnQnKTtcclxuICAgIHRoaXMuJGlucHV0ID0gZmllbGQuJGlucHV0KCk7XHJcbiAgICB0aGlzLiRpbnB1dC5vbiggJ2lucHV0IG1heGxlbmd0aDp1cGRhdGUnLCAoKSA9PiB0aGlzLnVwZGF0ZSgpICk7XHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgbGV0IHZhbHVlID0gdGhpcy4kaW5wdXQudmFsKCk7XHJcbiAgICBsZXQgcmVtYWluaW5nID0gdGhpcy5tYXggLSB2YWx1ZS5sZW5ndGg7XHJcbiAgICByZW1haW5pbmcgPSBNYXRoLm1heCggMCwgcmVtYWluaW5nICk7XHJcbiAgICBpZiggcmVtYWluaW5nIDwgMjAgKSB7XHJcbiAgICAgIHRoaXMuJGluZm8uYWRkQ2xhc3MoJ2lzLXdhcm5pbmcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuJGluZm8ucmVtb3ZlQ2xhc3MoJ2lzLXdhcm5pbmcnKTtcclxuICAgIH1cclxuICAgIHRoaXMuJHJlbWFpbmluZ0NvdW50LnRleHQoIHJlbWFpbmluZyApO1xyXG4gICAgdGhpcy4kaW5wdXQudmFsKCB2YWx1ZS5zdWJzdHJpbmcoIDAsIHRoaXMubWF4ICkgKTtcclxuICB9XHJcblxyXG59XHJcbiIsIlxyXG4vKipcclxuICogQUNGIEZyb250ZW5kIEZvcm1zXHJcbiAqIFZlcnNpb246IDEuMFxyXG4gKi9cclxuXHJcbmdsb2JhbC5qUXVlcnkgPSAkID0gd2luZG93LmpRdWVyeTtcclxuXHJcbmltcG9ydCAnLi9tb2R1bGVzL2F1dG9maWxsJztcclxuaW1wb3J0IEFDRkZyb250ZW5kRm9ybSBmcm9tICcuL21vZHVsZXMvZnJvbnRlbmQtZm9ybSc7XHJcbmltcG9ydCBJbWFnZURyb3AgZnJvbSAnLi9tb2R1bGVzL2ltYWdlLWRyb3AnO1xyXG5pbXBvcnQgTWF4TGVuZ3RoIGZyb20gJy4vbW9kdWxlcy9tYXhsZW5ndGgnO1xyXG5pbXBvcnQgYXV0b3NpemUgZnJvbSAnYXV0b3NpemUnO1xyXG5cclxud2luZG93LnJhaCA9IHdpbmRvdy5yYWggfHwge307XHJcblxyXG53aW5kb3cucmFoLmFjZkZvcm0gPSBmdW5jdGlvbiggJGZvcm0sIG9wdGlvbnMgPSB7fSApIHtcclxuICBsZXQgaW5zdGFuY2UgPSAkZm9ybS5kYXRhKCdSQUhGcm9udGVuZEZvcm0nKTtcclxuICByZXR1cm4gaW5zdGFuY2UgfHwgbmV3IEFDRkZyb250ZW5kRm9ybSggJGZvcm0sIG9wdGlvbnMgKTtcclxufVxyXG5cclxuY2xhc3MgQXBwIHtcclxuICBcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICBpZiggdHlwZW9mIGFjZiA9PT0gJ3VuZGVmaW5lZCcgKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybiggJ1RoZSBnbG9iYWwgYWNmIG9iamVjdCBpcyBub3QgZGVmaW5lZCcgKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLnNldHVwKCk7XHJcbiAgICB0aGlzLnNldHVwQWpheFN1Ym1pdCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0dXAgZ2xvYmFsIGFjZiBmdW5jdGlvbnMgYW5kIGhvb2tzXHJcbiAgICovXHJcbiAgc2V0dXAoKSB7XHJcbiAgICBcclxuICAgIC8vIGFkZCBpbml0aWFsaXplZCBjbGFzcyB0byBmaWVsZHMgb24gaW5pdGlhbGl6YXRpb25cclxuICAgIGFjZi5hZGRBY3Rpb24oJ25ld19maWVsZCcsICggZmllbGQgKSA9PiB7XHJcbiAgICAgIGZpZWxkLiRlbC5hZGRDbGFzcygncmFoLWlzLWluaXRpYWxpemVkJyk7XHJcbiAgICAgIHRoaXMuaW5pdE1heElucHV0SW5mbyggZmllbGQgKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGFjZi5hZGRBY3Rpb24oJ25ld19maWVsZC90eXBlPWltYWdlJywgKCBmaWVsZCApID0+IHtcclxuICAgICAgbmV3IEltYWdlRHJvcCggZmllbGQgKTtcclxuICAgIH0pXHJcblxyXG4gICAgYWNmLmFkZEFjdGlvbignbmV3X2ZpZWxkL3R5cGU9dGV4dGFyZWEnLCAoIGZpZWxkICkgPT4ge1xyXG4gICAgICB0aGlzLmluaXRBdXRvc2l6ZSggZmllbGQgKTtcclxuICAgIH0pXHJcblxyXG4gICAgLy8gZnVuY3Rpb25zXHJcbiAgICBhY2YudmFsaWRhdGlvbi5zaG93X3NwaW5uZXIgPSBhY2YudmFsaWRhdGlvbi5zaG93U3Bpbm5lciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKCdodG1sJykuYWRkQ2xhc3MoJ2lzLWxvYWRpbmctZm9ybScpO1xyXG4gICAgfVxyXG4gICAgYWNmLnZhbGlkYXRpb24uaGlkZV9zcGlubmVyID0gYWNmLnZhbGlkYXRpb24uaGlkZVNwaW5uZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdpcy1sb2FkaW5nLWZvcm0nKTtcclxuICAgIH1cclxuICAgIGFjZi5hZGRBY3Rpb24oJ3JlbW92ZScsIGZ1bmN0aW9uKCAkdGFyZ2V0ICkge1xyXG4gICAgICAkdGFyZ2V0LnJlbW92ZSgpO1xyXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdyYWgvYWNmLWZvcm0tcmVzaXplZCcpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgYWNmLmFkZEFjdGlvbiggJ2FwcGVuZCcsIGZ1bmN0aW9uKCAkZWwgKSB7XHJcbiAgICAgIGxldCAkcmVwZWF0ZXIgPSAkZWwucGFyZW50cygnLmFjZi1yZXBlYXRlcicpO1xyXG4gICAgICBpZiggISRyZXBlYXRlci5sZW5ndGggKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIGFkanVzdCBkaXNhYmxlZCBjbGFzc1xyXG4gICAgICBsZXQgbyA9IGFjZi5nZXRfZGF0YSggJHJlcGVhdGVyICk7XHJcbiAgICAgIGxldCBjb3VudCA9ICRyZXBlYXRlci5maW5kKCcuYWNmLXJvdycpLmxlbmd0aCAtIDE7XHJcbiAgICAgIGlmKCBvLm1heCA+IDAgJiYgY291bnQgPj0gby5tYXggKSB7XHJcbiAgICAgICAgJGVsLmZpbmQoJ1tkYXRhLWV2ZW50PVwiYWRkLXJvd1wiXScpLmFkZENsYXNzKCdpcy1kaXNhYmxlZCcpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIGZvY3VzIHRoZSBmaXJzdCBpbnB1dCBvZiB0aGUgbmV3IHJvd1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBsZXQgJGlucHV0ID0gJGVsLmZpbmQoJ2lucHV0OmZpcnN0Jyk7XHJcbiAgICAgICAgaWYoICEkaW5wdXQubGVuZ3RoICkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkaW5wdXQuZm9jdXMoKTtcclxuICAgICAgfSwgMSk7XHJcblxyXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdyYWgvYWNmLWZvcm0tcmVzaXplZCcpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXR1cCB0aGUgYWpheCBzdWJtaXRcclxuICAgKi9cclxuICBzZXR1cEFqYXhTdWJtaXQoKSB7XHJcblxyXG4gICAgYWNmLmFkZEFjdGlvbignc3VibWl0JywgKCAkZm9ybSApID0+IHtcclxuXHJcbiAgICAgIGlmKCAhJGZvcm0uaGFzQ2xhc3MoJ2lzLWFqYXgtc3VibWl0JykgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuZ2V0SW5zdGFuY2UoICRmb3JtICkuZG9BamF4U3VibWl0KCk7XHJcblxyXG4gICAgfSk7XHJcblxyXG4gIH1cclxuXHJcbiAgZ2V0SW5zdGFuY2UoICRmb3JtICkge1xyXG4gICAgcmV0dXJuICRmb3JtLmRhdGEoJ1JBSEZyb250ZW5kRm9ybScpO1xyXG4gIH1cclxuXHJcbiAgaW5pdE1heElucHV0SW5mbyggZmllbGQgKSB7XHJcbiAgICBsZXQgJGluZm8gPSBmaWVsZC4kZWwuZmluZCgnLm1heGxlbmd0aC1pbmZvJyk7XHJcbiAgICBpZiggJGluZm8ubGVuZ3RoICkge1xyXG4gICAgICBuZXcgTWF4TGVuZ3RoKCBmaWVsZCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaW5pdEF1dG9zaXplKCBmaWVsZCApIHtcclxuICAgIGxldCAkaW5wdXQgPSBmaWVsZC4kaW5wdXQoKTtcclxuICAgIFxyXG4gICAgJGlucHV0LmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgYXV0b3NpemUodGhpcyk7XHJcbiAgICB9KS5vbignYXV0b3NpemU6cmVzaXplZCcsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3JhaC9hY2YtZm9ybS1yZXNpemVkJyk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbm5ldyBBcHAoKTtcclxuIiwiLyohXG5cdGF1dG9zaXplIDQuMC4yXG5cdGxpY2Vuc2U6IE1JVFxuXHRodHRwOi8vd3d3LmphY2tsbW9vcmUuY29tL2F1dG9zaXplXG4qL1xuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0ZGVmaW5lKFsnbW9kdWxlJywgJ2V4cG9ydHMnXSwgZmFjdG9yeSk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRmYWN0b3J5KG1vZHVsZSwgZXhwb3J0cyk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIG1vZCA9IHtcblx0XHRcdGV4cG9ydHM6IHt9XG5cdFx0fTtcblx0XHRmYWN0b3J5KG1vZCwgbW9kLmV4cG9ydHMpO1xuXHRcdGdsb2JhbC5hdXRvc2l6ZSA9IG1vZC5leHBvcnRzO1xuXHR9XG59KSh0aGlzLCBmdW5jdGlvbiAobW9kdWxlLCBleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgbWFwID0gdHlwZW9mIE1hcCA9PT0gXCJmdW5jdGlvblwiID8gbmV3IE1hcCgpIDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBrZXlzID0gW107XG5cdFx0dmFyIHZhbHVlcyA9IFtdO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGhhczogZnVuY3Rpb24gaGFzKGtleSkge1xuXHRcdFx0XHRyZXR1cm4ga2V5cy5pbmRleE9mKGtleSkgPiAtMTtcblx0XHRcdH0sXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldChrZXkpIHtcblx0XHRcdFx0cmV0dXJuIHZhbHVlc1trZXlzLmluZGV4T2Yoa2V5KV07XG5cdFx0XHR9LFxuXHRcdFx0c2V0OiBmdW5jdGlvbiBzZXQoa2V5LCB2YWx1ZSkge1xuXHRcdFx0XHRpZiAoa2V5cy5pbmRleE9mKGtleSkgPT09IC0xKSB7XG5cdFx0XHRcdFx0a2V5cy5wdXNoKGtleSk7XG5cdFx0XHRcdFx0dmFsdWVzLnB1c2godmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0ZGVsZXRlOiBmdW5jdGlvbiBfZGVsZXRlKGtleSkge1xuXHRcdFx0XHR2YXIgaW5kZXggPSBrZXlzLmluZGV4T2Yoa2V5KTtcblx0XHRcdFx0aWYgKGluZGV4ID4gLTEpIHtcblx0XHRcdFx0XHRrZXlzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0XHRcdFx0dmFsdWVzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR9KCk7XG5cblx0dmFyIGNyZWF0ZUV2ZW50ID0gZnVuY3Rpb24gY3JlYXRlRXZlbnQobmFtZSkge1xuXHRcdHJldHVybiBuZXcgRXZlbnQobmFtZSwgeyBidWJibGVzOiB0cnVlIH0pO1xuXHR9O1xuXHR0cnkge1xuXHRcdG5ldyBFdmVudCgndGVzdCcpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0Ly8gSUUgZG9lcyBub3Qgc3VwcG9ydCBgbmV3IEV2ZW50KClgXG5cdFx0Y3JlYXRlRXZlbnQgPSBmdW5jdGlvbiBjcmVhdGVFdmVudChuYW1lKSB7XG5cdFx0XHR2YXIgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG5cdFx0XHRldnQuaW5pdEV2ZW50KG5hbWUsIHRydWUsIGZhbHNlKTtcblx0XHRcdHJldHVybiBldnQ7XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIGFzc2lnbih0YSkge1xuXHRcdGlmICghdGEgfHwgIXRhLm5vZGVOYW1lIHx8IHRhLm5vZGVOYW1lICE9PSAnVEVYVEFSRUEnIHx8IG1hcC5oYXModGEpKSByZXR1cm47XG5cblx0XHR2YXIgaGVpZ2h0T2Zmc2V0ID0gbnVsbDtcblx0XHR2YXIgY2xpZW50V2lkdGggPSBudWxsO1xuXHRcdHZhciBjYWNoZWRIZWlnaHQgPSBudWxsO1xuXG5cdFx0ZnVuY3Rpb24gaW5pdCgpIHtcblx0XHRcdHZhciBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRhLCBudWxsKTtcblxuXHRcdFx0aWYgKHN0eWxlLnJlc2l6ZSA9PT0gJ3ZlcnRpY2FsJykge1xuXHRcdFx0XHR0YS5zdHlsZS5yZXNpemUgPSAnbm9uZSc7XG5cdFx0XHR9IGVsc2UgaWYgKHN0eWxlLnJlc2l6ZSA9PT0gJ2JvdGgnKSB7XG5cdFx0XHRcdHRhLnN0eWxlLnJlc2l6ZSA9ICdob3Jpem9udGFsJztcblx0XHRcdH1cblxuXHRcdFx0aWYgKHN0eWxlLmJveFNpemluZyA9PT0gJ2NvbnRlbnQtYm94Jykge1xuXHRcdFx0XHRoZWlnaHRPZmZzZXQgPSAtKHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ1RvcCkgKyBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdCb3R0b20pKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGhlaWdodE9mZnNldCA9IHBhcnNlRmxvYXQoc3R5bGUuYm9yZGVyVG9wV2lkdGgpICsgcGFyc2VGbG9hdChzdHlsZS5ib3JkZXJCb3R0b21XaWR0aCk7XG5cdFx0XHR9XG5cdFx0XHQvLyBGaXggd2hlbiBhIHRleHRhcmVhIGlzIG5vdCBvbiBkb2N1bWVudCBib2R5IGFuZCBoZWlnaHRPZmZzZXQgaXMgTm90IGEgTnVtYmVyXG5cdFx0XHRpZiAoaXNOYU4oaGVpZ2h0T2Zmc2V0KSkge1xuXHRcdFx0XHRoZWlnaHRPZmZzZXQgPSAwO1xuXHRcdFx0fVxuXG5cdFx0XHR1cGRhdGUoKTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBjaGFuZ2VPdmVyZmxvdyh2YWx1ZSkge1xuXHRcdFx0e1xuXHRcdFx0XHQvLyBDaHJvbWUvU2FmYXJpLXNwZWNpZmljIGZpeDpcblx0XHRcdFx0Ly8gV2hlbiB0aGUgdGV4dGFyZWEgeS1vdmVyZmxvdyBpcyBoaWRkZW4sIENocm9tZS9TYWZhcmkgZG8gbm90IHJlZmxvdyB0aGUgdGV4dCB0byBhY2NvdW50IGZvciB0aGUgc3BhY2Vcblx0XHRcdFx0Ly8gbWFkZSBhdmFpbGFibGUgYnkgcmVtb3ZpbmcgdGhlIHNjcm9sbGJhci4gVGhlIGZvbGxvd2luZyBmb3JjZXMgdGhlIG5lY2Vzc2FyeSB0ZXh0IHJlZmxvdy5cblx0XHRcdFx0dmFyIHdpZHRoID0gdGEuc3R5bGUud2lkdGg7XG5cdFx0XHRcdHRhLnN0eWxlLndpZHRoID0gJzBweCc7XG5cdFx0XHRcdC8vIEZvcmNlIHJlZmxvdzpcblx0XHRcdFx0LyoganNoaW50IGlnbm9yZTpzdGFydCAqL1xuXHRcdFx0XHR0YS5vZmZzZXRXaWR0aDtcblx0XHRcdFx0LyoganNoaW50IGlnbm9yZTplbmQgKi9cblx0XHRcdFx0dGEuc3R5bGUud2lkdGggPSB3aWR0aDtcblx0XHRcdH1cblxuXHRcdFx0dGEuc3R5bGUub3ZlcmZsb3dZID0gdmFsdWU7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZ2V0UGFyZW50T3ZlcmZsb3dzKGVsKSB7XG5cdFx0XHR2YXIgYXJyID0gW107XG5cblx0XHRcdHdoaWxlIChlbCAmJiBlbC5wYXJlbnROb2RlICYmIGVsLnBhcmVudE5vZGUgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG5cdFx0XHRcdGlmIChlbC5wYXJlbnROb2RlLnNjcm9sbFRvcCkge1xuXHRcdFx0XHRcdGFyci5wdXNoKHtcblx0XHRcdFx0XHRcdG5vZGU6IGVsLnBhcmVudE5vZGUsXG5cdFx0XHRcdFx0XHRzY3JvbGxUb3A6IGVsLnBhcmVudE5vZGUuc2Nyb2xsVG9wXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWwgPSBlbC5wYXJlbnROb2RlO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gYXJyO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHJlc2l6ZSgpIHtcblx0XHRcdGlmICh0YS5zY3JvbGxIZWlnaHQgPT09IDApIHtcblx0XHRcdFx0Ly8gSWYgdGhlIHNjcm9sbEhlaWdodCBpcyAwLCB0aGVuIHRoZSBlbGVtZW50IHByb2JhYmx5IGhhcyBkaXNwbGF5Om5vbmUgb3IgaXMgZGV0YWNoZWQgZnJvbSB0aGUgRE9NLlxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHZhciBvdmVyZmxvd3MgPSBnZXRQYXJlbnRPdmVyZmxvd3ModGEpO1xuXHRcdFx0dmFyIGRvY1RvcCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wOyAvLyBOZWVkZWQgZm9yIE1vYmlsZSBJRSAodGlja2V0ICMyNDApXG5cblx0XHRcdHRhLnN0eWxlLmhlaWdodCA9ICcnO1xuXHRcdFx0dGEuc3R5bGUuaGVpZ2h0ID0gdGEuc2Nyb2xsSGVpZ2h0ICsgaGVpZ2h0T2Zmc2V0ICsgJ3B4JztcblxuXHRcdFx0Ly8gdXNlZCB0byBjaGVjayBpZiBhbiB1cGRhdGUgaXMgYWN0dWFsbHkgbmVjZXNzYXJ5IG9uIHdpbmRvdy5yZXNpemVcblx0XHRcdGNsaWVudFdpZHRoID0gdGEuY2xpZW50V2lkdGg7XG5cblx0XHRcdC8vIHByZXZlbnRzIHNjcm9sbC1wb3NpdGlvbiBqdW1waW5nXG5cdFx0XHRvdmVyZmxvd3MuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcblx0XHRcdFx0ZWwubm9kZS5zY3JvbGxUb3AgPSBlbC5zY3JvbGxUb3A7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKGRvY1RvcCkge1xuXHRcdFx0XHRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wID0gZG9jVG9wO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHVwZGF0ZSgpIHtcblx0XHRcdHJlc2l6ZSgpO1xuXG5cdFx0XHR2YXIgc3R5bGVIZWlnaHQgPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQodGEuc3R5bGUuaGVpZ2h0KSk7XG5cdFx0XHR2YXIgY29tcHV0ZWQgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YSwgbnVsbCk7XG5cblx0XHRcdC8vIFVzaW5nIG9mZnNldEhlaWdodCBhcyBhIHJlcGxhY2VtZW50IGZvciBjb21wdXRlZC5oZWlnaHQgaW4gSUUsIGJlY2F1c2UgSUUgZG9lcyBub3QgYWNjb3VudCB1c2Ugb2YgYm9yZGVyLWJveFxuXHRcdFx0dmFyIGFjdHVhbEhlaWdodCA9IGNvbXB1dGVkLmJveFNpemluZyA9PT0gJ2NvbnRlbnQtYm94JyA/IE1hdGgucm91bmQocGFyc2VGbG9hdChjb21wdXRlZC5oZWlnaHQpKSA6IHRhLm9mZnNldEhlaWdodDtcblxuXHRcdFx0Ly8gVGhlIGFjdHVhbCBoZWlnaHQgbm90IG1hdGNoaW5nIHRoZSBzdHlsZSBoZWlnaHQgKHNldCB2aWEgdGhlIHJlc2l6ZSBtZXRob2QpIGluZGljYXRlcyB0aGF0IFxuXHRcdFx0Ly8gdGhlIG1heC1oZWlnaHQgaGFzIGJlZW4gZXhjZWVkZWQsIGluIHdoaWNoIGNhc2UgdGhlIG92ZXJmbG93IHNob3VsZCBiZSBhbGxvd2VkLlxuXHRcdFx0aWYgKGFjdHVhbEhlaWdodCA8IHN0eWxlSGVpZ2h0KSB7XG5cdFx0XHRcdGlmIChjb21wdXRlZC5vdmVyZmxvd1kgPT09ICdoaWRkZW4nKSB7XG5cdFx0XHRcdFx0Y2hhbmdlT3ZlcmZsb3coJ3Njcm9sbCcpO1xuXHRcdFx0XHRcdHJlc2l6ZSgpO1xuXHRcdFx0XHRcdGFjdHVhbEhlaWdodCA9IGNvbXB1dGVkLmJveFNpemluZyA9PT0gJ2NvbnRlbnQtYm94JyA/IE1hdGgucm91bmQocGFyc2VGbG9hdCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YSwgbnVsbCkuaGVpZ2h0KSkgOiB0YS5vZmZzZXRIZWlnaHQ7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIE5vcm1hbGx5IGtlZXAgb3ZlcmZsb3cgc2V0IHRvIGhpZGRlbiwgdG8gYXZvaWQgZmxhc2ggb2Ygc2Nyb2xsYmFyIGFzIHRoZSB0ZXh0YXJlYSBleHBhbmRzLlxuXHRcdFx0XHRpZiAoY29tcHV0ZWQub3ZlcmZsb3dZICE9PSAnaGlkZGVuJykge1xuXHRcdFx0XHRcdGNoYW5nZU92ZXJmbG93KCdoaWRkZW4nKTtcblx0XHRcdFx0XHRyZXNpemUoKTtcblx0XHRcdFx0XHRhY3R1YWxIZWlnaHQgPSBjb21wdXRlZC5ib3hTaXppbmcgPT09ICdjb250ZW50LWJveCcgPyBNYXRoLnJvdW5kKHBhcnNlRmxvYXQod2luZG93LmdldENvbXB1dGVkU3R5bGUodGEsIG51bGwpLmhlaWdodCkpIDogdGEub2Zmc2V0SGVpZ2h0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChjYWNoZWRIZWlnaHQgIT09IGFjdHVhbEhlaWdodCkge1xuXHRcdFx0XHRjYWNoZWRIZWlnaHQgPSBhY3R1YWxIZWlnaHQ7XG5cdFx0XHRcdHZhciBldnQgPSBjcmVhdGVFdmVudCgnYXV0b3NpemU6cmVzaXplZCcpO1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHRhLmRpc3BhdGNoRXZlbnQoZXZ0KTtcblx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0Ly8gRmlyZWZveCB3aWxsIHRocm93IGFuIGVycm9yIG9uIGRpc3BhdGNoRXZlbnQgZm9yIGEgZGV0YWNoZWQgZWxlbWVudFxuXHRcdFx0XHRcdC8vIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTg4OTM3NlxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dmFyIHBhZ2VSZXNpemUgPSBmdW5jdGlvbiBwYWdlUmVzaXplKCkge1xuXHRcdFx0aWYgKHRhLmNsaWVudFdpZHRoICE9PSBjbGllbnRXaWR0aCkge1xuXHRcdFx0XHR1cGRhdGUoKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0dmFyIGRlc3Ryb3kgPSBmdW5jdGlvbiAoc3R5bGUpIHtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBwYWdlUmVzaXplLCBmYWxzZSk7XG5cdFx0XHR0YS5yZW1vdmVFdmVudExpc3RlbmVyKCdpbnB1dCcsIHVwZGF0ZSwgZmFsc2UpO1xuXHRcdFx0dGEucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cGRhdGUsIGZhbHNlKTtcblx0XHRcdHRhLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2F1dG9zaXplOmRlc3Ryb3knLCBkZXN0cm95LCBmYWxzZSk7XG5cdFx0XHR0YS5yZW1vdmVFdmVudExpc3RlbmVyKCdhdXRvc2l6ZTp1cGRhdGUnLCB1cGRhdGUsIGZhbHNlKTtcblxuXHRcdFx0T2JqZWN0LmtleXMoc3R5bGUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHR0YS5zdHlsZVtrZXldID0gc3R5bGVba2V5XTtcblx0XHRcdH0pO1xuXG5cdFx0XHRtYXAuZGVsZXRlKHRhKTtcblx0XHR9LmJpbmQodGEsIHtcblx0XHRcdGhlaWdodDogdGEuc3R5bGUuaGVpZ2h0LFxuXHRcdFx0cmVzaXplOiB0YS5zdHlsZS5yZXNpemUsXG5cdFx0XHRvdmVyZmxvd1k6IHRhLnN0eWxlLm92ZXJmbG93WSxcblx0XHRcdG92ZXJmbG93WDogdGEuc3R5bGUub3ZlcmZsb3dYLFxuXHRcdFx0d29yZFdyYXA6IHRhLnN0eWxlLndvcmRXcmFwXG5cdFx0fSk7XG5cblx0XHR0YS5hZGRFdmVudExpc3RlbmVyKCdhdXRvc2l6ZTpkZXN0cm95JywgZGVzdHJveSwgZmFsc2UpO1xuXG5cdFx0Ly8gSUU5IGRvZXMgbm90IGZpcmUgb25wcm9wZXJ0eWNoYW5nZSBvciBvbmlucHV0IGZvciBkZWxldGlvbnMsXG5cdFx0Ly8gc28gYmluZGluZyB0byBvbmtleXVwIHRvIGNhdGNoIG1vc3Qgb2YgdGhvc2UgZXZlbnRzLlxuXHRcdC8vIFRoZXJlIGlzIG5vIHdheSB0aGF0IEkga25vdyBvZiB0byBkZXRlY3Qgc29tZXRoaW5nIGxpa2UgJ2N1dCcgaW4gSUU5LlxuXHRcdGlmICgnb25wcm9wZXJ0eWNoYW5nZScgaW4gdGEgJiYgJ29uaW5wdXQnIGluIHRhKSB7XG5cdFx0XHR0YS5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVwZGF0ZSwgZmFsc2UpO1xuXHRcdH1cblxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBwYWdlUmVzaXplLCBmYWxzZSk7XG5cdFx0dGEuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB1cGRhdGUsIGZhbHNlKTtcblx0XHR0YS5hZGRFdmVudExpc3RlbmVyKCdhdXRvc2l6ZTp1cGRhdGUnLCB1cGRhdGUsIGZhbHNlKTtcblx0XHR0YS5zdHlsZS5vdmVyZmxvd1ggPSAnaGlkZGVuJztcblx0XHR0YS5zdHlsZS53b3JkV3JhcCA9ICdicmVhay13b3JkJztcblxuXHRcdG1hcC5zZXQodGEsIHtcblx0XHRcdGRlc3Ryb3k6IGRlc3Ryb3ksXG5cdFx0XHR1cGRhdGU6IHVwZGF0ZVxuXHRcdH0pO1xuXG5cdFx0aW5pdCgpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGVzdHJveSh0YSkge1xuXHRcdHZhciBtZXRob2RzID0gbWFwLmdldCh0YSk7XG5cdFx0aWYgKG1ldGhvZHMpIHtcblx0XHRcdG1ldGhvZHMuZGVzdHJveSgpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHVwZGF0ZSh0YSkge1xuXHRcdHZhciBtZXRob2RzID0gbWFwLmdldCh0YSk7XG5cdFx0aWYgKG1ldGhvZHMpIHtcblx0XHRcdG1ldGhvZHMudXBkYXRlKCk7XG5cdFx0fVxuXHR9XG5cblx0dmFyIGF1dG9zaXplID0gbnVsbDtcblxuXHQvLyBEbyBub3RoaW5nIGluIE5vZGUuanMgZW52aXJvbm1lbnQgYW5kIElFOCAob3IgbG93ZXIpXG5cdGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2Ygd2luZG93LmdldENvbXB1dGVkU3R5bGUgIT09ICdmdW5jdGlvbicpIHtcblx0XHRhdXRvc2l6ZSA9IGZ1bmN0aW9uIGF1dG9zaXplKGVsKSB7XG5cdFx0XHRyZXR1cm4gZWw7XG5cdFx0fTtcblx0XHRhdXRvc2l6ZS5kZXN0cm95ID0gZnVuY3Rpb24gKGVsKSB7XG5cdFx0XHRyZXR1cm4gZWw7XG5cdFx0fTtcblx0XHRhdXRvc2l6ZS51cGRhdGUgPSBmdW5jdGlvbiAoZWwpIHtcblx0XHRcdHJldHVybiBlbDtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdGF1dG9zaXplID0gZnVuY3Rpb24gYXV0b3NpemUoZWwsIG9wdGlvbnMpIHtcblx0XHRcdGlmIChlbCkge1xuXHRcdFx0XHRBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGVsLmxlbmd0aCA/IGVsIDogW2VsXSwgZnVuY3Rpb24gKHgpIHtcblx0XHRcdFx0XHRyZXR1cm4gYXNzaWduKHgsIG9wdGlvbnMpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBlbDtcblx0XHR9O1xuXHRcdGF1dG9zaXplLmRlc3Ryb3kgPSBmdW5jdGlvbiAoZWwpIHtcblx0XHRcdGlmIChlbCkge1xuXHRcdFx0XHRBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGVsLmxlbmd0aCA/IGVsIDogW2VsXSwgZGVzdHJveSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZWw7XG5cdFx0fTtcblx0XHRhdXRvc2l6ZS51cGRhdGUgPSBmdW5jdGlvbiAoZWwpIHtcblx0XHRcdGlmIChlbCkge1xuXHRcdFx0XHRBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGVsLmxlbmd0aCA/IGVsIDogW2VsXSwgdXBkYXRlKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBlbDtcblx0XHR9O1xuXHR9XG5cblx0ZXhwb3J0cy5kZWZhdWx0ID0gYXV0b3NpemU7XG5cdG1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xufSk7IiwiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiZmVhdGhlclwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJmZWF0aGVyXCJdID0gZmFjdG9yeSgpO1xufSkodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuIC8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0aTogbW9kdWxlSWQsXG4vKioqKioqLyBcdFx0XHRsOiBmYWxzZSxcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbi8qKioqKiovIFx0XHRtb2R1bGUubCA9IHRydWU7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG4vKioqKioqL1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4vKioqKioqLyBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuLyoqKioqKi8gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbi8qKioqKiovIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbi8qKioqKiovIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbi8qKioqKiovIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbi8qKioqKiovIFx0XHRcdH0pO1xuLyoqKioqKi8gXHRcdH1cbi8qKioqKiovIFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuLyoqKioqKi8gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4vKioqKioqLyBcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbi8qKioqKiovIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbi8qKioqKiovIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4vKioqKioqLyBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbi8qKioqKiovIFx0XHRyZXR1cm4gZ2V0dGVyO1xuLyoqKioqKi8gXHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG4vKioqKioqL1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoe1xuXG4vKioqLyBcIi4vZGlzdC9pY29ucy5qc29uXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vZGlzdC9pY29ucy5qc29uICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIGV4cG9ydHMgcHJvdmlkZWQ6IGFjdGl2aXR5LCBhaXJwbGF5LCBhbGVydC1jaXJjbGUsIGFsZXJ0LW9jdGFnb24sIGFsZXJ0LXRyaWFuZ2xlLCBhbGlnbi1jZW50ZXIsIGFsaWduLWp1c3RpZnksIGFsaWduLWxlZnQsIGFsaWduLXJpZ2h0LCBhbmNob3IsIGFwZXJ0dXJlLCBhcmNoaXZlLCBhcnJvdy1kb3duLWNpcmNsZSwgYXJyb3ctZG93bi1sZWZ0LCBhcnJvdy1kb3duLXJpZ2h0LCBhcnJvdy1kb3duLCBhcnJvdy1sZWZ0LWNpcmNsZSwgYXJyb3ctbGVmdCwgYXJyb3ctcmlnaHQtY2lyY2xlLCBhcnJvdy1yaWdodCwgYXJyb3ctdXAtY2lyY2xlLCBhcnJvdy11cC1sZWZ0LCBhcnJvdy11cC1yaWdodCwgYXJyb3ctdXAsIGF0LXNpZ24sIGF3YXJkLCBiYXItY2hhcnQtMiwgYmFyLWNoYXJ0LCBiYXR0ZXJ5LWNoYXJnaW5nLCBiYXR0ZXJ5LCBiZWxsLW9mZiwgYmVsbCwgYmx1ZXRvb3RoLCBib2xkLCBib29rLW9wZW4sIGJvb2ssIGJvb2ttYXJrLCBib3gsIGJyaWVmY2FzZSwgY2FsZW5kYXIsIGNhbWVyYS1vZmYsIGNhbWVyYSwgY2FzdCwgY2hlY2stY2lyY2xlLCBjaGVjay1zcXVhcmUsIGNoZWNrLCBjaGV2cm9uLWRvd24sIGNoZXZyb24tbGVmdCwgY2hldnJvbi1yaWdodCwgY2hldnJvbi11cCwgY2hldnJvbnMtZG93biwgY2hldnJvbnMtbGVmdCwgY2hldnJvbnMtcmlnaHQsIGNoZXZyb25zLXVwLCBjaHJvbWUsIGNpcmNsZSwgY2xpcGJvYXJkLCBjbG9jaywgY2xvdWQtZHJpenpsZSwgY2xvdWQtbGlnaHRuaW5nLCBjbG91ZC1vZmYsIGNsb3VkLXJhaW4sIGNsb3VkLXNub3csIGNsb3VkLCBjb2RlLCBjb2RlcGVuLCBjb21tYW5kLCBjb21wYXNzLCBjb3B5LCBjb3JuZXItZG93bi1sZWZ0LCBjb3JuZXItZG93bi1yaWdodCwgY29ybmVyLWxlZnQtZG93biwgY29ybmVyLWxlZnQtdXAsIGNvcm5lci1yaWdodC1kb3duLCBjb3JuZXItcmlnaHQtdXAsIGNvcm5lci11cC1sZWZ0LCBjb3JuZXItdXAtcmlnaHQsIGNwdSwgY3JlZGl0LWNhcmQsIGNyb3AsIGNyb3NzaGFpciwgZGF0YWJhc2UsIGRlbGV0ZSwgZGlzYywgZG9sbGFyLXNpZ24sIGRvd25sb2FkLWNsb3VkLCBkb3dubG9hZCwgZHJvcGxldCwgZWRpdC0yLCBlZGl0LTMsIGVkaXQsIGV4dGVybmFsLWxpbmssIGV5ZS1vZmYsIGV5ZSwgZmFjZWJvb2ssIGZhc3QtZm9yd2FyZCwgZmVhdGhlciwgZmlsZS1taW51cywgZmlsZS1wbHVzLCBmaWxlLXRleHQsIGZpbGUsIGZpbG0sIGZpbHRlciwgZmxhZywgZm9sZGVyLW1pbnVzLCBmb2xkZXItcGx1cywgZm9sZGVyLCBnaWZ0LCBnaXQtYnJhbmNoLCBnaXQtY29tbWl0LCBnaXQtbWVyZ2UsIGdpdC1wdWxsLXJlcXVlc3QsIGdpdGh1YiwgZ2l0bGFiLCBnbG9iZSwgZ3JpZCwgaGFyZC1kcml2ZSwgaGFzaCwgaGVhZHBob25lcywgaGVhcnQsIGhlbHAtY2lyY2xlLCBob21lLCBpbWFnZSwgaW5ib3gsIGluZm8sIGluc3RhZ3JhbSwgaXRhbGljLCBsYXllcnMsIGxheW91dCwgbGlmZS1idW95LCBsaW5rLTIsIGxpbmssIGxpbmtlZGluLCBsaXN0LCBsb2FkZXIsIGxvY2ssIGxvZy1pbiwgbG9nLW91dCwgbWFpbCwgbWFwLXBpbiwgbWFwLCBtYXhpbWl6ZS0yLCBtYXhpbWl6ZSwgbWVudSwgbWVzc2FnZS1jaXJjbGUsIG1lc3NhZ2Utc3F1YXJlLCBtaWMtb2ZmLCBtaWMsIG1pbmltaXplLTIsIG1pbmltaXplLCBtaW51cy1jaXJjbGUsIG1pbnVzLXNxdWFyZSwgbWludXMsIG1vbml0b3IsIG1vb24sIG1vcmUtaG9yaXpvbnRhbCwgbW9yZS12ZXJ0aWNhbCwgbW92ZSwgbXVzaWMsIG5hdmlnYXRpb24tMiwgbmF2aWdhdGlvbiwgb2N0YWdvbiwgcGFja2FnZSwgcGFwZXJjbGlwLCBwYXVzZS1jaXJjbGUsIHBhdXNlLCBwZXJjZW50LCBwaG9uZS1jYWxsLCBwaG9uZS1mb3J3YXJkZWQsIHBob25lLWluY29taW5nLCBwaG9uZS1taXNzZWQsIHBob25lLW9mZiwgcGhvbmUtb3V0Z29pbmcsIHBob25lLCBwaWUtY2hhcnQsIHBsYXktY2lyY2xlLCBwbGF5LCBwbHVzLWNpcmNsZSwgcGx1cy1zcXVhcmUsIHBsdXMsIHBvY2tldCwgcG93ZXIsIHByaW50ZXIsIHJhZGlvLCByZWZyZXNoLWNjdywgcmVmcmVzaC1jdywgcmVwZWF0LCByZXdpbmQsIHJvdGF0ZS1jY3csIHJvdGF0ZS1jdywgcnNzLCBzYXZlLCBzY2lzc29ycywgc2VhcmNoLCBzZW5kLCBzZXJ2ZXIsIHNldHRpbmdzLCBzaGFyZS0yLCBzaGFyZSwgc2hpZWxkLW9mZiwgc2hpZWxkLCBzaG9wcGluZy1iYWcsIHNob3BwaW5nLWNhcnQsIHNodWZmbGUsIHNpZGViYXIsIHNraXAtYmFjaywgc2tpcC1mb3J3YXJkLCBzbGFjaywgc2xhc2gsIHNsaWRlcnMsIHNtYXJ0cGhvbmUsIHNwZWFrZXIsIHNxdWFyZSwgc3Rhciwgc3RvcC1jaXJjbGUsIHN1biwgc3VucmlzZSwgc3Vuc2V0LCB0YWJsZXQsIHRhZywgdGFyZ2V0LCB0ZXJtaW5hbCwgdGhlcm1vbWV0ZXIsIHRodW1icy1kb3duLCB0aHVtYnMtdXAsIHRvZ2dsZS1sZWZ0LCB0b2dnbGUtcmlnaHQsIHRyYXNoLTIsIHRyYXNoLCB0cmVuZGluZy1kb3duLCB0cmVuZGluZy11cCwgdHJpYW5nbGUsIHRydWNrLCB0diwgdHdpdHRlciwgdHlwZSwgdW1icmVsbGEsIHVuZGVybGluZSwgdW5sb2NrLCB1cGxvYWQtY2xvdWQsIHVwbG9hZCwgdXNlci1jaGVjaywgdXNlci1taW51cywgdXNlci1wbHVzLCB1c2VyLXgsIHVzZXIsIHVzZXJzLCB2aWRlby1vZmYsIHZpZGVvLCB2b2ljZW1haWwsIHZvbHVtZS0xLCB2b2x1bWUtMiwgdm9sdW1lLXgsIHZvbHVtZSwgd2F0Y2gsIHdpZmktb2ZmLCB3aWZpLCB3aW5kLCB4LWNpcmNsZSwgeC1zcXVhcmUsIHgsIHlvdXR1YmUsIHphcC1vZmYsIHphcCwgem9vbS1pbiwgem9vbS1vdXQsIGRlZmF1bHQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUpIHtcblxubW9kdWxlLmV4cG9ydHMgPSB7XCJhY3Rpdml0eVwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMjIgMTIgMTggMTIgMTUgMjEgOSAzIDYgMTIgMiAxMlxcXCI+PC9wb2x5bGluZT5cIixcImFpcnBsYXlcIjpcIjxwYXRoIGQ9XFxcIk01IDE3SDRhMiAyIDAgMCAxLTItMlY1YTIgMiAwIDAgMSAyLTJoMTZhMiAyIDAgMCAxIDIgMnYxMGEyIDIgMCAwIDEtMiAyaC0xXFxcIj48L3BhdGg+PHBvbHlnb24gcG9pbnRzPVxcXCIxMiAxNSAxNyAyMSA3IDIxIDEyIDE1XFxcIj48L3BvbHlnb24+XCIsXCJhbGVydC1jaXJjbGVcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjEwXFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCI4XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjE2XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIxNlxcXCI+PC9saW5lPlwiLFwiYWxlcnQtb2N0YWdvblwiOlwiPHBvbHlnb24gcG9pbnRzPVxcXCI3Ljg2IDIgMTYuMTQgMiAyMiA3Ljg2IDIyIDE2LjE0IDE2LjE0IDIyIDcuODYgMjIgMiAxNi4xNCAyIDcuODYgNy44NiAyXFxcIj48L3BvbHlnb24+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiOFxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIxNlxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTZcXFwiPjwvbGluZT5cIixcImFsZXJ0LXRyaWFuZ2xlXCI6XCI8cGF0aCBkPVxcXCJNMTAuMjkgMy44NkwxLjgyIDE4YTIgMiAwIDAgMCAxLjcxIDNoMTYuOTRhMiAyIDAgMCAwIDEuNzEtM0wxMy43MSAzLjg2YTIgMiAwIDAgMC0zLjQyIDB6XFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiOVxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTNcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIxN1xcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTdcXFwiPjwvbGluZT5cIixcImFsaWduLWNlbnRlclwiOlwiPGxpbmUgeDE9XFxcIjE4XFxcIiB5MT1cXFwiMTBcXFwiIHgyPVxcXCI2XFxcIiB5Mj1cXFwiMTBcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMjFcXFwiIHkxPVxcXCI2XFxcIiB4Mj1cXFwiM1xcXCIgeTI9XFxcIjZcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMjFcXFwiIHkxPVxcXCIxNFxcXCIgeDI9XFxcIjNcXFwiIHkyPVxcXCIxNFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxOFxcXCIgeTE9XFxcIjE4XFxcIiB4Mj1cXFwiNlxcXCIgeTI9XFxcIjE4XFxcIj48L2xpbmU+XCIsXCJhbGlnbi1qdXN0aWZ5XCI6XCI8bGluZSB4MT1cXFwiMjFcXFwiIHkxPVxcXCIxMFxcXCIgeDI9XFxcIjNcXFwiIHkyPVxcXCIxMFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIyMVxcXCIgeTE9XFxcIjZcXFwiIHgyPVxcXCIzXFxcIiB5Mj1cXFwiNlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIyMVxcXCIgeTE9XFxcIjE0XFxcIiB4Mj1cXFwiM1xcXCIgeTI9XFxcIjE0XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjIxXFxcIiB5MT1cXFwiMThcXFwiIHgyPVxcXCIzXFxcIiB5Mj1cXFwiMThcXFwiPjwvbGluZT5cIixcImFsaWduLWxlZnRcIjpcIjxsaW5lIHgxPVxcXCIxN1xcXCIgeTE9XFxcIjEwXFxcIiB4Mj1cXFwiM1xcXCIgeTI9XFxcIjEwXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjIxXFxcIiB5MT1cXFwiNlxcXCIgeDI9XFxcIjNcXFwiIHkyPVxcXCI2XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjIxXFxcIiB5MT1cXFwiMTRcXFwiIHgyPVxcXCIzXFxcIiB5Mj1cXFwiMTRcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTdcXFwiIHkxPVxcXCIxOFxcXCIgeDI9XFxcIjNcXFwiIHkyPVxcXCIxOFxcXCI+PC9saW5lPlwiLFwiYWxpZ24tcmlnaHRcIjpcIjxsaW5lIHgxPVxcXCIyMVxcXCIgeTE9XFxcIjEwXFxcIiB4Mj1cXFwiN1xcXCIgeTI9XFxcIjEwXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjIxXFxcIiB5MT1cXFwiNlxcXCIgeDI9XFxcIjNcXFwiIHkyPVxcXCI2XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjIxXFxcIiB5MT1cXFwiMTRcXFwiIHgyPVxcXCIzXFxcIiB5Mj1cXFwiMTRcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMjFcXFwiIHkxPVxcXCIxOFxcXCIgeDI9XFxcIjdcXFwiIHkyPVxcXCIxOFxcXCI+PC9saW5lPlwiLFwiYW5jaG9yXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjVcXFwiIHI9XFxcIjNcXFwiPjwvY2lyY2xlPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjIyXFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCI4XFxcIj48L2xpbmU+PHBhdGggZD1cXFwiTTUgMTJIMmExMCAxMCAwIDAgMCAyMCAwaC0zXFxcIj48L3BhdGg+XCIsXCJhcGVydHVyZVwiOlwiPGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiMTBcXFwiPjwvY2lyY2xlPjxsaW5lIHgxPVxcXCIxNC4zMVxcXCIgeTE9XFxcIjhcXFwiIHgyPVxcXCIyMC4wNVxcXCIgeTI9XFxcIjE3Ljk0XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjkuNjlcXFwiIHkxPVxcXCI4XFxcIiB4Mj1cXFwiMjEuMTdcXFwiIHkyPVxcXCI4XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjcuMzhcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjEzLjEyXFxcIiB5Mj1cXFwiMi4wNlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI5LjY5XFxcIiB5MT1cXFwiMTZcXFwiIHgyPVxcXCIzLjk1XFxcIiB5Mj1cXFwiNi4wNlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNC4zMVxcXCIgeTE9XFxcIjE2XFxcIiB4Mj1cXFwiMi44M1xcXCIgeTI9XFxcIjE2XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE2LjYyXFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCIxMC44OFxcXCIgeTI9XFxcIjIxLjk0XFxcIj48L2xpbmU+XCIsXCJhcmNoaXZlXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIyMSA4IDIxIDIxIDMgMjEgMyA4XFxcIj48L3BvbHlsaW5lPjxyZWN0IHg9XFxcIjFcXFwiIHk9XFxcIjNcXFwiIHdpZHRoPVxcXCIyMlxcXCIgaGVpZ2h0PVxcXCI1XFxcIj48L3JlY3Q+PGxpbmUgeDE9XFxcIjEwXFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCIxNFxcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+XCIsXCJhcnJvdy1kb3duLWNpcmNsZVwiOlwiPGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiMTBcXFwiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9XFxcIjggMTIgMTIgMTYgMTYgMTJcXFwiPjwvcG9seWxpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiOFxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTZcXFwiPjwvbGluZT5cIixcImFycm93LWRvd24tbGVmdFwiOlwiPGxpbmUgeDE9XFxcIjE3XFxcIiB5MT1cXFwiN1xcXCIgeDI9XFxcIjdcXFwiIHkyPVxcXCIxN1xcXCI+PC9saW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjE3IDE3IDcgMTcgNyA3XFxcIj48L3BvbHlsaW5lPlwiLFwiYXJyb3ctZG93bi1yaWdodFwiOlwiPGxpbmUgeDE9XFxcIjdcXFwiIHkxPVxcXCI3XFxcIiB4Mj1cXFwiMTdcXFwiIHkyPVxcXCIxN1xcXCI+PC9saW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjE3IDcgMTcgMTcgNyAxN1xcXCI+PC9wb2x5bGluZT5cIixcImFycm93LWRvd25cIjpcIjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjVcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjE5XFxcIj48L2xpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTkgMTIgMTIgMTkgNSAxMlxcXCI+PC9wb2x5bGluZT5cIixcImFycm93LWxlZnQtY2lyY2xlXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxMFxcXCI+PC9jaXJjbGU+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTIgOCA4IDEyIDEyIDE2XFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCIxNlxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiOFxcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+XCIsXCJhcnJvdy1sZWZ0XCI6XCI8bGluZSB4MT1cXFwiMTlcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjVcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjEyIDE5IDUgMTIgMTIgNVxcXCI+PC9wb2x5bGluZT5cIixcImFycm93LXJpZ2h0LWNpcmNsZVwiOlwiPGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiMTBcXFwiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9XFxcIjEyIDE2IDE2IDEyIDEyIDhcXFwiPjwvcG9seWxpbmU+PGxpbmUgeDE9XFxcIjhcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjE2XFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT5cIixcImFycm93LXJpZ2h0XCI6XCI8bGluZSB4MT1cXFwiNVxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiMTlcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjEyIDUgMTkgMTIgMTIgMTlcXFwiPjwvcG9seWxpbmU+XCIsXCJhcnJvdy11cC1jaXJjbGVcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjEwXFxcIj48L2NpcmNsZT48cG9seWxpbmUgcG9pbnRzPVxcXCIxNiAxMiAxMiA4IDggMTJcXFwiPjwvcG9seWxpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMTZcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjhcXFwiPjwvbGluZT5cIixcImFycm93LXVwLWxlZnRcIjpcIjxsaW5lIHgxPVxcXCIxN1xcXCIgeTE9XFxcIjE3XFxcIiB4Mj1cXFwiN1xcXCIgeTI9XFxcIjdcXFwiPjwvbGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCI3IDE3IDcgNyAxNyA3XFxcIj48L3BvbHlsaW5lPlwiLFwiYXJyb3ctdXAtcmlnaHRcIjpcIjxsaW5lIHgxPVxcXCI3XFxcIiB5MT1cXFwiMTdcXFwiIHgyPVxcXCIxN1xcXCIgeTI9XFxcIjdcXFwiPjwvbGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCI3IDcgMTcgNyAxNyAxN1xcXCI+PC9wb2x5bGluZT5cIixcImFycm93LXVwXCI6XCI8bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIxOVxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiNVxcXCI+PC9saW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjUgMTIgMTIgNSAxOSAxMlxcXCI+PC9wb2x5bGluZT5cIixcImF0LXNpZ25cIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjRcXFwiPjwvY2lyY2xlPjxwYXRoIGQ9XFxcIk0xNiA4djVhMyAzIDAgMCAwIDYgMHYtMWExMCAxMCAwIDEgMC0zLjkyIDcuOTRcXFwiPjwvcGF0aD5cIixcImF3YXJkXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjhcXFwiIHI9XFxcIjdcXFwiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9XFxcIjguMjEgMTMuODkgNyAyMyAxMiAyMCAxNyAyMyAxNS43OSAxMy44OFxcXCI+PC9wb2x5bGluZT5cIixcImJhci1jaGFydC0yXCI6XCI8bGluZSB4MT1cXFwiMThcXFwiIHkxPVxcXCIyMFxcXCIgeDI9XFxcIjE4XFxcIiB5Mj1cXFwiMTBcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIyMFxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiNFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI2XFxcIiB5MT1cXFwiMjBcXFwiIHgyPVxcXCI2XFxcIiB5Mj1cXFwiMTRcXFwiPjwvbGluZT5cIixcImJhci1jaGFydFwiOlwiPGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMjBcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjEwXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE4XFxcIiB5MT1cXFwiMjBcXFwiIHgyPVxcXCIxOFxcXCIgeTI9XFxcIjRcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiNlxcXCIgeTE9XFxcIjIwXFxcIiB4Mj1cXFwiNlxcXCIgeTI9XFxcIjE2XFxcIj48L2xpbmU+XCIsXCJiYXR0ZXJ5LWNoYXJnaW5nXCI6XCI8cGF0aCBkPVxcXCJNNSAxOEgzYTIgMiAwIDAgMS0yLTJWOGEyIDIgMCAwIDEgMi0yaDMuMTlNMTUgNmgyYTIgMiAwIDAgMSAyIDJ2OGEyIDIgMCAwIDEtMiAyaC0zLjE5XFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjIzXFxcIiB5MT1cXFwiMTNcXFwiIHgyPVxcXCIyM1xcXCIgeTI9XFxcIjExXFxcIj48L2xpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTEgNiA3IDEyIDEzIDEyIDkgMThcXFwiPjwvcG9seWxpbmU+XCIsXCJiYXR0ZXJ5XCI6XCI8cmVjdCB4PVxcXCIxXFxcIiB5PVxcXCI2XFxcIiB3aWR0aD1cXFwiMThcXFwiIGhlaWdodD1cXFwiMTJcXFwiIHJ4PVxcXCIyXFxcIiByeT1cXFwiMlxcXCI+PC9yZWN0PjxsaW5lIHgxPVxcXCIyM1xcXCIgeTE9XFxcIjEzXFxcIiB4Mj1cXFwiMjNcXFwiIHkyPVxcXCIxMVxcXCI+PC9saW5lPlwiLFwiYmVsbC1vZmZcIjpcIjxwYXRoIGQ9XFxcIk04LjU2IDIuOUE3IDcgMCAwIDEgMTkgOXY0bS0yIDRIMmEzIDMgMCAwIDAgMy0zVjlhNyA3IDAgMCAxIC43OC0zLjIyTTEzLjczIDIxYTIgMiAwIDAgMS0zLjQ2IDBcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiMVxcXCIgeTE9XFxcIjFcXFwiIHgyPVxcXCIyM1xcXCIgeTI9XFxcIjIzXFxcIj48L2xpbmU+XCIsXCJiZWxsXCI6XCI8cGF0aCBkPVxcXCJNMjIgMTdIMmEzIDMgMCAwIDAgMy0zVjlhNyA3IDAgMCAxIDE0IDB2NWEzIDMgMCAwIDAgMyAzem0tOC4yNyA0YTIgMiAwIDAgMS0zLjQ2IDBcXFwiPjwvcGF0aD5cIixcImJsdWV0b290aFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiNi41IDYuNSAxNy41IDE3LjUgMTIgMjMgMTIgMSAxNy41IDYuNSA2LjUgMTcuNVxcXCI+PC9wb2x5bGluZT5cIixcImJvbGRcIjpcIjxwYXRoIGQ9XFxcIk02IDRoOGE0IDQgMCAwIDEgNCA0IDQgNCAwIDAgMS00IDRINnpcXFwiPjwvcGF0aD48cGF0aCBkPVxcXCJNNiAxMmg5YTQgNCAwIDAgMSA0IDQgNCA0IDAgMCAxLTQgNEg2elxcXCI+PC9wYXRoPlwiLFwiYm9vay1vcGVuXCI6XCI8cGF0aCBkPVxcXCJNMiAzaDZhNCA0IDAgMCAxIDQgNHYxNGEzIDMgMCAwIDAtMy0zSDJ6XFxcIj48L3BhdGg+PHBhdGggZD1cXFwiTTIyIDNoLTZhNCA0IDAgMCAwLTQgNHYxNGEzIDMgMCAwIDEgMy0zaDd6XFxcIj48L3BhdGg+XCIsXCJib29rXCI6XCI8cGF0aCBkPVxcXCJNNCAxOS41QTIuNSAyLjUgMCAwIDEgNi41IDE3SDIwXFxcIj48L3BhdGg+PHBhdGggZD1cXFwiTTYuNSAySDIwdjIwSDYuNUEyLjUgMi41IDAgMCAxIDQgMTkuNXYtMTVBMi41IDIuNSAwIDAgMSA2LjUgMnpcXFwiPjwvcGF0aD5cIixcImJvb2ttYXJrXCI6XCI8cGF0aCBkPVxcXCJNMTkgMjFsLTctNS03IDVWNWEyIDIgMCAwIDEgMi0yaDEwYTIgMiAwIDAgMSAyIDJ6XFxcIj48L3BhdGg+XCIsXCJib3hcIjpcIjxwYXRoIGQ9XFxcIk0xMi44OSAxLjQ1bDggNEEyIDIgMCAwIDEgMjIgNy4yNHY5LjUzYTIgMiAwIDAgMS0xLjExIDEuNzlsLTggNGEyIDIgMCAwIDEtMS43OSAwbC04LTRhMiAyIDAgMCAxLTEuMS0xLjhWNy4yNGEyIDIgMCAwIDEgMS4xMS0xLjc5bDgtNGEyIDIgMCAwIDEgMS43OCAwelxcXCI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9XFxcIjIuMzIgNi4xNiAxMiAxMSAyMS42OCA2LjE2XFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjIyLjc2XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIxMVxcXCI+PC9saW5lPlwiLFwiYnJpZWZjYXNlXCI6XCI8cmVjdCB4PVxcXCIyXFxcIiB5PVxcXCI3XFxcIiB3aWR0aD1cXFwiMjBcXFwiIGhlaWdodD1cXFwiMTRcXFwiIHJ4PVxcXCIyXFxcIiByeT1cXFwiMlxcXCI+PC9yZWN0PjxwYXRoIGQ9XFxcIk0xNiAyMVY1YTIgMiAwIDAgMC0yLTJoLTRhMiAyIDAgMCAwLTIgMnYxNlxcXCI+PC9wYXRoPlwiLFwiY2FsZW5kYXJcIjpcIjxyZWN0IHg9XFxcIjNcXFwiIHk9XFxcIjRcXFwiIHdpZHRoPVxcXCIxOFxcXCIgaGVpZ2h0PVxcXCIxOFxcXCIgcng9XFxcIjJcXFwiIHJ5PVxcXCIyXFxcIj48L3JlY3Q+PGxpbmUgeDE9XFxcIjE2XFxcIiB5MT1cXFwiMlxcXCIgeDI9XFxcIjE2XFxcIiB5Mj1cXFwiNlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI4XFxcIiB5MT1cXFwiMlxcXCIgeDI9XFxcIjhcXFwiIHkyPVxcXCI2XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjNcXFwiIHkxPVxcXCIxMFxcXCIgeDI9XFxcIjIxXFxcIiB5Mj1cXFwiMTBcXFwiPjwvbGluZT5cIixcImNhbWVyYS1vZmZcIjpcIjxsaW5lIHgxPVxcXCIxXFxcIiB5MT1cXFwiMVxcXCIgeDI9XFxcIjIzXFxcIiB5Mj1cXFwiMjNcXFwiPjwvbGluZT48cGF0aCBkPVxcXCJNMjEgMjFIM2EyIDIgMCAwIDEtMi0yVjhhMiAyIDAgMCAxIDItMmgzbTMtM2g2bDIgM2g0YTIgMiAwIDAgMSAyIDJ2OS4zNG0tNy43Mi0yLjA2YTQgNCAwIDEgMS01LjU2LTUuNTZcXFwiPjwvcGF0aD5cIixcImNhbWVyYVwiOlwiPHBhdGggZD1cXFwiTTIzIDE5YTIgMiAwIDAgMS0yIDJIM2EyIDIgMCAwIDEtMi0yVjhhMiAyIDAgMCAxIDItMmg0bDItM2g2bDIgM2g0YTIgMiAwIDAgMSAyIDJ6XFxcIj48L3BhdGg+PGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxM1xcXCIgcj1cXFwiNFxcXCI+PC9jaXJjbGU+XCIsXCJjYXN0XCI6XCI8cGF0aCBkPVxcXCJNMiAxNi4xQTUgNSAwIDAgMSA1LjkgMjBNMiAxMi4wNUE5IDkgMCAwIDEgOS45NSAyME0yIDhWNmEyIDIgMCAwIDEgMi0yaDE2YTIgMiAwIDAgMSAyIDJ2MTJhMiAyIDAgMCAxLTIgMmgtNlxcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCIyXFxcIiB5MT1cXFwiMjBcXFwiIHgyPVxcXCIyXFxcIiB5Mj1cXFwiMjBcXFwiPjwvbGluZT5cIixcImNoZWNrLWNpcmNsZVwiOlwiPHBhdGggZD1cXFwiTTIyIDExLjA4VjEyYTEwIDEwIDAgMSAxLTUuOTMtOS4xNFxcXCI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9XFxcIjIyIDQgMTIgMTQuMDEgOSAxMS4wMVxcXCI+PC9wb2x5bGluZT5cIixcImNoZWNrLXNxdWFyZVwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiOSAxMSAxMiAxNCAyMiA0XFxcIj48L3BvbHlsaW5lPjxwYXRoIGQ9XFxcIk0yMSAxMnY3YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0yVjVhMiAyIDAgMCAxIDItMmgxMVxcXCI+PC9wYXRoPlwiLFwiY2hlY2tcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjIwIDYgOSAxNyA0IDEyXFxcIj48L3BvbHlsaW5lPlwiLFwiY2hldnJvbi1kb3duXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCI2IDkgMTIgMTUgMTggOVxcXCI+PC9wb2x5bGluZT5cIixcImNoZXZyb24tbGVmdFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMTUgMTggOSAxMiAxNSA2XFxcIj48L3BvbHlsaW5lPlwiLFwiY2hldnJvbi1yaWdodFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiOSAxOCAxNSAxMiA5IDZcXFwiPjwvcG9seWxpbmU+XCIsXCJjaGV2cm9uLXVwXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIxOCAxNSAxMiA5IDYgMTVcXFwiPjwvcG9seWxpbmU+XCIsXCJjaGV2cm9ucy1kb3duXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCI3IDEzIDEyIDE4IDE3IDEzXFxcIj48L3BvbHlsaW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjcgNiAxMiAxMSAxNyA2XFxcIj48L3BvbHlsaW5lPlwiLFwiY2hldnJvbnMtbGVmdFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMTEgMTcgNiAxMiAxMSA3XFxcIj48L3BvbHlsaW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjE4IDE3IDEzIDEyIDE4IDdcXFwiPjwvcG9seWxpbmU+XCIsXCJjaGV2cm9ucy1yaWdodFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMTMgMTcgMTggMTIgMTMgN1xcXCI+PC9wb2x5bGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCI2IDE3IDExIDEyIDYgN1xcXCI+PC9wb2x5bGluZT5cIixcImNoZXZyb25zLXVwXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIxNyAxMSAxMiA2IDcgMTFcXFwiPjwvcG9seWxpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTcgMTggMTIgMTMgNyAxOFxcXCI+PC9wb2x5bGluZT5cIixcImNocm9tZVwiOlwiPGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiMTBcXFwiPjwvY2lyY2xlPjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjRcXFwiPjwvY2lyY2xlPjxsaW5lIHgxPVxcXCIyMS4xN1xcXCIgeTE9XFxcIjhcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjhcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMy45NVxcXCIgeTE9XFxcIjYuMDZcXFwiIHgyPVxcXCI4LjU0XFxcIiB5Mj1cXFwiMTRcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTAuODhcXFwiIHkxPVxcXCIyMS45NFxcXCIgeDI9XFxcIjE1LjQ2XFxcIiB5Mj1cXFwiMTRcXFwiPjwvbGluZT5cIixcImNpcmNsZVwiOlwiPGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiMTBcXFwiPjwvY2lyY2xlPlwiLFwiY2xpcGJvYXJkXCI6XCI8cGF0aCBkPVxcXCJNMTYgNGgyYTIgMiAwIDAgMSAyIDJ2MTRhMiAyIDAgMCAxLTIgMkg2YTIgMiAwIDAgMS0yLTJWNmEyIDIgMCAwIDEgMi0yaDJcXFwiPjwvcGF0aD48cmVjdCB4PVxcXCI4XFxcIiB5PVxcXCIyXFxcIiB3aWR0aD1cXFwiOFxcXCIgaGVpZ2h0PVxcXCI0XFxcIiByeD1cXFwiMVxcXCIgcnk9XFxcIjFcXFwiPjwvcmVjdD5cIixcImNsb2NrXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxMFxcXCI+PC9jaXJjbGU+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTIgNiAxMiAxMiAxNiAxNFxcXCI+PC9wb2x5bGluZT5cIixcImNsb3VkLWRyaXp6bGVcIjpcIjxsaW5lIHgxPVxcXCI4XFxcIiB5MT1cXFwiMTlcXFwiIHgyPVxcXCI4XFxcIiB5Mj1cXFwiMjFcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiOFxcXCIgeTE9XFxcIjEzXFxcIiB4Mj1cXFwiOFxcXCIgeTI9XFxcIjE1XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE2XFxcIiB5MT1cXFwiMTlcXFwiIHgyPVxcXCIxNlxcXCIgeTI9XFxcIjIxXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE2XFxcIiB5MT1cXFwiMTNcXFwiIHgyPVxcXCIxNlxcXCIgeTI9XFxcIjE1XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMjFcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjIzXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMTVcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjE3XFxcIj48L2xpbmU+PHBhdGggZD1cXFwiTTIwIDE2LjU4QTUgNSAwIDAgMCAxOCA3aC0xLjI2QTggOCAwIDEgMCA0IDE1LjI1XFxcIj48L3BhdGg+XCIsXCJjbG91ZC1saWdodG5pbmdcIjpcIjxwYXRoIGQ9XFxcIk0xOSAxNi45QTUgNSAwIDAgMCAxOCA3aC0xLjI2YTggOCAwIDEgMC0xMS42MiA5XFxcIj48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTMgMTEgOSAxNyAxNSAxNyAxMSAyM1xcXCI+PC9wb2x5bGluZT5cIixcImNsb3VkLW9mZlwiOlwiPHBhdGggZD1cXFwiTTIyLjYxIDE2Ljk1QTUgNSAwIDAgMCAxOCAxMGgtMS4yNmE4IDggMCAwIDAtNy4wNS02TTUgNWE4IDggMCAwIDAgNCAxNWg5YTUgNSAwIDAgMCAxLjctLjNcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiMVxcXCIgeTE9XFxcIjFcXFwiIHgyPVxcXCIyM1xcXCIgeTI9XFxcIjIzXFxcIj48L2xpbmU+XCIsXCJjbG91ZC1yYWluXCI6XCI8bGluZSB4MT1cXFwiMTZcXFwiIHkxPVxcXCIxM1xcXCIgeDI9XFxcIjE2XFxcIiB5Mj1cXFwiMjFcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiOFxcXCIgeTE9XFxcIjEzXFxcIiB4Mj1cXFwiOFxcXCIgeTI9XFxcIjIxXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMTVcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjIzXFxcIj48L2xpbmU+PHBhdGggZD1cXFwiTTIwIDE2LjU4QTUgNSAwIDAgMCAxOCA3aC0xLjI2QTggOCAwIDEgMCA0IDE1LjI1XFxcIj48L3BhdGg+XCIsXCJjbG91ZC1zbm93XCI6XCI8cGF0aCBkPVxcXCJNMjAgMTcuNThBNSA1IDAgMCAwIDE4IDhoLTEuMjZBOCA4IDAgMSAwIDQgMTYuMjVcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiOFxcXCIgeTE9XFxcIjE2XFxcIiB4Mj1cXFwiOFxcXCIgeTI9XFxcIjE2XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjhcXFwiIHkxPVxcXCIyMFxcXCIgeDI9XFxcIjhcXFwiIHkyPVxcXCIyMFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjE4XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIxOFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjIyXFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIyMlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNlxcXCIgeTE9XFxcIjE2XFxcIiB4Mj1cXFwiMTZcXFwiIHkyPVxcXCIxNlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNlxcXCIgeTE9XFxcIjIwXFxcIiB4Mj1cXFwiMTZcXFwiIHkyPVxcXCIyMFxcXCI+PC9saW5lPlwiLFwiY2xvdWRcIjpcIjxwYXRoIGQ9XFxcIk0xOCAxMGgtMS4yNkE4IDggMCAxIDAgOSAyMGg5YTUgNSAwIDAgMCAwLTEwelxcXCI+PC9wYXRoPlwiLFwiY29kZVwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMTYgMTggMjIgMTIgMTYgNlxcXCI+PC9wb2x5bGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCI4IDYgMiAxMiA4IDE4XFxcIj48L3BvbHlsaW5lPlwiLFwiY29kZXBlblwiOlwiPHBvbHlnb24gcG9pbnRzPVxcXCIxMiAyIDIyIDguNSAyMiAxNS41IDEyIDIyIDIgMTUuNSAyIDguNSAxMiAyXFxcIj48L3BvbHlnb24+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMjJcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjE1LjVcXFwiPjwvbGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCIyMiA4LjUgMTIgMTUuNSAyIDguNVxcXCI+PC9wb2x5bGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCIyIDE1LjUgMTIgOC41IDIyIDE1LjVcXFwiPjwvcG9seWxpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMlxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiOC41XFxcIj48L2xpbmU+XCIsXCJjb21tYW5kXCI6XCI8cGF0aCBkPVxcXCJNMTggM2EzIDMgMCAwIDAtMyAzdjEyYTMgMyAwIDAgMCAzIDMgMyAzIDAgMCAwIDMtMyAzIDMgMCAwIDAtMy0zSDZhMyAzIDAgMCAwLTMgMyAzIDMgMCAwIDAgMyAzIDMgMyAwIDAgMCAzLTNWNmEzIDMgMCAwIDAtMy0zIDMgMyAwIDAgMC0zIDMgMyAzIDAgMCAwIDMgM2gxMmEzIDMgMCAwIDAgMy0zIDMgMyAwIDAgMC0zLTN6XFxcIj48L3BhdGg+XCIsXCJjb21wYXNzXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxMFxcXCI+PC9jaXJjbGU+PHBvbHlnb24gcG9pbnRzPVxcXCIxNi4yNCA3Ljc2IDE0LjEyIDE0LjEyIDcuNzYgMTYuMjQgOS44OCA5Ljg4IDE2LjI0IDcuNzZcXFwiPjwvcG9seWdvbj5cIixcImNvcHlcIjpcIjxyZWN0IHg9XFxcIjlcXFwiIHk9XFxcIjlcXFwiIHdpZHRoPVxcXCIxM1xcXCIgaGVpZ2h0PVxcXCIxM1xcXCIgcng9XFxcIjJcXFwiIHJ5PVxcXCIyXFxcIj48L3JlY3Q+PHBhdGggZD1cXFwiTTUgMTVINGEyIDIgMCAwIDEtMi0yVjRhMiAyIDAgMCAxIDItMmg5YTIgMiAwIDAgMSAyIDJ2MVxcXCI+PC9wYXRoPlwiLFwiY29ybmVyLWRvd24tbGVmdFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiOSAxMCA0IDE1IDkgMjBcXFwiPjwvcG9seWxpbmU+PHBhdGggZD1cXFwiTTIwIDR2N2E0IDQgMCAwIDEtNCA0SDRcXFwiPjwvcGF0aD5cIixcImNvcm5lci1kb3duLXJpZ2h0XCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIxNSAxMCAyMCAxNSAxNSAyMFxcXCI+PC9wb2x5bGluZT48cGF0aCBkPVxcXCJNNCA0djdhNCA0IDAgMCAwIDQgNGgxMlxcXCI+PC9wYXRoPlwiLFwiY29ybmVyLWxlZnQtZG93blwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMTQgMTUgOSAyMCA0IDE1XFxcIj48L3BvbHlsaW5lPjxwYXRoIGQ9XFxcIk0yMCA0aC03YTQgNCAwIDAgMC00IDR2MTJcXFwiPjwvcGF0aD5cIixcImNvcm5lci1sZWZ0LXVwXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIxNCA5IDkgNCA0IDlcXFwiPjwvcG9seWxpbmU+PHBhdGggZD1cXFwiTTIwIDIwaC03YTQgNCAwIDAgMS00LTRWNFxcXCI+PC9wYXRoPlwiLFwiY29ybmVyLXJpZ2h0LWRvd25cIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjEwIDE1IDE1IDIwIDIwIDE1XFxcIj48L3BvbHlsaW5lPjxwYXRoIGQ9XFxcIk00IDRoN2E0IDQgMCAwIDEgNCA0djEyXFxcIj48L3BhdGg+XCIsXCJjb3JuZXItcmlnaHQtdXBcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjEwIDkgMTUgNCAyMCA5XFxcIj48L3BvbHlsaW5lPjxwYXRoIGQ9XFxcIk00IDIwaDdhNCA0IDAgMCAwIDQtNFY0XFxcIj48L3BhdGg+XCIsXCJjb3JuZXItdXAtbGVmdFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiOSAxNCA0IDkgOSA0XFxcIj48L3BvbHlsaW5lPjxwYXRoIGQ9XFxcIk0yMCAyMHYtN2E0IDQgMCAwIDAtNC00SDRcXFwiPjwvcGF0aD5cIixcImNvcm5lci11cC1yaWdodFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMTUgMTQgMjAgOSAxNSA0XFxcIj48L3BvbHlsaW5lPjxwYXRoIGQ9XFxcIk00IDIwdi03YTQgNCAwIDAgMSA0LTRoMTJcXFwiPjwvcGF0aD5cIixcImNwdVwiOlwiPHJlY3QgeD1cXFwiNFxcXCIgeT1cXFwiNFxcXCIgd2lkdGg9XFxcIjE2XFxcIiBoZWlnaHQ9XFxcIjE2XFxcIiByeD1cXFwiMlxcXCIgcnk9XFxcIjJcXFwiPjwvcmVjdD48cmVjdCB4PVxcXCI5XFxcIiB5PVxcXCI5XFxcIiB3aWR0aD1cXFwiNlxcXCIgaGVpZ2h0PVxcXCI2XFxcIj48L3JlY3Q+PGxpbmUgeDE9XFxcIjlcXFwiIHkxPVxcXCIxXFxcIiB4Mj1cXFwiOVxcXCIgeTI9XFxcIjRcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTVcXFwiIHkxPVxcXCIxXFxcIiB4Mj1cXFwiMTVcXFwiIHkyPVxcXCI0XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjlcXFwiIHkxPVxcXCIyMFxcXCIgeDI9XFxcIjlcXFwiIHkyPVxcXCIyM1xcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNVxcXCIgeTE9XFxcIjIwXFxcIiB4Mj1cXFwiMTVcXFwiIHkyPVxcXCIyM1xcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIyMFxcXCIgeTE9XFxcIjlcXFwiIHgyPVxcXCIyM1xcXCIgeTI9XFxcIjlcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMjBcXFwiIHkxPVxcXCIxNFxcXCIgeDI9XFxcIjIzXFxcIiB5Mj1cXFwiMTRcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMVxcXCIgeTE9XFxcIjlcXFwiIHgyPVxcXCI0XFxcIiB5Mj1cXFwiOVxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxXFxcIiB5MT1cXFwiMTRcXFwiIHgyPVxcXCI0XFxcIiB5Mj1cXFwiMTRcXFwiPjwvbGluZT5cIixcImNyZWRpdC1jYXJkXCI6XCI8cmVjdCB4PVxcXCIxXFxcIiB5PVxcXCI0XFxcIiB3aWR0aD1cXFwiMjJcXFwiIGhlaWdodD1cXFwiMTZcXFwiIHJ4PVxcXCIyXFxcIiByeT1cXFwiMlxcXCI+PC9yZWN0PjxsaW5lIHgxPVxcXCIxXFxcIiB5MT1cXFwiMTBcXFwiIHgyPVxcXCIyM1xcXCIgeTI9XFxcIjEwXFxcIj48L2xpbmU+XCIsXCJjcm9wXCI6XCI8cGF0aCBkPVxcXCJNNi4xMyAxTDYgMTZhMiAyIDAgMCAwIDIgMmgxNVxcXCI+PC9wYXRoPjxwYXRoIGQ9XFxcIk0xIDYuMTNMMTYgNmEyIDIgMCAwIDEgMiAydjE1XFxcIj48L3BhdGg+XCIsXCJjcm9zc2hhaXJcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjEwXFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiMjJcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjE4XFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiNlxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiMlxcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiNlxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjIyXFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIxOFxcXCI+PC9saW5lPlwiLFwiZGF0YWJhc2VcIjpcIjxlbGxpcHNlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjVcXFwiIHJ4PVxcXCI5XFxcIiByeT1cXFwiM1xcXCI+PC9lbGxpcHNlPjxwYXRoIGQ9XFxcIk0yMSAxMmMwIDEuNjYtNCAzLTkgM3MtOS0xLjM0LTktM1xcXCI+PC9wYXRoPjxwYXRoIGQ9XFxcIk0zIDV2MTRjMCAxLjY2IDQgMyA5IDNzOS0xLjM0IDktM1Y1XFxcIj48L3BhdGg+XCIsXCJkZWxldGVcIjpcIjxwYXRoIGQ9XFxcIk0yMSA0SDhsLTcgOCA3IDhoMTNhMiAyIDAgMCAwIDItMlY2YTIgMiAwIDAgMC0yLTJ6XFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjE4XFxcIiB5MT1cXFwiOVxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTVcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCI5XFxcIiB4Mj1cXFwiMThcXFwiIHkyPVxcXCIxNVxcXCI+PC9saW5lPlwiLFwiZGlzY1wiOlwiPGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiMTBcXFwiPjwvY2lyY2xlPjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjNcXFwiPjwvY2lyY2xlPlwiLFwiZG9sbGFyLXNpZ25cIjpcIjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjFcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjIzXFxcIj48L2xpbmU+PHBhdGggZD1cXFwiTTE3IDVIOS41YTMuNSAzLjUgMCAwIDAgMCA3aDVhMy41IDMuNSAwIDAgMSAwIDdINlxcXCI+PC9wYXRoPlwiLFwiZG93bmxvYWQtY2xvdWRcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjggMTcgMTIgMjEgMTYgMTdcXFwiPjwvcG9seWxpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjIxXFxcIj48L2xpbmU+PHBhdGggZD1cXFwiTTIwLjg4IDE4LjA5QTUgNSAwIDAgMCAxOCA5aC0xLjI2QTggOCAwIDEgMCAzIDE2LjI5XFxcIj48L3BhdGg+XCIsXCJkb3dubG9hZFwiOlwiPHBhdGggZD1cXFwiTTIxIDE1djRhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJ2LTRcXFwiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPVxcXCI3IDEwIDEyIDE1IDE3IDEwXFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjE1XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIzXFxcIj48L2xpbmU+XCIsXCJkcm9wbGV0XCI6XCI8cGF0aCBkPVxcXCJNMTIgMi42OWw1LjY2IDUuNjZhOCA4IDAgMSAxLTExLjMxIDB6XFxcIj48L3BhdGg+XCIsXCJlZGl0LTJcIjpcIjxwb2x5Z29uIHBvaW50cz1cXFwiMTYgMyAyMSA4IDggMjEgMyAyMSAzIDE2IDE2IDNcXFwiPjwvcG9seWdvbj5cIixcImVkaXQtM1wiOlwiPHBvbHlnb24gcG9pbnRzPVxcXCIxNCAyIDE4IDYgNyAxNyAzIDE3IDMgMTMgMTQgMlxcXCI+PC9wb2x5Z29uPjxsaW5lIHgxPVxcXCIzXFxcIiB5MT1cXFwiMjJcXFwiIHgyPVxcXCIyMVxcXCIgeTI9XFxcIjIyXFxcIj48L2xpbmU+XCIsXCJlZGl0XCI6XCI8cGF0aCBkPVxcXCJNMjAgMTQuNjZWMjBhMiAyIDAgMCAxLTIgMkg0YTIgMiAwIDAgMS0yLTJWNmEyIDIgMCAwIDEgMi0yaDUuMzRcXFwiPjwvcGF0aD48cG9seWdvbiBwb2ludHM9XFxcIjE4IDIgMjIgNiAxMiAxNiA4IDE2IDggMTIgMTggMlxcXCI+PC9wb2x5Z29uPlwiLFwiZXh0ZXJuYWwtbGlua1wiOlwiPHBhdGggZD1cXFwiTTE4IDEzdjZhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJWOGEyIDIgMCAwIDEgMi0yaDZcXFwiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPVxcXCIxNSAzIDIxIDMgMjEgOVxcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMTBcXFwiIHkxPVxcXCIxNFxcXCIgeDI9XFxcIjIxXFxcIiB5Mj1cXFwiM1xcXCI+PC9saW5lPlwiLFwiZXllLW9mZlwiOlwiPHBhdGggZD1cXFwiTTE3Ljk0IDE3Ljk0QTEwLjA3IDEwLjA3IDAgMCAxIDEyIDIwYy03IDAtMTEtOC0xMS04YTE4LjQ1IDE4LjQ1IDAgMCAxIDUuMDYtNS45NE05LjkgNC4yNEE5LjEyIDkuMTIgMCAwIDEgMTIgNGM3IDAgMTEgOCAxMSA4YTE4LjUgMTguNSAwIDAgMS0yLjE2IDMuMTltLTYuNzItMS4wN2EzIDMgMCAxIDEtNC4yNC00LjI0XFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjFcXFwiIHkxPVxcXCIxXFxcIiB4Mj1cXFwiMjNcXFwiIHkyPVxcXCIyM1xcXCI+PC9saW5lPlwiLFwiZXllXCI6XCI8cGF0aCBkPVxcXCJNMSAxMnM0LTggMTEtOCAxMSA4IDExIDgtNCA4LTExIDgtMTEtOC0xMS04elxcXCI+PC9wYXRoPjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjNcXFwiPjwvY2lyY2xlPlwiLFwiZmFjZWJvb2tcIjpcIjxwYXRoIGQ9XFxcIk0xOCAyaC0zYTUgNSAwIDAgMC01IDV2M0g3djRoM3Y4aDR2LThoM2wxLTRoLTRWN2ExIDEgMCAwIDEgMS0xaDN6XFxcIj48L3BhdGg+XCIsXCJmYXN0LWZvcndhcmRcIjpcIjxwb2x5Z29uIHBvaW50cz1cXFwiMTMgMTkgMjIgMTIgMTMgNSAxMyAxOVxcXCI+PC9wb2x5Z29uPjxwb2x5Z29uIHBvaW50cz1cXFwiMiAxOSAxMSAxMiAyIDUgMiAxOVxcXCI+PC9wb2x5Z29uPlwiLFwiZmVhdGhlclwiOlwiPHBhdGggZD1cXFwiTTIwLjI0IDEyLjI0YTYgNiAwIDAgMC04LjQ5LTguNDlMNSAxMC41VjE5aDguNXpcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiMTZcXFwiIHkxPVxcXCI4XFxcIiB4Mj1cXFwiMlxcXCIgeTI9XFxcIjIyXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE3XFxcIiB5MT1cXFwiMTVcXFwiIHgyPVxcXCI5XFxcIiB5Mj1cXFwiMTVcXFwiPjwvbGluZT5cIixcImZpbGUtbWludXNcIjpcIjxwYXRoIGQ9XFxcIk0xNCAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWOHpcXFwiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPVxcXCIxNCAyIDE0IDggMjAgOFxcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiOVxcXCIgeTE9XFxcIjE1XFxcIiB4Mj1cXFwiMTVcXFwiIHkyPVxcXCIxNVxcXCI+PC9saW5lPlwiLFwiZmlsZS1wbHVzXCI6XCI8cGF0aCBkPVxcXCJNMTQgMkg2YTIgMiAwIDAgMC0yIDJ2MTZhMiAyIDAgMCAwIDIgMmgxMmEyIDIgMCAwIDAgMi0yVjh6XFxcIj48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTQgMiAxNCA4IDIwIDhcXFwiPjwvcG9seWxpbmU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMThcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjlcXFwiIHkxPVxcXCIxNVxcXCIgeDI9XFxcIjE1XFxcIiB5Mj1cXFwiMTVcXFwiPjwvbGluZT5cIixcImZpbGUtdGV4dFwiOlwiPHBhdGggZD1cXFwiTTE0IDJINmEyIDIgMCAwIDAtMiAydjE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY4elxcXCI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9XFxcIjE0IDIgMTQgOCAyMCA4XFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCIxNlxcXCIgeTE9XFxcIjEzXFxcIiB4Mj1cXFwiOFxcXCIgeTI9XFxcIjEzXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE2XFxcIiB5MT1cXFwiMTdcXFwiIHgyPVxcXCI4XFxcIiB5Mj1cXFwiMTdcXFwiPjwvbGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCIxMCA5IDkgOSA4IDlcXFwiPjwvcG9seWxpbmU+XCIsXCJmaWxlXCI6XCI8cGF0aCBkPVxcXCJNMTMgMkg2YTIgMiAwIDAgMC0yIDJ2MTZhMiAyIDAgMCAwIDIgMmgxMmEyIDIgMCAwIDAgMi0yVjl6XFxcIj48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTMgMiAxMyA5IDIwIDlcXFwiPjwvcG9seWxpbmU+XCIsXCJmaWxtXCI6XCI8cmVjdCB4PVxcXCIyXFxcIiB5PVxcXCIyXFxcIiB3aWR0aD1cXFwiMjBcXFwiIGhlaWdodD1cXFwiMjBcXFwiIHJ4PVxcXCIyLjE4XFxcIiByeT1cXFwiMi4xOFxcXCI+PC9yZWN0PjxsaW5lIHgxPVxcXCI3XFxcIiB5MT1cXFwiMlxcXCIgeDI9XFxcIjdcXFwiIHkyPVxcXCIyMlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxN1xcXCIgeTE9XFxcIjJcXFwiIHgyPVxcXCIxN1xcXCIgeTI9XFxcIjIyXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjJcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjIyXFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMlxcXCIgeTE9XFxcIjdcXFwiIHgyPVxcXCI3XFxcIiB5Mj1cXFwiN1xcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIyXFxcIiB5MT1cXFwiMTdcXFwiIHgyPVxcXCI3XFxcIiB5Mj1cXFwiMTdcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTdcXFwiIHkxPVxcXCIxN1xcXCIgeDI9XFxcIjIyXFxcIiB5Mj1cXFwiMTdcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTdcXFwiIHkxPVxcXCI3XFxcIiB4Mj1cXFwiMjJcXFwiIHkyPVxcXCI3XFxcIj48L2xpbmU+XCIsXCJmaWx0ZXJcIjpcIjxwb2x5Z29uIHBvaW50cz1cXFwiMjIgMyAyIDMgMTAgMTIuNDYgMTAgMTkgMTQgMjEgMTQgMTIuNDYgMjIgM1xcXCI+PC9wb2x5Z29uPlwiLFwiZmxhZ1wiOlwiPHBhdGggZD1cXFwiTTQgMTVzMS0xIDQtMSA1IDIgOCAyIDQtMSA0LTFWM3MtMSAxLTQgMS01LTItOC0yLTQgMS00IDF6XFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjRcXFwiIHkxPVxcXCIyMlxcXCIgeDI9XFxcIjRcXFwiIHkyPVxcXCIxNVxcXCI+PC9saW5lPlwiLFwiZm9sZGVyLW1pbnVzXCI6XCI8cGF0aCBkPVxcXCJNMjIgMTlhMiAyIDAgMCAxLTIgMkg0YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDVsMiAzaDlhMiAyIDAgMCAxIDIgMnpcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiOVxcXCIgeTE9XFxcIjE0XFxcIiB4Mj1cXFwiMTVcXFwiIHkyPVxcXCIxNFxcXCI+PC9saW5lPlwiLFwiZm9sZGVyLXBsdXNcIjpcIjxwYXRoIGQ9XFxcIk0yMiAxOWEyIDIgMCAwIDEtMiAySDRhMiAyIDAgMCAxLTItMlY1YTIgMiAwIDAgMSAyLTJoNWwyIDNoOWEyIDIgMCAwIDEgMiAyelxcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjExXFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIxN1xcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI5XFxcIiB5MT1cXFwiMTRcXFwiIHgyPVxcXCIxNVxcXCIgeTI9XFxcIjE0XFxcIj48L2xpbmU+XCIsXCJmb2xkZXJcIjpcIjxwYXRoIGQ9XFxcIk0yMiAxOWEyIDIgMCAwIDEtMiAySDRhMiAyIDAgMCAxLTItMlY1YTIgMiAwIDAgMSAyLTJoNWwyIDNoOWEyIDIgMCAwIDEgMiAyelxcXCI+PC9wYXRoPlwiLFwiZ2lmdFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMjAgMTIgMjAgMjIgNCAyMiA0IDEyXFxcIj48L3BvbHlsaW5lPjxyZWN0IHg9XFxcIjJcXFwiIHk9XFxcIjdcXFwiIHdpZHRoPVxcXCIyMFxcXCIgaGVpZ2h0PVxcXCI1XFxcIj48L3JlY3Q+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMjJcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjdcXFwiPjwvbGluZT48cGF0aCBkPVxcXCJNMTIgN0g3LjVhMi41IDIuNSAwIDAgMSAwLTVDMTEgMiAxMiA3IDEyIDd6XFxcIj48L3BhdGg+PHBhdGggZD1cXFwiTTEyIDdoNC41YTIuNSAyLjUgMCAwIDAgMC01QzEzIDIgMTIgNyAxMiA3elxcXCI+PC9wYXRoPlwiLFwiZ2l0LWJyYW5jaFwiOlwiPGxpbmUgeDE9XFxcIjZcXFwiIHkxPVxcXCIzXFxcIiB4Mj1cXFwiNlxcXCIgeTI9XFxcIjE1XFxcIj48L2xpbmU+PGNpcmNsZSBjeD1cXFwiMThcXFwiIGN5PVxcXCI2XFxcIiByPVxcXCIzXFxcIj48L2NpcmNsZT48Y2lyY2xlIGN4PVxcXCI2XFxcIiBjeT1cXFwiMThcXFwiIHI9XFxcIjNcXFwiPjwvY2lyY2xlPjxwYXRoIGQ9XFxcIk0xOCA5YTkgOSAwIDAgMS05IDlcXFwiPjwvcGF0aD5cIixcImdpdC1jb21taXRcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjRcXFwiPjwvY2lyY2xlPjxsaW5lIHgxPVxcXCIxLjA1XFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCI3XFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTcuMDFcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjIyLjk2XFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT5cIixcImdpdC1tZXJnZVwiOlwiPGNpcmNsZSBjeD1cXFwiMThcXFwiIGN5PVxcXCIxOFxcXCIgcj1cXFwiM1xcXCI+PC9jaXJjbGU+PGNpcmNsZSBjeD1cXFwiNlxcXCIgY3k9XFxcIjZcXFwiIHI9XFxcIjNcXFwiPjwvY2lyY2xlPjxwYXRoIGQ9XFxcIk02IDIxVjlhOSA5IDAgMCAwIDkgOVxcXCI+PC9wYXRoPlwiLFwiZ2l0LXB1bGwtcmVxdWVzdFwiOlwiPGNpcmNsZSBjeD1cXFwiMThcXFwiIGN5PVxcXCIxOFxcXCIgcj1cXFwiM1xcXCI+PC9jaXJjbGU+PGNpcmNsZSBjeD1cXFwiNlxcXCIgY3k9XFxcIjZcXFwiIHI9XFxcIjNcXFwiPjwvY2lyY2xlPjxwYXRoIGQ9XFxcIk0xMyA2aDNhMiAyIDAgMCAxIDIgMnY3XFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjZcXFwiIHkxPVxcXCI5XFxcIiB4Mj1cXFwiNlxcXCIgeTI9XFxcIjIxXFxcIj48L2xpbmU+XCIsXCJnaXRodWJcIjpcIjxwYXRoIGQ9XFxcIk05IDE5Yy01IDEuNS01LTIuNS03LTNtMTQgNnYtMy44N2EzLjM3IDMuMzcgMCAwIDAtLjk0LTIuNjFjMy4xNC0uMzUgNi40NC0xLjU0IDYuNDQtN0E1LjQ0IDUuNDQgMCAwIDAgMjAgNC43NyA1LjA3IDUuMDcgMCAwIDAgMTkuOTEgMVMxOC43My42NSAxNiAyLjQ4YTEzLjM4IDEzLjM4IDAgMCAwLTcgMEM2LjI3LjY1IDUuMDkgMSA1LjA5IDFBNS4wNyA1LjA3IDAgMCAwIDUgNC43N2E1LjQ0IDUuNDQgMCAwIDAtMS41IDMuNzhjMCA1LjQyIDMuMyA2LjYxIDYuNDQgN0EzLjM3IDMuMzcgMCAwIDAgOSAxOC4xM1YyMlxcXCI+PC9wYXRoPlwiLFwiZ2l0bGFiXCI6XCI8cGF0aCBkPVxcXCJNMjIuNjUgMTQuMzlMMTIgMjIuMTMgMS4zNSAxNC4zOWEuODQuODQgMCAwIDEtLjMtLjk0bDEuMjItMy43OCAyLjQ0LTcuNTFBLjQyLjQyIDAgMCAxIDQuODIgMmEuNDMuNDMgMCAwIDEgLjU4IDAgLjQyLjQyIDAgMCAxIC4xMS4xOGwyLjQ0IDcuNDloOC4xbDIuNDQtNy41MUEuNDIuNDIgMCAwIDEgMTguNiAyYS40My40MyAwIDAgMSAuNTggMCAuNDIuNDIgMCAwIDEgLjExLjE4bDIuNDQgNy41MUwyMyAxMy40NWEuODQuODQgMCAwIDEtLjM1Ljk0elxcXCI+PC9wYXRoPlwiLFwiZ2xvYmVcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjEwXFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiMlxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiMjJcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPjxwYXRoIGQ9XFxcIk0xMiAyYTE1LjMgMTUuMyAwIDAgMSA0IDEwIDE1LjMgMTUuMyAwIDAgMS00IDEwIDE1LjMgMTUuMyAwIDAgMS00LTEwIDE1LjMgMTUuMyAwIDAgMSA0LTEwelxcXCI+PC9wYXRoPlwiLFwiZ3JpZFwiOlwiPHJlY3QgeD1cXFwiM1xcXCIgeT1cXFwiM1xcXCIgd2lkdGg9XFxcIjdcXFwiIGhlaWdodD1cXFwiN1xcXCI+PC9yZWN0PjxyZWN0IHg9XFxcIjE0XFxcIiB5PVxcXCIzXFxcIiB3aWR0aD1cXFwiN1xcXCIgaGVpZ2h0PVxcXCI3XFxcIj48L3JlY3Q+PHJlY3QgeD1cXFwiMTRcXFwiIHk9XFxcIjE0XFxcIiB3aWR0aD1cXFwiN1xcXCIgaGVpZ2h0PVxcXCI3XFxcIj48L3JlY3Q+PHJlY3QgeD1cXFwiM1xcXCIgeT1cXFwiMTRcXFwiIHdpZHRoPVxcXCI3XFxcIiBoZWlnaHQ9XFxcIjdcXFwiPjwvcmVjdD5cIixcImhhcmQtZHJpdmVcIjpcIjxsaW5lIHgxPVxcXCIyMlxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiMlxcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+PHBhdGggZD1cXFwiTTUuNDUgNS4xMUwyIDEydjZhMiAyIDAgMCAwIDIgMmgxNmEyIDIgMCAwIDAgMi0ydi02bC0zLjQ1LTYuODlBMiAyIDAgMCAwIDE2Ljc2IDRINy4yNGEyIDIgMCAwIDAtMS43OSAxLjExelxcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCI2XFxcIiB5MT1cXFwiMTZcXFwiIHgyPVxcXCI2XFxcIiB5Mj1cXFwiMTZcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTBcXFwiIHkxPVxcXCIxNlxcXCIgeDI9XFxcIjEwXFxcIiB5Mj1cXFwiMTZcXFwiPjwvbGluZT5cIixcImhhc2hcIjpcIjxsaW5lIHgxPVxcXCI0XFxcIiB5MT1cXFwiOVxcXCIgeDI9XFxcIjIwXFxcIiB5Mj1cXFwiOVxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI0XFxcIiB5MT1cXFwiMTVcXFwiIHgyPVxcXCIyMFxcXCIgeTI9XFxcIjE1XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjEwXFxcIiB5MT1cXFwiM1xcXCIgeDI9XFxcIjhcXFwiIHkyPVxcXCIyMVxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNlxcXCIgeTE9XFxcIjNcXFwiIHgyPVxcXCIxNFxcXCIgeTI9XFxcIjIxXFxcIj48L2xpbmU+XCIsXCJoZWFkcGhvbmVzXCI6XCI8cGF0aCBkPVxcXCJNMyAxOHYtNmE5IDkgMCAwIDEgMTggMHY2XFxcIj48L3BhdGg+PHBhdGggZD1cXFwiTTIxIDE5YTIgMiAwIDAgMS0yIDJoLTFhMiAyIDAgMCAxLTItMnYtM2EyIDIgMCAwIDEgMi0yaDN6TTMgMTlhMiAyIDAgMCAwIDIgMmgxYTIgMiAwIDAgMCAyLTJ2LTNhMiAyIDAgMCAwLTItMkgzelxcXCI+PC9wYXRoPlwiLFwiaGVhcnRcIjpcIjxwYXRoIGQ9XFxcIk0yMC44NCA0LjYxYTUuNSA1LjUgMCAwIDAtNy43OCAwTDEyIDUuNjdsLTEuMDYtMS4wNmE1LjUgNS41IDAgMCAwLTcuNzggNy43OGwxLjA2IDEuMDZMMTIgMjEuMjNsNy43OC03Ljc4IDEuMDYtMS4wNmE1LjUgNS41IDAgMCAwIDAtNy43OHpcXFwiPjwvcGF0aD5cIixcImhlbHAtY2lyY2xlXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxMFxcXCI+PC9jaXJjbGU+PHBhdGggZD1cXFwiTTkuMDkgOWEzIDMgMCAwIDEgNS44MyAxYzAgMi0zIDMtMyAzXFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMTdcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjE3XFxcIj48L2xpbmU+XCIsXCJob21lXCI6XCI8cGF0aCBkPVxcXCJNMyA5bDktNyA5IDd2MTFhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJ6XFxcIj48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz1cXFwiOSAyMiA5IDEyIDE1IDEyIDE1IDIyXFxcIj48L3BvbHlsaW5lPlwiLFwiaW1hZ2VcIjpcIjxyZWN0IHg9XFxcIjNcXFwiIHk9XFxcIjNcXFwiIHdpZHRoPVxcXCIxOFxcXCIgaGVpZ2h0PVxcXCIxOFxcXCIgcng9XFxcIjJcXFwiIHJ5PVxcXCIyXFxcIj48L3JlY3Q+PGNpcmNsZSBjeD1cXFwiOC41XFxcIiBjeT1cXFwiOC41XFxcIiByPVxcXCIxLjVcXFwiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9XFxcIjIxIDE1IDE2IDEwIDUgMjFcXFwiPjwvcG9seWxpbmU+XCIsXCJpbmJveFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMjIgMTIgMTYgMTIgMTQgMTUgMTAgMTUgOCAxMiAyIDEyXFxcIj48L3BvbHlsaW5lPjxwYXRoIGQ9XFxcIk01LjQ1IDUuMTFMMiAxMnY2YTIgMiAwIDAgMCAyIDJoMTZhMiAyIDAgMCAwIDItMnYtNmwtMy40NS02Ljg5QTIgMiAwIDAgMCAxNi43NiA0SDcuMjRhMiAyIDAgMCAwLTEuNzkgMS4xMXpcXFwiPjwvcGF0aD5cIixcImluZm9cIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjEwXFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIxNlxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCI4XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCI4XFxcIj48L2xpbmU+XCIsXCJpbnN0YWdyYW1cIjpcIjxyZWN0IHg9XFxcIjJcXFwiIHk9XFxcIjJcXFwiIHdpZHRoPVxcXCIyMFxcXCIgaGVpZ2h0PVxcXCIyMFxcXCIgcng9XFxcIjVcXFwiIHJ5PVxcXCI1XFxcIj48L3JlY3Q+PHBhdGggZD1cXFwiTTE2IDExLjM3QTQgNCAwIDEgMSAxMi42MyA4IDQgNCAwIDAgMSAxNiAxMS4zN3pcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiMTcuNVxcXCIgeTE9XFxcIjYuNVxcXCIgeDI9XFxcIjE3LjVcXFwiIHkyPVxcXCI2LjVcXFwiPjwvbGluZT5cIixcIml0YWxpY1wiOlwiPGxpbmUgeDE9XFxcIjE5XFxcIiB5MT1cXFwiNFxcXCIgeDI9XFxcIjEwXFxcIiB5Mj1cXFwiNFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNFxcXCIgeTE9XFxcIjIwXFxcIiB4Mj1cXFwiNVxcXCIgeTI9XFxcIjIwXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE1XFxcIiB5MT1cXFwiNFxcXCIgeDI9XFxcIjlcXFwiIHkyPVxcXCIyMFxcXCI+PC9saW5lPlwiLFwibGF5ZXJzXCI6XCI8cG9seWdvbiBwb2ludHM9XFxcIjEyIDIgMiA3IDEyIDEyIDIyIDcgMTIgMlxcXCI+PC9wb2x5Z29uPjxwb2x5bGluZSBwb2ludHM9XFxcIjIgMTcgMTIgMjIgMjIgMTdcXFwiPjwvcG9seWxpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiMiAxMiAxMiAxNyAyMiAxMlxcXCI+PC9wb2x5bGluZT5cIixcImxheW91dFwiOlwiPHJlY3QgeD1cXFwiM1xcXCIgeT1cXFwiM1xcXCIgd2lkdGg9XFxcIjE4XFxcIiBoZWlnaHQ9XFxcIjE4XFxcIiByeD1cXFwiMlxcXCIgcnk9XFxcIjJcXFwiPjwvcmVjdD48bGluZSB4MT1cXFwiM1xcXCIgeTE9XFxcIjlcXFwiIHgyPVxcXCIyMVxcXCIgeTI9XFxcIjlcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiOVxcXCIgeTE9XFxcIjIxXFxcIiB4Mj1cXFwiOVxcXCIgeTI9XFxcIjlcXFwiPjwvbGluZT5cIixcImxpZmUtYnVveVwiOlwiPGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiMTBcXFwiPjwvY2lyY2xlPjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjRcXFwiPjwvY2lyY2xlPjxsaW5lIHgxPVxcXCI0LjkzXFxcIiB5MT1cXFwiNC45M1xcXCIgeDI9XFxcIjkuMTdcXFwiIHkyPVxcXCI5LjE3XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE0LjgzXFxcIiB5MT1cXFwiMTQuODNcXFwiIHgyPVxcXCIxOS4wN1xcXCIgeTI9XFxcIjE5LjA3XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE0LjgzXFxcIiB5MT1cXFwiOS4xN1xcXCIgeDI9XFxcIjE5LjA3XFxcIiB5Mj1cXFwiNC45M1xcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNC44M1xcXCIgeTE9XFxcIjkuMTdcXFwiIHgyPVxcXCIxOC4zNlxcXCIgeTI9XFxcIjUuNjRcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiNC45M1xcXCIgeTE9XFxcIjE5LjA3XFxcIiB4Mj1cXFwiOS4xN1xcXCIgeTI9XFxcIjE0LjgzXFxcIj48L2xpbmU+XCIsXCJsaW5rLTJcIjpcIjxwYXRoIGQ9XFxcIk0xNSA3aDNhNSA1IDAgMCAxIDUgNSA1IDUgMCAwIDEtNSA1aC0zbS02IDBINmE1IDUgMCAwIDEtNS01IDUgNSAwIDAgMSA1LTVoM1xcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCI4XFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCIxNlxcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+XCIsXCJsaW5rXCI6XCI8cGF0aCBkPVxcXCJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MVxcXCI+PC9wYXRoPjxwYXRoIGQ9XFxcIk0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MVxcXCI+PC9wYXRoPlwiLFwibGlua2VkaW5cIjpcIjxwYXRoIGQ9XFxcIk0xNiA4YTYgNiAwIDAgMSA2IDZ2N2gtNHYtN2EyIDIgMCAwIDAtMi0yIDIgMiAwIDAgMC0yIDJ2N2gtNHYtN2E2IDYgMCAwIDEgNi02elxcXCI+PC9wYXRoPjxyZWN0IHg9XFxcIjJcXFwiIHk9XFxcIjlcXFwiIHdpZHRoPVxcXCI0XFxcIiBoZWlnaHQ9XFxcIjEyXFxcIj48L3JlY3Q+PGNpcmNsZSBjeD1cXFwiNFxcXCIgY3k9XFxcIjRcXFwiIHI9XFxcIjJcXFwiPjwvY2lyY2xlPlwiLFwibGlzdFwiOlwiPGxpbmUgeDE9XFxcIjhcXFwiIHkxPVxcXCI2XFxcIiB4Mj1cXFwiMjFcXFwiIHkyPVxcXCI2XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjhcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjIxXFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiOFxcXCIgeTE9XFxcIjE4XFxcIiB4Mj1cXFwiMjFcXFwiIHkyPVxcXCIxOFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIzXFxcIiB5MT1cXFwiNlxcXCIgeDI9XFxcIjNcXFwiIHkyPVxcXCI2XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjNcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjNcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIzXFxcIiB5MT1cXFwiMThcXFwiIHgyPVxcXCIzXFxcIiB5Mj1cXFwiMThcXFwiPjwvbGluZT5cIixcImxvYWRlclwiOlwiPGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMlxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiNlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjE4XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIyMlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI0LjkzXFxcIiB5MT1cXFwiNC45M1xcXCIgeDI9XFxcIjcuNzZcXFwiIHkyPVxcXCI3Ljc2XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE2LjI0XFxcIiB5MT1cXFwiMTYuMjRcXFwiIHgyPVxcXCIxOS4wN1xcXCIgeTI9XFxcIjE5LjA3XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjJcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjZcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxOFxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiMjJcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI0LjkzXFxcIiB5MT1cXFwiMTkuMDdcXFwiIHgyPVxcXCI3Ljc2XFxcIiB5Mj1cXFwiMTYuMjRcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTYuMjRcXFwiIHkxPVxcXCI3Ljc2XFxcIiB4Mj1cXFwiMTkuMDdcXFwiIHkyPVxcXCI0LjkzXFxcIj48L2xpbmU+XCIsXCJsb2NrXCI6XCI8cmVjdCB4PVxcXCIzXFxcIiB5PVxcXCIxMVxcXCIgd2lkdGg9XFxcIjE4XFxcIiBoZWlnaHQ9XFxcIjExXFxcIiByeD1cXFwiMlxcXCIgcnk9XFxcIjJcXFwiPjwvcmVjdD48cGF0aCBkPVxcXCJNNyAxMVY3YTUgNSAwIDAgMSAxMCAwdjRcXFwiPjwvcGF0aD5cIixcImxvZy1pblwiOlwiPHBhdGggZD1cXFwiTTE1IDNoNGEyIDIgMCAwIDEgMiAydjE0YTIgMiAwIDAgMS0yIDJoLTRcXFwiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPVxcXCIxMCAxNyAxNSAxMiAxMCA3XFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCIxNVxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiM1xcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+XCIsXCJsb2ctb3V0XCI6XCI8cGF0aCBkPVxcXCJNOSAyMUg1YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDRcXFwiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPVxcXCIxNiAxNyAyMSAxMiAxNiA3XFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCIyMVxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiOVxcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+XCIsXCJtYWlsXCI6XCI8cGF0aCBkPVxcXCJNNCA0aDE2YzEuMSAwIDIgLjkgMiAydjEyYzAgMS4xLS45IDItMiAySDRjLTEuMSAwLTItLjktMi0yVjZjMC0xLjEuOS0yIDItMnpcXFwiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPVxcXCIyMiw2IDEyLDEzIDIsNlxcXCI+PC9wb2x5bGluZT5cIixcIm1hcC1waW5cIjpcIjxwYXRoIGQ9XFxcIk0yMSAxMGMwIDctOSAxMy05IDEzcy05LTYtOS0xM2E5IDkgMCAwIDEgMTggMHpcXFwiPjwvcGF0aD48Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEwXFxcIiByPVxcXCIzXFxcIj48L2NpcmNsZT5cIixcIm1hcFwiOlwiPHBvbHlnb24gcG9pbnRzPVxcXCIxIDYgMSAyMiA4IDE4IDE2IDIyIDIzIDE4IDIzIDIgMTYgNiA4IDIgMSA2XFxcIj48L3BvbHlnb24+PGxpbmUgeDE9XFxcIjhcXFwiIHkxPVxcXCIyXFxcIiB4Mj1cXFwiOFxcXCIgeTI9XFxcIjE4XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE2XFxcIiB5MT1cXFwiNlxcXCIgeDI9XFxcIjE2XFxcIiB5Mj1cXFwiMjJcXFwiPjwvbGluZT5cIixcIm1heGltaXplLTJcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjE1IDMgMjEgMyAyMSA5XFxcIj48L3BvbHlsaW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjkgMjEgMyAyMSAzIDE1XFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCIyMVxcXCIgeTE9XFxcIjNcXFwiIHgyPVxcXCIxNFxcXCIgeTI9XFxcIjEwXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjNcXFwiIHkxPVxcXCIyMVxcXCIgeDI9XFxcIjEwXFxcIiB5Mj1cXFwiMTRcXFwiPjwvbGluZT5cIixcIm1heGltaXplXCI6XCI8cGF0aCBkPVxcXCJNOCAzSDVhMiAyIDAgMCAwLTIgMnYzbTE4IDBWNWEyIDIgMCAwIDAtMi0yaC0zbTAgMThoM2EyIDIgMCAwIDAgMi0ydi0zTTMgMTZ2M2EyIDIgMCAwIDAgMiAyaDNcXFwiPjwvcGF0aD5cIixcIm1lbnVcIjpcIjxsaW5lIHgxPVxcXCIzXFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCIyMVxcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjNcXFwiIHkxPVxcXCI2XFxcIiB4Mj1cXFwiMjFcXFwiIHkyPVxcXCI2XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjNcXFwiIHkxPVxcXCIxOFxcXCIgeDI9XFxcIjIxXFxcIiB5Mj1cXFwiMThcXFwiPjwvbGluZT5cIixcIm1lc3NhZ2UtY2lyY2xlXCI6XCI8cGF0aCBkPVxcXCJNMjEgMTEuNWE4LjM4IDguMzggMCAwIDEtLjkgMy44IDguNSA4LjUgMCAwIDEtNy42IDQuNyA4LjM4IDguMzggMCAwIDEtMy44LS45TDMgMjFsMS45LTUuN2E4LjM4IDguMzggMCAwIDEtLjktMy44IDguNSA4LjUgMCAwIDEgNC43LTcuNiA4LjM4IDguMzggMCAwIDEgMy44LS45aC41YTguNDggOC40OCAwIDAgMSA4IDh2LjV6XFxcIj48L3BhdGg+XCIsXCJtZXNzYWdlLXNxdWFyZVwiOlwiPHBhdGggZD1cXFwiTTIxIDE1YTIgMiAwIDAgMS0yIDJIN2wtNCA0VjVhMiAyIDAgMCAxIDItMmgxNGEyIDIgMCAwIDEgMiAyelxcXCI+PC9wYXRoPlwiLFwibWljLW9mZlwiOlwiPGxpbmUgeDE9XFxcIjFcXFwiIHkxPVxcXCIxXFxcIiB4Mj1cXFwiMjNcXFwiIHkyPVxcXCIyM1xcXCI+PC9saW5lPjxwYXRoIGQ9XFxcIk05IDl2M2EzIDMgMCAwIDAgNS4xMiAyLjEyTTE1IDkuMzRWNGEzIDMgMCAwIDAtNS45NC0uNlxcXCI+PC9wYXRoPjxwYXRoIGQ9XFxcIk0xNyAxNi45NUE3IDcgMCAwIDEgNSAxMnYtMm0xNCAwdjJhNyA3IDAgMCAxLS4xMSAxLjIzXFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMTlcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjIzXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjhcXFwiIHkxPVxcXCIyM1xcXCIgeDI9XFxcIjE2XFxcIiB5Mj1cXFwiMjNcXFwiPjwvbGluZT5cIixcIm1pY1wiOlwiPHBhdGggZD1cXFwiTTEyIDFhMyAzIDAgMCAwLTMgM3Y4YTMgMyAwIDAgMCA2IDBWNGEzIDMgMCAwIDAtMy0zelxcXCI+PC9wYXRoPjxwYXRoIGQ9XFxcIk0xOSAxMHYyYTcgNyAwIDAgMS0xNCAwdi0yXFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMTlcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjIzXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjhcXFwiIHkxPVxcXCIyM1xcXCIgeDI9XFxcIjE2XFxcIiB5Mj1cXFwiMjNcXFwiPjwvbGluZT5cIixcIm1pbmltaXplLTJcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjQgMTQgMTAgMTQgMTAgMjBcXFwiPjwvcG9seWxpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiMjAgMTAgMTQgMTAgMTQgNFxcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMTRcXFwiIHkxPVxcXCIxMFxcXCIgeDI9XFxcIjIxXFxcIiB5Mj1cXFwiM1xcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIzXFxcIiB5MT1cXFwiMjFcXFwiIHgyPVxcXCIxMFxcXCIgeTI9XFxcIjE0XFxcIj48L2xpbmU+XCIsXCJtaW5pbWl6ZVwiOlwiPHBhdGggZD1cXFwiTTggM3YzYTIgMiAwIDAgMS0yIDJIM20xOCAwaC0zYTIgMiAwIDAgMS0yLTJWM20wIDE4di0zYTIgMiAwIDAgMSAyLTJoM00zIDE2aDNhMiAyIDAgMCAxIDIgMnYzXFxcIj48L3BhdGg+XCIsXCJtaW51cy1jaXJjbGVcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjEwXFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiOFxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiMTZcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPlwiLFwibWludXMtc3F1YXJlXCI6XCI8cmVjdCB4PVxcXCIzXFxcIiB5PVxcXCIzXFxcIiB3aWR0aD1cXFwiMThcXFwiIGhlaWdodD1cXFwiMThcXFwiIHJ4PVxcXCIyXFxcIiByeT1cXFwiMlxcXCI+PC9yZWN0PjxsaW5lIHgxPVxcXCI4XFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCIxNlxcXCIgeTI9XFxcIjEyXFxcIj48L2xpbmU+XCIsXCJtaW51c1wiOlwiPGxpbmUgeDE9XFxcIjVcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjE5XFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT5cIixcIm1vbml0b3JcIjpcIjxyZWN0IHg9XFxcIjJcXFwiIHk9XFxcIjNcXFwiIHdpZHRoPVxcXCIyMFxcXCIgaGVpZ2h0PVxcXCIxNFxcXCIgcng9XFxcIjJcXFwiIHJ5PVxcXCIyXFxcIj48L3JlY3Q+PGxpbmUgeDE9XFxcIjhcXFwiIHkxPVxcXCIyMVxcXCIgeDI9XFxcIjE2XFxcIiB5Mj1cXFwiMjFcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIxN1xcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMjFcXFwiPjwvbGluZT5cIixcIm1vb25cIjpcIjxwYXRoIGQ9XFxcIk0yMSAxMi43OUE5IDkgMCAxIDEgMTEuMjEgMyA3IDcgMCAwIDAgMjEgMTIuNzl6XFxcIj48L3BhdGg+XCIsXCJtb3JlLWhvcml6b250YWxcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjFcXFwiPjwvY2lyY2xlPjxjaXJjbGUgY3g9XFxcIjE5XFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjFcXFwiPjwvY2lyY2xlPjxjaXJjbGUgY3g9XFxcIjVcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiMVxcXCI+PC9jaXJjbGU+XCIsXCJtb3JlLXZlcnRpY2FsXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxXFxcIj48L2NpcmNsZT48Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjVcXFwiIHI9XFxcIjFcXFwiPjwvY2lyY2xlPjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTlcXFwiIHI9XFxcIjFcXFwiPjwvY2lyY2xlPlwiLFwibW92ZVwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiNSA5IDIgMTIgNSAxNVxcXCI+PC9wb2x5bGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCI5IDUgMTIgMiAxNSA1XFxcIj48L3BvbHlsaW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjE1IDE5IDEyIDIyIDkgMTlcXFwiPjwvcG9seWxpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTkgOSAyMiAxMiAxOSAxNVxcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMlxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiMjJcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjJcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjIyXFxcIj48L2xpbmU+XCIsXCJtdXNpY1wiOlwiPHBhdGggZD1cXFwiTTkgMTdINWEyIDIgMCAwIDAtMiAyIDIgMiAwIDAgMCAyIDJoMmEyIDIgMCAwIDAgMi0yem0xMi0yaC00YTIgMiAwIDAgMC0yIDIgMiAyIDAgMCAwIDIgMmgyYTIgMiAwIDAgMCAyLTJ6XFxcIj48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz1cXFwiOSAxNyA5IDUgMjEgMyAyMSAxNVxcXCI+PC9wb2x5bGluZT5cIixcIm5hdmlnYXRpb24tMlwiOlwiPHBvbHlnb24gcG9pbnRzPVxcXCIxMiAyIDE5IDIxIDEyIDE3IDUgMjEgMTIgMlxcXCI+PC9wb2x5Z29uPlwiLFwibmF2aWdhdGlvblwiOlwiPHBvbHlnb24gcG9pbnRzPVxcXCIzIDExIDIyIDIgMTMgMjEgMTEgMTMgMyAxMVxcXCI+PC9wb2x5Z29uPlwiLFwib2N0YWdvblwiOlwiPHBvbHlnb24gcG9pbnRzPVxcXCI3Ljg2IDIgMTYuMTQgMiAyMiA3Ljg2IDIyIDE2LjE0IDE2LjE0IDIyIDcuODYgMjIgMiAxNi4xNCAyIDcuODYgNy44NiAyXFxcIj48L3BvbHlnb24+XCIsXCJwYWNrYWdlXCI6XCI8cGF0aCBkPVxcXCJNMTIuODkgMS40NWw4IDRBMiAyIDAgMCAxIDIyIDcuMjR2OS41M2EyIDIgMCAwIDEtMS4xMSAxLjc5bC04IDRhMiAyIDAgMCAxLTEuNzkgMGwtOC00YTIgMiAwIDAgMS0xLjEtMS44VjcuMjRhMiAyIDAgMCAxIDEuMTEtMS43OWw4LTRhMiAyIDAgMCAxIDEuNzggMHpcXFwiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPVxcXCIyLjMyIDYuMTYgMTIgMTEgMjEuNjggNi4xNlxcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIyMi43NlxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTFcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiN1xcXCIgeTE9XFxcIjMuNVxcXCIgeDI9XFxcIjE3XFxcIiB5Mj1cXFwiOC41XFxcIj48L2xpbmU+XCIsXCJwYXBlcmNsaXBcIjpcIjxwYXRoIGQ9XFxcIk0yMS40NCAxMS4wNWwtOS4xOSA5LjE5YTYgNiAwIDAgMS04LjQ5LTguNDlsOS4xOS05LjE5YTQgNCAwIDAgMSA1LjY2IDUuNjZsLTkuMiA5LjE5YTIgMiAwIDAgMS0yLjgzLTIuODNsOC40OS04LjQ4XFxcIj48L3BhdGg+XCIsXCJwYXVzZS1jaXJjbGVcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjEwXFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiMTBcXFwiIHkxPVxcXCIxNVxcXCIgeDI9XFxcIjEwXFxcIiB5Mj1cXFwiOVxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxNFxcXCIgeTE9XFxcIjE1XFxcIiB4Mj1cXFwiMTRcXFwiIHkyPVxcXCI5XFxcIj48L2xpbmU+XCIsXCJwYXVzZVwiOlwiPHJlY3QgeD1cXFwiNlxcXCIgeT1cXFwiNFxcXCIgd2lkdGg9XFxcIjRcXFwiIGhlaWdodD1cXFwiMTZcXFwiPjwvcmVjdD48cmVjdCB4PVxcXCIxNFxcXCIgeT1cXFwiNFxcXCIgd2lkdGg9XFxcIjRcXFwiIGhlaWdodD1cXFwiMTZcXFwiPjwvcmVjdD5cIixcInBlcmNlbnRcIjpcIjxsaW5lIHgxPVxcXCIxOVxcXCIgeTE9XFxcIjVcXFwiIHgyPVxcXCI1XFxcIiB5Mj1cXFwiMTlcXFwiPjwvbGluZT48Y2lyY2xlIGN4PVxcXCI2LjVcXFwiIGN5PVxcXCI2LjVcXFwiIHI9XFxcIjIuNVxcXCI+PC9jaXJjbGU+PGNpcmNsZSBjeD1cXFwiMTcuNVxcXCIgY3k9XFxcIjE3LjVcXFwiIHI9XFxcIjIuNVxcXCI+PC9jaXJjbGU+XCIsXCJwaG9uZS1jYWxsXCI6XCI8cGF0aCBkPVxcXCJNMTUuMDUgNUE1IDUgMCAwIDEgMTkgOC45NU0xNS4wNSAxQTkgOSAwIDAgMSAyMyA4Ljk0bS0xIDcuOTh2M2EyIDIgMCAwIDEtMi4xOCAyIDE5Ljc5IDE5Ljc5IDAgMCAxLTguNjMtMy4wNyAxOS41IDE5LjUgMCAwIDEtNi02IDE5Ljc5IDE5Ljc5IDAgMCAxLTMuMDctOC42N0EyIDIgMCAwIDEgNC4xMSAyaDNhMiAyIDAgMCAxIDIgMS43MiAxMi44NCAxMi44NCAwIDAgMCAuNyAyLjgxIDIgMiAwIDAgMS0uNDUgMi4xMUw4LjA5IDkuOTFhMTYgMTYgMCAwIDAgNiA2bDEuMjctMS4yN2EyIDIgMCAwIDEgMi4xMS0uNDUgMTIuODQgMTIuODQgMCAwIDAgMi44MS43QTIgMiAwIDAgMSAyMiAxNi45MnpcXFwiPjwvcGF0aD5cIixcInBob25lLWZvcndhcmRlZFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMTkgMSAyMyA1IDE5IDlcXFwiPjwvcG9seWxpbmU+PGxpbmUgeDE9XFxcIjE1XFxcIiB5MT1cXFwiNVxcXCIgeDI9XFxcIjIzXFxcIiB5Mj1cXFwiNVxcXCI+PC9saW5lPjxwYXRoIGQ9XFxcIk0yMiAxNi45MnYzYTIgMiAwIDAgMS0yLjE4IDIgMTkuNzkgMTkuNzkgMCAwIDEtOC42My0zLjA3IDE5LjUgMTkuNSAwIDAgMS02LTYgMTkuNzkgMTkuNzkgMCAwIDEtMy4wNy04LjY3QTIgMiAwIDAgMSA0LjExIDJoM2EyIDIgMCAwIDEgMiAxLjcyIDEyLjg0IDEyLjg0IDAgMCAwIC43IDIuODEgMiAyIDAgMCAxLS40NSAyLjExTDguMDkgOS45MWExNiAxNiAwIDAgMCA2IDZsMS4yNy0xLjI3YTIgMiAwIDAgMSAyLjExLS40NSAxMi44NCAxMi44NCAwIDAgMCAyLjgxLjdBMiAyIDAgMCAxIDIyIDE2LjkyelxcXCI+PC9wYXRoPlwiLFwicGhvbmUtaW5jb21pbmdcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjE2IDIgMTYgOCAyMiA4XFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCIyM1xcXCIgeTE9XFxcIjFcXFwiIHgyPVxcXCIxNlxcXCIgeTI9XFxcIjhcXFwiPjwvbGluZT48cGF0aCBkPVxcXCJNMjIgMTYuOTJ2M2EyIDIgMCAwIDEtMi4xOCAyIDE5Ljc5IDE5Ljc5IDAgMCAxLTguNjMtMy4wNyAxOS41IDE5LjUgMCAwIDEtNi02IDE5Ljc5IDE5Ljc5IDAgMCAxLTMuMDctOC42N0EyIDIgMCAwIDEgNC4xMSAyaDNhMiAyIDAgMCAxIDIgMS43MiAxMi44NCAxMi44NCAwIDAgMCAuNyAyLjgxIDIgMiAwIDAgMS0uNDUgMi4xMUw4LjA5IDkuOTFhMTYgMTYgMCAwIDAgNiA2bDEuMjctMS4yN2EyIDIgMCAwIDEgMi4xMS0uNDUgMTIuODQgMTIuODQgMCAwIDAgMi44MS43QTIgMiAwIDAgMSAyMiAxNi45MnpcXFwiPjwvcGF0aD5cIixcInBob25lLW1pc3NlZFwiOlwiPGxpbmUgeDE9XFxcIjIzXFxcIiB5MT1cXFwiMVxcXCIgeDI9XFxcIjE3XFxcIiB5Mj1cXFwiN1xcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxN1xcXCIgeTE9XFxcIjFcXFwiIHgyPVxcXCIyM1xcXCIgeTI9XFxcIjdcXFwiPjwvbGluZT48cGF0aCBkPVxcXCJNMjIgMTYuOTJ2M2EyIDIgMCAwIDEtMi4xOCAyIDE5Ljc5IDE5Ljc5IDAgMCAxLTguNjMtMy4wNyAxOS41IDE5LjUgMCAwIDEtNi02IDE5Ljc5IDE5Ljc5IDAgMCAxLTMuMDctOC42N0EyIDIgMCAwIDEgNC4xMSAyaDNhMiAyIDAgMCAxIDIgMS43MiAxMi44NCAxMi44NCAwIDAgMCAuNyAyLjgxIDIgMiAwIDAgMS0uNDUgMi4xMUw4LjA5IDkuOTFhMTYgMTYgMCAwIDAgNiA2bDEuMjctMS4yN2EyIDIgMCAwIDEgMi4xMS0uNDUgMTIuODQgMTIuODQgMCAwIDAgMi44MS43QTIgMiAwIDAgMSAyMiAxNi45MnpcXFwiPjwvcGF0aD5cIixcInBob25lLW9mZlwiOlwiPHBhdGggZD1cXFwiTTEwLjY4IDEzLjMxYTE2IDE2IDAgMCAwIDMuNDEgMi42bDEuMjctMS4yN2EyIDIgMCAwIDEgMi4xMS0uNDUgMTIuODQgMTIuODQgMCAwIDAgMi44MS43IDIgMiAwIDAgMSAxLjcyIDJ2M2EyIDIgMCAwIDEtMi4xOCAyIDE5Ljc5IDE5Ljc5IDAgMCAxLTguNjMtMy4wNyAxOS40MiAxOS40MiAwIDAgMS0zLjMzLTIuNjdtLTIuNjctMy4zNGExOS43OSAxOS43OSAwIDAgMS0zLjA3LTguNjNBMiAyIDAgMCAxIDQuMTEgMmgzYTIgMiAwIDAgMSAyIDEuNzIgMTIuODQgMTIuODQgMCAwIDAgLjcgMi44MSAyIDIgMCAwIDEtLjQ1IDIuMTFMOC4wOSA5LjkxXFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjIzXFxcIiB5MT1cXFwiMVxcXCIgeDI9XFxcIjFcXFwiIHkyPVxcXCIyM1xcXCI+PC9saW5lPlwiLFwicGhvbmUtb3V0Z29pbmdcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjIzIDcgMjMgMSAxNyAxXFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCIxNlxcXCIgeTE9XFxcIjhcXFwiIHgyPVxcXCIyM1xcXCIgeTI9XFxcIjFcXFwiPjwvbGluZT48cGF0aCBkPVxcXCJNMjIgMTYuOTJ2M2EyIDIgMCAwIDEtMi4xOCAyIDE5Ljc5IDE5Ljc5IDAgMCAxLTguNjMtMy4wNyAxOS41IDE5LjUgMCAwIDEtNi02IDE5Ljc5IDE5Ljc5IDAgMCAxLTMuMDctOC42N0EyIDIgMCAwIDEgNC4xMSAyaDNhMiAyIDAgMCAxIDIgMS43MiAxMi44NCAxMi44NCAwIDAgMCAuNyAyLjgxIDIgMiAwIDAgMS0uNDUgMi4xMUw4LjA5IDkuOTFhMTYgMTYgMCAwIDAgNiA2bDEuMjctMS4yN2EyIDIgMCAwIDEgMi4xMS0uNDUgMTIuODQgMTIuODQgMCAwIDAgMi44MS43QTIgMiAwIDAgMSAyMiAxNi45MnpcXFwiPjwvcGF0aD5cIixcInBob25lXCI6XCI8cGF0aCBkPVxcXCJNMjIgMTYuOTJ2M2EyIDIgMCAwIDEtMi4xOCAyIDE5Ljc5IDE5Ljc5IDAgMCAxLTguNjMtMy4wNyAxOS41IDE5LjUgMCAwIDEtNi02IDE5Ljc5IDE5Ljc5IDAgMCAxLTMuMDctOC42N0EyIDIgMCAwIDEgNC4xMSAyaDNhMiAyIDAgMCAxIDIgMS43MiAxMi44NCAxMi44NCAwIDAgMCAuNyAyLjgxIDIgMiAwIDAgMS0uNDUgMi4xMUw4LjA5IDkuOTFhMTYgMTYgMCAwIDAgNiA2bDEuMjctMS4yN2EyIDIgMCAwIDEgMi4xMS0uNDUgMTIuODQgMTIuODQgMCAwIDAgMi44MS43QTIgMiAwIDAgMSAyMiAxNi45MnpcXFwiPjwvcGF0aD5cIixcInBpZS1jaGFydFwiOlwiPHBhdGggZD1cXFwiTTIxLjIxIDE1Ljg5QTEwIDEwIDAgMSAxIDggMi44M1xcXCI+PC9wYXRoPjxwYXRoIGQ9XFxcIk0yMiAxMkExMCAxMCAwIDAgMCAxMiAydjEwelxcXCI+PC9wYXRoPlwiLFwicGxheS1jaXJjbGVcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjEwXFxcIj48L2NpcmNsZT48cG9seWdvbiBwb2ludHM9XFxcIjEwIDggMTYgMTIgMTAgMTYgMTAgOFxcXCI+PC9wb2x5Z29uPlwiLFwicGxheVwiOlwiPHBvbHlnb24gcG9pbnRzPVxcXCI1IDMgMTkgMTIgNSAyMSA1IDNcXFwiPjwvcG9seWdvbj5cIixcInBsdXMtY2lyY2xlXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxMFxcXCI+PC9jaXJjbGU+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiOFxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTZcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiOFxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiMTZcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPlwiLFwicGx1cy1zcXVhcmVcIjpcIjxyZWN0IHg9XFxcIjNcXFwiIHk9XFxcIjNcXFwiIHdpZHRoPVxcXCIxOFxcXCIgaGVpZ2h0PVxcXCIxOFxcXCIgcng9XFxcIjJcXFwiIHJ5PVxcXCIyXFxcIj48L3JlY3Q+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiOFxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTZcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiOFxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiMTZcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPlwiLFwicGx1c1wiOlwiPGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiNVxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTlcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiNVxcXCIgeTE9XFxcIjEyXFxcIiB4Mj1cXFwiMTlcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPlwiLFwicG9ja2V0XCI6XCI8cGF0aCBkPVxcXCJNNCAzaDE2YTIgMiAwIDAgMSAyIDJ2NmExMCAxMCAwIDAgMS0xMCAxMEExMCAxMCAwIDAgMSAyIDExVjVhMiAyIDAgMCAxIDItMnpcXFwiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPVxcXCI4IDEwIDEyIDE0IDE2IDEwXFxcIj48L3BvbHlsaW5lPlwiLFwicG93ZXJcIjpcIjxwYXRoIGQ9XFxcIk0xOC4zNiA2LjY0YTkgOSAwIDEgMS0xMi43MyAwXFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMlxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT5cIixcInByaW50ZXJcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjYgOSA2IDIgMTggMiAxOCA5XFxcIj48L3BvbHlsaW5lPjxwYXRoIGQ9XFxcIk02IDE4SDRhMiAyIDAgMCAxLTItMnYtNWEyIDIgMCAwIDEgMi0yaDE2YTIgMiAwIDAgMSAyIDJ2NWEyIDIgMCAwIDEtMiAyaC0yXFxcIj48L3BhdGg+PHJlY3QgeD1cXFwiNlxcXCIgeT1cXFwiMTRcXFwiIHdpZHRoPVxcXCIxMlxcXCIgaGVpZ2h0PVxcXCI4XFxcIj48L3JlY3Q+XCIsXCJyYWRpb1wiOlwiPGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiMlxcXCI+PC9jaXJjbGU+PHBhdGggZD1cXFwiTTE2LjI0IDcuNzZhNiA2IDAgMCAxIDAgOC40OW0tOC40OC0uMDFhNiA2IDAgMCAxIDAtOC40OW0xMS4zMS0yLjgyYTEwIDEwIDAgMCAxIDAgMTQuMTRtLTE0LjE0IDBhMTAgMTAgMCAwIDEgMC0xNC4xNFxcXCI+PC9wYXRoPlwiLFwicmVmcmVzaC1jY3dcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjEgNCAxIDEwIDcgMTBcXFwiPjwvcG9seWxpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiMjMgMjAgMjMgMTQgMTcgMTRcXFwiPjwvcG9seWxpbmU+PHBhdGggZD1cXFwiTTIwLjQ5IDlBOSA5IDAgMCAwIDUuNjQgNS42NEwxIDEwbTIyIDRsLTQuNjQgNC4zNkE5IDkgMCAwIDEgMy41MSAxNVxcXCI+PC9wYXRoPlwiLFwicmVmcmVzaC1jd1wiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMjMgNCAyMyAxMCAxNyAxMFxcXCI+PC9wb2x5bGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCIxIDIwIDEgMTQgNyAxNFxcXCI+PC9wb2x5bGluZT48cGF0aCBkPVxcXCJNMy41MSA5YTkgOSAwIDAgMSAxNC44NS0zLjM2TDIzIDEwTTEgMTRsNC42NCA0LjM2QTkgOSAwIDAgMCAyMC40OSAxNVxcXCI+PC9wYXRoPlwiLFwicmVwZWF0XCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIxNyAxIDIxIDUgMTcgOVxcXCI+PC9wb2x5bGluZT48cGF0aCBkPVxcXCJNMyAxMVY5YTQgNCAwIDAgMSA0LTRoMTRcXFwiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPVxcXCI3IDIzIDMgMTkgNyAxNVxcXCI+PC9wb2x5bGluZT48cGF0aCBkPVxcXCJNMjEgMTN2MmE0IDQgMCAwIDEtNCA0SDNcXFwiPjwvcGF0aD5cIixcInJld2luZFwiOlwiPHBvbHlnb24gcG9pbnRzPVxcXCIxMSAxOSAyIDEyIDExIDUgMTEgMTlcXFwiPjwvcG9seWdvbj48cG9seWdvbiBwb2ludHM9XFxcIjIyIDE5IDEzIDEyIDIyIDUgMjIgMTlcXFwiPjwvcG9seWdvbj5cIixcInJvdGF0ZS1jY3dcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjEgNCAxIDEwIDcgMTBcXFwiPjwvcG9seWxpbmU+PHBhdGggZD1cXFwiTTMuNTEgMTVhOSA5IDAgMSAwIDIuMTMtOS4zNkwxIDEwXFxcIj48L3BhdGg+XCIsXCJyb3RhdGUtY3dcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjIzIDQgMjMgMTAgMTcgMTBcXFwiPjwvcG9seWxpbmU+PHBhdGggZD1cXFwiTTIwLjQ5IDE1YTkgOSAwIDEgMS0yLjEyLTkuMzZMMjMgMTBcXFwiPjwvcGF0aD5cIixcInJzc1wiOlwiPHBhdGggZD1cXFwiTTQgMTFhOSA5IDAgMCAxIDkgOVxcXCI+PC9wYXRoPjxwYXRoIGQ9XFxcIk00IDRhMTYgMTYgMCAwIDEgMTYgMTZcXFwiPjwvcGF0aD48Y2lyY2xlIGN4PVxcXCI1XFxcIiBjeT1cXFwiMTlcXFwiIHI9XFxcIjFcXFwiPjwvY2lyY2xlPlwiLFwic2F2ZVwiOlwiPHBhdGggZD1cXFwiTTE5IDIxSDVhMiAyIDAgMCAxLTItMlY1YTIgMiAwIDAgMSAyLTJoMTFsNSA1djExYTIgMiAwIDAgMS0yIDJ6XFxcIj48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTcgMjEgMTcgMTMgNyAxMyA3IDIxXFxcIj48L3BvbHlsaW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjcgMyA3IDggMTUgOFxcXCI+PC9wb2x5bGluZT5cIixcInNjaXNzb3JzXCI6XCI8Y2lyY2xlIGN4PVxcXCI2XFxcIiBjeT1cXFwiNlxcXCIgcj1cXFwiM1xcXCI+PC9jaXJjbGU+PGNpcmNsZSBjeD1cXFwiNlxcXCIgY3k9XFxcIjE4XFxcIiByPVxcXCIzXFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiMjBcXFwiIHkxPVxcXCI0XFxcIiB4Mj1cXFwiOC4xMlxcXCIgeTI9XFxcIjE1Ljg4XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE0LjQ3XFxcIiB5MT1cXFwiMTQuNDhcXFwiIHgyPVxcXCIyMFxcXCIgeTI9XFxcIjIwXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjguMTJcXFwiIHkxPVxcXCI4LjEyXFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPlwiLFwic2VhcmNoXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMVxcXCIgY3k9XFxcIjExXFxcIiByPVxcXCI4XFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiMjFcXFwiIHkxPVxcXCIyMVxcXCIgeDI9XFxcIjE2LjY1XFxcIiB5Mj1cXFwiMTYuNjVcXFwiPjwvbGluZT5cIixcInNlbmRcIjpcIjxsaW5lIHgxPVxcXCIyMlxcXCIgeTE9XFxcIjJcXFwiIHgyPVxcXCIxMVxcXCIgeTI9XFxcIjEzXFxcIj48L2xpbmU+PHBvbHlnb24gcG9pbnRzPVxcXCIyMiAyIDE1IDIyIDExIDEzIDIgOSAyMiAyXFxcIj48L3BvbHlnb24+XCIsXCJzZXJ2ZXJcIjpcIjxyZWN0IHg9XFxcIjJcXFwiIHk9XFxcIjJcXFwiIHdpZHRoPVxcXCIyMFxcXCIgaGVpZ2h0PVxcXCI4XFxcIiByeD1cXFwiMlxcXCIgcnk9XFxcIjJcXFwiPjwvcmVjdD48cmVjdCB4PVxcXCIyXFxcIiB5PVxcXCIxNFxcXCIgd2lkdGg9XFxcIjIwXFxcIiBoZWlnaHQ9XFxcIjhcXFwiIHJ4PVxcXCIyXFxcIiByeT1cXFwiMlxcXCI+PC9yZWN0PjxsaW5lIHgxPVxcXCI2XFxcIiB5MT1cXFwiNlxcXCIgeDI9XFxcIjZcXFwiIHkyPVxcXCI2XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjZcXFwiIHkxPVxcXCIxOFxcXCIgeDI9XFxcIjZcXFwiIHkyPVxcXCIxOFxcXCI+PC9saW5lPlwiLFwic2V0dGluZ3NcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjNcXFwiPjwvY2lyY2xlPjxwYXRoIGQ9XFxcIk0xOS40IDE1YTEuNjUgMS42NSAwIDAgMCAuMzMgMS44MmwuMDYuMDZhMiAyIDAgMCAxIDAgMi44MyAyIDIgMCAwIDEtMi44MyAwbC0uMDYtLjA2YTEuNjUgMS42NSAwIDAgMC0xLjgyLS4zMyAxLjY1IDEuNjUgMCAwIDAtMSAxLjUxVjIxYTIgMiAwIDAgMS0yIDIgMiAyIDAgMCAxLTItMnYtLjA5QTEuNjUgMS42NSAwIDAgMCA5IDE5LjRhMS42NSAxLjY1IDAgMCAwLTEuODIuMzNsLS4wNi4wNmEyIDIgMCAwIDEtMi44MyAwIDIgMiAwIDAgMSAwLTIuODNsLjA2LS4wNmExLjY1IDEuNjUgMCAwIDAgLjMzLTEuODIgMS42NSAxLjY1IDAgMCAwLTEuNTEtMUgzYTIgMiAwIDAgMS0yLTIgMiAyIDAgMCAxIDItMmguMDlBMS42NSAxLjY1IDAgMCAwIDQuNiA5YTEuNjUgMS42NSAwIDAgMC0uMzMtMS44MmwtLjA2LS4wNmEyIDIgMCAwIDEgMC0yLjgzIDIgMiAwIDAgMSAyLjgzIDBsLjA2LjA2YTEuNjUgMS42NSAwIDAgMCAxLjgyLjMzSDlhMS42NSAxLjY1IDAgMCAwIDEtMS41MVYzYTIgMiAwIDAgMSAyLTIgMiAyIDAgMCAxIDIgMnYuMDlhMS42NSAxLjY1IDAgMCAwIDEgMS41MSAxLjY1IDEuNjUgMCAwIDAgMS44Mi0uMzNsLjA2LS4wNmEyIDIgMCAwIDEgMi44MyAwIDIgMiAwIDAgMSAwIDIuODNsLS4wNi4wNmExLjY1IDEuNjUgMCAwIDAtLjMzIDEuODJWOWExLjY1IDEuNjUgMCAwIDAgMS41MSAxSDIxYTIgMiAwIDAgMSAyIDIgMiAyIDAgMCAxLTIgMmgtLjA5YTEuNjUgMS42NSAwIDAgMC0xLjUxIDF6XFxcIj48L3BhdGg+XCIsXCJzaGFyZS0yXCI6XCI8Y2lyY2xlIGN4PVxcXCIxOFxcXCIgY3k9XFxcIjVcXFwiIHI9XFxcIjNcXFwiPjwvY2lyY2xlPjxjaXJjbGUgY3g9XFxcIjZcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiM1xcXCI+PC9jaXJjbGU+PGNpcmNsZSBjeD1cXFwiMThcXFwiIGN5PVxcXCIxOVxcXCIgcj1cXFwiM1xcXCI+PC9jaXJjbGU+PGxpbmUgeDE9XFxcIjguNTlcXFwiIHkxPVxcXCIxMy41MVxcXCIgeDI9XFxcIjE1LjQyXFxcIiB5Mj1cXFwiMTcuNDlcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTUuNDFcXFwiIHkxPVxcXCI2LjUxXFxcIiB4Mj1cXFwiOC41OVxcXCIgeTI9XFxcIjEwLjQ5XFxcIj48L2xpbmU+XCIsXCJzaGFyZVwiOlwiPHBhdGggZD1cXFwiTTQgMTJ2OGEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJ2LThcXFwiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPVxcXCIxNiA2IDEyIDIgOCA2XFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjJcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjE1XFxcIj48L2xpbmU+XCIsXCJzaGllbGQtb2ZmXCI6XCI8cGF0aCBkPVxcXCJNMTkuNjkgMTRhNi45IDYuOSAwIDAgMCAuMzEtMlY1bC04LTMtMy4xNiAxLjE4XFxcIj48L3BhdGg+PHBhdGggZD1cXFwiTTQuNzMgNC43M0w0IDV2N2MwIDYgOCAxMCA4IDEwYTIwLjI5IDIwLjI5IDAgMCAwIDUuNjItNC4zOFxcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCIxXFxcIiB5MT1cXFwiMVxcXCIgeDI9XFxcIjIzXFxcIiB5Mj1cXFwiMjNcXFwiPjwvbGluZT5cIixcInNoaWVsZFwiOlwiPHBhdGggZD1cXFwiTTEyIDIyczgtNCA4LTEwVjVsLTgtMy04IDN2N2MwIDYgOCAxMCA4IDEwelxcXCI+PC9wYXRoPlwiLFwic2hvcHBpbmctYmFnXCI6XCI8cGF0aCBkPVxcXCJNNiAyTDMgNnYxNGEyIDIgMCAwIDAgMiAyaDE0YTIgMiAwIDAgMCAyLTJWNmwtMy00elxcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCIzXFxcIiB5MT1cXFwiNlxcXCIgeDI9XFxcIjIxXFxcIiB5Mj1cXFwiNlxcXCI+PC9saW5lPjxwYXRoIGQ9XFxcIk0xNiAxMGE0IDQgMCAwIDEtOCAwXFxcIj48L3BhdGg+XCIsXCJzaG9wcGluZy1jYXJ0XCI6XCI8Y2lyY2xlIGN4PVxcXCI5XFxcIiBjeT1cXFwiMjFcXFwiIHI9XFxcIjFcXFwiPjwvY2lyY2xlPjxjaXJjbGUgY3g9XFxcIjIwXFxcIiBjeT1cXFwiMjFcXFwiIHI9XFxcIjFcXFwiPjwvY2lyY2xlPjxwYXRoIGQ9XFxcIk0xIDFoNGwyLjY4IDEzLjM5YTIgMiAwIDAgMCAyIDEuNjFoOS43MmEyIDIgMCAwIDAgMi0xLjYxTDIzIDZINlxcXCI+PC9wYXRoPlwiLFwic2h1ZmZsZVwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMTYgMyAyMSAzIDIxIDhcXFwiPjwvcG9seWxpbmU+PGxpbmUgeDE9XFxcIjRcXFwiIHkxPVxcXCIyMFxcXCIgeDI9XFxcIjIxXFxcIiB5Mj1cXFwiM1xcXCI+PC9saW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjIxIDE2IDIxIDIxIDE2IDIxXFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCIxNVxcXCIgeTE9XFxcIjE1XFxcIiB4Mj1cXFwiMjFcXFwiIHkyPVxcXCIyMVxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI0XFxcIiB5MT1cXFwiNFxcXCIgeDI9XFxcIjlcXFwiIHkyPVxcXCI5XFxcIj48L2xpbmU+XCIsXCJzaWRlYmFyXCI6XCI8cmVjdCB4PVxcXCIzXFxcIiB5PVxcXCIzXFxcIiB3aWR0aD1cXFwiMThcXFwiIGhlaWdodD1cXFwiMThcXFwiIHJ4PVxcXCIyXFxcIiByeT1cXFwiMlxcXCI+PC9yZWN0PjxsaW5lIHgxPVxcXCI5XFxcIiB5MT1cXFwiM1xcXCIgeDI9XFxcIjlcXFwiIHkyPVxcXCIyMVxcXCI+PC9saW5lPlwiLFwic2tpcC1iYWNrXCI6XCI8cG9seWdvbiBwb2ludHM9XFxcIjE5IDIwIDkgMTIgMTkgNCAxOSAyMFxcXCI+PC9wb2x5Z29uPjxsaW5lIHgxPVxcXCI1XFxcIiB5MT1cXFwiMTlcXFwiIHgyPVxcXCI1XFxcIiB5Mj1cXFwiNVxcXCI+PC9saW5lPlwiLFwic2tpcC1mb3J3YXJkXCI6XCI8cG9seWdvbiBwb2ludHM9XFxcIjUgNCAxNSAxMiA1IDIwIDUgNFxcXCI+PC9wb2x5Z29uPjxsaW5lIHgxPVxcXCIxOVxcXCIgeTE9XFxcIjVcXFwiIHgyPVxcXCIxOVxcXCIgeTI9XFxcIjE5XFxcIj48L2xpbmU+XCIsXCJzbGFja1wiOlwiPHBhdGggZD1cXFwiTTIyLjA4IDlDMTkuODEgMS40MSAxNi41NC0uMzUgOSAxLjkyUy0uMzUgNy40NiAxLjkyIDE1IDcuNDYgMjQuMzUgMTUgMjIuMDggMjQuMzUgMTYuNTQgMjIuMDggOXpcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiMTIuNTdcXFwiIHkxPVxcXCI1Ljk5XFxcIiB4Mj1cXFwiMTYuMTVcXFwiIHkyPVxcXCIxNi4zOVxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI3Ljg1XFxcIiB5MT1cXFwiNy42MVxcXCIgeDI9XFxcIjExLjQzXFxcIiB5Mj1cXFwiMTguMDFcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTYuMzlcXFwiIHkxPVxcXCI3Ljg1XFxcIiB4Mj1cXFwiNS45OVxcXCIgeTI9XFxcIjExLjQzXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE4LjAxXFxcIiB5MT1cXFwiMTIuNTdcXFwiIHgyPVxcXCI3LjYxXFxcIiB5Mj1cXFwiMTYuMTVcXFwiPjwvbGluZT5cIixcInNsYXNoXCI6XCI8Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIxMFxcXCI+PC9jaXJjbGU+PGxpbmUgeDE9XFxcIjQuOTNcXFwiIHkxPVxcXCI0LjkzXFxcIiB4Mj1cXFwiMTkuMDdcXFwiIHkyPVxcXCIxOS4wN1xcXCI+PC9saW5lPlwiLFwic2xpZGVyc1wiOlwiPGxpbmUgeDE9XFxcIjRcXFwiIHkxPVxcXCIyMVxcXCIgeDI9XFxcIjRcXFwiIHkyPVxcXCIxNFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI0XFxcIiB5MT1cXFwiMTBcXFwiIHgyPVxcXCI0XFxcIiB5Mj1cXFwiM1xcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjIxXFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIxMlxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjhcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjNcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMjBcXFwiIHkxPVxcXCIyMVxcXCIgeDI9XFxcIjIwXFxcIiB5Mj1cXFwiMTZcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMjBcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjIwXFxcIiB5Mj1cXFwiM1xcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxXFxcIiB5MT1cXFwiMTRcXFwiIHgyPVxcXCI3XFxcIiB5Mj1cXFwiMTRcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiOVxcXCIgeTE9XFxcIjhcXFwiIHgyPVxcXCIxNVxcXCIgeTI9XFxcIjhcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTdcXFwiIHkxPVxcXCIxNlxcXCIgeDI9XFxcIjIzXFxcIiB5Mj1cXFwiMTZcXFwiPjwvbGluZT5cIixcInNtYXJ0cGhvbmVcIjpcIjxyZWN0IHg9XFxcIjVcXFwiIHk9XFxcIjJcXFwiIHdpZHRoPVxcXCIxNFxcXCIgaGVpZ2h0PVxcXCIyMFxcXCIgcng9XFxcIjJcXFwiIHJ5PVxcXCIyXFxcIj48L3JlY3Q+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMThcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjE4XFxcIj48L2xpbmU+XCIsXCJzcGVha2VyXCI6XCI8cmVjdCB4PVxcXCI0XFxcIiB5PVxcXCIyXFxcIiB3aWR0aD1cXFwiMTZcXFwiIGhlaWdodD1cXFwiMjBcXFwiIHJ4PVxcXCIyXFxcIiByeT1cXFwiMlxcXCI+PC9yZWN0PjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTRcXFwiIHI9XFxcIjRcXFwiPjwvY2lyY2xlPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjZcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjZcXFwiPjwvbGluZT5cIixcInNxdWFyZVwiOlwiPHJlY3QgeD1cXFwiM1xcXCIgeT1cXFwiM1xcXCIgd2lkdGg9XFxcIjE4XFxcIiBoZWlnaHQ9XFxcIjE4XFxcIiByeD1cXFwiMlxcXCIgcnk9XFxcIjJcXFwiPjwvcmVjdD5cIixcInN0YXJcIjpcIjxwb2x5Z29uIHBvaW50cz1cXFwiMTIgMiAxNS4wOSA4LjI2IDIyIDkuMjcgMTcgMTQuMTQgMTguMTggMjEuMDIgMTIgMTcuNzcgNS44MiAyMS4wMiA3IDE0LjE0IDIgOS4yNyA4LjkxIDguMjYgMTIgMlxcXCI+PC9wb2x5Z29uPlwiLFwic3RvcC1jaXJjbGVcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjEwXFxcIj48L2NpcmNsZT48cmVjdCB4PVxcXCI5XFxcIiB5PVxcXCI5XFxcIiB3aWR0aD1cXFwiNlxcXCIgaGVpZ2h0PVxcXCI2XFxcIj48L3JlY3Q+XCIsXCJzdW5cIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjVcXFwiPjwvY2lyY2xlPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjFcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjNcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIyMVxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMjNcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiNC4yMlxcXCIgeTE9XFxcIjQuMjJcXFwiIHgyPVxcXCI1LjY0XFxcIiB5Mj1cXFwiNS42NFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxOC4zNlxcXCIgeTE9XFxcIjE4LjM2XFxcIiB4Mj1cXFwiMTkuNzhcXFwiIHkyPVxcXCIxOS43OFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxXFxcIiB5MT1cXFwiMTJcXFwiIHgyPVxcXCIzXFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMjFcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjIzXFxcIiB5Mj1cXFwiMTJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiNC4yMlxcXCIgeTE9XFxcIjE5Ljc4XFxcIiB4Mj1cXFwiNS42NFxcXCIgeTI9XFxcIjE4LjM2XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE4LjM2XFxcIiB5MT1cXFwiNS42NFxcXCIgeDI9XFxcIjE5Ljc4XFxcIiB5Mj1cXFwiNC4yMlxcXCI+PC9saW5lPlwiLFwic3VucmlzZVwiOlwiPHBhdGggZD1cXFwiTTE3IDE4YTUgNSAwIDAgMC0xMCAwXFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMlxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiOVxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI0LjIyXFxcIiB5MT1cXFwiMTAuMjJcXFwiIHgyPVxcXCI1LjY0XFxcIiB5Mj1cXFwiMTEuNjRcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMVxcXCIgeTE9XFxcIjE4XFxcIiB4Mj1cXFwiM1xcXCIgeTI9XFxcIjE4XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjIxXFxcIiB5MT1cXFwiMThcXFwiIHgyPVxcXCIyM1xcXCIgeTI9XFxcIjE4XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE4LjM2XFxcIiB5MT1cXFwiMTEuNjRcXFwiIHgyPVxcXCIxOS43OFxcXCIgeTI9XFxcIjEwLjIyXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjIzXFxcIiB5MT1cXFwiMjJcXFwiIHgyPVxcXCIxXFxcIiB5Mj1cXFwiMjJcXFwiPjwvbGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCI4IDYgMTIgMiAxNiA2XFxcIj48L3BvbHlsaW5lPlwiLFwic3Vuc2V0XCI6XCI8cGF0aCBkPVxcXCJNMTcgMThhNSA1IDAgMCAwLTEwIDBcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCI5XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIyXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjQuMjJcXFwiIHkxPVxcXCIxMC4yMlxcXCIgeDI9XFxcIjUuNjRcXFwiIHkyPVxcXCIxMS42NFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIxXFxcIiB5MT1cXFwiMThcXFwiIHgyPVxcXCIzXFxcIiB5Mj1cXFwiMThcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMjFcXFwiIHkxPVxcXCIxOFxcXCIgeDI9XFxcIjIzXFxcIiB5Mj1cXFwiMThcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTguMzZcXFwiIHkxPVxcXCIxMS42NFxcXCIgeDI9XFxcIjE5Ljc4XFxcIiB5Mj1cXFwiMTAuMjJcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMjNcXFwiIHkxPVxcXCIyMlxcXCIgeDI9XFxcIjFcXFwiIHkyPVxcXCIyMlxcXCI+PC9saW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjE2IDUgMTIgOSA4IDVcXFwiPjwvcG9seWxpbmU+XCIsXCJ0YWJsZXRcIjpcIjxyZWN0IHg9XFxcIjRcXFwiIHk9XFxcIjJcXFwiIHdpZHRoPVxcXCIxNlxcXCIgaGVpZ2h0PVxcXCIyMFxcXCIgcng9XFxcIjJcXFwiIHJ5PVxcXCIyXFxcIiB0cmFuc2Zvcm09XFxcInJvdGF0ZSgxODAgMTIgMTIpXFxcIj48L3JlY3Q+PGxpbmUgeDE9XFxcIjEyXFxcIiB5MT1cXFwiMThcXFwiIHgyPVxcXCIxMlxcXCIgeTI9XFxcIjE4XFxcIj48L2xpbmU+XCIsXCJ0YWdcIjpcIjxwYXRoIGQ9XFxcIk0yMC41OSAxMy40MWwtNy4xNyA3LjE3YTIgMiAwIDAgMS0yLjgzIDBMMiAxMlYyaDEwbDguNTkgOC41OWEyIDIgMCAwIDEgMCAyLjgyelxcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCI3XFxcIiB5MT1cXFwiN1xcXCIgeDI9XFxcIjdcXFwiIHkyPVxcXCI3XFxcIj48L2xpbmU+XCIsXCJ0YXJnZXRcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjEwXFxcIj48L2NpcmNsZT48Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCI2XFxcIj48L2NpcmNsZT48Y2lyY2xlIGN4PVxcXCIxMlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIyXFxcIj48L2NpcmNsZT5cIixcInRlcm1pbmFsXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCI0IDE3IDEwIDExIDQgNVxcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIxOVxcXCIgeDI9XFxcIjIwXFxcIiB5Mj1cXFwiMTlcXFwiPjwvbGluZT5cIixcInRoZXJtb21ldGVyXCI6XCI8cGF0aCBkPVxcXCJNMTQgMTQuNzZWMy41YTIuNSAyLjUgMCAwIDAtNSAwdjExLjI2YTQuNSA0LjUgMCAxIDAgNSAwelxcXCI+PC9wYXRoPlwiLFwidGh1bWJzLWRvd25cIjpcIjxwYXRoIGQ9XFxcIk0xMCAxNXY0YTMgMyAwIDAgMCAzIDNsNC05VjJINS43MmEyIDIgMCAwIDAtMiAxLjdsLTEuMzggOWEyIDIgMCAwIDAgMiAyLjN6bTctMTNoMi42N0EyLjMxIDIuMzEgMCAwIDEgMjIgNHY3YTIuMzEgMi4zMSAwIDAgMS0yLjMzIDJIMTdcXFwiPjwvcGF0aD5cIixcInRodW1icy11cFwiOlwiPHBhdGggZD1cXFwiTTE0IDlWNWEzIDMgMCAwIDAtMy0zbC00IDl2MTFoMTEuMjhhMiAyIDAgMCAwIDItMS43bDEuMzgtOWEyIDIgMCAwIDAtMi0yLjN6TTcgMjJINGEyIDIgMCAwIDEtMi0ydi03YTIgMiAwIDAgMSAyLTJoM1xcXCI+PC9wYXRoPlwiLFwidG9nZ2xlLWxlZnRcIjpcIjxyZWN0IHg9XFxcIjFcXFwiIHk9XFxcIjVcXFwiIHdpZHRoPVxcXCIyMlxcXCIgaGVpZ2h0PVxcXCIxNFxcXCIgcng9XFxcIjdcXFwiIHJ5PVxcXCI3XFxcIj48L3JlY3Q+PGNpcmNsZSBjeD1cXFwiOFxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIzXFxcIj48L2NpcmNsZT5cIixcInRvZ2dsZS1yaWdodFwiOlwiPHJlY3QgeD1cXFwiMVxcXCIgeT1cXFwiNVxcXCIgd2lkdGg9XFxcIjIyXFxcIiBoZWlnaHQ9XFxcIjE0XFxcIiByeD1cXFwiN1xcXCIgcnk9XFxcIjdcXFwiPjwvcmVjdD48Y2lyY2xlIGN4PVxcXCIxNlxcXCIgY3k9XFxcIjEyXFxcIiByPVxcXCIzXFxcIj48L2NpcmNsZT5cIixcInRyYXNoLTJcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjMgNiA1IDYgMjEgNlxcXCI+PC9wb2x5bGluZT48cGF0aCBkPVxcXCJNMTkgNnYxNGEyIDIgMCAwIDEtMiAySDdhMiAyIDAgMCAxLTItMlY2bTMgMFY0YTIgMiAwIDAgMSAyLTJoNGEyIDIgMCAwIDEgMiAydjJcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiMTBcXFwiIHkxPVxcXCIxMVxcXCIgeDI9XFxcIjEwXFxcIiB5Mj1cXFwiMTdcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTRcXFwiIHkxPVxcXCIxMVxcXCIgeDI9XFxcIjE0XFxcIiB5Mj1cXFwiMTdcXFwiPjwvbGluZT5cIixcInRyYXNoXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIzIDYgNSA2IDIxIDZcXFwiPjwvcG9seWxpbmU+PHBhdGggZD1cXFwiTTE5IDZ2MTRhMiAyIDAgMCAxLTIgMkg3YTIgMiAwIDAgMS0yLTJWNm0zIDBWNGEyIDIgMCAwIDEgMi0yaDRhMiAyIDAgMCAxIDIgMnYyXFxcIj48L3BhdGg+XCIsXCJ0cmVuZGluZy1kb3duXCI6XCI8cG9seWxpbmUgcG9pbnRzPVxcXCIyMyAxOCAxMy41IDguNSA4LjUgMTMuNSAxIDZcXFwiPjwvcG9seWxpbmU+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTcgMTggMjMgMTggMjMgMTJcXFwiPjwvcG9seWxpbmU+XCIsXCJ0cmVuZGluZy11cFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMjMgNiAxMy41IDE1LjUgOC41IDEwLjUgMSAxOFxcXCI+PC9wb2x5bGluZT48cG9seWxpbmUgcG9pbnRzPVxcXCIxNyA2IDIzIDYgMjMgMTJcXFwiPjwvcG9seWxpbmU+XCIsXCJ0cmlhbmdsZVwiOlwiPHBhdGggZD1cXFwiTTEwLjI5IDMuODZMMS44MiAxOGEyIDIgMCAwIDAgMS43MSAzaDE2Ljk0YTIgMiAwIDAgMCAxLjcxLTNMMTMuNzEgMy44NmEyIDIgMCAwIDAtMy40MiAwelxcXCI+PC9wYXRoPlwiLFwidHJ1Y2tcIjpcIjxyZWN0IHg9XFxcIjFcXFwiIHk9XFxcIjNcXFwiIHdpZHRoPVxcXCIxNVxcXCIgaGVpZ2h0PVxcXCIxM1xcXCI+PC9yZWN0Pjxwb2x5Z29uIHBvaW50cz1cXFwiMTYgOCAyMCA4IDIzIDExIDIzIDE2IDE2IDE2IDE2IDhcXFwiPjwvcG9seWdvbj48Y2lyY2xlIGN4PVxcXCI1LjVcXFwiIGN5PVxcXCIxOC41XFxcIiByPVxcXCIyLjVcXFwiPjwvY2lyY2xlPjxjaXJjbGUgY3g9XFxcIjE4LjVcXFwiIGN5PVxcXCIxOC41XFxcIiByPVxcXCIyLjVcXFwiPjwvY2lyY2xlPlwiLFwidHZcIjpcIjxyZWN0IHg9XFxcIjJcXFwiIHk9XFxcIjdcXFwiIHdpZHRoPVxcXCIyMFxcXCIgaGVpZ2h0PVxcXCIxNVxcXCIgcng9XFxcIjJcXFwiIHJ5PVxcXCIyXFxcIj48L3JlY3Q+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTcgMiAxMiA3IDcgMlxcXCI+PC9wb2x5bGluZT5cIixcInR3aXR0ZXJcIjpcIjxwYXRoIGQ9XFxcIk0yMyAzYTEwLjkgMTAuOSAwIDAgMS0zLjE0IDEuNTMgNC40OCA0LjQ4IDAgMCAwLTcuODYgM3YxQTEwLjY2IDEwLjY2IDAgMCAxIDMgNHMtNCA5IDUgMTNhMTEuNjQgMTEuNjQgMCAwIDEtNyAyYzkgNSAyMCAwIDIwLTExLjVhNC41IDQuNSAwIDAgMC0uMDgtLjgzQTcuNzIgNy43MiAwIDAgMCAyMyAzelxcXCI+PC9wYXRoPlwiLFwidHlwZVwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiNCA3IDQgNCAyMCA0IDIwIDdcXFwiPjwvcG9seWxpbmU+PGxpbmUgeDE9XFxcIjlcXFwiIHkxPVxcXCIyMFxcXCIgeDI9XFxcIjE1XFxcIiB5Mj1cXFwiMjBcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCI0XFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIyMFxcXCI+PC9saW5lPlwiLFwidW1icmVsbGFcIjpcIjxwYXRoIGQ9XFxcIk0yMyAxMmExMS4wNSAxMS4wNSAwIDAgMC0yMiAwem0tNSA3YTMgMyAwIDAgMS02IDB2LTdcXFwiPjwvcGF0aD5cIixcInVuZGVybGluZVwiOlwiPHBhdGggZD1cXFwiTTYgM3Y3YTYgNiAwIDAgMCA2IDYgNiA2IDAgMCAwIDYtNlYzXFxcIj48L3BhdGg+PGxpbmUgeDE9XFxcIjRcXFwiIHkxPVxcXCIyMVxcXCIgeDI9XFxcIjIwXFxcIiB5Mj1cXFwiMjFcXFwiPjwvbGluZT5cIixcInVubG9ja1wiOlwiPHJlY3QgeD1cXFwiM1xcXCIgeT1cXFwiMTFcXFwiIHdpZHRoPVxcXCIxOFxcXCIgaGVpZ2h0PVxcXCIxMVxcXCIgcng9XFxcIjJcXFwiIHJ5PVxcXCIyXFxcIj48L3JlY3Q+PHBhdGggZD1cXFwiTTcgMTFWN2E1IDUgMCAwIDEgOS45LTFcXFwiPjwvcGF0aD5cIixcInVwbG9hZC1jbG91ZFwiOlwiPHBvbHlsaW5lIHBvaW50cz1cXFwiMTYgMTYgMTIgMTIgOCAxNlxcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIxMlxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMjFcXFwiPjwvbGluZT48cGF0aCBkPVxcXCJNMjAuMzkgMTguMzlBNSA1IDAgMCAwIDE4IDloLTEuMjZBOCA4IDAgMSAwIDMgMTYuM1xcXCI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9XFxcIjE2IDE2IDEyIDEyIDggMTZcXFwiPjwvcG9seWxpbmU+XCIsXCJ1cGxvYWRcIjpcIjxwYXRoIGQ9XFxcIk0yMSAxNXY0YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0ydi00XFxcIj48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz1cXFwiMTcgOCAxMiAzIDcgOFxcXCI+PC9wb2x5bGluZT48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIzXFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIxNVxcXCI+PC9saW5lPlwiLFwidXNlci1jaGVja1wiOlwiPHBhdGggZD1cXFwiTTE2IDIxdi0yYTQgNCAwIDAgMC00LTRINWE0IDQgMCAwIDAtNCA0djJcXFwiPjwvcGF0aD48Y2lyY2xlIGN4PVxcXCI4LjVcXFwiIGN5PVxcXCI3XFxcIiByPVxcXCI0XFxcIj48L2NpcmNsZT48cG9seWxpbmUgcG9pbnRzPVxcXCIxNyAxMSAxOSAxMyAyMyA5XFxcIj48L3BvbHlsaW5lPlwiLFwidXNlci1taW51c1wiOlwiPHBhdGggZD1cXFwiTTE2IDIxdi0yYTQgNCAwIDAgMC00LTRINWE0IDQgMCAwIDAtNCA0djJcXFwiPjwvcGF0aD48Y2lyY2xlIGN4PVxcXCI4LjVcXFwiIGN5PVxcXCI3XFxcIiByPVxcXCI0XFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiMjNcXFwiIHkxPVxcXCIxMVxcXCIgeDI9XFxcIjE3XFxcIiB5Mj1cXFwiMTFcXFwiPjwvbGluZT5cIixcInVzZXItcGx1c1wiOlwiPHBhdGggZD1cXFwiTTE2IDIxdi0yYTQgNCAwIDAgMC00LTRINWE0IDQgMCAwIDAtNCA0djJcXFwiPjwvcGF0aD48Y2lyY2xlIGN4PVxcXCI4LjVcXFwiIGN5PVxcXCI3XFxcIiByPVxcXCI0XFxcIj48L2NpcmNsZT48bGluZSB4MT1cXFwiMjBcXFwiIHkxPVxcXCI4XFxcIiB4Mj1cXFwiMjBcXFwiIHkyPVxcXCIxNFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCIyM1xcXCIgeTE9XFxcIjExXFxcIiB4Mj1cXFwiMTdcXFwiIHkyPVxcXCIxMVxcXCI+PC9saW5lPlwiLFwidXNlci14XCI6XCI8cGF0aCBkPVxcXCJNMTYgMjF2LTJhNCA0IDAgMCAwLTQtNEg1YTQgNCAwIDAgMC00IDR2MlxcXCI+PC9wYXRoPjxjaXJjbGUgY3g9XFxcIjguNVxcXCIgY3k9XFxcIjdcXFwiIHI9XFxcIjRcXFwiPjwvY2lyY2xlPjxsaW5lIHgxPVxcXCIxOFxcXCIgeTE9XFxcIjhcXFwiIHgyPVxcXCIyM1xcXCIgeTI9XFxcIjEzXFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjIzXFxcIiB5MT1cXFwiOFxcXCIgeDI9XFxcIjE4XFxcIiB5Mj1cXFwiMTNcXFwiPjwvbGluZT5cIixcInVzZXJcIjpcIjxwYXRoIGQ9XFxcIk0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyXFxcIj48L3BhdGg+PGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCI3XFxcIiByPVxcXCI0XFxcIj48L2NpcmNsZT5cIixcInVzZXJzXCI6XCI8cGF0aCBkPVxcXCJNMTcgMjF2LTJhNCA0IDAgMCAwLTQtNEg1YTQgNCAwIDAgMC00IDR2MlxcXCI+PC9wYXRoPjxjaXJjbGUgY3g9XFxcIjlcXFwiIGN5PVxcXCI3XFxcIiByPVxcXCI0XFxcIj48L2NpcmNsZT48cGF0aCBkPVxcXCJNMjMgMjF2LTJhNCA0IDAgMCAwLTMtMy44N1xcXCI+PC9wYXRoPjxwYXRoIGQ9XFxcIk0xNiAzLjEzYTQgNCAwIDAgMSAwIDcuNzVcXFwiPjwvcGF0aD5cIixcInZpZGVvLW9mZlwiOlwiPHBhdGggZD1cXFwiTTE2IDE2djFhMiAyIDAgMCAxLTIgMkgzYTIgMiAwIDAgMS0yLTJWN2EyIDIgMCAwIDEgMi0yaDJtNS42NiAwSDE0YTIgMiAwIDAgMSAyIDJ2My4zNGwxIDFMMjMgN3YxMFxcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCIxXFxcIiB5MT1cXFwiMVxcXCIgeDI9XFxcIjIzXFxcIiB5Mj1cXFwiMjNcXFwiPjwvbGluZT5cIixcInZpZGVvXCI6XCI8cG9seWdvbiBwb2ludHM9XFxcIjIzIDcgMTYgMTIgMjMgMTcgMjMgN1xcXCI+PC9wb2x5Z29uPjxyZWN0IHg9XFxcIjFcXFwiIHk9XFxcIjVcXFwiIHdpZHRoPVxcXCIxNVxcXCIgaGVpZ2h0PVxcXCIxNFxcXCIgcng9XFxcIjJcXFwiIHJ5PVxcXCIyXFxcIj48L3JlY3Q+XCIsXCJ2b2ljZW1haWxcIjpcIjxjaXJjbGUgY3g9XFxcIjUuNVxcXCIgY3k9XFxcIjExLjVcXFwiIHI9XFxcIjQuNVxcXCI+PC9jaXJjbGU+PGNpcmNsZSBjeD1cXFwiMTguNVxcXCIgY3k9XFxcIjExLjVcXFwiIHI9XFxcIjQuNVxcXCI+PC9jaXJjbGU+PGxpbmUgeDE9XFxcIjUuNVxcXCIgeTE9XFxcIjE2XFxcIiB4Mj1cXFwiMTguNVxcXCIgeTI9XFxcIjE2XFxcIj48L2xpbmU+XCIsXCJ2b2x1bWUtMVwiOlwiPHBvbHlnb24gcG9pbnRzPVxcXCIxMSA1IDYgOSAyIDkgMiAxNSA2IDE1IDExIDE5IDExIDVcXFwiPjwvcG9seWdvbj48cGF0aCBkPVxcXCJNMTUuNTQgOC40NmE1IDUgMCAwIDEgMCA3LjA3XFxcIj48L3BhdGg+XCIsXCJ2b2x1bWUtMlwiOlwiPHBvbHlnb24gcG9pbnRzPVxcXCIxMSA1IDYgOSAyIDkgMiAxNSA2IDE1IDExIDE5IDExIDVcXFwiPjwvcG9seWdvbj48cGF0aCBkPVxcXCJNMTkuMDcgNC45M2ExMCAxMCAwIDAgMSAwIDE0LjE0TTE1LjU0IDguNDZhNSA1IDAgMCAxIDAgNy4wN1xcXCI+PC9wYXRoPlwiLFwidm9sdW1lLXhcIjpcIjxwb2x5Z29uIHBvaW50cz1cXFwiMTEgNSA2IDkgMiA5IDIgMTUgNiAxNSAxMSAxOSAxMSA1XFxcIj48L3BvbHlnb24+PGxpbmUgeDE9XFxcIjIzXFxcIiB5MT1cXFwiOVxcXCIgeDI9XFxcIjE3XFxcIiB5Mj1cXFwiMTVcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiMTdcXFwiIHkxPVxcXCI5XFxcIiB4Mj1cXFwiMjNcXFwiIHkyPVxcXCIxNVxcXCI+PC9saW5lPlwiLFwidm9sdW1lXCI6XCI8cG9seWdvbiBwb2ludHM9XFxcIjExIDUgNiA5IDIgOSAyIDE1IDYgMTUgMTEgMTkgMTEgNVxcXCI+PC9wb2x5Z29uPlwiLFwid2F0Y2hcIjpcIjxjaXJjbGUgY3g9XFxcIjEyXFxcIiBjeT1cXFwiMTJcXFwiIHI9XFxcIjdcXFwiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9XFxcIjEyIDkgMTIgMTIgMTMuNSAxMy41XFxcIj48L3BvbHlsaW5lPjxwYXRoIGQ9XFxcIk0xNi41MSAxNy4zNWwtLjM1IDMuODNhMiAyIDAgMCAxLTIgMS44Mkg5LjgzYTIgMiAwIDAgMS0yLTEuODJsLS4zNS0zLjgzbS4wMS0xMC43bC4zNS0zLjgzQTIgMiAwIDAgMSA5LjgzIDFoNC4zNWEyIDIgMCAwIDEgMiAxLjgybC4zNSAzLjgzXFxcIj48L3BhdGg+XCIsXCJ3aWZpLW9mZlwiOlwiPGxpbmUgeDE9XFxcIjFcXFwiIHkxPVxcXCIxXFxcIiB4Mj1cXFwiMjNcXFwiIHkyPVxcXCIyM1xcXCI+PC9saW5lPjxwYXRoIGQ9XFxcIk0xNi43MiAxMS4wNkExMC45NCAxMC45NCAwIDAgMSAxOSAxMi41NVxcXCI+PC9wYXRoPjxwYXRoIGQ9XFxcIk01IDEyLjU1YTEwLjk0IDEwLjk0IDAgMCAxIDUuMTctMi4zOVxcXCI+PC9wYXRoPjxwYXRoIGQ9XFxcIk0xMC43MSA1LjA1QTE2IDE2IDAgMCAxIDIyLjU4IDlcXFwiPjwvcGF0aD48cGF0aCBkPVxcXCJNMS40MiA5YTE1LjkxIDE1LjkxIDAgMCAxIDQuNy0yLjg4XFxcIj48L3BhdGg+PHBhdGggZD1cXFwiTTguNTMgMTYuMTFhNiA2IDAgMCAxIDYuOTUgMFxcXCI+PC9wYXRoPjxsaW5lIHgxPVxcXCIxMlxcXCIgeTE9XFxcIjIwXFxcIiB4Mj1cXFwiMTJcXFwiIHkyPVxcXCIyMFxcXCI+PC9saW5lPlwiLFwid2lmaVwiOlwiPHBhdGggZD1cXFwiTTUgMTIuNTVhMTEgMTEgMCAwIDEgMTQuMDggMFxcXCI+PC9wYXRoPjxwYXRoIGQ9XFxcIk0xLjQyIDlhMTYgMTYgMCAwIDEgMjEuMTYgMFxcXCI+PC9wYXRoPjxwYXRoIGQ9XFxcIk04LjUzIDE2LjExYTYgNiAwIDAgMSA2Ljk1IDBcXFwiPjwvcGF0aD48bGluZSB4MT1cXFwiMTJcXFwiIHkxPVxcXCIyMFxcXCIgeDI9XFxcIjEyXFxcIiB5Mj1cXFwiMjBcXFwiPjwvbGluZT5cIixcIndpbmRcIjpcIjxwYXRoIGQ9XFxcIk05LjU5IDQuNTlBMiAyIDAgMSAxIDExIDhIMm0xMC41OSAxMS40MUEyIDIgMCAxIDAgMTQgMTZIMm0xNS43My04LjI3QTIuNSAyLjUgMCAxIDEgMTkuNSAxMkgyXFxcIj48L3BhdGg+XCIsXCJ4LWNpcmNsZVwiOlwiPGNpcmNsZSBjeD1cXFwiMTJcXFwiIGN5PVxcXCIxMlxcXCIgcj1cXFwiMTBcXFwiPjwvY2lyY2xlPjxsaW5lIHgxPVxcXCIxNVxcXCIgeTE9XFxcIjlcXFwiIHgyPVxcXCI5XFxcIiB5Mj1cXFwiMTVcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiOVxcXCIgeTE9XFxcIjlcXFwiIHgyPVxcXCIxNVxcXCIgeTI9XFxcIjE1XFxcIj48L2xpbmU+XCIsXCJ4LXNxdWFyZVwiOlwiPHJlY3QgeD1cXFwiM1xcXCIgeT1cXFwiM1xcXCIgd2lkdGg9XFxcIjE4XFxcIiBoZWlnaHQ9XFxcIjE4XFxcIiByeD1cXFwiMlxcXCIgcnk9XFxcIjJcXFwiPjwvcmVjdD48bGluZSB4MT1cXFwiOVxcXCIgeTE9XFxcIjlcXFwiIHgyPVxcXCIxNVxcXCIgeTI9XFxcIjE1XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjE1XFxcIiB5MT1cXFwiOVxcXCIgeDI9XFxcIjlcXFwiIHkyPVxcXCIxNVxcXCI+PC9saW5lPlwiLFwieFwiOlwiPGxpbmUgeDE9XFxcIjE4XFxcIiB5MT1cXFwiNlxcXCIgeDI9XFxcIjZcXFwiIHkyPVxcXCIxOFxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI2XFxcIiB5MT1cXFwiNlxcXCIgeDI9XFxcIjE4XFxcIiB5Mj1cXFwiMThcXFwiPjwvbGluZT5cIixcInlvdXR1YmVcIjpcIjxwYXRoIGQ9XFxcIk0yMi41NCA2LjQyYTIuNzggMi43OCAwIDAgMC0xLjk0LTJDMTguODggNCAxMiA0IDEyIDRzLTYuODggMC04LjYuNDZhMi43OCAyLjc4IDAgMCAwLTEuOTQgMkEyOSAyOSAwIDAgMCAxIDExLjc1YTI5IDI5IDAgMCAwIC40NiA1LjMzQTIuNzggMi43OCAwIDAgMCAzLjQgMTljMS43Mi40NiA4LjYuNDYgOC42LjQ2czYuODggMCA4LjYtLjQ2YTIuNzggMi43OCAwIDAgMCAxLjk0LTIgMjkgMjkgMCAwIDAgLjQ2LTUuMjUgMjkgMjkgMCAwIDAtLjQ2LTUuMzN6XFxcIj48L3BhdGg+PHBvbHlnb24gcG9pbnRzPVxcXCI5Ljc1IDE1LjAyIDE1LjUgMTEuNzUgOS43NSA4LjQ4IDkuNzUgMTUuMDJcXFwiPjwvcG9seWdvbj5cIixcInphcC1vZmZcIjpcIjxwb2x5bGluZSBwb2ludHM9XFxcIjEyLjQxIDYuNzUgMTMgMiAxMC41NyA0LjkyXFxcIj48L3BvbHlsaW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjE4LjU3IDEyLjkxIDIxIDEwIDE1LjY2IDEwXFxcIj48L3BvbHlsaW5lPjxwb2x5bGluZSBwb2ludHM9XFxcIjggOCAzIDE0IDEyIDE0IDExIDIyIDE2IDE2XFxcIj48L3BvbHlsaW5lPjxsaW5lIHgxPVxcXCIxXFxcIiB5MT1cXFwiMVxcXCIgeDI9XFxcIjIzXFxcIiB5Mj1cXFwiMjNcXFwiPjwvbGluZT5cIixcInphcFwiOlwiPHBvbHlnb24gcG9pbnRzPVxcXCIxMyAyIDMgMTQgMTIgMTQgMTEgMjIgMjEgMTAgMTIgMTAgMTMgMlxcXCI+PC9wb2x5Z29uPlwiLFwiem9vbS1pblwiOlwiPGNpcmNsZSBjeD1cXFwiMTFcXFwiIGN5PVxcXCIxMVxcXCIgcj1cXFwiOFxcXCI+PC9jaXJjbGU+PGxpbmUgeDE9XFxcIjIxXFxcIiB5MT1cXFwiMjFcXFwiIHgyPVxcXCIxNi42NVxcXCIgeTI9XFxcIjE2LjY1XFxcIj48L2xpbmU+PGxpbmUgeDE9XFxcIjExXFxcIiB5MT1cXFwiOFxcXCIgeDI9XFxcIjExXFxcIiB5Mj1cXFwiMTRcXFwiPjwvbGluZT48bGluZSB4MT1cXFwiOFxcXCIgeTE9XFxcIjExXFxcIiB4Mj1cXFwiMTRcXFwiIHkyPVxcXCIxMVxcXCI+PC9saW5lPlwiLFwiem9vbS1vdXRcIjpcIjxjaXJjbGUgY3g9XFxcIjExXFxcIiBjeT1cXFwiMTFcXFwiIHI9XFxcIjhcXFwiPjwvY2lyY2xlPjxsaW5lIHgxPVxcXCIyMVxcXCIgeTE9XFxcIjIxXFxcIiB4Mj1cXFwiMTYuNjVcXFwiIHkyPVxcXCIxNi42NVxcXCI+PC9saW5lPjxsaW5lIHgxPVxcXCI4XFxcIiB5MT1cXFwiMTFcXFwiIHgyPVxcXCIxNFxcXCIgeTI9XFxcIjExXFxcIj48L2xpbmU+XCJ9O1xuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jbGFzc25hbWVzL2RlZHVwZS5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jbGFzc25hbWVzL2RlZHVwZS5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgX19XRUJQQUNLX0FNRF9ERUZJTkVfQVJSQVlfXywgX19XRUJQQUNLX0FNRF9ERUZJTkVfUkVTVUxUX187LyohXG4gIENvcHlyaWdodCAoYykgMjAxNiBKZWQgV2F0c29uLlxuICBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKE1JVCksIHNlZVxuICBodHRwOi8vamVkd2F0c29uLmdpdGh1Yi5pby9jbGFzc25hbWVzXG4qL1xuLyogZ2xvYmFsIGRlZmluZSAqL1xuXG4oZnVuY3Rpb24gKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIGNsYXNzTmFtZXMgPSAoZnVuY3Rpb24gKCkge1xuXHRcdC8vIGRvbid0IGluaGVyaXQgZnJvbSBPYmplY3Qgc28gd2UgY2FuIHNraXAgaGFzT3duUHJvcGVydHkgY2hlY2sgbGF0ZXJcblx0XHQvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1NTE4MzI4L2NyZWF0aW5nLWpzLW9iamVjdC13aXRoLW9iamVjdC1jcmVhdGVudWxsI2Fuc3dlci0yMTA3OTIzMlxuXHRcdGZ1bmN0aW9uIFN0b3JhZ2VPYmplY3QoKSB7fVxuXHRcdFN0b3JhZ2VPYmplY3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuXHRcdGZ1bmN0aW9uIF9wYXJzZUFycmF5IChyZXN1bHRTZXQsIGFycmF5KSB7XG5cdFx0XHR2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG5cdFx0XHRcdF9wYXJzZShyZXN1bHRTZXQsIGFycmF5W2ldKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgaGFzT3duID0ge30uaGFzT3duUHJvcGVydHk7XG5cblx0XHRmdW5jdGlvbiBfcGFyc2VOdW1iZXIgKHJlc3VsdFNldCwgbnVtKSB7XG5cdFx0XHRyZXN1bHRTZXRbbnVtXSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gX3BhcnNlT2JqZWN0IChyZXN1bHRTZXQsIG9iamVjdCkge1xuXHRcdFx0Zm9yICh2YXIgayBpbiBvYmplY3QpIHtcblx0XHRcdFx0aWYgKGhhc093bi5jYWxsKG9iamVjdCwgaykpIHtcblx0XHRcdFx0XHQvLyBzZXQgdmFsdWUgdG8gZmFsc2UgaW5zdGVhZCBvZiBkZWxldGluZyBpdCB0byBhdm9pZCBjaGFuZ2luZyBvYmplY3Qgc3RydWN0dXJlXG5cdFx0XHRcdFx0Ly8gaHR0cHM6Ly93d3cuc21hc2hpbmdtYWdhemluZS5jb20vMjAxMi8xMS93cml0aW5nLWZhc3QtbWVtb3J5LWVmZmljaWVudC1qYXZhc2NyaXB0LyNkZS1yZWZlcmVuY2luZy1taXNjb25jZXB0aW9uc1xuXHRcdFx0XHRcdHJlc3VsdFNldFtrXSA9ICEhb2JqZWN0W2tdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dmFyIFNQQUNFID0gL1xccysvO1xuXHRcdGZ1bmN0aW9uIF9wYXJzZVN0cmluZyAocmVzdWx0U2V0LCBzdHIpIHtcblx0XHRcdHZhciBhcnJheSA9IHN0ci5zcGxpdChTUEFDRSk7XG5cdFx0XHR2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG5cdFx0XHRcdHJlc3VsdFNldFthcnJheVtpXV0gPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIF9wYXJzZSAocmVzdWx0U2V0LCBhcmcpIHtcblx0XHRcdGlmICghYXJnKSByZXR1cm47XG5cdFx0XHR2YXIgYXJnVHlwZSA9IHR5cGVvZiBhcmc7XG5cblx0XHRcdC8vICdmb28gYmFyJ1xuXHRcdFx0aWYgKGFyZ1R5cGUgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdF9wYXJzZVN0cmluZyhyZXN1bHRTZXQsIGFyZyk7XG5cblx0XHRcdC8vIFsnZm9vJywgJ2JhcicsIC4uLl1cblx0XHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShhcmcpKSB7XG5cdFx0XHRcdF9wYXJzZUFycmF5KHJlc3VsdFNldCwgYXJnKTtcblxuXHRcdFx0Ly8geyAnZm9vJzogdHJ1ZSwgLi4uIH1cblx0XHRcdH0gZWxzZSBpZiAoYXJnVHlwZSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdFx0X3BhcnNlT2JqZWN0KHJlc3VsdFNldCwgYXJnKTtcblxuXHRcdFx0Ly8gJzEzMCdcblx0XHRcdH0gZWxzZSBpZiAoYXJnVHlwZSA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0X3BhcnNlTnVtYmVyKHJlc3VsdFNldCwgYXJnKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBfY2xhc3NOYW1lcyAoKSB7XG5cdFx0XHQvLyBkb24ndCBsZWFrIGFyZ3VtZW50c1xuXHRcdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL3BldGthYW50b25vdi9ibHVlYmlyZC93aWtpL09wdGltaXphdGlvbi1raWxsZXJzIzMyLWxlYWtpbmctYXJndW1lbnRzXG5cdFx0XHR2YXIgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcblx0XHRcdHZhciBhcmdzID0gQXJyYXkobGVuKTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdFx0YXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGNsYXNzU2V0ID0gbmV3IFN0b3JhZ2VPYmplY3QoKTtcblx0XHRcdF9wYXJzZUFycmF5KGNsYXNzU2V0LCBhcmdzKTtcblxuXHRcdFx0dmFyIGxpc3QgPSBbXTtcblxuXHRcdFx0Zm9yICh2YXIgayBpbiBjbGFzc1NldCkge1xuXHRcdFx0XHRpZiAoY2xhc3NTZXRba10pIHtcblx0XHRcdFx0XHRsaXN0LnB1c2goaylcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbGlzdC5qb2luKCcgJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIF9jbGFzc05hbWVzO1xuXHR9KSgpO1xuXG5cdGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gY2xhc3NOYW1lcztcblx0fSBlbHNlIGlmICh0cnVlKSB7XG5cdFx0Ly8gcmVnaXN0ZXIgYXMgJ2NsYXNzbmFtZXMnLCBjb25zaXN0ZW50IHdpdGggbnBtIHBhY2thZ2UgbmFtZVxuXHRcdCEoX19XRUJQQUNLX0FNRF9ERUZJTkVfQVJSQVlfXyA9IFtdLCBfX1dFQlBBQ0tfQU1EX0RFRklORV9SRVNVTFRfXyA9IChmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gY2xhc3NOYW1lcztcblx0XHR9KS5hcHBseShleHBvcnRzLCBfX1dFQlBBQ0tfQU1EX0RFRklORV9BUlJBWV9fKSxcblx0XHRcdFx0X19XRUJQQUNLX0FNRF9ERUZJTkVfUkVTVUxUX18gIT09IHVuZGVmaW5lZCAmJiAobW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfQU1EX0RFRklORV9SRVNVTFRfXykpO1xuXHR9IGVsc2Uge31cbn0oKSk7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9mbi9hcnJheS9mcm9tLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ZuL2FycmF5L2Zyb20uanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbl9fd2VicGFja19yZXF1aXJlX18oLyohIC4uLy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvciAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yLmpzXCIpO1xuX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi4vLi4vbW9kdWxlcy9lczYuYXJyYXkuZnJvbSAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuZnJvbS5qc1wiKTtcbm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi4vLi4vbW9kdWxlcy9fY29yZSAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY29yZS5qc1wiKS5BcnJheS5mcm9tO1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYS1mdW5jdGlvbi5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpIHRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGEgZnVuY3Rpb24hJyk7XG4gIHJldHVybiBpdDtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxudmFyIGlzT2JqZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9faXMtb2JqZWN0ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pcy1vYmplY3QuanNcIik7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoIWlzT2JqZWN0KGl0KSkgdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYXJyYXktaW5jbHVkZXMuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2FycmF5LWluY2x1ZGVzLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuLy8gZmFsc2UgLT4gQXJyYXkjaW5kZXhPZlxuLy8gdHJ1ZSAgLT4gQXJyYXkjaW5jbHVkZXNcbnZhciB0b0lPYmplY3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL190by1pb2JqZWN0ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1pb2JqZWN0LmpzXCIpO1xudmFyIHRvTGVuZ3RoID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fdG8tbGVuZ3RoICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1sZW5ndGguanNcIik7XG52YXIgdG9BYnNvbHV0ZUluZGV4ID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fdG8tYWJzb2x1dGUtaW5kZXggKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWFic29sdXRlLWluZGV4LmpzXCIpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoSVNfSU5DTFVERVMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgkdGhpcywgZWwsIGZyb21JbmRleCkge1xuICAgIHZhciBPID0gdG9JT2JqZWN0KCR0aGlzKTtcbiAgICB2YXIgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpO1xuICAgIHZhciBpbmRleCA9IHRvQWJzb2x1dGVJbmRleChmcm9tSW5kZXgsIGxlbmd0aCk7XG4gICAgdmFyIHZhbHVlO1xuICAgIC8vIEFycmF5I2luY2x1ZGVzIHVzZXMgU2FtZVZhbHVlWmVybyBlcXVhbGl0eSBhbGdvcml0aG1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgaWYgKElTX0lOQ0xVREVTICYmIGVsICE9IGVsKSB3aGlsZSAobGVuZ3RoID4gaW5kZXgpIHtcbiAgICAgIHZhbHVlID0gT1tpbmRleCsrXTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgIGlmICh2YWx1ZSAhPSB2YWx1ZSkgcmV0dXJuIHRydWU7XG4gICAgLy8gQXJyYXkjaW5kZXhPZiBpZ25vcmVzIGhvbGVzLCBBcnJheSNpbmNsdWRlcyAtIG5vdFxuICAgIH0gZWxzZSBmb3IgKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKykgaWYgKElTX0lOQ0xVREVTIHx8IGluZGV4IGluIE8pIHtcbiAgICAgIGlmIChPW2luZGV4XSA9PT0gZWwpIHJldHVybiBJU19JTkNMVURFUyB8fCBpbmRleCB8fCAwO1xuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcbiAgfTtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jbGFzc29mLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NsYXNzb2YuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbi8vIGdldHRpbmcgdGFnIGZyb20gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY29mID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fY29mICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jb2YuanNcIik7XG52YXIgVEFHID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fd2tzICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL193a3MuanNcIikoJ3RvU3RyaW5nVGFnJyk7XG4vLyBFUzMgd3JvbmcgaGVyZVxudmFyIEFSRyA9IGNvZihmdW5jdGlvbiAoKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPT0gJ0FyZ3VtZW50cyc7XG5cbi8vIGZhbGxiYWNrIGZvciBJRTExIFNjcmlwdCBBY2Nlc3MgRGVuaWVkIGVycm9yXG52YXIgdHJ5R2V0ID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gaXRba2V5XTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgTywgVCwgQjtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6IGl0ID09PSBudWxsID8gJ051bGwnXG4gICAgLy8gQEB0b1N0cmluZ1RhZyBjYXNlXG4gICAgOiB0eXBlb2YgKFQgPSB0cnlHZXQoTyA9IE9iamVjdChpdCksIFRBRykpID09ICdzdHJpbmcnID8gVFxuICAgIC8vIGJ1aWx0aW5UYWcgY2FzZVxuICAgIDogQVJHID8gY29mKE8pXG4gICAgLy8gRVMzIGFyZ3VtZW50cyBmYWxsYmFja1xuICAgIDogKEIgPSBjb2YoTykpID09ICdPYmplY3QnICYmIHR5cGVvZiBPLmNhbGxlZSA9PSAnZnVuY3Rpb24nID8gJ0FyZ3VtZW50cycgOiBCO1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvZi5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvZi5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG52YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jb3JlLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbnZhciBjb3JlID0gbW9kdWxlLmV4cG9ydHMgPSB7IHZlcnNpb246ICcyLjUuMycgfTtcbmlmICh0eXBlb2YgX19lID09ICdudW1iZXInKSBfX2UgPSBjb3JlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jcmVhdGUtcHJvcGVydHkuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jcmVhdGUtcHJvcGVydHkuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciAkZGVmaW5lUHJvcGVydHkgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19vYmplY3QtZHAgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1kcC5qc1wiKTtcbnZhciBjcmVhdGVEZXNjID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fcHJvcGVydHktZGVzYyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqZWN0LCBpbmRleCwgdmFsdWUpIHtcbiAgaWYgKGluZGV4IGluIG9iamVjdCkgJGRlZmluZVByb3BlcnR5LmYob2JqZWN0LCBpbmRleCwgY3JlYXRlRGVzYygwLCB2YWx1ZSkpO1xuICBlbHNlIG9iamVjdFtpbmRleF0gPSB2YWx1ZTtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jdHguanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jdHguanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuLy8gb3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG52YXIgYUZ1bmN0aW9uID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fYS1mdW5jdGlvbiAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYS1mdW5jdGlvbi5qc1wiKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZuLCB0aGF0LCBsZW5ndGgpIHtcbiAgYUZ1bmN0aW9uKGZuKTtcbiAgaWYgKHRoYXQgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZuO1xuICBzd2l0Y2ggKGxlbmd0aCkge1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uIChhKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiAoLyogLi4uYXJncyAqLykge1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2RlZmluZWQuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZGVmaW5lZC5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuLy8gNy4yLjEgUmVxdWlyZU9iamVjdENvZXJjaWJsZShhcmd1bWVudClcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmIChpdCA9PSB1bmRlZmluZWQpIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uICBcIiArIGl0KTtcbiAgcmV0dXJuIGl0O1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kZXNjcmlwdG9ycy5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbi8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcbm1vZHVsZS5leHBvcnRzID0gIV9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2ZhaWxzICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19mYWlscy5qc1wiKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdhJywgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH0gfSkuYSAhPSA3O1xufSk7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kb20tY3JlYXRlLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2RvbS1jcmVhdGUuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbnZhciBpc09iamVjdCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2lzLW9iamVjdCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXMtb2JqZWN0LmpzXCIpO1xudmFyIGRvY3VtZW50ID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fZ2xvYmFsICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19nbG9iYWwuanNcIikuZG9jdW1lbnQ7XG4vLyB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0JyBpbiBvbGQgSUVcbnZhciBpcyA9IGlzT2JqZWN0KGRvY3VtZW50KSAmJiBpc09iamVjdChkb2N1bWVudC5jcmVhdGVFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpcyA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXQpIDoge307XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZW51bS1idWcta2V5cy5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG4vLyBJRSA4LSBkb24ndCBlbnVtIGJ1ZyBrZXlzXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgJ2NvbnN0cnVjdG9yLGhhc093blByb3BlcnR5LGlzUHJvdG90eXBlT2YscHJvcGVydHlJc0VudW1lcmFibGUsdG9Mb2NhbGVTdHJpbmcsdG9TdHJpbmcsdmFsdWVPZidcbikuc3BsaXQoJywnKTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2V4cG9ydC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2V4cG9ydC5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgZ2xvYmFsID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fZ2xvYmFsICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19nbG9iYWwuanNcIik7XG52YXIgY29yZSA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2NvcmUgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanNcIik7XG52YXIgaGlkZSA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2hpZGUgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2hpZGUuanNcIik7XG52YXIgcmVkZWZpbmUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19yZWRlZmluZSAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcmVkZWZpbmUuanNcIik7XG52YXIgY3R4ID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fY3R4ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jdHguanNcIik7XG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG5cbnZhciAkZXhwb3J0ID0gZnVuY3Rpb24gKHR5cGUsIG5hbWUsIHNvdXJjZSkge1xuICB2YXIgSVNfRk9SQ0VEID0gdHlwZSAmICRleHBvcnQuRjtcbiAgdmFyIElTX0dMT0JBTCA9IHR5cGUgJiAkZXhwb3J0Lkc7XG4gIHZhciBJU19TVEFUSUMgPSB0eXBlICYgJGV4cG9ydC5TO1xuICB2YXIgSVNfUFJPVE8gPSB0eXBlICYgJGV4cG9ydC5QO1xuICB2YXIgSVNfQklORCA9IHR5cGUgJiAkZXhwb3J0LkI7XG4gIHZhciB0YXJnZXQgPSBJU19HTE9CQUwgPyBnbG9iYWwgOiBJU19TVEFUSUMgPyBnbG9iYWxbbmFtZV0gfHwgKGdsb2JhbFtuYW1lXSA9IHt9KSA6IChnbG9iYWxbbmFtZV0gfHwge30pW1BST1RPVFlQRV07XG4gIHZhciBleHBvcnRzID0gSVNfR0xPQkFMID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSk7XG4gIHZhciBleHBQcm90byA9IGV4cG9ydHNbUFJPVE9UWVBFXSB8fCAoZXhwb3J0c1tQUk9UT1RZUEVdID0ge30pO1xuICB2YXIga2V5LCBvd24sIG91dCwgZXhwO1xuICBpZiAoSVNfR0xPQkFMKSBzb3VyY2UgPSBuYW1lO1xuICBmb3IgKGtleSBpbiBzb3VyY2UpIHtcbiAgICAvLyBjb250YWlucyBpbiBuYXRpdmVcbiAgICBvd24gPSAhSVNfRk9SQ0VEICYmIHRhcmdldCAmJiB0YXJnZXRba2V5XSAhPT0gdW5kZWZpbmVkO1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gKG93biA/IHRhcmdldCA6IHNvdXJjZSlba2V5XTtcbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxuICAgIGV4cCA9IElTX0JJTkQgJiYgb3duID8gY3R4KG91dCwgZ2xvYmFsKSA6IElTX1BST1RPICYmIHR5cGVvZiBvdXQgPT0gJ2Z1bmN0aW9uJyA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIC8vIGV4dGVuZCBnbG9iYWxcbiAgICBpZiAodGFyZ2V0KSByZWRlZmluZSh0YXJnZXQsIGtleSwgb3V0LCB0eXBlICYgJGV4cG9ydC5VKTtcbiAgICAvLyBleHBvcnRcbiAgICBpZiAoZXhwb3J0c1trZXldICE9IG91dCkgaGlkZShleHBvcnRzLCBrZXksIGV4cCk7XG4gICAgaWYgKElTX1BST1RPICYmIGV4cFByb3RvW2tleV0gIT0gb3V0KSBleHBQcm90b1trZXldID0gb3V0O1xuICB9XG59O1xuZ2xvYmFsLmNvcmUgPSBjb3JlO1xuLy8gdHlwZSBiaXRtYXBcbiRleHBvcnQuRiA9IDE7ICAgLy8gZm9yY2VkXG4kZXhwb3J0LkcgPSAyOyAgIC8vIGdsb2JhbFxuJGV4cG9ydC5TID0gNDsgICAvLyBzdGF0aWNcbiRleHBvcnQuUCA9IDg7ICAgLy8gcHJvdG9cbiRleHBvcnQuQiA9IDE2OyAgLy8gYmluZFxuJGV4cG9ydC5XID0gMzI7ICAvLyB3cmFwXG4kZXhwb3J0LlUgPSA2NDsgIC8vIHNhZmVcbiRleHBvcnQuUiA9IDEyODsgLy8gcmVhbCBwcm90byBtZXRob2QgZm9yIGBsaWJyYXJ5YFxubW9kdWxlLmV4cG9ydHMgPSAkZXhwb3J0O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZmFpbHMuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2ZhaWxzLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhlYykge1xuICB0cnkge1xuICAgIHJldHVybiAhIWV4ZWMoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZ2xvYmFsLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZ2xvYmFsLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG52YXIgZ2xvYmFsID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09IE1hdGhcbiAgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT0gTWF0aCA/IHNlbGZcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLW5ldy1mdW5jXG4gIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbmlmICh0eXBlb2YgX19nID09ICdudW1iZXInKSBfX2cgPSBnbG9iYWw7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2hhcy5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2hhcy5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG52YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faGlkZS5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgZFAgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19vYmplY3QtZHAgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1kcC5qc1wiKTtcbnZhciBjcmVhdGVEZXNjID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fcHJvcGVydHktZGVzYyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qc1wiKTtcbm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fZGVzY3JpcHRvcnMgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzXCIpID8gZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICByZXR1cm4gZFAuZihvYmplY3QsIGtleSwgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19odG1sLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2h0bWwuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbnZhciBkb2N1bWVudCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2dsb2JhbCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZ2xvYmFsLmpzXCIpLmRvY3VtZW50O1xubW9kdWxlLmV4cG9ydHMgPSBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faWU4LWRvbS1kZWZpbmUuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5tb2R1bGUuZXhwb3J0cyA9ICFfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19kZXNjcmlwdG9ycyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZGVzY3JpcHRvcnMuanNcIikgJiYgIV9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2ZhaWxzICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19mYWlscy5qc1wiKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fZG9tLWNyZWF0ZSAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZG9tLWNyZWF0ZS5qc1wiKSgnZGl2JyksICdhJywgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH0gfSkuYSAhPSA3O1xufSk7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pb2JqZWN0LmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2lvYmplY3QuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG52YXIgY29mID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fY29mICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19jb2YuanNcIik7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdCgneicpLnByb3BlcnR5SXNFbnVtZXJhYmxlKDApID8gT2JqZWN0IDogZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogT2JqZWN0KGl0KTtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pcy1hcnJheS1pdGVyLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2lzLWFycmF5LWl0ZXIuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbi8vIGNoZWNrIG9uIGRlZmF1bHQgQXJyYXkgaXRlcmF0b3JcbnZhciBJdGVyYXRvcnMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19pdGVyYXRvcnMgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXJhdG9ycy5qc1wiKTtcbnZhciBJVEVSQVRPUiA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX3drcyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fd2tzLmpzXCIpKCdpdGVyYXRvcicpO1xudmFyIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpdCAhPT0gdW5kZWZpbmVkICYmIChJdGVyYXRvcnMuQXJyYXkgPT09IGl0IHx8IEFycmF5UHJvdG9bSVRFUkFUT1JdID09PSBpdCk7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXMtb2JqZWN0LmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXMtb2JqZWN0LmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXRlci1jYWxsLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXRlci1jYWxsLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbi8vIGNhbGwgc29tZXRoaW5nIG9uIGl0ZXJhdG9yIHN0ZXAgd2l0aCBzYWZlIGNsb3Npbmcgb24gZXJyb3JcbnZhciBhbk9iamVjdCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2FuLW9iamVjdCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fYW4tb2JqZWN0LmpzXCIpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIGZuLCB2YWx1ZSwgZW50cmllcykge1xuICB0cnkge1xuICAgIHJldHVybiBlbnRyaWVzID8gZm4oYW5PYmplY3QodmFsdWUpWzBdLCB2YWx1ZVsxXSkgOiBmbih2YWx1ZSk7XG4gIC8vIDcuNC42IEl0ZXJhdG9yQ2xvc2UoaXRlcmF0b3IsIGNvbXBsZXRpb24pXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB2YXIgcmV0ID0gaXRlcmF0b3JbJ3JldHVybiddO1xuICAgIGlmIChyZXQgIT09IHVuZGVmaW5lZCkgYW5PYmplY3QocmV0LmNhbGwoaXRlcmF0b3IpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXRlci1jcmVhdGUuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXItY3JlYXRlLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBjcmVhdGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19vYmplY3QtY3JlYXRlICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtY3JlYXRlLmpzXCIpO1xudmFyIGRlc2NyaXB0b3IgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19wcm9wZXJ0eS1kZXNjICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19wcm9wZXJ0eS1kZXNjLmpzXCIpO1xudmFyIHNldFRvU3RyaW5nVGFnID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fc2V0LXRvLXN0cmluZy10YWcgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3NldC10by1zdHJpbmctdGFnLmpzXCIpO1xudmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG5cbi8vIDI1LjEuMi4xLjEgJUl0ZXJhdG9yUHJvdG90eXBlJVtAQGl0ZXJhdG9yXSgpXG5fX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19oaWRlICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzXCIpKEl0ZXJhdG9yUHJvdG90eXBlLCBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL193a3MgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3drcy5qc1wiKSgnaXRlcmF0b3InKSwgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KSB7XG4gIENvbnN0cnVjdG9yLnByb3RvdHlwZSA9IGNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSwgeyBuZXh0OiBkZXNjcmlwdG9yKDEsIG5leHQpIH0pO1xuICBzZXRUb1N0cmluZ1RhZyhDb25zdHJ1Y3RvciwgTkFNRSArICcgSXRlcmF0b3InKTtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pdGVyLWRlZmluZS5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faXRlci1kZWZpbmUuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIExJQlJBUlkgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19saWJyYXJ5ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19saWJyYXJ5LmpzXCIpO1xudmFyICRleHBvcnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19leHBvcnQgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2V4cG9ydC5qc1wiKTtcbnZhciByZWRlZmluZSA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX3JlZGVmaW5lICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19yZWRlZmluZS5qc1wiKTtcbnZhciBoaWRlID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9faGlkZSAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faGlkZS5qc1wiKTtcbnZhciBoYXMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19oYXMgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2hhcy5qc1wiKTtcbnZhciBJdGVyYXRvcnMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19pdGVyYXRvcnMgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXJhdG9ycy5qc1wiKTtcbnZhciAkaXRlckNyZWF0ZSA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2l0ZXItY3JlYXRlICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pdGVyLWNyZWF0ZS5qc1wiKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX3NldC10by1zdHJpbmctdGFnICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zZXQtdG8tc3RyaW5nLXRhZy5qc1wiKTtcbnZhciBnZXRQcm90b3R5cGVPZiA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX29iamVjdC1ncG8gKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1ncG8uanNcIik7XG52YXIgSVRFUkFUT1IgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL193a3MgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3drcy5qc1wiKSgnaXRlcmF0b3InKTtcbnZhciBCVUdHWSA9ICEoW10ua2V5cyAmJiAnbmV4dCcgaW4gW10ua2V5cygpKTsgLy8gU2FmYXJpIGhhcyBidWdneSBpdGVyYXRvcnMgdy9vIGBuZXh0YFxudmFyIEZGX0lURVJBVE9SID0gJ0BAaXRlcmF0b3InO1xudmFyIEtFWVMgPSAna2V5cyc7XG52YXIgVkFMVUVTID0gJ3ZhbHVlcyc7XG5cbnZhciByZXR1cm5UaGlzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoQmFzZSwgTkFNRSwgQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0VEKSB7XG4gICRpdGVyQ3JlYXRlKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KTtcbiAgdmFyIGdldE1ldGhvZCA9IGZ1bmN0aW9uIChraW5kKSB7XG4gICAgaWYgKCFCVUdHWSAmJiBraW5kIGluIHByb3RvKSByZXR1cm4gcHJvdG9ba2luZF07XG4gICAgc3dpdGNoIChraW5kKSB7XG4gICAgICBjYXNlIEtFWVM6IHJldHVybiBmdW5jdGlvbiBrZXlzKCkgeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICAgICAgY2FzZSBWQUxVRVM6IHJldHVybiBmdW5jdGlvbiB2YWx1ZXMoKSB7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gICAgfSByZXR1cm4gZnVuY3Rpb24gZW50cmllcygpIHsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgfTtcbiAgdmFyIFRBRyA9IE5BTUUgKyAnIEl0ZXJhdG9yJztcbiAgdmFyIERFRl9WQUxVRVMgPSBERUZBVUxUID09IFZBTFVFUztcbiAgdmFyIFZBTFVFU19CVUcgPSBmYWxzZTtcbiAgdmFyIHByb3RvID0gQmFzZS5wcm90b3R5cGU7XG4gIHZhciAkbmF0aXZlID0gcHJvdG9bSVRFUkFUT1JdIHx8IHByb3RvW0ZGX0lURVJBVE9SXSB8fCBERUZBVUxUICYmIHByb3RvW0RFRkFVTFRdO1xuICB2YXIgJGRlZmF1bHQgPSAoIUJVR0dZICYmICRuYXRpdmUpIHx8IGdldE1ldGhvZChERUZBVUxUKTtcbiAgdmFyICRlbnRyaWVzID0gREVGQVVMVCA/ICFERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoJ2VudHJpZXMnKSA6IHVuZGVmaW5lZDtcbiAgdmFyICRhbnlOYXRpdmUgPSBOQU1FID09ICdBcnJheScgPyBwcm90by5lbnRyaWVzIHx8ICRuYXRpdmUgOiAkbmF0aXZlO1xuICB2YXIgbWV0aG9kcywga2V5LCBJdGVyYXRvclByb3RvdHlwZTtcbiAgLy8gRml4IG5hdGl2ZVxuICBpZiAoJGFueU5hdGl2ZSkge1xuICAgIEl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG90eXBlT2YoJGFueU5hdGl2ZS5jYWxsKG5ldyBCYXNlKCkpKTtcbiAgICBpZiAoSXRlcmF0b3JQcm90b3R5cGUgIT09IE9iamVjdC5wcm90b3R5cGUgJiYgSXRlcmF0b3JQcm90b3R5cGUubmV4dCkge1xuICAgICAgLy8gU2V0IEBAdG9TdHJpbmdUYWcgdG8gbmF0aXZlIGl0ZXJhdG9yc1xuICAgICAgc2V0VG9TdHJpbmdUYWcoSXRlcmF0b3JQcm90b3R5cGUsIFRBRywgdHJ1ZSk7XG4gICAgICAvLyBmaXggZm9yIHNvbWUgb2xkIGVuZ2luZXNcbiAgICAgIGlmICghTElCUkFSWSAmJiAhaGFzKEl0ZXJhdG9yUHJvdG90eXBlLCBJVEVSQVRPUikpIGhpZGUoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SLCByZXR1cm5UaGlzKTtcbiAgICB9XG4gIH1cbiAgLy8gZml4IEFycmF5I3t2YWx1ZXMsIEBAaXRlcmF0b3J9Lm5hbWUgaW4gVjggLyBGRlxuICBpZiAoREVGX1ZBTFVFUyAmJiAkbmF0aXZlICYmICRuYXRpdmUubmFtZSAhPT0gVkFMVUVTKSB7XG4gICAgVkFMVUVTX0JVRyA9IHRydWU7XG4gICAgJGRlZmF1bHQgPSBmdW5jdGlvbiB2YWx1ZXMoKSB7IHJldHVybiAkbmF0aXZlLmNhbGwodGhpcyk7IH07XG4gIH1cbiAgLy8gRGVmaW5lIGl0ZXJhdG9yXG4gIGlmICgoIUxJQlJBUlkgfHwgRk9SQ0VEKSAmJiAoQlVHR1kgfHwgVkFMVUVTX0JVRyB8fCAhcHJvdG9bSVRFUkFUT1JdKSkge1xuICAgIGhpZGUocHJvdG8sIElURVJBVE9SLCAkZGVmYXVsdCk7XG4gIH1cbiAgLy8gUGx1ZyBmb3IgbGlicmFyeVxuICBJdGVyYXRvcnNbTkFNRV0gPSAkZGVmYXVsdDtcbiAgSXRlcmF0b3JzW1RBR10gPSByZXR1cm5UaGlzO1xuICBpZiAoREVGQVVMVCkge1xuICAgIG1ldGhvZHMgPSB7XG4gICAgICB2YWx1ZXM6IERFRl9WQUxVRVMgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChWQUxVRVMpLFxuICAgICAga2V5czogSVNfU0VUID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoS0VZUyksXG4gICAgICBlbnRyaWVzOiAkZW50cmllc1xuICAgIH07XG4gICAgaWYgKEZPUkNFRCkgZm9yIChrZXkgaW4gbWV0aG9kcykge1xuICAgICAgaWYgKCEoa2V5IGluIHByb3RvKSkgcmVkZWZpbmUocHJvdG8sIGtleSwgbWV0aG9kc1trZXldKTtcbiAgICB9IGVsc2UgJGV4cG9ydCgkZXhwb3J0LlAgKyAkZXhwb3J0LkYgKiAoQlVHR1kgfHwgVkFMVUVTX0JVRyksIE5BTUUsIG1ldGhvZHMpO1xuICB9XG4gIHJldHVybiBtZXRob2RzO1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXItZGV0ZWN0LmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pdGVyLWRldGVjdC5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbnZhciBJVEVSQVRPUiA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX3drcyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fd2tzLmpzXCIpKCdpdGVyYXRvcicpO1xudmFyIFNBRkVfQ0xPU0lORyA9IGZhbHNlO1xuXG50cnkge1xuICB2YXIgcml0ZXIgPSBbN11bSVRFUkFUT1JdKCk7XG4gIHJpdGVyWydyZXR1cm4nXSA9IGZ1bmN0aW9uICgpIHsgU0FGRV9DTE9TSU5HID0gdHJ1ZTsgfTtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXRocm93LWxpdGVyYWxcbiAgQXJyYXkuZnJvbShyaXRlciwgZnVuY3Rpb24gKCkgeyB0aHJvdyAyOyB9KTtcbn0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChleGVjLCBza2lwQ2xvc2luZykge1xuICBpZiAoIXNraXBDbG9zaW5nICYmICFTQUZFX0NMT1NJTkcpIHJldHVybiBmYWxzZTtcbiAgdmFyIHNhZmUgPSBmYWxzZTtcbiAgdHJ5IHtcbiAgICB2YXIgYXJyID0gWzddO1xuICAgIHZhciBpdGVyID0gYXJyW0lURVJBVE9SXSgpO1xuICAgIGl0ZXIubmV4dCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHsgZG9uZTogc2FmZSA9IHRydWUgfTsgfTtcbiAgICBhcnJbSVRFUkFUT1JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gaXRlcjsgfTtcbiAgICBleGVjKGFycik7XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuICByZXR1cm4gc2FmZTtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pdGVyYXRvcnMuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pdGVyYXRvcnMuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2xpYnJhcnkuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fbGlicmFyeS5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSBmYWxzZTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1jcmVhdGUuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWNyZWF0ZS5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuLy8gMTkuMS4yLjIgLyAxNS4yLjMuNSBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXG52YXIgYW5PYmplY3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19hbi1vYmplY3QgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2FuLW9iamVjdC5qc1wiKTtcbnZhciBkUHMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19vYmplY3QtZHBzICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHBzLmpzXCIpO1xudmFyIGVudW1CdWdLZXlzID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fZW51bS1idWcta2V5cyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZW51bS1idWcta2V5cy5qc1wiKTtcbnZhciBJRV9QUk9UTyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX3NoYXJlZC1rZXkgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC1rZXkuanNcIikoJ0lFX1BST1RPJyk7XG52YXIgRW1wdHkgPSBmdW5jdGlvbiAoKSB7IC8qIGVtcHR5ICovIH07XG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG5cbi8vIENyZWF0ZSBvYmplY3Qgd2l0aCBmYWtlIGBudWxsYCBwcm90b3R5cGU6IHVzZSBpZnJhbWUgT2JqZWN0IHdpdGggY2xlYXJlZCBwcm90b3R5cGVcbnZhciBjcmVhdGVEaWN0ID0gZnVuY3Rpb24gKCkge1xuICAvLyBUaHJhc2gsIHdhc3RlIGFuZCBzb2RvbXk6IElFIEdDIGJ1Z1xuICB2YXIgaWZyYW1lID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fZG9tLWNyZWF0ZSAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZG9tLWNyZWF0ZS5qc1wiKSgnaWZyYW1lJyk7XG4gIHZhciBpID0gZW51bUJ1Z0tleXMubGVuZ3RoO1xuICB2YXIgbHQgPSAnPCc7XG4gIHZhciBndCA9ICc+JztcbiAgdmFyIGlmcmFtZURvY3VtZW50O1xuICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9faHRtbCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faHRtbC5qc1wiKS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICBpZnJhbWUuc3JjID0gJ2phdmFzY3JpcHQ6JzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zY3JpcHQtdXJsXG4gIC8vIGNyZWF0ZURpY3QgPSBpZnJhbWUuY29udGVudFdpbmRvdy5PYmplY3Q7XG4gIC8vIGh0bWwucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcbiAgaWZyYW1lRG9jdW1lbnQgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgaWZyYW1lRG9jdW1lbnQub3BlbigpO1xuICBpZnJhbWVEb2N1bWVudC53cml0ZShsdCArICdzY3JpcHQnICsgZ3QgKyAnZG9jdW1lbnQuRj1PYmplY3QnICsgbHQgKyAnL3NjcmlwdCcgKyBndCk7XG4gIGlmcmFtZURvY3VtZW50LmNsb3NlKCk7XG4gIGNyZWF0ZURpY3QgPSBpZnJhbWVEb2N1bWVudC5GO1xuICB3aGlsZSAoaS0tKSBkZWxldGUgY3JlYXRlRGljdFtQUk9UT1RZUEVdW2VudW1CdWdLZXlzW2ldXTtcbiAgcmV0dXJuIGNyZWF0ZURpY3QoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiBjcmVhdGUoTywgUHJvcGVydGllcykge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoTyAhPT0gbnVsbCkge1xuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBhbk9iamVjdChPKTtcbiAgICByZXN1bHQgPSBuZXcgRW1wdHkoKTtcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gbnVsbDtcbiAgICAvLyBhZGQgXCJfX3Byb3RvX19cIiBmb3IgT2JqZWN0LmdldFByb3RvdHlwZU9mIHBvbHlmaWxsXG4gICAgcmVzdWx0W0lFX1BST1RPXSA9IE87XG4gIH0gZWxzZSByZXN1bHQgPSBjcmVhdGVEaWN0KCk7XG4gIHJldHVybiBQcm9wZXJ0aWVzID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiBkUHMocmVzdWx0LCBQcm9wZXJ0aWVzKTtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHAuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHAuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxudmFyIGFuT2JqZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fYW4tb2JqZWN0ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanNcIik7XG52YXIgSUU4X0RPTV9ERUZJTkUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19pZTgtZG9tLWRlZmluZSAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faWU4LWRvbS1kZWZpbmUuanNcIik7XG52YXIgdG9QcmltaXRpdmUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL190by1wcmltaXRpdmUgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLXByaW1pdGl2ZS5qc1wiKTtcbnZhciBkUCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuZXhwb3J0cy5mID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fZGVzY3JpcHRvcnMgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzXCIpID8gT2JqZWN0LmRlZmluZVByb3BlcnR5IDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcykge1xuICBhbk9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBhbk9iamVjdChBdHRyaWJ1dGVzKTtcbiAgaWYgKElFOF9ET01fREVGSU5FKSB0cnkge1xuICAgIHJldHVybiBkUChPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG4gIGlmICgnZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpIHRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhJyk7XG4gIGlmICgndmFsdWUnIGluIEF0dHJpYnV0ZXMpIE9bUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xuICByZXR1cm4gTztcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHBzLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1kcHMuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbnZhciBkUCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX29iamVjdC1kcCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwLmpzXCIpO1xudmFyIGFuT2JqZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fYW4tb2JqZWN0ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanNcIik7XG52YXIgZ2V0S2V5cyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX29iamVjdC1rZXlzICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19kZXNjcmlwdG9ycyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZGVzY3JpcHRvcnMuanNcIikgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcykge1xuICBhbk9iamVjdChPKTtcbiAgdmFyIGtleXMgPSBnZXRLZXlzKFByb3BlcnRpZXMpO1xuICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gIHZhciBpID0gMDtcbiAgdmFyIFA7XG4gIHdoaWxlIChsZW5ndGggPiBpKSBkUC5mKE8sIFAgPSBrZXlzW2krK10sIFByb3BlcnRpZXNbUF0pO1xuICByZXR1cm4gTztcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ3BvLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1ncG8uanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbi8vIDE5LjEuMi45IC8gMTUuMi4zLjIgT2JqZWN0LmdldFByb3RvdHlwZU9mKE8pXG52YXIgaGFzID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9faGFzICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oYXMuanNcIik7XG52YXIgdG9PYmplY3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL190by1vYmplY3QgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLW9iamVjdC5qc1wiKTtcbnZhciBJRV9QUk9UTyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX3NoYXJlZC1rZXkgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC1rZXkuanNcIikoJ0lFX1BST1RPJyk7XG52YXIgT2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiAoTykge1xuICBPID0gdG9PYmplY3QoTyk7XG4gIGlmIChoYXMoTywgSUVfUFJPVE8pKSByZXR1cm4gT1tJRV9QUk9UT107XG4gIGlmICh0eXBlb2YgTy5jb25zdHJ1Y3RvciA9PSAnZnVuY3Rpb24nICYmIE8gaW5zdGFuY2VvZiBPLmNvbnN0cnVjdG9yKSB7XG4gICAgcmV0dXJuIE8uY29uc3RydWN0b3IucHJvdG90eXBlO1xuICB9IHJldHVybiBPIGluc3RhbmNlb2YgT2JqZWN0ID8gT2JqZWN0UHJvdG8gOiBudWxsO1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1rZXlzLWludGVybmFsLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbnZhciBoYXMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19oYXMgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2hhcy5qc1wiKTtcbnZhciB0b0lPYmplY3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL190by1pb2JqZWN0ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1pb2JqZWN0LmpzXCIpO1xudmFyIGFycmF5SW5kZXhPZiA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2FycmF5LWluY2x1ZGVzICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qc1wiKShmYWxzZSk7XG52YXIgSUVfUFJPVE8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19zaGFyZWQta2V5ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zaGFyZWQta2V5LmpzXCIpKCdJRV9QUk9UTycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWVzKSB7XG4gIHZhciBPID0gdG9JT2JqZWN0KG9iamVjdCk7XG4gIHZhciBpID0gMDtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIga2V5O1xuICBmb3IgKGtleSBpbiBPKSBpZiAoa2V5ICE9IElFX1BST1RPKSBoYXMoTywga2V5KSAmJiByZXN1bHQucHVzaChrZXkpO1xuICAvLyBEb24ndCBlbnVtIGJ1ZyAmIGhpZGRlbiBrZXlzXG4gIHdoaWxlIChuYW1lcy5sZW5ndGggPiBpKSBpZiAoaGFzKE8sIGtleSA9IG5hbWVzW2krK10pKSB7XG4gICAgfmFycmF5SW5kZXhPZihyZXN1bHQsIGtleSkgfHwgcmVzdWx0LnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1rZXlzLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbi8vIDE5LjEuMi4xNCAvIDE1LjIuMy4xNCBPYmplY3Qua2V5cyhPKVxudmFyICRrZXlzID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fb2JqZWN0LWtleXMtaW50ZXJuYWwgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1rZXlzLWludGVybmFsLmpzXCIpO1xudmFyIGVudW1CdWdLZXlzID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fZW51bS1idWcta2V5cyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fZW51bS1idWcta2V5cy5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiBrZXlzKE8pIHtcbiAgcmV0dXJuICRrZXlzKE8sIGVudW1CdWdLZXlzKTtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19wcm9wZXJ0eS1kZXNjLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3Byb3BlcnR5LWRlc2MuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJpdG1hcCwgdmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlOiAhKGJpdG1hcCAmIDEpLFxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcbiAgICB3cml0YWJsZTogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZTogdmFsdWVcbiAgfTtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19yZWRlZmluZS5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fcmVkZWZpbmUuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgZ2xvYmFsID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fZ2xvYmFsICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19nbG9iYWwuanNcIik7XG52YXIgaGlkZSA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2hpZGUgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2hpZGUuanNcIik7XG52YXIgaGFzID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9faGFzICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19oYXMuanNcIik7XG52YXIgU1JDID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fdWlkICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL191aWQuanNcIikoJ3NyYycpO1xudmFyIFRPX1NUUklORyA9ICd0b1N0cmluZyc7XG52YXIgJHRvU3RyaW5nID0gRnVuY3Rpb25bVE9fU1RSSU5HXTtcbnZhciBUUEwgPSAoJycgKyAkdG9TdHJpbmcpLnNwbGl0KFRPX1NUUklORyk7XG5cbl9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2NvcmUgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanNcIikuaW5zcGVjdFNvdXJjZSA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gJHRvU3RyaW5nLmNhbGwoaXQpO1xufTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE8sIGtleSwgdmFsLCBzYWZlKSB7XG4gIHZhciBpc0Z1bmN0aW9uID0gdHlwZW9mIHZhbCA9PSAnZnVuY3Rpb24nO1xuICBpZiAoaXNGdW5jdGlvbikgaGFzKHZhbCwgJ25hbWUnKSB8fCBoaWRlKHZhbCwgJ25hbWUnLCBrZXkpO1xuICBpZiAoT1trZXldID09PSB2YWwpIHJldHVybjtcbiAgaWYgKGlzRnVuY3Rpb24pIGhhcyh2YWwsIFNSQykgfHwgaGlkZSh2YWwsIFNSQywgT1trZXldID8gJycgKyBPW2tleV0gOiBUUEwuam9pbihTdHJpbmcoa2V5KSkpO1xuICBpZiAoTyA9PT0gZ2xvYmFsKSB7XG4gICAgT1trZXldID0gdmFsO1xuICB9IGVsc2UgaWYgKCFzYWZlKSB7XG4gICAgZGVsZXRlIE9ba2V5XTtcbiAgICBoaWRlKE8sIGtleSwgdmFsKTtcbiAgfSBlbHNlIGlmIChPW2tleV0pIHtcbiAgICBPW2tleV0gPSB2YWw7XG4gIH0gZWxzZSB7XG4gICAgaGlkZShPLCBrZXksIHZhbCk7XG4gIH1cbi8vIGFkZCBmYWtlIEZ1bmN0aW9uI3RvU3RyaW5nIGZvciBjb3JyZWN0IHdvcmsgd3JhcHBlZCBtZXRob2RzIC8gY29uc3RydWN0b3JzIHdpdGggbWV0aG9kcyBsaWtlIExvRGFzaCBpc05hdGl2ZVxufSkoRnVuY3Rpb24ucHJvdG90eXBlLCBUT19TVFJJTkcsIGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gdHlwZW9mIHRoaXMgPT0gJ2Z1bmN0aW9uJyAmJiB0aGlzW1NSQ10gfHwgJHRvU3RyaW5nLmNhbGwodGhpcyk7XG59KTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3NldC10by1zdHJpbmctdGFnLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zZXQtdG8tc3RyaW5nLXRhZy5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbnZhciBkZWYgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19vYmplY3QtZHAgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1kcC5qc1wiKS5mO1xudmFyIGhhcyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2hhcyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9faGFzLmpzXCIpO1xudmFyIFRBRyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX3drcyAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fd2tzLmpzXCIpKCd0b1N0cmluZ1RhZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgdGFnLCBzdGF0KSB7XG4gIGlmIChpdCAmJiAhaGFzKGl0ID0gc3RhdCA/IGl0IDogaXQucHJvdG90eXBlLCBUQUcpKSBkZWYoaXQsIFRBRywgeyBjb25maWd1cmFibGU6IHRydWUsIHZhbHVlOiB0YWcgfSk7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLWtleS5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zaGFyZWQta2V5LmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgc2hhcmVkID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fc2hhcmVkICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zaGFyZWQuanNcIikoJ2tleXMnKTtcbnZhciB1aWQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL191aWQgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3VpZC5qc1wiKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4gc2hhcmVkW2tleV0gfHwgKHNoYXJlZFtrZXldID0gdWlkKGtleSkpO1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgZ2xvYmFsID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fZ2xvYmFsICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19nbG9iYWwuanNcIik7XG52YXIgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXyc7XG52YXIgc3RvcmUgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIHN0b3JlW2tleV0gfHwgKHN0b3JlW2tleV0gPSB7fSk7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fc3RyaW5nLWF0LmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fc3RyaW5nLWF0LmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbnZhciB0b0ludGVnZXIgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL190by1pbnRlZ2VyICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1pbnRlZ2VyLmpzXCIpO1xudmFyIGRlZmluZWQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19kZWZpbmVkICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzXCIpO1xuLy8gdHJ1ZSAgLT4gU3RyaW5nI2F0XG4vLyBmYWxzZSAtPiBTdHJpbmcjY29kZVBvaW50QXRcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFRPX1NUUklORykge1xuICByZXR1cm4gZnVuY3Rpb24gKHRoYXQsIHBvcykge1xuICAgIHZhciBzID0gU3RyaW5nKGRlZmluZWQodGhhdCkpO1xuICAgIHZhciBpID0gdG9JbnRlZ2VyKHBvcyk7XG4gICAgdmFyIGwgPSBzLmxlbmd0aDtcbiAgICB2YXIgYSwgYjtcbiAgICBpZiAoaSA8IDAgfHwgaSA+PSBsKSByZXR1cm4gVE9fU1RSSU5HID8gJycgOiB1bmRlZmluZWQ7XG4gICAgYSA9IHMuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYSA8IDB4ZDgwMCB8fCBhID4gMHhkYmZmIHx8IGkgKyAxID09PSBsIHx8IChiID0gcy5jaGFyQ29kZUF0KGkgKyAxKSkgPCAweGRjMDAgfHwgYiA+IDB4ZGZmZlxuICAgICAgPyBUT19TVFJJTkcgPyBzLmNoYXJBdChpKSA6IGFcbiAgICAgIDogVE9fU1RSSU5HID8gcy5zbGljZShpLCBpICsgMikgOiAoYSAtIDB4ZDgwMCA8PCAxMCkgKyAoYiAtIDB4ZGMwMCkgKyAweDEwMDAwO1xuICB9O1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWFic29sdXRlLWluZGV4LmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1hYnNvbHV0ZS1pbmRleC5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbnZhciB0b0ludGVnZXIgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL190by1pbnRlZ2VyICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1pbnRlZ2VyLmpzXCIpO1xudmFyIG1heCA9IE1hdGgubWF4O1xudmFyIG1pbiA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW5kZXgsIGxlbmd0aCkge1xuICBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XG4gIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWludGVnZXIuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8taW50ZWdlci5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuLy8gNy4xLjQgVG9JbnRlZ2VyXG52YXIgY2VpbCA9IE1hdGguY2VpbDtcbnZhciBmbG9vciA9IE1hdGguZmxvb3I7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1pb2JqZWN0LmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWlvYmplY3QuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIElPYmplY3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19pb2JqZWN0ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pb2JqZWN0LmpzXCIpO1xudmFyIGRlZmluZWQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19kZWZpbmVkICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzXCIpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIElPYmplY3QoZGVmaW5lZChpdCkpO1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWxlbmd0aC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWxlbmd0aC5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG4vLyA3LjEuMTUgVG9MZW5ndGhcbnZhciB0b0ludGVnZXIgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL190by1pbnRlZ2VyICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1pbnRlZ2VyLmpzXCIpO1xudmFyIG1pbiA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0ID4gMCA/IG1pbih0b0ludGVnZXIoaXQpLCAweDFmZmZmZmZmZmZmZmZmKSA6IDA7IC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1vYmplY3QuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL190by1vYmplY3QuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuLy8gNy4xLjEzIFRvT2JqZWN0KGFyZ3VtZW50KVxudmFyIGRlZmluZWQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19kZWZpbmVkICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzXCIpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIE9iamVjdChkZWZpbmVkKGl0KSk7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbi8vIDcuMS4xIFRvUHJpbWl0aXZlKGlucHV0IFssIFByZWZlcnJlZFR5cGVdKVxudmFyIGlzT2JqZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9faXMtb2JqZWN0ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pcy1vYmplY3QuanNcIik7XG4vLyBpbnN0ZWFkIG9mIHRoZSBFUzYgc3BlYyB2ZXJzaW9uLCB3ZSBkaWRuJ3QgaW1wbGVtZW50IEBAdG9QcmltaXRpdmUgY2FzZVxuLy8gYW5kIHRoZSBzZWNvbmQgYXJndW1lbnQgLSBmbGFnIC0gcHJlZmVycmVkIHR5cGUgaXMgYSBzdHJpbmdcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBTKSB7XG4gIGlmICghaXNPYmplY3QoaXQpKSByZXR1cm4gaXQ7XG4gIHZhciBmbiwgdmFsO1xuICBpZiAoUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKHR5cGVvZiAoZm4gPSBpdC52YWx1ZU9mKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpIHJldHVybiB2YWw7XG4gIGlmICghUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gcHJpbWl0aXZlIHZhbHVlXCIpO1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3VpZC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3VpZC5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG52YXIgaWQgPSAwO1xudmFyIHB4ID0gTWF0aC5yYW5kb20oKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4gJ1N5bWJvbCgnLmNvbmNhdChrZXkgPT09IHVuZGVmaW5lZCA/ICcnIDoga2V5LCAnKV8nLCAoKytpZCArIHB4KS50b1N0cmluZygzNikpO1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3drcy5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3drcy5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgc3RvcmUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19zaGFyZWQgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC5qc1wiKSgnd2tzJyk7XG52YXIgdWlkID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fdWlkICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL191aWQuanNcIik7XG52YXIgU3ltYm9sID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fZ2xvYmFsICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19nbG9iYWwuanNcIikuU3ltYm9sO1xudmFyIFVTRV9TWU1CT0wgPSB0eXBlb2YgU3ltYm9sID09ICdmdW5jdGlvbic7XG5cbnZhciAkZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIHN0b3JlW25hbWVdIHx8IChzdG9yZVtuYW1lXSA9XG4gICAgVVNFX1NZTUJPTCAmJiBTeW1ib2xbbmFtZV0gfHwgKFVTRV9TWU1CT0wgPyBTeW1ib2wgOiB1aWQpKCdTeW1ib2wuJyArIG5hbWUpKTtcbn07XG5cbiRleHBvcnRzLnN0b3JlID0gc3RvcmU7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgY2xhc3NvZiA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2NsYXNzb2YgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2NsYXNzb2YuanNcIik7XG52YXIgSVRFUkFUT1IgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL193a3MgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3drcy5qc1wiKSgnaXRlcmF0b3InKTtcbnZhciBJdGVyYXRvcnMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19pdGVyYXRvcnMgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXJhdG9ycy5qc1wiKTtcbm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fY29yZSAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY29yZS5qc1wiKS5nZXRJdGVyYXRvck1ldGhvZCA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoaXQgIT0gdW5kZWZpbmVkKSByZXR1cm4gaXRbSVRFUkFUT1JdXG4gICAgfHwgaXRbJ0BAaXRlcmF0b3InXVxuICAgIHx8IEl0ZXJhdG9yc1tjbGFzc29mKGl0KV07XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuZnJvbS5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5mcm9tLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGN0eCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2N0eCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY3R4LmpzXCIpO1xudmFyICRleHBvcnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19leHBvcnQgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2V4cG9ydC5qc1wiKTtcbnZhciB0b09iamVjdCA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX3RvLW9iamVjdCAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fdG8tb2JqZWN0LmpzXCIpO1xudmFyIGNhbGwgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL19pdGVyLWNhbGwgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXItY2FsbC5qc1wiKTtcbnZhciBpc0FycmF5SXRlciA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2lzLWFycmF5LWl0ZXIgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2lzLWFycmF5LWl0ZXIuanNcIik7XG52YXIgdG9MZW5ndGggPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL190by1sZW5ndGggKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX3RvLWxlbmd0aC5qc1wiKTtcbnZhciBjcmVhdGVQcm9wZXJ0eSA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2NyZWF0ZS1wcm9wZXJ0eSAqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9fY3JlYXRlLXByb3BlcnR5LmpzXCIpO1xudmFyIGdldEl0ZXJGbiA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZC5qc1wiKTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9faXRlci1kZXRlY3QgKi8gXCIuL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvX2l0ZXItZGV0ZWN0LmpzXCIpKGZ1bmN0aW9uIChpdGVyKSB7IEFycmF5LmZyb20oaXRlcik7IH0pLCAnQXJyYXknLCB7XG4gIC8vIDIyLjEuMi4xIEFycmF5LmZyb20oYXJyYXlMaWtlLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgZnJvbTogZnVuY3Rpb24gZnJvbShhcnJheUxpa2UgLyogLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZCAqLykge1xuICAgIHZhciBPID0gdG9PYmplY3QoYXJyYXlMaWtlKTtcbiAgICB2YXIgQyA9IHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgPyB0aGlzIDogQXJyYXk7XG4gICAgdmFyIGFMZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIHZhciBtYXBmbiA9IGFMZW4gPiAxID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkO1xuICAgIHZhciBtYXBwaW5nID0gbWFwZm4gIT09IHVuZGVmaW5lZDtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBpdGVyRm4gPSBnZXRJdGVyRm4oTyk7XG4gICAgdmFyIGxlbmd0aCwgcmVzdWx0LCBzdGVwLCBpdGVyYXRvcjtcbiAgICBpZiAobWFwcGluZykgbWFwZm4gPSBjdHgobWFwZm4sIGFMZW4gPiAyID8gYXJndW1lbnRzWzJdIDogdW5kZWZpbmVkLCAyKTtcbiAgICAvLyBpZiBvYmplY3QgaXNuJ3QgaXRlcmFibGUgb3IgaXQncyBhcnJheSB3aXRoIGRlZmF1bHQgaXRlcmF0b3IgLSB1c2Ugc2ltcGxlIGNhc2VcbiAgICBpZiAoaXRlckZuICE9IHVuZGVmaW5lZCAmJiAhKEMgPT0gQXJyYXkgJiYgaXNBcnJheUl0ZXIoaXRlckZuKSkpIHtcbiAgICAgIGZvciAoaXRlcmF0b3IgPSBpdGVyRm4uY2FsbChPKSwgcmVzdWx0ID0gbmV3IEMoKTsgIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lOyBpbmRleCsrKSB7XG4gICAgICAgIGNyZWF0ZVByb3BlcnR5KHJlc3VsdCwgaW5kZXgsIG1hcHBpbmcgPyBjYWxsKGl0ZXJhdG9yLCBtYXBmbiwgW3N0ZXAudmFsdWUsIGluZGV4XSwgdHJ1ZSkgOiBzdGVwLnZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpO1xuICAgICAgZm9yIChyZXN1bHQgPSBuZXcgQyhsZW5ndGgpOyBsZW5ndGggPiBpbmRleDsgaW5kZXgrKykge1xuICAgICAgICBjcmVhdGVQcm9wZXJ0eShyZXN1bHQsIGluZGV4LCBtYXBwaW5nID8gbWFwZm4oT1tpbmRleF0sIGluZGV4KSA6IE9baW5kZXhdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0Lmxlbmd0aCA9IGluZGV4O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn0pO1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgJGF0ID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9fc3RyaW5nLWF0ICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19zdHJpbmctYXQuanNcIikodHJ1ZSk7XG5cbi8vIDIxLjEuMy4yNyBTdHJpbmcucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbl9fd2VicGFja19yZXF1aXJlX18oLyohIC4vX2l0ZXItZGVmaW5lICovIFwiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL19pdGVyLWRlZmluZS5qc1wiKShTdHJpbmcsICdTdHJpbmcnLCBmdW5jdGlvbiAoaXRlcmF0ZWQpIHtcbiAgdGhpcy5fdCA9IFN0cmluZyhpdGVyYXRlZCk7IC8vIHRhcmdldFxuICB0aGlzLl9pID0gMDsgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxuLy8gMjEuMS41LjIuMSAlU3RyaW5nSXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24gKCkge1xuICB2YXIgTyA9IHRoaXMuX3Q7XG4gIHZhciBpbmRleCA9IHRoaXMuX2k7XG4gIHZhciBwb2ludDtcbiAgaWYgKGluZGV4ID49IE8ubGVuZ3RoKSByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIHBvaW50ID0gJGF0KE8sIGluZGV4KTtcbiAgdGhpcy5faSArPSBwb2ludC5sZW5ndGg7XG4gIHJldHVybiB7IHZhbHVlOiBwb2ludCwgZG9uZTogZmFsc2UgfTtcbn0pO1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vc3JjL2RlZmF1bHQtYXR0cnMuanNvblwiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiohKlxcXG4gICEqKiogLi9zcmMvZGVmYXVsdC1hdHRycy5qc29uICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBleHBvcnRzIHByb3ZpZGVkOiB4bWxucywgd2lkdGgsIGhlaWdodCwgdmlld0JveCwgZmlsbCwgc3Ryb2tlLCBzdHJva2Utd2lkdGgsIHN0cm9rZS1saW5lY2FwLCBzdHJva2UtbGluZWpvaW4sIGRlZmF1bHQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUpIHtcblxubW9kdWxlLmV4cG9ydHMgPSB7XCJ4bWxuc1wiOlwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixcIndpZHRoXCI6MjQsXCJoZWlnaHRcIjoyNCxcInZpZXdCb3hcIjpcIjAgMCAyNCAyNFwiLFwiZmlsbFwiOlwibm9uZVwiLFwic3Ryb2tlXCI6XCJjdXJyZW50Q29sb3JcIixcInN0cm9rZS13aWR0aFwiOjIsXCJzdHJva2UtbGluZWNhcFwiOlwicm91bmRcIixcInN0cm9rZS1saW5lam9pblwiOlwicm91bmRcIn07XG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vc3JjL2ljb24uanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL3NyYy9pY29uLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9kZWR1cGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISBjbGFzc25hbWVzL2RlZHVwZSAqLyBcIi4vbm9kZV9tb2R1bGVzL2NsYXNzbmFtZXMvZGVkdXBlLmpzXCIpO1xuXG52YXIgX2RlZHVwZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9kZWR1cGUpO1xuXG52YXIgX2RlZmF1bHRBdHRycyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vZGVmYXVsdC1hdHRycy5qc29uICovIFwiLi9zcmMvZGVmYXVsdC1hdHRycy5qc29uXCIpO1xuXG52YXIgX2RlZmF1bHRBdHRyczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9kZWZhdWx0QXR0cnMpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgSWNvbiA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gSWNvbihuYW1lLCBjb250ZW50cykge1xuICAgIHZhciB0YWdzID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBbXTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBJY29uKTtcblxuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5jb250ZW50cyA9IGNvbnRlbnRzO1xuICAgIHRoaXMudGFncyA9IHRhZ3M7XG4gICAgdGhpcy5hdHRycyA9IF9leHRlbmRzKHt9LCBfZGVmYXVsdEF0dHJzMi5kZWZhdWx0LCB7IGNsYXNzOiAnZmVhdGhlciBmZWF0aGVyLScgKyBuYW1lIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbiBTVkcgc3RyaW5nLlxuICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG5cblxuICBfY3JlYXRlQ2xhc3MoSWNvbiwgW3tcbiAgICBrZXk6ICd0b1N2ZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHRvU3ZnKCkge1xuICAgICAgdmFyIGF0dHJzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcblxuICAgICAgdmFyIGNvbWJpbmVkQXR0cnMgPSBfZXh0ZW5kcyh7fSwgdGhpcy5hdHRycywgYXR0cnMsIHsgY2xhc3M6ICgwLCBfZGVkdXBlMi5kZWZhdWx0KSh0aGlzLmF0dHJzLmNsYXNzLCBhdHRycy5jbGFzcykgfSk7XG5cbiAgICAgIHJldHVybiAnPHN2ZyAnICsgYXR0cnNUb1N0cmluZyhjb21iaW5lZEF0dHJzKSArICc+JyArIHRoaXMuY29udGVudHMgKyAnPC9zdmc+JztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGFuIGBJY29uYC5cbiAgICAgKlxuICAgICAqIEFkZGVkIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LiBJZiBvbGQgY29kZSBleHBlY3RzIGBmZWF0aGVyLmljb25zLjxuYW1lPmBcbiAgICAgKiB0byBiZSBhIHN0cmluZywgYHRvU3RyaW5nKClgIHdpbGwgZ2V0IGltcGxpY2l0bHkgY2FsbGVkLlxuICAgICAqXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAndG9TdHJpbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRlbnRzO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBJY29uO1xufSgpO1xuXG4vKipcbiAqIENvbnZlcnQgYXR0cmlidXRlcyBvYmplY3QgdG8gc3RyaW5nIG9mIEhUTUwgYXR0cmlidXRlcy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuXG5cbmZ1bmN0aW9uIGF0dHJzVG9TdHJpbmcoYXR0cnMpIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGF0dHJzKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBrZXkgKyAnPVwiJyArIGF0dHJzW2tleV0gKyAnXCInO1xuICB9KS5qb2luKCcgJyk7XG59XG5cbmV4cG9ydHMuZGVmYXVsdCA9IEljb247XG5cbi8qKiovIH0pLFxuXG4vKioqLyBcIi4vc3JjL2ljb25zLmpzXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vc3JjL2ljb25zLmpzICoqKiFcbiAgXFwqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfaWNvbiA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vaWNvbiAqLyBcIi4vc3JjL2ljb24uanNcIik7XG5cbnZhciBfaWNvbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pY29uKTtcblxudmFyIF9pY29ucyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4uL2Rpc3QvaWNvbnMuanNvbiAqLyBcIi4vZGlzdC9pY29ucy5qc29uXCIpO1xuXG52YXIgX2ljb25zMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ljb25zKTtcblxudmFyIF90YWdzID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi90YWdzLmpzb24gKi8gXCIuL3NyYy90YWdzLmpzb25cIik7XG5cbnZhciBfdGFnczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF90YWdzKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5kZWZhdWx0ID0gT2JqZWN0LmtleXMoX2ljb25zMi5kZWZhdWx0KS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4gbmV3IF9pY29uMi5kZWZhdWx0KGtleSwgX2ljb25zMi5kZWZhdWx0W2tleV0sIF90YWdzMi5kZWZhdWx0W2tleV0pO1xufSkucmVkdWNlKGZ1bmN0aW9uIChvYmplY3QsIGljb24pIHtcbiAgb2JqZWN0W2ljb24ubmFtZV0gPSBpY29uO1xuICByZXR1cm4gb2JqZWN0O1xufSwge30pO1xuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL3NyYy9pbmRleC5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL3NyYy9pbmRleC5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG52YXIgX2ljb25zID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9pY29ucyAqLyBcIi4vc3JjL2ljb25zLmpzXCIpO1xuXG52YXIgX2ljb25zMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ljb25zKTtcblxudmFyIF90b1N2ZyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vdG8tc3ZnICovIFwiLi9zcmMvdG8tc3ZnLmpzXCIpO1xuXG52YXIgX3RvU3ZnMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3RvU3ZnKTtcblxudmFyIF9yZXBsYWNlID0gX193ZWJwYWNrX3JlcXVpcmVfXygvKiEgLi9yZXBsYWNlICovIFwiLi9zcmMvcmVwbGFjZS5qc1wiKTtcblxudmFyIF9yZXBsYWNlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlcGxhY2UpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgaWNvbnM6IF9pY29uczIuZGVmYXVsdCwgdG9Tdmc6IF90b1N2ZzIuZGVmYXVsdCwgcmVwbGFjZTogX3JlcGxhY2UyLmRlZmF1bHQgfTtcblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9zcmMvcmVwbGFjZS5qc1wiOlxuLyohKioqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vc3JjL3JlcGxhY2UuanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qISBubyBzdGF0aWMgZXhwb3J0cyBmb3VuZCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9OyAvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cblxuXG52YXIgX2RlZHVwZSA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIGNsYXNzbmFtZXMvZGVkdXBlICovIFwiLi9ub2RlX21vZHVsZXMvY2xhc3NuYW1lcy9kZWR1cGUuanNcIik7XG5cbnZhciBfZGVkdXBlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2RlZHVwZSk7XG5cbnZhciBfaWNvbnMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAuL2ljb25zICovIFwiLi9zcmMvaWNvbnMuanNcIik7XG5cbnZhciBfaWNvbnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaWNvbnMpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG4vKipcbiAqIFJlcGxhY2UgYWxsIEhUTUwgZWxlbWVudHMgdGhhdCBoYXZlIGEgYGRhdGEtZmVhdGhlcmAgYXR0cmlidXRlIHdpdGggU1ZHIG1hcmt1cFxuICogY29ycmVzcG9uZGluZyB0byB0aGUgZWxlbWVudCdzIGBkYXRhLWZlYXRoZXJgIGF0dHJpYnV0ZSB2YWx1ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICovXG5mdW5jdGlvbiByZXBsYWNlKCkge1xuICB2YXIgYXR0cnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuXG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdgZmVhdGhlci5yZXBsYWNlKClgIG9ubHkgd29ya3MgaW4gYSBicm93c2VyIGVudmlyb25tZW50LicpO1xuICB9XG5cbiAgdmFyIGVsZW1lbnRzVG9SZXBsYWNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZmVhdGhlcl0nKTtcblxuICBBcnJheS5mcm9tKGVsZW1lbnRzVG9SZXBsYWNlKS5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgcmV0dXJuIHJlcGxhY2VFbGVtZW50KGVsZW1lbnQsIGF0dHJzKTtcbiAgfSk7XG59XG5cbi8qKlxuICogUmVwbGFjZSBhIHNpbmdsZSBIVE1MIGVsZW1lbnQgd2l0aCBTVkcgbWFya3VwXG4gKiBjb3JyZXNwb25kaW5nIHRvIHRoZSBlbGVtZW50J3MgYGRhdGEtZmVhdGhlcmAgYXR0cmlidXRlIHZhbHVlLlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gKi9cbmZ1bmN0aW9uIHJlcGxhY2VFbGVtZW50KGVsZW1lbnQpIHtcbiAgdmFyIGF0dHJzID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcblxuICB2YXIgZWxlbWVudEF0dHJzID0gZ2V0QXR0cnMoZWxlbWVudCk7XG4gIHZhciBuYW1lID0gZWxlbWVudEF0dHJzWydkYXRhLWZlYXRoZXInXTtcbiAgZGVsZXRlIGVsZW1lbnRBdHRyc1snZGF0YS1mZWF0aGVyJ107XG5cbiAgdmFyIHN2Z1N0cmluZyA9IF9pY29uczIuZGVmYXVsdFtuYW1lXS50b1N2ZyhfZXh0ZW5kcyh7fSwgYXR0cnMsIGVsZW1lbnRBdHRycywgeyBjbGFzczogKDAsIF9kZWR1cGUyLmRlZmF1bHQpKGF0dHJzLmNsYXNzLCBlbGVtZW50QXR0cnMuY2xhc3MpIH0pKTtcbiAgdmFyIHN2Z0RvY3VtZW50ID0gbmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyhzdmdTdHJpbmcsICdpbWFnZS9zdmcreG1sJyk7XG4gIHZhciBzdmdFbGVtZW50ID0gc3ZnRG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc3ZnJyk7XG5cbiAgZWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChzdmdFbGVtZW50LCBlbGVtZW50KTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGF0dHJpYnV0ZXMgb2YgYW4gSFRNTCBlbGVtZW50LlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybnMge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gZ2V0QXR0cnMoZWxlbWVudCkge1xuICByZXR1cm4gQXJyYXkuZnJvbShlbGVtZW50LmF0dHJpYnV0ZXMpLnJlZHVjZShmdW5jdGlvbiAoYXR0cnMsIGF0dHIpIHtcbiAgICBhdHRyc1thdHRyLm5hbWVdID0gYXR0ci52YWx1ZTtcbiAgICByZXR1cm4gYXR0cnM7XG4gIH0sIHt9KTtcbn1cblxuZXhwb3J0cy5kZWZhdWx0ID0gcmVwbGFjZTtcblxuLyoqKi8gfSksXG5cbi8qKiovIFwiLi9zcmMvdGFncy5qc29uXCI6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiAuL3NyYy90YWdzLmpzb24gKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIGV4cG9ydHMgcHJvdmlkZWQ6IGFjdGl2aXR5LCBhaXJwbGF5LCBhbGVydC1jaXJjbGUsIGFsZXJ0LW9jdGFnb24sIGFsZXJ0LXRyaWFuZ2xlLCBhdC1zaWduLCBhd2FyZCwgYXBlcnR1cmUsIGJlbGwsIGJlbGwtb2ZmLCBibHVldG9vdGgsIGJvb2stb3BlbiwgYm9vaywgYm9va21hcmssIGJyaWVmY2FzZSwgY2xpcGJvYXJkLCBjbG9jaywgY2xvdWQtZHJpenpsZSwgY2xvdWQtbGlnaHRuaW5nLCBjbG91ZC1yYWluLCBjbG91ZC1zbm93LCBjbG91ZCwgY29kZXBlbiwgY29tbWFuZCwgY29tcGFzcywgY29weSwgY29ybmVyLWRvd24tbGVmdCwgY29ybmVyLWRvd24tcmlnaHQsIGNvcm5lci1sZWZ0LWRvd24sIGNvcm5lci1sZWZ0LXVwLCBjb3JuZXItcmlnaHQtZG93biwgY29ybmVyLXJpZ2h0LXVwLCBjb3JuZXItdXAtbGVmdCwgY29ybmVyLXVwLXJpZ2h0LCBjcmVkaXQtY2FyZCwgY3JvcCwgY3Jvc3NoYWlyLCBkYXRhYmFzZSwgZGVsZXRlLCBkaXNjLCBkb2xsYXItc2lnbiwgZHJvcGxldCwgZWRpdCwgZWRpdC0yLCBlZGl0LTMsIGV5ZSwgZXllLW9mZiwgZXh0ZXJuYWwtbGluaywgZmFjZWJvb2ssIGZhc3QtZm9yd2FyZCwgZmlsbSwgZm9sZGVyLW1pbnVzLCBmb2xkZXItcGx1cywgZm9sZGVyLCBnaWZ0LCBnaXQtYnJhbmNoLCBnaXQtY29tbWl0LCBnaXQtbWVyZ2UsIGdpdC1wdWxsLXJlcXVlc3QsIGdpdGh1YiwgZ2l0bGFiLCBnbG9iYWwsIGhhcmQtZHJpdmUsIGhhc2gsIGhlYWRwaG9uZXMsIGhlYXJ0LCBoZWxwLWNpcmNsZSwgaG9tZSwgaW1hZ2UsIGluYm94LCBpbnN0YWdyYW0sIGxpZmUtYm91eSwgbGlua2VkaW4sIGxvY2ssIGxvZy1pbiwgbG9nLW91dCwgbWFpbCwgbWFwLXBpbiwgbWFwLCBtYXhpbWl6ZSwgbWF4aW1pemUtMiwgbWVudSwgbWVzc2FnZS1jaXJjbGUsIG1lc3NhZ2Utc3F1YXJlLCBtaWMtb2ZmLCBtaWMsIG1pbmltaXplLCBtaW5pbWl6ZS0yLCBtb25pdG9yLCBtb29uLCBtb3JlLWhvcml6b250YWwsIG1vcmUtdmVydGljYWwsIG1vdmUsIG5hdmlnYXRpb24sIG5hdmlnYXRpb24tMiwgb2N0YWdvbiwgcGFja2FnZSwgcGFwZXJjbGlwLCBwYXVzZSwgcGF1c2UtY2lyY2xlLCBwbGF5LCBwbGF5LWNpcmNsZSwgcGx1cywgcGx1cy1jaXJjbGUsIHBsdXMtc3F1YXJlLCBwb2NrZXQsIHBvd2VyLCByYWRpbywgcmV3aW5kLCByc3MsIHNhdmUsIHNlbmQsIHNldHRpbmdzLCBzaGllbGQsIHNoaWVsZC1vZmYsIHNob3BwaW5nLWJhZywgc2hvcHBpbmctY2FydCwgc2h1ZmZsZSwgc2tpcC1iYWNrLCBza2lwLWZvcndhcmQsIHNsYXNoLCBzbGlkZXJzLCBzcGVha2VyLCBzdGFyLCBzdW4sIHN1bnJpc2UsIHN1bnNldCwgdGFnLCB0YXJnZXQsIHRlcm1pbmFsLCB0aHVtYnMtZG93biwgdGh1bWJzLXVwLCB0b2dnbGUtbGVmdCwgdG9nZ2xlLXJpZ2h0LCB0cmFzaCwgdHJhc2gtMiwgdHJpYW5nbGUsIHRydWNrLCB0d2l0dGVyLCB1bWJyZWxsYSwgdmlkZW8tb2ZmLCB2aWRlbywgdm9pY2VtYWlsLCB2b2x1bWUsIHZvbHVtZS0xLCB2b2x1bWUtMiwgdm9sdW1lLXgsIHdhdGNoLCB3aW5kLCB4LWNpcmNsZSwgeC1zcXVhcmUsIHgsIHlvdXR1YmUsIHphcC1vZmYsIHphcCwgZGVmYXVsdCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSkge1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcImFjdGl2aXR5XCI6W1wicHVsc2VcIixcImhlYWx0aFwiLFwiYWN0aW9uXCIsXCJtb3Rpb25cIl0sXCJhaXJwbGF5XCI6W1wic3RyZWFtXCIsXCJjYXN0XCIsXCJtaXJyb3JpbmdcIl0sXCJhbGVydC1jaXJjbGVcIjpbXCJ3YXJuaW5nXCJdLFwiYWxlcnQtb2N0YWdvblwiOltcIndhcm5pbmdcIl0sXCJhbGVydC10cmlhbmdsZVwiOltcIndhcm5pbmdcIl0sXCJhdC1zaWduXCI6W1wibWVudGlvblwiXSxcImF3YXJkXCI6W1wiYWNoaWV2ZW1lbnRcIixcImJhZGdlXCJdLFwiYXBlcnR1cmVcIjpbXCJjYW1lcmFcIixcInBob3RvXCJdLFwiYmVsbFwiOltcImFsYXJtXCIsXCJub3RpZmljYXRpb25cIl0sXCJiZWxsLW9mZlwiOltcImFsYXJtXCIsXCJub3RpZmljYXRpb25cIixcInNpbGVudFwiXSxcImJsdWV0b290aFwiOltcIndpcmVsZXNzXCJdLFwiYm9vay1vcGVuXCI6W1wicmVhZFwiXSxcImJvb2tcIjpbXCJyZWFkXCIsXCJkaWN0aW9uYXJ5XCIsXCJib29rbGV0XCIsXCJtYWdhemluZVwiXSxcImJvb2ttYXJrXCI6W1wicmVhZFwiLFwiY2xpcFwiLFwibWFya2VyXCIsXCJ0YWdcIl0sXCJicmllZmNhc2VcIjpbXCJ3b3JrXCIsXCJiYWdcIixcImJhZ2dhZ2VcIixcImZvbGRlclwiXSxcImNsaXBib2FyZFwiOltcImNvcHlcIl0sXCJjbG9ja1wiOltcInRpbWVcIixcIndhdGNoXCIsXCJhbGFybVwiXSxcImNsb3VkLWRyaXp6bGVcIjpbXCJ3ZWF0aGVyXCIsXCJzaG93ZXJcIl0sXCJjbG91ZC1saWdodG5pbmdcIjpbXCJ3ZWF0aGVyXCIsXCJib2x0XCJdLFwiY2xvdWQtcmFpblwiOltcIndlYXRoZXJcIl0sXCJjbG91ZC1zbm93XCI6W1wid2VhdGhlclwiLFwiYmxpenphcmRcIl0sXCJjbG91ZFwiOltcIndlYXRoZXJcIl0sXCJjb2RlcGVuXCI6W1wibG9nb1wiXSxcImNvbW1hbmRcIjpbXCJrZXlib2FyZFwiLFwiY21kXCJdLFwiY29tcGFzc1wiOltcIm5hdmlnYXRpb25cIixcInNhZmFyaVwiLFwidHJhdmVsXCJdLFwiY29weVwiOltcImNsb25lXCIsXCJkdXBsaWNhdGVcIl0sXCJjb3JuZXItZG93bi1sZWZ0XCI6W1wiYXJyb3dcIl0sXCJjb3JuZXItZG93bi1yaWdodFwiOltcImFycm93XCJdLFwiY29ybmVyLWxlZnQtZG93blwiOltcImFycm93XCJdLFwiY29ybmVyLWxlZnQtdXBcIjpbXCJhcnJvd1wiXSxcImNvcm5lci1yaWdodC1kb3duXCI6W1wiYXJyb3dcIl0sXCJjb3JuZXItcmlnaHQtdXBcIjpbXCJhcnJvd1wiXSxcImNvcm5lci11cC1sZWZ0XCI6W1wiYXJyb3dcIl0sXCJjb3JuZXItdXAtcmlnaHRcIjpbXCJhcnJvd1wiXSxcImNyZWRpdC1jYXJkXCI6W1wicHVyY2hhc2VcIixcInBheW1lbnRcIixcImNjXCJdLFwiY3JvcFwiOltcInBob3RvXCIsXCJpbWFnZVwiXSxcImNyb3NzaGFpclwiOltcImFpbVwiLFwidGFyZ2V0XCJdLFwiZGF0YWJhc2VcIjpbXCJzdG9yYWdlXCJdLFwiZGVsZXRlXCI6W1wicmVtb3ZlXCJdLFwiZGlzY1wiOltcImFsYnVtXCIsXCJjZFwiLFwiZHZkXCIsXCJtdXNpY1wiXSxcImRvbGxhci1zaWduXCI6W1wiY3VycmVuY3lcIixcIm1vbmV5XCIsXCJwYXltZW50XCJdLFwiZHJvcGxldFwiOltcIndhdGVyXCJdLFwiZWRpdFwiOltcInBlbmNpbFwiLFwiY2hhbmdlXCJdLFwiZWRpdC0yXCI6W1wicGVuY2lsXCIsXCJjaGFuZ2VcIl0sXCJlZGl0LTNcIjpbXCJwZW5jaWxcIixcImNoYW5nZVwiXSxcImV5ZVwiOltcInZpZXdcIixcIndhdGNoXCJdLFwiZXllLW9mZlwiOltcInZpZXdcIixcIndhdGNoXCJdLFwiZXh0ZXJuYWwtbGlua1wiOltcIm91dGJvdW5kXCJdLFwiZmFjZWJvb2tcIjpbXCJsb2dvXCJdLFwiZmFzdC1mb3J3YXJkXCI6W1wibXVzaWNcIl0sXCJmaWxtXCI6W1wibW92aWVcIixcInZpZGVvXCJdLFwiZm9sZGVyLW1pbnVzXCI6W1wiZGlyZWN0b3J5XCJdLFwiZm9sZGVyLXBsdXNcIjpbXCJkaXJlY3RvcnlcIl0sXCJmb2xkZXJcIjpbXCJkaXJlY3RvcnlcIl0sXCJnaWZ0XCI6W1wicHJlc2VudFwiLFwiYm94XCIsXCJiaXJ0aGRheVwiLFwicGFydHlcIl0sXCJnaXQtYnJhbmNoXCI6W1wiY29kZVwiLFwidmVyc2lvbiBjb250cm9sXCJdLFwiZ2l0LWNvbW1pdFwiOltcImNvZGVcIixcInZlcnNpb24gY29udHJvbFwiXSxcImdpdC1tZXJnZVwiOltcImNvZGVcIixcInZlcnNpb24gY29udHJvbFwiXSxcImdpdC1wdWxsLXJlcXVlc3RcIjpbXCJjb2RlXCIsXCJ2ZXJzaW9uIGNvbnRyb2xcIl0sXCJnaXRodWJcIjpbXCJsb2dvXCIsXCJ2ZXJzaW9uIGNvbnRyb2xcIl0sXCJnaXRsYWJcIjpbXCJsb2dvXCIsXCJ2ZXJzaW9uIGNvbnRyb2xcIl0sXCJnbG9iYWxcIjpbXCJ3b3JsZFwiLFwiYnJvd3NlclwiLFwibGFuZ3VhZ2VcIixcInRyYW5zbGF0ZVwiXSxcImhhcmQtZHJpdmVcIjpbXCJjb21wdXRlclwiLFwic2VydmVyXCJdLFwiaGFzaFwiOltcImhhc2h0YWdcIixcIm51bWJlclwiLFwicG91bmRcIl0sXCJoZWFkcGhvbmVzXCI6W1wibXVzaWNcIixcImF1ZGlvXCJdLFwiaGVhcnRcIjpbXCJsaWtlXCIsXCJsb3ZlXCJdLFwiaGVscC1jaXJjbGVcIjpbXCJxdWVzdGlvbiBtYXJrXCJdLFwiaG9tZVwiOltcImhvdXNlXCJdLFwiaW1hZ2VcIjpbXCJwaWN0dXJlXCJdLFwiaW5ib3hcIjpbXCJlbWFpbFwiXSxcImluc3RhZ3JhbVwiOltcImxvZ29cIixcImNhbWVyYVwiXSxcImxpZmUtYm91eVwiOltcImhlbHBcIixcImxpZmUgcmluZ1wiLFwic3VwcG9ydFwiXSxcImxpbmtlZGluXCI6W1wibG9nb1wiXSxcImxvY2tcIjpbXCJzZWN1cml0eVwiLFwicGFzc3dvcmRcIl0sXCJsb2ctaW5cIjpbXCJzaWduIGluXCIsXCJhcnJvd1wiXSxcImxvZy1vdXRcIjpbXCJzaWduIG91dFwiLFwiYXJyb3dcIl0sXCJtYWlsXCI6W1wiZW1haWxcIl0sXCJtYXAtcGluXCI6W1wibG9jYXRpb25cIixcIm5hdmlnYXRpb25cIixcInRyYXZlbFwiLFwibWFya2VyXCJdLFwibWFwXCI6W1wibG9jYXRpb25cIixcIm5hdmlnYXRpb25cIixcInRyYXZlbFwiXSxcIm1heGltaXplXCI6W1wiZnVsbHNjcmVlblwiXSxcIm1heGltaXplLTJcIjpbXCJmdWxsc2NyZWVuXCIsXCJhcnJvd3NcIl0sXCJtZW51XCI6W1wiYmFyc1wiLFwibmF2aWdhdGlvblwiLFwiaGFtYnVyZ2VyXCJdLFwibWVzc2FnZS1jaXJjbGVcIjpbXCJjb21tZW50XCIsXCJjaGF0XCJdLFwibWVzc2FnZS1zcXVhcmVcIjpbXCJjb21tZW50XCIsXCJjaGF0XCJdLFwibWljLW9mZlwiOltcInJlY29yZFwiXSxcIm1pY1wiOltcInJlY29yZFwiXSxcIm1pbmltaXplXCI6W1wiZXhpdCBmdWxsc2NyZWVuXCJdLFwibWluaW1pemUtMlwiOltcImV4aXQgZnVsbHNjcmVlblwiLFwiYXJyb3dzXCJdLFwibW9uaXRvclwiOltcInR2XCJdLFwibW9vblwiOltcImRhcmtcIixcIm5pZ2h0XCJdLFwibW9yZS1ob3Jpem9udGFsXCI6W1wiZWxsaXBzaXNcIl0sXCJtb3JlLXZlcnRpY2FsXCI6W1wiZWxsaXBzaXNcIl0sXCJtb3ZlXCI6W1wiYXJyb3dzXCJdLFwibmF2aWdhdGlvblwiOltcImxvY2F0aW9uXCIsXCJ0cmF2ZWxcIl0sXCJuYXZpZ2F0aW9uLTJcIjpbXCJsb2NhdGlvblwiLFwidHJhdmVsXCJdLFwib2N0YWdvblwiOltcInN0b3BcIl0sXCJwYWNrYWdlXCI6W1wiYm94XCJdLFwicGFwZXJjbGlwXCI6W1wiYXR0YWNobWVudFwiXSxcInBhdXNlXCI6W1wibXVzaWNcIixcInN0b3BcIl0sXCJwYXVzZS1jaXJjbGVcIjpbXCJtdXNpY1wiLFwic3RvcFwiXSxcInBsYXlcIjpbXCJtdXNpY1wiLFwic3RhcnRcIl0sXCJwbGF5LWNpcmNsZVwiOltcIm11c2ljXCIsXCJzdGFydFwiXSxcInBsdXNcIjpbXCJhZGRcIixcIm5ld1wiXSxcInBsdXMtY2lyY2xlXCI6W1wiYWRkXCIsXCJuZXdcIl0sXCJwbHVzLXNxdWFyZVwiOltcImFkZFwiLFwibmV3XCJdLFwicG9ja2V0XCI6W1wibG9nb1wiLFwic2F2ZVwiXSxcInBvd2VyXCI6W1wib25cIixcIm9mZlwiXSxcInJhZGlvXCI6W1wic2lnbmFsXCJdLFwicmV3aW5kXCI6W1wibXVzaWNcIl0sXCJyc3NcIjpbXCJmZWVkXCIsXCJzdWJzY3JpYmVcIl0sXCJzYXZlXCI6W1wiZmxvcHB5IGRpc2tcIl0sXCJzZW5kXCI6W1wibWVzc2FnZVwiLFwibWFpbFwiLFwicGFwZXIgYWlycGxhbmVcIl0sXCJzZXR0aW5nc1wiOltcImNvZ1wiLFwiZWRpdFwiLFwiZ2VhclwiLFwicHJlZmVyZW5jZXNcIl0sXCJzaGllbGRcIjpbXCJzZWN1cml0eVwiXSxcInNoaWVsZC1vZmZcIjpbXCJzZWN1cml0eVwiXSxcInNob3BwaW5nLWJhZ1wiOltcImVjb21tZXJjZVwiLFwiY2FydFwiLFwicHVyY2hhc2VcIixcInN0b3JlXCJdLFwic2hvcHBpbmctY2FydFwiOltcImVjb21tZXJjZVwiLFwiY2FydFwiLFwicHVyY2hhc2VcIixcInN0b3JlXCJdLFwic2h1ZmZsZVwiOltcIm11c2ljXCJdLFwic2tpcC1iYWNrXCI6W1wibXVzaWNcIl0sXCJza2lwLWZvcndhcmRcIjpbXCJtdXNpY1wiXSxcInNsYXNoXCI6W1wiYmFuXCIsXCJub1wiXSxcInNsaWRlcnNcIjpbXCJzZXR0aW5nc1wiLFwiY29udHJvbHNcIl0sXCJzcGVha2VyXCI6W1wibXVzaWNcIl0sXCJzdGFyXCI6W1wiYm9va21hcmtcIixcImZhdm9yaXRlXCIsXCJsaWtlXCJdLFwic3VuXCI6W1wiYnJpZ2h0bmVzc1wiLFwid2VhdGhlclwiLFwibGlnaHRcIl0sXCJzdW5yaXNlXCI6W1wid2VhdGhlclwiXSxcInN1bnNldFwiOltcIndlYXRoZXJcIl0sXCJ0YWdcIjpbXCJsYWJlbFwiXSxcInRhcmdldFwiOltcImJ1bGxzZXllXCJdLFwidGVybWluYWxcIjpbXCJjb2RlXCIsXCJjb21tYW5kIGxpbmVcIl0sXCJ0aHVtYnMtZG93blwiOltcImRpc2xpa2VcIixcImJhZFwiXSxcInRodW1icy11cFwiOltcImxpa2VcIixcImdvb2RcIl0sXCJ0b2dnbGUtbGVmdFwiOltcIm9uXCIsXCJvZmZcIixcInN3aXRjaFwiXSxcInRvZ2dsZS1yaWdodFwiOltcIm9uXCIsXCJvZmZcIixcInN3aXRjaFwiXSxcInRyYXNoXCI6W1wiZ2FyYmFnZVwiLFwiZGVsZXRlXCIsXCJyZW1vdmVcIl0sXCJ0cmFzaC0yXCI6W1wiZ2FyYmFnZVwiLFwiZGVsZXRlXCIsXCJyZW1vdmVcIl0sXCJ0cmlhbmdsZVwiOltcImRlbHRhXCJdLFwidHJ1Y2tcIjpbXCJkZWxpdmVyeVwiLFwidmFuXCIsXCJzaGlwcGluZ1wiXSxcInR3aXR0ZXJcIjpbXCJsb2dvXCJdLFwidW1icmVsbGFcIjpbXCJyYWluXCIsXCJ3ZWF0aGVyXCJdLFwidmlkZW8tb2ZmXCI6W1wiY2FtZXJhXCIsXCJtb3ZpZVwiLFwiZmlsbVwiXSxcInZpZGVvXCI6W1wiY2FtZXJhXCIsXCJtb3ZpZVwiLFwiZmlsbVwiXSxcInZvaWNlbWFpbFwiOltcInBob25lXCJdLFwidm9sdW1lXCI6W1wibXVzaWNcIixcInNvdW5kXCIsXCJtdXRlXCJdLFwidm9sdW1lLTFcIjpbXCJtdXNpY1wiLFwic291bmRcIl0sXCJ2b2x1bWUtMlwiOltcIm11c2ljXCIsXCJzb3VuZFwiXSxcInZvbHVtZS14XCI6W1wibXVzaWNcIixcInNvdW5kXCIsXCJtdXRlXCJdLFwid2F0Y2hcIjpbXCJjbG9ja1wiLFwidGltZVwiXSxcIndpbmRcIjpbXCJ3ZWF0aGVyXCIsXCJhaXJcIl0sXCJ4LWNpcmNsZVwiOltcImNhbmNlbFwiLFwiY2xvc2VcIixcImRlbGV0ZVwiLFwicmVtb3ZlXCIsXCJ0aW1lc1wiXSxcIngtc3F1YXJlXCI6W1wiY2FuY2VsXCIsXCJjbG9zZVwiLFwiZGVsZXRlXCIsXCJyZW1vdmVcIixcInRpbWVzXCJdLFwieFwiOltcImNhbmNlbFwiLFwiY2xvc2VcIixcImRlbGV0ZVwiLFwicmVtb3ZlXCIsXCJ0aW1lc1wiXSxcInlvdXR1YmVcIjpbXCJsb2dvXCIsXCJ2aWRlb1wiLFwicGxheVwiXSxcInphcC1vZmZcIjpbXCJmbGFzaFwiLFwiY2FtZXJhXCIsXCJsaWdodG5pbmdcIl0sXCJ6YXBcIjpbXCJmbGFzaFwiLFwiY2FtZXJhXCIsXCJsaWdodG5pbmdcIl19O1xuXG4vKioqLyB9KSxcblxuLyoqKi8gXCIuL3NyYy90by1zdmcuanNcIjpcbi8qISoqKioqKioqKioqKioqKioqKioqKioqISpcXFxuICAhKioqIC4vc3JjL3RvLXN2Zy5qcyAqKiohXG4gIFxcKioqKioqKioqKioqKioqKioqKioqKiovXG4vKiEgbm8gc3RhdGljIGV4cG9ydHMgZm91bmQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9pY29ucyA9IF9fd2VicGFja19yZXF1aXJlX18oLyohIC4vaWNvbnMgKi8gXCIuL3NyYy9pY29ucy5qc1wiKTtcblxudmFyIF9pY29uczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pY29ucyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbi8qKlxuICogQ3JlYXRlIGFuIFNWRyBzdHJpbmcuXG4gKiBAZGVwcmVjYXRlZFxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gdG9TdmcobmFtZSkge1xuICB2YXIgYXR0cnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuXG4gIGNvbnNvbGUud2FybignZmVhdGhlci50b1N2ZygpIGlzIGRlcHJlY2F0ZWQuIFBsZWFzZSB1c2UgZmVhdGhlci5pY29uc1tuYW1lXS50b1N2ZygpIGluc3RlYWQuJyk7XG5cbiAgaWYgKCFuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgcmVxdWlyZWQgYGtleWAgKGljb24gbmFtZSkgcGFyYW1ldGVyIGlzIG1pc3NpbmcuJyk7XG4gIH1cblxuICBpZiAoIV9pY29uczIuZGVmYXVsdFtuYW1lXSkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm8gaWNvbiBtYXRjaGluZyBcXCcnICsgbmFtZSArICdcXCcuIFNlZSB0aGUgY29tcGxldGUgbGlzdCBvZiBpY29ucyBhdCBodHRwczovL2ZlYXRoZXJpY29ucy5jb20nKTtcbiAgfVxuXG4gIHJldHVybiBfaWNvbnMyLmRlZmF1bHRbbmFtZV0udG9TdmcoYXR0cnMpO1xufVxuXG5leHBvcnRzLmRlZmF1bHQgPSB0b1N2ZztcblxuLyoqKi8gfSksXG5cbi8qKiovIDA6XG4vKiEqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiEqXFxcbiAgISoqKiBtdWx0aSBjb3JlLWpzL2ZuL2FycmF5L2Zyb20gLi9zcmMvaW5kZXguanMgKioqIVxuICBcXCoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyohIG5vIHN0YXRpYyBleHBvcnRzIGZvdW5kICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbl9fd2VicGFja19yZXF1aXJlX18oLyohIGNvcmUtanMvZm4vYXJyYXkvZnJvbSAqL1wiLi9ub2RlX21vZHVsZXMvY29yZS1qcy9mbi9hcnJheS9mcm9tLmpzXCIpO1xubW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKC8qISAvaG9tZS90cmF2aXMvYnVpbGQvZmVhdGhlcmljb25zL2ZlYXRoZXIvc3JjL2luZGV4LmpzICovXCIuL3NyYy9pbmRleC5qc1wiKTtcblxuXG4vKioqLyB9KVxuXG4vKioqKioqLyB9KTtcbn0pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZmVhdGhlci5qcy5tYXAiXX0=
