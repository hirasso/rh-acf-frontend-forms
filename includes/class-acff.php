<?php 

namespace ACFF;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class ACFF {

  private $prefix;

  function __construct() {

    $this->prefix = get_prefix();

    // setup hooks
    $this->hooks();
    // always set acf validation to true, so that the form 
    // also works if the page is loaded via AJAX
    acf_localize_data( array( 'validation' => 1 ) );
    // register settings page
  }
  /**
   * Setup action and filter hooks
   */
  function hooks() {

    // Always initializes the form_head in the frontend
    add_action('template_redirect', 'acf_form_head');

    // internal hooks
    add_action('wp_enqueue_scripts', [$this, 'frontend_assets'], 100 );
    add_action('admin_enqueue_scripts', [$this, 'admin_styles'], 999);
    add_filter('acf/prepare_field/type=image', [$this, 'prepare_image_field'] );
    add_filter('acf/validate_value', [$this, 'validate_value'], 9, 3 );
    add_filter('acf/render_field/type=image', [$this, 'render_image_field'] );
    add_filter('acf/render_field/type=text', [$this, 'render_max_length_info'] );
    add_filter('acf/render_field/type=textarea', [$this, 'render_max_length_info'] );
    add_action('acf/submit_form', [$this, 'on_submit_form'], 10, 2 );

    add_action('acf/include_field_types', [$this, 'include_field_types']);

    add_filter('acf/prepare_field', [$this, 'prepare_field']);

    // add the settings page
    add_action('acf/init', [$this, 'add_settings_page']);

  }

  /**
   * Enqueue and dequeue assets
   */
  function frontend_assets() {

    // enqueue plugin script
    wp_enqueue_script( 'rh-acff', asset_uri('assets/js/acff.js'), array('jquery'), null, true );

    // enqueue plugin styles
    wp_enqueue_style( 'rh-acff', asset_uri('assets/css/acff.css'), array(), 'all');

    if( apply_filters('rh/acff/deregister-acf-styles', true ) ) {
      // Removes the default ACF styles
      wp_deregister_style('acf-global');
      wp_deregister_style('acf-input');
      wp_deregister_style('acf-field-group');
    }

  }

  /**
   * Enqueue Admin Styles
   *
   * @return void
   */
  public function admin_styles() {
    wp_enqueue_style( "rh-acff-admin", asset_uri('assets/css/acff-admin.css') );
  }

  
  /**
   * Prepares image fields
   * @param  array $field
   * @return array $field
   */
  function prepare_image_field( $field ) {
    if( is_admin() ) {
      return $field;
    }
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
    $success = apply_filters("rh/acf_form_success", true, $post_id );
    $success = apply_filters("rh/acf_form_success/id={$form['id']}", true, $post_id );
    
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
    $error_message = __('Something went wrong, please reload the page and try again', 'rh-acf-frontend-forms');
    
    $error_message = apply_filters("rh/acf_form_error_message", $error_message );
    $error_message = apply_filters("rh/acf_form_error_message/id={$form['id']}", $error_message );

    if( $success ) {
      wp_send_json_success( array('message' => $form['updated_message']) );
    } else {
      wp_send_json_error( array( 'message' => $error_message ) );
    }
  }

  /**
   * Prepare text fields for max chars info
   * @param  array $field
   * @return array $field
   */
  function render_max_length_info( $field ) {

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
    $message = apply_filters('rh/acf_error_message', $message);
    
    return $message;
  }

  function add_settings_page() {
    
    $settings_page = get_settings_page_info();

    acf_add_options_page([
      'page_title'    => __('Frontend Forms Settings'),
      'menu_title'    => __('ACFF Admin'),
      'menu_slug'     => $settings_page->slug,
      'capability'    => 'manage_options',
      'redirect'      => false,
      'post_id'       => $settings_page->id,
      'parent_slug'   => 'edit.php?post_type=acf-field-group',
    ]);

    $field_group_title = __('Frontend Form Settings');

    // hack to let us get around the acf-field-group #title check on submit
    $title_hack = '<div class="rh-acf-title-hack hidden" id="titlewrap"><input id="title" value="noop" readonly></input></div>';

    acf_add_local_field_group(array (
      'key' => "group_$settings_page->id",
      'title' => "$field_group_title $title_hack",
      'location' => array (
        array (
          array (
            'param' => 'options_page',
            'operator' => '==',
            'value' => $settings_page->slug,
          ),
        ),
      ),
    ));

    // It seems to not be possible to add field groups to acf-field-groups
    // acf_add_local_field_group(array (
    //   'key' => "group_acff_settings",
    //   'title' => 'ACFF',
    //   'location' => array (
    //     array (
    //       array (
    //         'param' => 'post_type',
    //         'operator' => '==',
    //         'value' => 'acf-field-group',
    //       ),
    //     ),
    //   ),
    // ));

  }

  /**
   * Adds 'has-value' to wrapper, if field has a value
   *
   * @param [type] $field
   * @return void
   */
  public function prepare_field( $field ) {
    $field_group_id = $field['parent'];
    $field_group = acf_get_field_group( $field_group_id );
    $is_frontend_form = $field_group['acff_is_frontend_form'] ?? false;
    if( !$is_frontend_form ) {
      return $field;
    }
    if( !empty($field['value']) ) {
      $field['wrapper']['class'] .= ' has-value';
    }
    return $field;
  }

  
  /**
   * Include 'Frontend Forrm' Field Type
   *
   * @return void
   */
  public function include_field_types() {
    acff_include("includes/fields/class-acf-field-frontend_form.php");
    acff_include("includes/fields/class-acf-field-form_review.php");
  }
}