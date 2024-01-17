
const $ = window.jQuery;

export default class MaxLength {

  constructor( field ) {
    let $el = field.$el;
    this.$info = $el.find('.maxlength-info');
    this.max = parseInt( this.$info.attr('data-maxlength'), 10 );
    this.$remainingCount = $el.find('.remaining-count');
    this.$input = field.$input();
    this.$input.on( 'input maxlength:update', () => this.update() );
    this.update();
  }

  update() {
    let value = this.$input.val();
    let remaining = this.max - value.length;
    remaining = Math.max( 0, remaining );
    if( remaining < 20 ) {
      this.$info.addClass('is-warning');
    } else {
      this.$info.removeClass('is-warning');
    }
    this.$remainingCount.text( remaining );
    this.$input.val( value.substring( 0, this.max ) );
  }

}
