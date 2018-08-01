
/**
 * ACF Frontend Forms
 * Version: 1.0
 */

global.jQuery = $ = window.jQuery;

import './modules/autofill';
import ACFFrontendForm from './modules/frontend-form';
import ImageDrop from './modules/image-drop';
import MaxLength from './modules/maxlength';
import autosize from 'autosize';

window.rah = window.rah || {};

window.rah.acfForm = function( $form, options = {} ) {
  let instance = $form.data('RAHFrontendForm');
  return instance || new ACFFrontendForm( $form, options );
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
    
    // add initialized class to fields on initialization
    acf.addAction('new_field', ( field ) => {
      field.$el.addClass('rah-is-initialized');
      this.initMaxInputInfo( field );
    });

    acf.addAction('new_field/type=image', ( field ) => {
      new ImageDrop( field );
    })

    acf.addAction('new_field/type=textarea', ( field ) => {
      this.initAutosize( field );
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

      this.getInstance( $form ).doAjaxSubmit();

    });

  }

  getInstance( $form ) {
    return $form.data('RAHFrontendForm');
  }

  initMaxInputInfo( field ) {
    let $info = field.$el.find('.maxlength-info');
    if( $info.length ) {
      new MaxLength( field );
    }
  }

  initAutosize( field ) {
    let $input = field.$input();
    
    $input.each(function(){
      autosize(this);
    }).on('autosize:resized', function(){
      $(document).trigger('rah/acf-form-resized');
    });
  }
}

new App();
