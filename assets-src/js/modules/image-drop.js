
global.jQuery = $ = window.jQuery;

import feather from 'feather-icons';

export default class ImageDrop {
  
  constructor( acfField ) {
    // vars
    this.acfField = acfField;

    this.$el = acfField.$el;
    
    this.$input = this.$el.find('input[type="file"]');
    this.$imagePreview = this.$el.find('.image-wrap');
    this.$image = this.$imagePreview.find('img');
    this.$clear = this.$el.find('[data-name="remove"]');
    this.$clear.html(feather.icons['x-circle'].toSvg());
    
    this.$imageUploader = this.$el.find('.acf-image-uploader');
    this.$instructions = this.$el.find('.instructions');
    this.$instructions.appendTo( this.$imageUploader );
    this.dataSettings = this.$instructions.data('settings');
    this.maxFileSize = this.maybeGet( 'max_size', this.dataSettings, false );
    this.mimeTypes = this.maybeGet( 'mime_types', this.dataSettings, false );

    this.$el.addClass('image-drop');
    this.setupEvents();
    this.renderImage( this.$image.attr('src') );
    
  }

  maybeGet( key, object, fallback ) {
    let value = object[key];
    if( typeof value === 'undefined' ) {
      value = fallback;
    }
    return value;
  }

  setupEvents() {
    
    if( $.inArray( 'dataTransfer', $.event.props ) === -1 ) {
      $.event.props.push('dataTransfer');
    }

    this.$imageUploader.on('dragover', (e) => {
      e.preventDefault();
      this.$imageUploader.addClass('is-dragover');
    });

    this.$imageUploader.on('dragleave', () => {
      this.$imageUploader.removeClass('is-dragover');
    });

    this.$imageUploader.on('drop', (e) => {
      e.preventDefault();
      this.$imageUploader.removeClass('is-dragover');
      this.$input.get(0).files = e.dataTransfer.files;
      this.$input.trigger('change');
      // this.parseFile( e.dataTransfer.files[0] );
    });

    this.$clear.unbind().click((e) => {
      e.preventDefault();
      e.stopPropagation();
      this.clear();
    })

    this.currentImageSrc = this.$image.attr('src');

    this.lastInputVal = this.$input.val();
    this.$input.change( e => this.onInputChange( this.$input ) );
  }
  

  renderImage( src ) {

    if( typeof src === 'undefined' || !src.length ) {
      return;
    }

    let img = new Image;
    img.onload = () => {
      let ratio = img.height / img.width;
      if( ratio < 0.5 ) {
        this.clear( [`The image can't be more than twice the width of it's height`] );
        return;
      } else if( ratio > 2 ) {
        this.clear( [`The image can't be more than twice the height of it's width`] );
        return;
      }
      let paddingBottom = Math.floor( ratio * 100 );
      this.$imageUploader.css({
        paddingBottom: `${paddingBottom}%`,
      })

      this.$image.attr('src', src);
      this.$imageUploader.addClass('has-value');

      $(document).trigger('rah/acf-form-resized');

    }
    img.src = src;
  }

  clear( errors = false ) {
    this.acfField.removeAttachment();
    this.$input.val('');
    this.lastInputVal = this.$input.val();
    this.$imageUploader.css({ paddingBottom: '' });
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
        this.renderImage( e.target.result );
        this.acfField.removeError();
      } else {
        this.clear( errors );
        this.renderImage( this.currentImageSrc );
      }
    }
    reader.readAsDataURL( file );
  }

  getErrors( file ) {
    let errors = [];
    if( !this.validateMaxFileSize( file ) ) {
      errors.push( `The image must be smaller than ${this.maxFileSize} MB` );
    }
    if( !this.validateMimeType( file ) ) {
      if( this.mimeTypes.length < 2 ) {
        errors.push( `File type must be ${this.mimeTypes.join(', ')}` );
      } else {
        errors.push( `File type must be ${this.mimeTypes.slice(0, -1).join(', ')} or ${this.mimeTypes.slice(-1)}` );
      }
      
    }
    return errors.length ? errors : false;
  }

  validateMaxFileSize( file ) {
    return !this.maxFileSize || file.size / 1000000 <= this.maxFileSize;
  }

  validateMimeType( file ) {
    if( !this.mimeTypes.length ) {
      return true;
    }
    let extension = file.name.split('.').pop().toLowerCase();  // file extension from input file
    let isValidMimeType = $.inArray( extension, this.mimeTypes ) > -1;  // is extension in acceptable types
    return isValidMimeType;
  }
  
}
