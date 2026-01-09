
/**
 * ACF Frontend Form
 * Version: 1.0
 */

const $ = window.jQuery;

import plugin from './plugin';

export default class ACFFrontendForm {

  constructor( el, options = {} ) {

    let $form = $(el);
    this.options = options;
    this.$form = $form;

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
    if( $form.hasClass('rh-is-initialized') ) {
      return;
    }
    $form.addClass('rh-is-initialized');

    acf.doAction('append', $form);
    acf.validation.enable();

    this.$form.find('.acf-field input').each((i, el) => {
      this.adjustHasValueClass( $(el) );
    })

    this.createAjaxResponse();
    this.setupForm();
    this.setupInputs();
    this.hideConditionalFields();

    this.$form.data('RHFrontendForm', this);
  }

  setupForm() {

    if( this.options.ajaxSubmit ) {
      this.$form.addClass('is-ajax-submit');
      // this.$form.on('submit', (e) => {
      //   e.preventDefault();
      // });
    }

    this.$form.find('[data-event="add-row"]').removeClass('acf-icon');

    // disable the confirmation for repeater remove-row buttons
    this.$form.on('click', '[data-event="remove-row"]', function(e) {
      $(this).click();
    });

  }

  doAjaxSubmit() {

    // Fix for Safari Webkit – empty file inputs
    // https://stackoverflow.com/a/49827426/586823
    let $fileInputs = $('input[type="file"]:not([disabled])', this.$form)
    $fileInputs.each(function(i, input) {
      if( input.files.length > 0 ) {
        return;
      }
      $(input).prop('disabled', true);
    })

    var formData = new FormData( this.$form[0] );

    // Re-enable empty file $fileInputs
    $fileInputs.prop('disabled', false);

    acf.lockForm( this.$form );
    this.$form.addClass('rh-is-locked');

    $.ajax({
      url: window.location.href,
      method: 'post',
      data: formData,
      cache: false,
      processData: false,
      contentType: false
    }).done(response => {
      this.handleAjaxResponse( response );
      this.options.onSuccess( response );
    });
  }

  handleAjaxResponse( response ) {
    acf.hideSpinner();
    this.showAjaxResponse( response );
    if( !response.success ) {
      return;
    }
    acf.unload.disable();
    setTimeout( () => {
      this.$form.removeClass('show-ajax-response');
      acf.unlockForm( this.$form );
      acf.validation.reset( this.$form );
      this.$form.removeClass('rh-is-locked');
      if( this.options.resetAfterSubmit ) {
        this.resetForm();
      }
    }, this.options.waitAfterSubmit );
  }

  createAjaxResponse() {
    this.$ajaxResponse = $('<div class="acf-ajax-response"></div>');
    this.$form.find('.acf-form-submit').append( this.$ajaxResponse );
  }

  showAjaxResponse( response ) {
    let message = ((response || {}).data || {}).message;
    if( !message ) {
      console.warn('[rh-acf-frontend-forms] No response message found in AJAX response');
      return;
    }
    this.$form.trigger('rh/show-ajax-response', response);
    this.$form.trigger('rh/acf-frontend-form/response', response);
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
    $('.acf-field-image').each((i, el) => {
      new ImageDrop( $(el) );
    });
  }

  hideConditionalFields() {
    this.$form.find('.acf-field.hidden-by-conditional-logic').hide();
  }

  setupInputs() {

    let selector = 'input,textarea,select';
    this.$form.on( 'keyup keydown change', selector, e => this.adjustHasValueClass( $(e.currentTarget) ) );
    this.$form.on( 'change', selector, e => this.maybeSubmitForm(e) );
    this.$form.on( 'focus', selector, e => this.onInputFocus( e.currentTarget ) );
    this.$form.on( 'blur', selector, e => this.onInputBlur( e.currentTarget ) );

  }
  adjustHasValueClass( $input ) {

    let $field = $input.parents('.acf-field:first');
    let field = acf.getInstance( $field );
    if( typeof field === 'undefined' ) {
      return;
    }
    let type = $input.attr('type');
    let val = $input.val();

    let enabledInputs = [
      'text',
      'password',
      'url',
      'email',
      'number',
      'textarea',
      'select',
      'true_false',
      'date_picker',
      'time_picker',
      'date_time_picker',
      'oembed'
    ];
    if( $.inArray( field.get('type'), enabledInputs ) === -1 ) {
      return;
    }
    if( type === 'checkbox' ) {
      val = $input.prop('checked');
    }

    if( val ) {
      $field.addClass('has-value');
    } else {
      $field.removeClass('has-value');
    }
  }
  maybeSubmitForm( e ) {
    if( this.options.submitOnChange ) {
      this.$form.find('[type="submit"]').click();
      this.$form.submit();
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

/**
 * Defaults
 * @type {{color: string, status: number}}
 */
ACFFrontendForm.DEFAULTS = {
  ajaxSubmit: true,
  waitAfterSubmit: 1000,
  resetAfterSubmit: true,
  submitOnChange: false,
  onSuccess: () => {}
};

/**
 * make jQuery Plugin
 */
plugin('acfFrontendForm', ACFFrontendForm, true);
