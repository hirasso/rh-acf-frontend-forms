
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
      resetAfterSubmit: true,
      responseDuration: 1000
    }, options );

    this.$form = $form;

    
    this.$form.find('.acf-field').find('input,textarea,select').trigger('change');

    this.initTextAreasAutosize();
    this.createAjaxResponse();
    this.setupForm();
    this.setupInputs();
    this.initImageDrops();
    this.hideConditionalFields();
    this.initMaxInputLengths();
    
    this.$form.data('RAHFrontendForm', this);
  }

  setupForm() {
    
    if( this.options.ajaxSubmit ) {
      this.$form.addClass('is-ajax-submit');
      this.$form.on('submit', (e) => {
        e.preventDefault();
      });
    }

    this.$form.find('[data-event="add-row"]').removeClass('acf-icon');

    // disable the confirmation for repeater remove-row buttons
    this.$form.on('click', '[data-event="remove-row"]', function(e) {
      $(this).click();
    });

  }

  handleAjaxResponse( response ) {
    this.showAjaxResponse( response );
    setTimeout( () => {
      this.$form.removeClass('show-ajax-response');
      acf.validation.unlockForm( this.$form );
      if( this.options.resetAfterSubmit ) {
        this.resetForm( $form );
      }
    }, this.options.responseDuration );
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
  }

  initImageDrops() {
    $('[data-type="image"] .acf-input').each((i, el) => {
      new ImageDrop( $(el) );
    });
  }

  hideConditionalFields() {
    this.$form.find('.acf-field.hidden-by-conditional-logic').hide();
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

  initTextAreasAutosize() {
    this.$form.find('textarea').each(function(){
      autosize(this);
    }).on('autosize:resized', function(){
      $(document).trigger('rah/acf-form-resized')
    });
  }
}

