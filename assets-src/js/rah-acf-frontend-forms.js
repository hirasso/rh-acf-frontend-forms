
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

// window.rah = window.rah || {};

// window.rah.acfForm = function( $form, options = {} ) {
//   let instance = $form.data('RAHFrontendForm');
//   return instance || new ACFFrontendForm( $form, options );
// }

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
    acf.showSpinner = function() {
      $('html').addClass('is-loading-form');
    }
    acf.hideSpinner = function() {
      $('html').removeClass('is-loading-form');
    }
    acf.addAction('remove', ( $el ) => {
      let $repeater = $el.closest('.acf-repeater')
      $el.remove();
      this.adjustRepeater( $el, $repeater, 'remove' );
    });

    acf.addAction( 'append', ( $el ) => {
      this.adjustRepeater( $el, $el.closest('.acf-repeater'), 'append' );
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

  adjustRepeater( $el, $repeater, action ) {
    if( !$repeater.length ) {
      return;
    }
    // adjust disabled class
    let o = acf.get_data( $repeater );
    let $rows = $repeater.find('.acf-row:not(.acf-clone)');
    let $lastRow = $rows.last();
    let $addRow = $lastRow.find('[data-event="add-row"]');
    $addRow.toggleClass('is-disabled', o.max > 0 && $rows.length >= o.max);

    switch( action ) {
      case 'append':
      this.focusFirstInput( $lastRow );
      break;
      case 'remove':
      break;
    }

    $(document).trigger('rah/acf-form-resized');
  }

  focusFirstInput( $el ) {
    // focus the first input of the new row
    setTimeout(() => {
      let $input = $el.find('input:first');
      if( !$input.length ) {
        return;
      }
      $input.focus();
    }, 1);
  }

}

new App();
