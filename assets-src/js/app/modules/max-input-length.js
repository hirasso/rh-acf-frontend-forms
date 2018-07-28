

export default class MaxInputLength {
  
  constructor( $el ) {

    let $info = $el.find('.maxlength-info');
    let $remainingCount = $el.find('.remaining-count');
    let max = parseInt( $remainingCount.text(), 10 );
    let $input = $el.find('.acf-input').find('textarea');
    $input.on('change cut paste drop keyup', (e) => {
      let value = $input.val();
      if ( value.length > max ) {
        $input.val( value.substring( 0, max ) );
        return false;
       } else {

        let remaining = max - value.length;
        if( remaining < 20 ) {
          $info.addClass('is-warning');
        } else {
          $info.removeClass('is-warning');
        }
        $remainingCount.text( remaining );
      }
    });

  }

}
