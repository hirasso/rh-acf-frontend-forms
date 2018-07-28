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
    $this->hooks();
  }
  /**
   * Setup action and filter hooks
   */
  function hooks() {

    // Always initializes the form_head in the frontend
    add_action( 'template_redirect', 'acf_form_head');

    // internal hooks
    add_action( 'wp_enqueue_scripts', array( $this, 'assets' ) );
    add_filter( 'acf/render_field/type=image', array( $this, 'prepare_image_drop' ) );
    add_action( 'acf/submit_form', array( $this, 'on_submit_form' ), 10, 2 );

    // always set acf validation to true, so that the form 
    // also works if the page is visited via ajax
    acf_localize_data( array( 'validation' => 1 ) );
  }

  /**
   * Enqueue and dequeue assets
   */
  function assets() {

    // enqueue plugin script
    wp_enqueue_script( 'rah-acf-frontend-forms', $this->asset_uri('assets/js/rah-acf-frontend-forms.js'), array('jquery'), null, true );

    // Removes the default ACF styles
    wp_deregister_style('acf-global');
    wp_deregister_style('acf-input');
    wp_deregister_style('acf-field-group');

  }

  /**
   * Gets asset URIs with file creation time as version query parameter
   * @param  [type] $path [description]
   * @return [type]       [description]
   */
  function asset_uri( $path ) {
    $file_uri = plugins_url( $path, __FILE__ );
    $file_path = plugin_dir_path( __FILE__ ) . $path;
    $file_version = filemtime( $file_path );
    return "$file_uri?v=$file_version";
  }

  /**
   * Prepares image fields for JS enhancements
   * @param  array $field
   * @return array $field
   */
  function prepare_image_drop( $field ) {
    if( is_admin() ) {
      return $field;
    }

    $instructions = array();
    if( !empty($field['mime_types']) ) {
      $instructions = array_merge( $instructions, explode(',', $field['mime_types']) );
    }
    if( !empty($field['max_size']) ) {
      $instructions[] = "max <span class='max-size'>{$field['max_size']}</span> MB";
    }
    ob_start(); ?>
    
    <div class="instructions">
      <div class="instructions__title"><?= $field['label'] ?></div>
      <div class="instructions__body"><?= implode(', ', $instructions) ?></div>
    </div>

    <?php echo ob_get_clean(); //$field['instructions'] = ob_get_clean();
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
}
new RahAcfFrontendForms();














