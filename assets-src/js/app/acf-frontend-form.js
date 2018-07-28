
/**
 * ACF Frontend Form
 * Version: 1.0
 */

global.jQuery = $ = window.jQuery;

import autosize from 'autosize';

import ImageDrop from './modules/image-drop';
import MaxInputLength from './modules/max-input-length';

export default class ACFFrontendForm {

  constructor( $form, options = {} ) {

    // return if there is no form element
    if( !$form.length ) {
      console.warn( 'Form element doesn\'t exist' );
      return;
    }
    // return if global acf object doesn't exist
    if( typeof acf === 'undefined' ) {
      console.warn( 'The global acf object is not defined' );
      return;
    }
    // return if form has already been initialized
    if( $form.hasClass('rah-is--initialized') ) {
      return;
    }
    $form.addClass('rah-is--initialized');

    this.options = $.extend( {}, {
      ajaxSubmit: true,
      resetAfterSubmit: true
    }, options );

    this.$form = $form;

    autosize( $('textarea') );
    this.$form.find('.acf-field').find('input,textarea,select').trigger('change');

    this.createAjaxResponse();
    this.acfSetup();
    this.setupInputs();
    this.initImageDrops();
    this.hideConditionalFields();
    this.initMaxInputLengths();

    
    this.setupAjaxSubmit();
    
  }

  acfSetup() {
    
    // initialize the acf script
    acf.doAction('ready');

    // functions
    acf.validation.show_spinner = acf.validation.showSpinner = function() {
      $('html').addClass('is-loading-form');
    }
    acf.validation.hide_spinner = acf.validation.hideSpinner = function() {
      $('html').removeClass('is-loading-form');
    }
    acf.remove = function( $el ) {
      $el.remove();
    }

    acf.add_action('show_field', ( $field, type ) => {
      $field.slideDown(400, 'easeOutQuint');
    });
    acf.add_action('hide_field', ( $field, type ) => {
      $field.slideUp(400, 'easeOutQuint');
    });
    // for repeaters
    acf.add_action('append', ( $el ) => {
      let $repeater = $el.parents('.acf-repeater');
      if( !$repeater.length ) {
        return;
      }
      
      let o = acf.get_data( $repeater );
      let count = $repeater.find('.acf-row').length - 1;
      if( o.max > 0 && count >= o.max ) {
        $el.find('[data-event="add-row"]').addClass('is-disabled');
      }
    });

    // disable the confirmation for repeater remove-row buttons
    acf.tooltip.confirm_remove = function($el, callback) {
      callback.apply(null, [true]);
    }

    // Hack to force repeater fields 
    this.$form.find('[data-event="add-row"]').removeClass('acf-icon');
    

    this.$form.find('.acf-actions [data-event="add-row"]').each((i, el) => {
      let $el = $(el);
      $el.click(() => {
        setTimeout(() => {
          let $input = $el.parents('.acf-repeater').find('.acf-row:not(.acf-clone):last input:first');
          $input.focus();
        }, 1);
      });
    })
  }

  setupAjaxSubmit() {

    if( !this.options.ajaxSubmit ) {
      return;
    }

    this.$form.on('submit', (e) => {
      e.preventDefault();
    });

    acf.addAction('validation_success', ( $form ) => {

      if( $form.attr('id') !== this.$form.attr('id') ) {
        return;
      }

      let form = $form[0];

      // Fix for Safari Webkit – empty file inputs
      // https://stackoverflow.com/a/49827426/586823
      let $inputs = $('input[type="file"]:not([disabled])', $form)
      $inputs.each(function(i, input) {
        if( input.files.length > 0 ) {
          return;
        }
        $(input).prop('disabled', true);
      })
      
      var formData = new FormData( form );

      // Re-enable empty file inputs
      $inputs.prop('disabled', false);

      acf.validation.lockForm( this.$form );

      $.ajax({
        url: window.location.href,
        method: 'post',
        data: formData,
        cache: false,
        processData: false,
        contentType: false
      }).done(response => {
        acf.validation.hideSpinner();
        this.showAjaxResponse( response );
        if( this.options.resetAfterSubmit ) {
          setTimeout( () => this.resetForm(), 5000 );
        }
      });
          
    });

  }

  createAjaxResponse() {
    this.$ajaxResponse = $('<div class="acf-ajax-response"></div>');
    this.$form.find('.acf-form-submit').append( this.$ajaxResponse );
  }

  showAjaxResponse( response ) {
    let message = response.data.message;
    this.$ajaxResponse
      .text( message )
      .toggleClass('is--error', response.success === false);
    
    this.$form.addClass('show-ajax-response');
  }

  resetForm() {
    this.$form.get(0).reset();
    this.$form.find('.acf-field').find('input,textarea,select').trigger('change');
    this.$form.find('.acf-field').removeClass('has-value has-focus');
    this.$form.removeClass('show-ajax-response');
    acf.validation.unlockForm( this.$form );
  }

  initImageDrops() {
    $('[data-type="image"] .acf-input').each((i, el) => {
      new ImageDrop( $(el) );
    });
  }

  hideConditionalFields() {
    $('.acf-field.hidden-by-conditional-logic').hide();
  }

  initMaxInputLengths() {
    this.$form.find('.acf-field:has(.maxlength-info)').each((i, el) => {
      new MaxInputLength( $(el) );
    })
  }

  setupInputs() {
    
    this.$form.on( 'keyup keydown change', 'input,textarea,select', e => this.onInputChange( e.currentTarget ) );
    this.$form.on( 'focus', 'input,textarea,select', e => this.onInputFocus( e.currentTarget ) );
    this.$form.on( 'blur', 'input,textarea,select', e => this.onInputBlur( e.currentTarget ) );
      
  }
  onInputChange( el ) {

    let $el = $(el);

    let $field = $el.parents('.acf-field:first');
    let type = $el.attr('type');
    let val = $el.val();

    if( type === 'checkbox' ) {
      val = $el.prop('checked');
    }
    
    if( val ) {
      $field.addClass('has-value');
    } else {
      $field.removeClass('has-value');
    }
  }
  onInputFocus( el ) {
    this.$field( el ).addClass('has-focus');
  }
  onInputBlur( el ) {
    this.$field( el ).removeClass('has-focus');
  }
  $field( input ) {
    return $(input).parents('.acf-field:first');
  }
}

