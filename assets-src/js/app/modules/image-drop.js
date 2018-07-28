

export default class ImageDrop {
  
  constructor( $el ) {
    // vars
    this.$el = $el;
    this.$field = $el.parents('.acf-field');
    this.$fileInput = $el.find('input[type="file"]');
    this.$imagePreview = $el.find('.image-wrap');
    this.$image = this.$imagePreview.find('img');
    this.$clear = $el.find('[data-name="remove"]');
    this.maxFileSize = parseInt( $el.find('.max-size').text(), 10);

    this.$field.addClass('image-drop');

    this.setupEvents();
    this.showImagePreview( this.$image.attr('src') );
  }

  setupEvents() {

    this.$el.on('dragover', (e) => {
      e.preventDefault();
      this.$el.addClass('is-dragover');
    });

    this.$el.on('dragleave', () => {
      this.$el.removeClass('is-dragover');
    });

    this.$el.on('drop', (e) => {
      e.preventDefault();
      this.$el.removeClass('is-dragover');
      this.$fileInput.get(0).files = e.dataTransfer.files;
    });

    this.$clear.unbind().click((e) => {
      e.preventDefault();
      e.stopPropagation();
      this.clearFileInput();
    })

    this.$fileInput.change( e => this.onInputChange( e.target ) );
  }
  

  showImagePreview( src ) {

    if( typeof src === 'undefined' || !src.length ) {
      return;
    }

    let img = new Image;
    img.onload = () => {
      let ratio = img.height / img.width;
      if( ratio < 0.5 ) {
        this.clearFileInput( `The image can't be more than twice the width of it's height` );
        return;
      } else if( ratio > 2 ) {
        this.clearFileInput( `The image can't be more than twice the height of it's width` );
        return;
      }
      let paddingBottom = Math.floor( ratio * 100 );
      this.$el.css({
        paddingBottom: `${paddingBottom}%`,
      })
      this.$field.addClass('has-value');

      this.$image.attr('src', src);

    }
    img.src = src;
  }

  clearFileInput( message = false ) {
    this.$fileInput.val('').trigger('change');
    if( message ) {
      alert( message );
    }
  }

  onInputChange( input ) {

    if (input.files && input.files[0]) {

      let file = input.files[0];
      if( file.size / 1000000 > this.maxFileSize ) {
        this.clearFileInput( `The image must be smaller than ${this.maxFileSize}MB` );
        return;
      }

      let reader = new FileReader();
      reader.onload = (e) => {
        this.showImagePreview( e.target.result );
      }

      let fileTypes = ['jpg', 'jpeg', 'gif'];
      let extension = file.name.split('.').pop().toLowerCase();  //file extension from input file
      let isValidFileType = fileTypes.indexOf( extension ) > -1;  //is extension in acceptable types

      if( isValidFileType ) {
        reader.readAsDataURL( file );
      } else {
        this.clearFileInput( `Only JPGs or GIFs are allowed` );
        return;
      }
      
    } else {

      this.$field.removeClass('has-value');
      this.$image.removeAttr('src');
      this.$el.css({
        paddingBottom: '',
      })
    }
  }
  
}
