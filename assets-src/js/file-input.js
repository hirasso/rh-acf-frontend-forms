
const $ = window.jQuery;

import feather from 'feather-icons';

export default class FileInput {

  constructor( acfField ) {
    // vars
    this.acfField = acfField;
    this.$el = acfField.$el;

    this.$input = this.$el.find('input[type="file"]');
    this.$clear = this.$el.find('[data-name="remove"]');
    this.$clear.html(feather.icons['x-circle'].toSvg());

    this.$uploader = this.$el.find('.acf-file-uploader');
    this.$instructions = this.$el.find('.instructions');
    this.$instructions.appendTo( this.$uploader );
    this.dataSettings = this.$instructions.data('settings');

    this.setupEvents();

  }

  maybeGet( key, object, fallback ) {
    let value = (object || {})[key];
    if( typeof value === 'undefined' ) {
      value = fallback;
    }
    return value;
  }

  setupEvents() {

    if( $.inArray( 'dataTransfer', $.event.props ) === -1 ) {
      $.event.props.push('dataTransfer');
    }

    this.$uploader.on('dragover', (e) => {
      e.preventDefault();
      this.$uploader.addClass('is-dragover');
    });

    this.$uploader.on('dragleave', () => {
      this.$uploader.removeClass('is-dragover');
    });

    this.$uploader.on('drop', (e) => {
      e.preventDefault();
      this.$uploader.removeClass('is-dragover');
      this.$input.get(0).files = e.dataTransfer.files;
      this.$input.trigger('change');
      // this.parseFile( e.dataTransfer.files[0] );
    });

    this.$clear.unbind().click((e) => {
      e.preventDefault();
      e.stopPropagation();
      this.clear();
    })


    this.lastInputVal = this.$input.val();
    this.$input.change( e => this.onInputChange( this.$input ) );
  }

  clear( errors = false ) {
    this.acfField.removeAttachment();
    this.$input.val('');
    this.lastInputVal = this.$input.val();
    if( errors ) {
      this.acfField.showError( errors.join('<br>') );
    }
  }

  onInputChange( $input ) {

    if( this.lastInputVal === $input.val() ) {
      return;
    }
    this.lastInputVal = $input.val();
    if( $input.val() ) {
      this.parseFile( $input[0].files[0] );
    } else {
      this.clear();
    }
  }

  parseFile( file ) {
    let reader = new FileReader();
    reader.onload = (e) => {
      let errors = this.getErrors( file );
      if( !errors ) {
        this.acfField.removeError();
      } else {
        this.clear( errors );
      }
    }
    reader.readAsDataURL( file );
  }

  getErrors( file ) {
    let errors = [];

    // Check for max size
    let maxSize = this.maybeGet( 'max_size', this.dataSettings.restrictions, false )
    if( maxSize && file.size / 1000000 > maxSize.value ) {
      errors.push( maxSize.error );
    }

    // Check for mime type
    let mimeTypes = this.maybeGet( 'mime_types', this.dataSettings.restrictions, false )
    if( mimeTypes ) {
      let extension = file.name.split('.').pop().toLowerCase();  // file extension from input file
      let isValidMimeType = $.inArray( extension, mimeTypes.value ) > -1;  // is extension in acceptable types
      if( !isValidMimeType ) {
        errors.push( mimeTypes.error );
      }
    }

    return errors.length ? errors : false;
  }


}
