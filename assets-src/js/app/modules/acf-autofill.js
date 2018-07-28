
global.jQuery = $ = window.jQuery;

import autosize from 'autosize';

window.acfAutoFill = function( id = 0 ) {

  let $forms = $('.acf-form');
  
  if( !$forms.length ) {
    return;
  }

  let values = window.acfAutofillValues;
  if( typeof values !== 'object' ) {
    console.warn('window.acfAutofillValues is not defined');
    return;
  }
  values = values[id];

  let scrollTop = $(document).scrollTop();

  $forms.each((i, el) => {
    let $form = $(el);
    $form.addClass('is-autofilled');

    $form.find('.fill-password-suggestion').click();
    fillFields( $form, values );
    $form.trigger('autofilled');
  });

  autosize.update($('textarea'));

  $('html,body').animate({
    scrollTop: scrollTop
  }, 0);
 
  function leadingZero( number ) {
    if( number < 10 ) {
      return '0'+number;
    }
    return number;
  }
 
 
  function fillFields( $wrap, values ) {
    $.each( values, (key, value) => {
      let $fields = $wrap.find(`.acf-field[data-name="${key}"]`);


      if( !$fields.length ) {
        return true;
      }
      
      $fields.each((i, el) => {
        let $field = $(el);

        if( typeof value === 'object' && !(value instanceof Date) ) {
          
          $.each( value, (key, val) => {

            if( typeof key === 'number') {
              if( key > 0 ) {
                $field.find('[data-event="add-row"]:last').click();
              }
              let $fields = $field.find('.acf-fields').eq(key);
              fillFields( $fields, val )
            } else {
              fillFields( $field, val )
            }
          })
 
        } else {
 
          let $inputs = $field.find('input, select, checkbox, textarea');
          fillField( $inputs, value );
 
        }
 
      });
 
    })
  }
 
  function fillField( $inputs, value ) {

    $inputs.each((i, el) => {
      let $input = $(el);
      let type = $input.attr('type');
 
      if( type === 'hidden'
          || $input.hasClass('select2-search__field')
          || type === 'file'
          || $input.parents('.acf-clone').length 
        ) {
         
        return true;
      }
 
      if( typeof $input.data('select2') !== 'undefined' ) {
        $input.select2("trigger", "select", {
            data: value
        }).trigger('change');
        return true;
      }

      switch( type ) {
 
        case 'checkbox':
        $input.prop('checked', value).trigger('change');
        return true;
        break;
        case 'true_false':
        $input.prop('checked', value).trigger('change');
        return true;
        break;
 
      }
      
      if( $input.hasClass('hasDatepicker') ) {
        $input.datepicker( "setDate", value ).trigger('change');
        return true;
      }
 
      // default
      $input.val( value ).trigger('change');
      
    });
  }
}
