
/**
 * ACF Frontend Forms
 * Version: 1.0
 */

global.jQuery = $ = window.jQuery;

import './app/modules/acf-autofill';
import ACFFrontendForm from './app/acf-frontend-form';

window.rah = window.rah || {};

window.rah.acfFrontendForm = function( $form, options = {} ) {
  return new ACFFrontendForm( $form, options );
}

class App {
  
  constructor() {

    if( typeof acf === 'undefined' ) {
      console.warn( 'The global acf object is not defined' );
      return;
    }
    
    this.setup();
    this.setupAjaxSubmit();
  }

  /**
   * Setup global acf functions and hooks
   */
  setup() {
    
    // re-setup ACF on AJAX reload
    $(document).on('rah/render', () => {
      acf.doAction('ready');
    })

    // functions
    acf.validation.show_spinner = acf.validation.showSpinner = function() {
      $('html').addClass('is-loading-form');
    }
    acf.validation.hide_spinner = acf.validation.hideSpinner = function() {
      $('html').removeClass('is-loading-form');
    }
    acf.addAction('remove', function( $target ) {
      $target.remove();
      $(document).trigger('rah/acf-form-resized');
    });

    acf.addAction( 'append', function( $el ) {
      let $repeater = $el.parents('.acf-repeater');
      if( !$repeater.length ) {
        return;
      }
      // adjust disabled class
      let o = acf.get_data( $repeater );
      let count = $repeater.find('.acf-row').length - 1;
      if( o.max > 0 && count >= o.max ) {
        $el.find('[data-event="add-row"]').addClass('is-disabled');
      }
      // focus the first input of the new row
      setTimeout(() => {
        let $input = $el.find('input:first');
        if( !$input.length ) {
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
  setupAjaxSubmit() {

    acf.addAction('submit', ( $form ) => {

      if( !$form.hasClass('is-ajax-submit') ) {
        return true;
      }
      
      // if( $form.attr('id') !== this.$form.attr('id') ) {
      //   return;
      // }

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

      acf.validation.lockForm( $form );

      $.ajax({
        url: window.location.href,
        method: 'post',
        data: formData,
        cache: false,
        processData: false,
        contentType: false
      }).done(response => {
        acf.validation.hideSpinner();
        this.getFormInstance( $form ).handleAjaxResponse( response );
        // $form.trigger('rah/ajax-submit');
        
      });
          
    });

  }

  getFormInstance( $form ) {
    return $form.data('RAHFrontendForm');
  }

}

$(document).ready(function() {
  new App;
});
