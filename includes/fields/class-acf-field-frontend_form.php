<?php

namespace RH\ACFF;

class acf_field_frontend_form extends \acf_field_select {
	
	
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
		$this->name = 'frontend_form';
		$this->label = __("Frontend Form");
		$this->category = 'relational';
		$this->defaults = array(
      'multiple' 		=> 0,
      'allow_null' 	=> 1,
      'choices'		=> [],
      'default_value'	=> '',
      'ui'			=> 0,
      'ajax'			=> 0,
      'placeholder'	=> 'Select',
      'return_format'	=> 'value'
    );
		
	}

  function render_field( $field ) {
    $field['choices'] = $this->get_choices();
    parent::render_field( $field );
  }

  function render_field_settings( $field ) {
    // allow_null
    acf_render_field_setting( $field, array(
      'label'			=> __('Allow Null?','acf'),
      'instructions'	=> '',
      'name'			=> 'allow_null',
      'type'			=> 'true_false',
      'ui'			=> 1,
    ));
  }
	
  function get_choices() {
    
    $choices = [];
    foreach( ACFF()->get_frontend_forms_ids() as $id ) {
      $choices[$id] = get_the_title($id);
    }
    return $choices;
  }

  function load_value( $value, $post_id, $field ) {
    // return
    return intval( $value );
  }
	
}


// initialize
acf_register_field_type( ns('acf_field_frontend_form') );
