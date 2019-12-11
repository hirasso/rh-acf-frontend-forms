<?php

if( ! class_exists('acf_field_form_review') ) :

class acf_field_form_review extends acf_field_message {
	
	
	/*
	*  __construct
	*
	*  This function will setup the field type data
	*
	*  @type	function
	*  @date	5/03/2014
	*  @since	5.0.0
	*
	*  @param	n/a
	*  @return	n/a
	*/
	
	function initialize() {
		
		// vars
		$this->name = 'form_review';
		$this->label = __("Form Review");
		$this->category = 'layout';
		$this->defaults = array(
      'message'		=> '',
      'esc_html'		=> 0,
      'new_lines'		=> 'wpautop',
    );
		
	}

  function render_field_settings( $field ) {
    
  }

  function render_field( $field ) {
    // hook into 'acf/render_field/type=form_review' from your theme to display the review here.
  }

  function prepare_field( $field ) {
    $field['label'] = false;
    return $field;
  }
	
}


// initialize
acf_register_field_type( 'acf_field_form_review' );

endif; // class_exists check

?>