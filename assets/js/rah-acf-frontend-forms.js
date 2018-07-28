!function a(r,s,l){function f(t,e){if(!s[t]){if(!r[t]){var n="function"==typeof require&&require;if(!e&&n)return n(t,!0);if(u)return u(t,!0);var i=new Error("Cannot find module '"+t+"'");throw i.code="MODULE_NOT_FOUND",i}var o=s[t]={exports:{}};r[t][0].call(o.exports,function(e){return f(r[t][1][e]||e)},o,o.exports,a,r,s,l)}return s[t].exports}for(var u="function"==typeof require&&require,e=0;e<l.length;e++)f(l[e]);return f}({1:[function(s,e,l){(function(e){"use strict";Object.defineProperty(l,"__esModule",{value:!0});var t=function(){function i(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(e,t,n){return t&&i(e.prototype,t),n&&i(e,n),e}}(),i=n(s("autosize")),o=n(s("./modules/image-drop")),a=n(s("./modules/max-input-length"));function n(e){return e&&e.__esModule?e:{default:e}}e.jQuery=$=window.jQuery;var r=function(){function n(e){var t=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{};!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,n),e.length?"undefined"!=typeof acf?e.hasClass("rah-is--initialized")||(e.addClass("rah-is--initialized"),this.options=$.extend({},{ajaxSubmit:!0,resetAfterSubmit:!0},t),this.$form=e,(0,i.default)($("textarea")),this.$form.find(".acf-field").find("input,textarea,select").trigger("change"),this.createAjaxResponse(),this.acfSetup(),this.setupInputs(),this.initImageDrops(),this.hideConditionalFields(),this.initMaxInputLengths(),this.setupAjaxSubmit()):console.warn("The global acf object is not defined"):console.warn("Form element doesn't exist")}return t(n,[{key:"acfSetup",value:function(){acf.doAction("ready"),acf.validation.show_spinner=acf.validation.showSpinner=function(){$("html").addClass("is-loading-form")},acf.validation.hide_spinner=acf.validation.hideSpinner=function(){$("html").removeClass("is-loading-form")},acf.addAction("remove",function(e){e.remove()}),acf.add_action("show_field",function(e,t){e.slideDown(400,"easeOutQuint")}),acf.add_action("hide_field",function(e,t){e.slideUp(400,"easeOutQuint")}),$('[data-event="add-row"]').removeClass("acf-icon"),this.$form.on("click",'[data-event="remove-row"]',function(e){$(this).click()}),acf.addAction("append",function(t){var e=t.parents(".acf-repeater");if(e.length){var n=acf.get_data(e),i=e.find(".acf-row").length-1;0<n.max&&i>=n.max&&t.find('[data-event="add-row"]').addClass("is-disabled"),setTimeout(function(){var e=t.find("input:first");e.length&&e.focus()},1)}})}},{key:"setupAjaxSubmit",value:function(){var o=this;this.options.ajaxSubmit&&(this.$form.on("submit",function(e){e.preventDefault()}),acf.addAction("validation_success",function(e){if(e.attr("id")===o.$form.attr("id")){var t=e[0],n=$('input[type="file"]:not([disabled])',e);n.each(function(e,t){0<t.files.length||$(t).prop("disabled",!0)});var i=new FormData(t);n.prop("disabled",!1),acf.validation.lockForm(o.$form),$.ajax({url:window.location.href,method:"post",data:i,cache:!1,processData:!1,contentType:!1}).done(function(e){acf.validation.hideSpinner(),o.showAjaxResponse(e),o.options.resetAfterSubmit&&setTimeout(function(){return o.resetForm()},5e3)})}}))}},{key:"createAjaxResponse",value:function(){this.$ajaxResponse=$('<div class="acf-ajax-response"></div>'),this.$form.find(".acf-form-submit").append(this.$ajaxResponse)}},{key:"showAjaxResponse",value:function(e){var t=e.data.message;this.$ajaxResponse.text(t).toggleClass("is--error",!1===e.success),this.$form.addClass("show-ajax-response")}},{key:"resetForm",value:function(){this.$form.get(0).reset(),this.$form.find(".acf-field").find("input,textarea,select").trigger("change"),this.$form.find(".acf-field").removeClass("has-value has-focus"),this.$form.removeClass("show-ajax-response"),acf.validation.unlockForm(this.$form)}},{key:"initImageDrops",value:function(){$('[data-type="image"] .acf-input').each(function(e,t){new o.default($(t))})}},{key:"hideConditionalFields",value:function(){$(".acf-field.hidden-by-conditional-logic").hide()}},{key:"initMaxInputLengths",value:function(){this.$form.find(".acf-field:has(.maxlength-info)").each(function(e,t){new a.default($(t))})}},{key:"setupInputs",value:function(){var t=this;this.$form.on("keyup keydown change","input,textarea,select",function(e){return t.onInputChange(e.currentTarget)}),this.$form.on("focus","input,textarea,select",function(e){return t.onInputFocus(e.currentTarget)}),this.$form.on("blur","input,textarea,select",function(e){return t.onInputBlur(e.currentTarget)})}},{key:"onInputChange",value:function(e){var t=$(e),n=t.parents(".acf-field:first"),i=t.attr("type"),o=t.val();"checkbox"===i&&(o=t.prop("checked")),o?n.addClass("has-value"):n.removeClass("has-value")}},{key:"onInputFocus",value:function(e){this.$field(e).addClass("has-focus")}},{key:"onInputBlur",value:function(e){this.$field(e).removeClass("has-focus")}},{key:"$field",value:function(e){return $(e).parents(".acf-field:first")}}]),n}();l.default=r}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./modules/image-drop":3,"./modules/max-input-length":4,autosize:6}],2:[function(i,e,t){(function(e){"use strict";var t,s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},n=i("autosize"),o=(t=n)&&t.__esModule?t:{default:t};e.jQuery=$=window.jQuery,window.acfAutoFill=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:0,t=$(".acf-form");if(t.length){(0,o.default)($("textarea"));var i=window.acfAutofillValues;if("object"===(void 0===i?"undefined":s(i))){i=i[e];var n=$(document).scrollTop();t.each(function(e,t){var n=$(t);n.addClass("is-autofilled"),n.find(".fill-password-suggestion").click(),function r(n,e){$.each(e,function(e,a){var t=n.find('.acf-field[data-name="'+e+'"]');if(!t.length)return!0;t.each(function(e,t){var o,i=$(t);if("object"!==(void 0===a?"undefined":s(a))||a instanceof Date){var n=i.find("input, select, checkbox, textarea");o=a,n.each(function(e,t){var n=$(t),i=n.attr("type");if("hidden"===i||n.hasClass("select2-search__field")||"file"===i||n.parents(".acf-clone").length)return!0;if(void 0!==n.data("select2"))return n.select2("trigger","select",{data:o}).trigger("change"),!0;switch(i){case"checkbox":case"true_false":return n.prop("checked",o).trigger("change"),!0}if(n.hasClass("hasDatepicker"))return n.datepicker("setDate",o).trigger("change"),!0;n.val(o).trigger("change")})}else $.each(a,function(e,t){if("number"==typeof e){0<e&&i.find('[data-event="add-row"]:last').click();var n=i.find(".acf-fields").eq(e);r(n,t)}else r(i,t)})})})}(n,i),n.trigger("autofilled")}),o.default.update($("textarea")),$("html,body").animate({scrollTop:n},0)}else console.warn("window.acfAutofillValues is not defined")}}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{autosize:6}],3:[function(e,t,i){(function(e){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var n=function(){function i(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(e,t,n){return t&&i(e.prototype,t),n&&i(e,n),e}}();e.jQuery=$=window.jQuery;var t=function(){function t(e){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),this.$el=e,this.$field=e.parents(".acf-field"),this.$fileInput=e.find('input[type="file"]'),this.$imagePreview=e.find(".image-wrap"),this.$image=this.$imagePreview.find("img"),this.$clear=e.find('[data-name="remove"]'),this.maxFileSize=parseInt(e.find(".max-size").text(),10),this.$field.addClass("image-drop"),this.setupEvents(),this.showImagePreview(this.$image.attr("src"))}return n(t,[{key:"setupEvents",value:function(){var t=this;-1===$.inArray("dataTransfer",$.event.props)&&$.event.props.push("dataTransfer"),this.$el.on("dragover",function(e){e.preventDefault(),t.$el.addClass("is-dragover")}),this.$el.on("dragleave",function(){t.$el.removeClass("is-dragover")}),this.$el.on("drop",function(e){e.preventDefault(),t.$el.removeClass("is-dragover"),t.$fileInput.get(0).files=e.dataTransfer.files}),this.$clear.unbind().click(function(e){e.preventDefault(),e.stopPropagation(),t.clearFileInput()}),this.$fileInput.change(function(e){return t.onInputChange(e.target)})}},{key:"showImagePreview",value:function(n){var i=this;if(void 0!==n&&n.length){var o=new Image;o.onload=function(){var e=o.height/o.width;if(e<.5)i.clearFileInput("The image can't be more than twice the width of it's height");else if(2<e)i.clearFileInput("The image can't be more than twice the height of it's width");else{var t=Math.floor(100*e);i.$el.css({paddingBottom:t+"%"}),i.$field.addClass("has-value"),i.$image.attr("src",n)}},o.src=n}}},{key:"clearFileInput",value:function(){var e=0<arguments.length&&void 0!==arguments[0]&&arguments[0];this.$fileInput.val("").trigger("change"),e&&alert(e)}},{key:"onInputChange",value:function(e){var t=this;if(e.files&&e.files[0]){var n=e.files[0];if(n.size/1e6>this.maxFileSize)return void this.clearFileInput("The image must be smaller than "+this.maxFileSize+"MB");var i=new FileReader;i.onload=function(e){t.showImagePreview(e.target.result)};var o=n.name.split(".").pop().toLowerCase();if(!(-1<["jpg","jpeg","gif"].indexOf(o)))return void this.clearFileInput("Only JPGs or GIFs are allowed");i.readAsDataURL(n)}else this.$field.removeClass("has-value"),this.$image.removeAttr("src"),this.$el.css({paddingBottom:""})}}]),t}();i.default=t}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],4:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});n.default=function e(t){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e);var i=t.find(".maxlength-info"),o=t.find(".remaining-count"),a=parseInt(o.text(),10),r=t.find(".acf-input").find("textarea");r.on("change cut paste drop keyup",function(e){var t=r.val();if(t.length>a)return r.val(t.substring(0,a)),!1;var n=a-t.length;n<20?i.addClass("is-warning"):i.removeClass("is-warning"),o.text(n)})}},{}],5:[function(o,e,t){(function(e){"use strict";o("./app/modules/acf-autofill");var t,n=o("./app/acf-frontend-form"),i=(t=n)&&t.__esModule?t:{default:t};e.jQuery=$=window.jQuery,window.rah=window.rah||{},window.rah.acfFrontendForm=function(e){var t=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{};return new i.default(e,t)}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./app/acf-frontend-form":1,"./app/modules/acf-autofill":2}],6:[function(e,i,o){!function(e,t){if("function"==typeof define&&define.amd)define(["module","exports"],t);else if(void 0!==o)t(i,o);else{var n={exports:{}};t(n,n.exports),e.autosize=n.exports}}(this,function(e,t){"use strict";var n,i,d="function"==typeof Map?new Map:(n=[],i=[],{has:function(e){return-1<n.indexOf(e)},get:function(e){return i[n.indexOf(e)]},set:function(e,t){-1===n.indexOf(e)&&(n.push(e),i.push(t))},delete:function(e){var t=n.indexOf(e);-1<t&&(n.splice(t,1),i.splice(t,1))}}),c=function(e){return new Event(e,{bubbles:!0})};try{new Event("test")}catch(e){c=function(e){var t=document.createEvent("Event");return t.initEvent(e,!0,!1),t}}function o(o){if(o&&o.nodeName&&"TEXTAREA"===o.nodeName&&!d.has(o)){var e,n=null,i=null,a=null,r=function(){o.clientWidth!==i&&u()},s=function(t){window.removeEventListener("resize",r,!1),o.removeEventListener("input",u,!1),o.removeEventListener("keyup",u,!1),o.removeEventListener("autosize:destroy",s,!1),o.removeEventListener("autosize:update",u,!1),Object.keys(t).forEach(function(e){o.style[e]=t[e]}),d.delete(o)}.bind(o,{height:o.style.height,resize:o.style.resize,overflowY:o.style.overflowY,overflowX:o.style.overflowX,wordWrap:o.style.wordWrap});o.addEventListener("autosize:destroy",s,!1),"onpropertychange"in o&&"oninput"in o&&o.addEventListener("keyup",u,!1),window.addEventListener("resize",r,!1),o.addEventListener("input",u,!1),o.addEventListener("autosize:update",u,!1),o.style.overflowX="hidden",o.style.wordWrap="break-word",d.set(o,{destroy:s,update:u}),"vertical"===(e=window.getComputedStyle(o,null)).resize?o.style.resize="none":"both"===e.resize&&(o.style.resize="horizontal"),n="content-box"===e.boxSizing?-(parseFloat(e.paddingTop)+parseFloat(e.paddingBottom)):parseFloat(e.borderTopWidth)+parseFloat(e.borderBottomWidth),isNaN(n)&&(n=0),u()}function l(e){var t=o.style.width;o.style.width="0px",o.offsetWidth,o.style.width=t,o.style.overflowY=e}function f(){if(0!==o.scrollHeight){var e=function(e){for(var t=[];e&&e.parentNode&&e.parentNode instanceof Element;)e.parentNode.scrollTop&&t.push({node:e.parentNode,scrollTop:e.parentNode.scrollTop}),e=e.parentNode;return t}(o),t=document.documentElement&&document.documentElement.scrollTop;o.style.height="",o.style.height=o.scrollHeight+n+"px",i=o.clientWidth,e.forEach(function(e){e.node.scrollTop=e.scrollTop}),t&&(document.documentElement.scrollTop=t)}}function u(){f();var e=Math.round(parseFloat(o.style.height)),t=window.getComputedStyle(o,null),n="content-box"===t.boxSizing?Math.round(parseFloat(t.height)):o.offsetHeight;if(n<e?"hidden"===t.overflowY&&(l("scroll"),f(),n="content-box"===t.boxSizing?Math.round(parseFloat(window.getComputedStyle(o,null).height)):o.offsetHeight):"hidden"!==t.overflowY&&(l("hidden"),f(),n="content-box"===t.boxSizing?Math.round(parseFloat(window.getComputedStyle(o,null).height)):o.offsetHeight),a!==n){a=n;var i=c("autosize:resized");try{o.dispatchEvent(i)}catch(e){}}}}function a(e){var t=d.get(e);t&&t.destroy()}function r(e){var t=d.get(e);t&&t.update()}var s=null;"undefined"==typeof window||"function"!=typeof window.getComputedStyle?((s=function(e){return e}).destroy=function(e){return e},s.update=function(e){return e}):((s=function(e,t){return e&&Array.prototype.forEach.call(e.length?e:[e],function(e){return o(e)}),e}).destroy=function(e){return e&&Array.prototype.forEach.call(e.length?e:[e],a),e},s.update=function(e){return e&&Array.prototype.forEach.call(e.length?e:[e],r),e}),t.default=s,e.exports=t.default})},{}]},{},[5]);