<?php
/**
 * Plugin Name: RAH ACF Frontend Forms
 * Version: 1.0
 * Author: Rasso Hilber
 * Description: Frontend forms for Advanced Custom Fields
 * Author URI: https://rassohilber.com
**/

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
    $file_restrictions = array();
    $mime_types = array();

    if( !empty($field['mime_types']) ) {
      $mime_types = explode(',', $field['mime_types']);
      // glue together last 2 types
      if( count($mime_types) > 1 ) {
        
        $last1 = array_pop($mime_types);
        $last2 = array_pop($mime_types);
        
        $mime_types[] = $last2 . ' ' . __('or', 'acf') . ' ' . $last1;
        
      }
      $file_restrictions = array_merge( $file_restrictions, $mime_types );
    }
    if( !empty($field['max_size']) ) {
      $file_restrictions[] = "<span class='max-size-wrap'>max <span class='max-size'>{$field['max_size']}</span> MB</span>";
    }
    $data_settings = array(
      'mime_types' => $mime_types,
      'max_size' => $field['max_size']
    );
    ob_start(); ?>
    
    <div class="instructions" data-settings='<?= json_encode($data_settings) ?>'>
      <div class="instructions__title"><?= __('Select or drop image') ?></div>
      <div class="instructions__body"><?= implode(', ', $file_restrictions) ?></div>
    </div>

    <?php echo ob_get_clean();
    return $field;
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














