<?php
/**
 * Plugin Name: RAH ACF Frontend Forms
 * Version: 1.0
 * Author: Rasso Hilber
 * Description: Frontend forms for Advanced Custom Fields
 * Author URI: https://rassohilber.com
**/

require 'vendor/plugin-update-checker/plugin-update-checker.php';
$MyUpdateChecker = \Puc_v4_Factory::buildUpdateChecker(
  'https://rassohilber.com/wp-updates/?action=get_metadata&slug=rah-acf-frontend-forms', //Metadata URL.
  __FILE__, //Full path to the main plugin file.
  'rah-acf-frontend-forms' //Plugin slug. Usually it's the same as the name of the directory.
);

class RahAcfFrontendForms {

  function __construct() {
    // setup hooks
    $this->hooks();
    // always set acf validation to true, so that the form 
    // also works if the page is loaded via AJAX
    acf_localize_data( array( 'validation' => 1 ) );
  }
  /**
   * Setup action and filter hooks
   */
  function hooks() {

    // Always initializes the form_head in the frontend
    add_action( 'template_redirect', 'acf_form_head');

    // internal hooks
    add_action( 'wp_enqueue_scripts', array( $this, 'assets' ), 100 );
    add_filter( 'acf/prepare_field/type=image', array( $this, 'prepare_image_field' ) );
    add_filter( 'acf/validate_value', array( $this, 'validate_value' ), 9, 3 );
    add_filter( 'acf/render_field/type=image', array( $this, 'render_image_field' ) );
    add_filter( 'acf/render_field/type=text', array( $this, 'render_max_length' ) );
    add_filter( 'acf/render_field/type=textarea', array( $this, 'render_max_length' ) );
    add_action( 'acf/submit_form', array( $this, 'on_submit_form' ), 10, 2 );

  }

  /**
   * Enqueue and dequeue assets
   */
  function assets() {

    // enqueue plugin script
    wp_enqueue_script( 'rah-acf-frontend-forms', $this->asset_uri('assets/js/rah-acf-frontend-forms.js'), array('jquery'), null, true );

    // enqueue plugin styles
    wp_enqueue_style( 'rah-acf-frontend-forms', $this->asset_uri('assets/css/rah-acf-frontend-forms.css'), array(), 'all');

    // Removes the default ACF styles
    wp_deregister_style('acf-global');
    wp_deregister_style('acf-input');
    wp_deregister_style('acf-field-group');

  }

  /**
   * Gets asset URIs with file creation time as version query parameter
   * @param  string $path The path of the file, relative to the plugin's directory
   * @return string $path 
   */
  function asset_uri( $path ) {
    $file_uri = plugins_url( $path, __FILE__ );
    $file_path = plugin_dir_path( __FILE__ ) . $path;
    $file_version = filemtime( $file_path );
    return "$file_uri?v=$file_version";
  }

  
  /**
   * Prepares image fields
   * @param  array $field
   * @return array $field
   */
  function prepare_image_field( $field ) {
    $field['preview_size'] = 'large';
    return $field;
  }

  /**
   * Renders image field instructions
   * @param  array $field
   * @return array $field
   */
  function render_image_field( $field ) {
    if( is_admin() ) {
      return $field;
    }
    $settings = (object) array(
      'restrictions' => array()
    );
    $hints = array();

    $mime_types = acf_maybe_get( $field, 'mime_types', '' );
    $max_size = acf_maybe_get( $field, 'max_size', null );

    if( $mime_types ) {
      $mime_types = explode( ',', $mime_types );
      $glued_mime_types = $this->glue_last_two( $mime_types );
      $settings->restrictions['mime_types'] = array(
        'value' => $mime_types,
        'error' => sprintf(__('File type must be %s.', 'acf'), implode(', ', $glued_mime_types) ),
      );
      $hints[] = implode( ', ', $glued_mime_types );
    }
    
    if( $max_size ) {
      $settings->restrictions['max_size'] = array(
        'value' => $max_size,
        'error' => sprintf(__('File size must must not exceed %s.', 'acf'), acf_format_filesize($max_size) ),
      );
      $hints[] = 'max ' . acf_format_filesize($max_size);
    }
    
    ob_start(); ?>
    
    <div class="instructions" data-settings='<?= json_encode($settings) ?>'>
      <div class="instructions__title"><?= $field['label'] ?></div>
      <div class="instructions__body"><?= implode(', ', $hints) ?></div>
    </div>

    <?php echo ob_get_clean();
    return $field;
  }

  function glue_last_two( $array ) {
    // glue together last 2 types
    if( count($array) > 1 ) {
      
      $last1 = array_pop($array);
      $last2 = array_pop($array);
      
      $array[] = $last2 . ' ' . __('or', 'acf') . ' ' . $last1;
      
    }
    return $array;
  }

  function get_mime_types_error_message( $mime_types ) {
    // glue together last 2 types
    if( count($mime_types) > 1 ) {
      
      $last1 = array_pop($mime_types);
      $last2 = array_pop($mime_types);
      
      $mime_types[] = $last2 . ' ' . __('or', 'acf') . ' ' . $last1;
      
    }
    return sprintf(__('File type must be %s.', 'acf'), implode(', ', $mime_types) );
  }

  function get_max_size_error_message( ) {
    return 'test 123';
  }


  /**
   * Checks if the page is called via ajax, even if not in admin-ajax.php
   */
  function is_ajax_call() {
    return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
  }
  /**
   * Runs after form submit
   */
  function on_submit_form( $form, $post_id ) {
    $success = apply_filters("rah/acf_form_success", true, $post_id );
    $success = apply_filters("rah/acf_form_success/id={$form['id']}", true, $post_id );
    
    $this->send_ajax_submit_response( $form, $success );
  }
  /**
   * Send the response 
   */
  function send_ajax_submit_response( $form, $success ) {
    $custom_return = acf_maybe_get( $form, 'return', '' );
    if( $custom_return || !$this->is_ajax_call() ) {
      return;
    }
    $error_message = __('Something went wrong, please reload the page and try again', 'rah-acf-frontend-forms');
    
    $error_message = apply_filters("rah/acf_form_error_message", $error_message );
    $error_message = apply_filters("rah/acf_form_error_message/id={$form['id']}", $error_message );

    if( $success ) {
      wp_send_json_success( array('message' => $form['updated_message']) );
    } else {
      wp_send_json_error( array( 'message' => $submit_error_message ) );
    }
  }

  /**
   * Prepare text fields for max chars info
   * @param  array $field
   * @return array $field
   */
  function render_max_length( $field ) {

    if( !$field['maxlength'] || is_admin() ) {
      return;
    }
    ob_start(); ?>
    <div class="maxlength-info" data-maxlength="<?= $field['maxlength'] ?>">
      <span class="remaining-count"></span> characters remaining
    </div>
    <?php echo ob_get_clean();

  }

  function validate_value( $valid, $value, $field ) {
    if( !$field['required'] || $valid ) {
      return $valid;
    }
    $message = __('Please fill out this field');
    switch( $field['type'] ) {
      case 'radio':
      $message = __('Please select an option');
      break;
      case 'image':
      $message = __('Please add an image');
      break;
    }
    
    return $message;
  }
}
new RahAcfFrontendForms();














