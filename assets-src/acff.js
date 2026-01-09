
/**
 * ACF Frontend Forms
 * Version: 1.0
 */

const $ = window.jQuery;

import './js/autofill';
import './js/plugin.frontend-form';
import ImageDrop from './js/image-drop';
import FileInput from './js/file-input';
import MaxLength from './js/maxlength';
import autosize from 'autosize';

// window.rh = window.rh || {};

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
      field.$el.addClass('rh-is-initialized');
      this.initMaxInputInfo( field );
    });

    acf.addAction('new_field/type=image', ( field ) => {
      new ImageDrop( field );
    })

    acf.addAction('new_field/type=textarea', ( field ) => {
      this.initAutosize( field );
    })

    acf.addAction('new_field/type=file', field => {
      new FileInput( field );
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

    acf.addAction('submit', $form => {

      if( !$form.hasClass('is-ajax-submit') ) {
        return true;
      }
      $form.one('submit', e => {
        e.preventDefault();
      })

      $form.acfFrontendForm('doAjaxSubmit');

    });

  }

  getInstance( $form ) {
    return $form.data('RHFrontendForm');
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
      $(document).trigger('rh/acf-form-resized');
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

    $(document).trigger('rh/acf-form-resized');
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
