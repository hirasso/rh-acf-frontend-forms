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
    add_action('acf/render_field_settings', [$this, 'render_field_settings'], 11 );

    add_filter('acf/prepare_field', [$this, 'prepare_field']);
    add_filter('acf/format_value', [$this, 'format_value'], 10, 3);

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
      wp_send_json_success([
        'message' => $form['updated_message'],
        'redirect' => $form['return'] ?? ''
      ]);
    } else {
      wp_send_json_error(['message' => $error_message]);
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


  /**
   * Validate values of a text field
   *
   * @param [type] $valid
   * @param [type] $value
   * @param [type] $field
   * @return void
   */
  function validate_value( $valid, $value, $field ) {
    if( !$this->is_frontend_form_field($field) ) {
      return $valid;
    }
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

  }


  /**
   * Checks if a post is an ACF field group for submissions
   *
   * @param [type] $post
   * @return boolean
   */
  public function is_frontend_form( $post_id = 0 ) {
    $field_group = acf_get_field_group( $post_id );
    $is_frontend_form = $field_group['acff_is_frontend_form'] ?? false;
    return $is_frontend_form;
  }

  /**
   * Checks if a field is part of a frontend form
   *
   * @param [type] $field
   * @return boolean
   */
  private function is_frontend_form_field( $field ) {
    $ancestors = get_post_ancestors($field['ID']);
    $root = count($ancestors)-1;
    $field_group_id = $ancestors[$root] ?? false;
    if( !$field_group_id ) {
      return false;
    }
    return $this->is_frontend_form( $field_group_id );
  }

  /**
   * Prepare fields for frontend forms
   *
   * @param [type] $field
   * @return void
   */
  public function prepare_field( $field ) {
    if( is_admin() && !$this->is_frontend_form_field($field) ) {
      return $field;
    }
    if( in_array($field['type'], ['repeater', 'group']) ) {
      $field['layout'] = 'block';
    }
    if( in_array($field['type'], ['textarea']) ) {
      $field['rows'] = '2';
    }
    if( in_array($field['type'], ['file']) ) {
      $field['return_format'] = 'id';
    }
    if( in_array( $field['type'], ['true_false'] ) ) {
      if( $rich_text_message = $field['rich_text_message'] ?? false ) {
        $field['message'] = strip_tags( apply_filters('the_content', $rich_text_message), '<a>' );
      }
    }
    if( !empty($field['value']) ) {
      $field['wrapper']['class'] .= ' has-value';
    }
    return $field;
  }

  /**
   * Format some values
   *
   * @param [type] $value
   * @param [type] $post_id
   * @param [type] $field
   * @return void
   */
  public function format_value( $value, $post_id, $field ) {
    if( !$value || !$this->is_frontend_form_field($field) ) {
      return $value;
    }
    if( in_array($field['type'], ['file'] ) ) {
      $file_id = get_field($field['name'], $post_id, false);
      $file_url = wp_get_attachment_url($file_id);
      $value = "<a href='$file_url'>$file_url</a>";
    }
    
    return $value;
  }

  /**
   * Renders additional field settings
   *
   * @return void
   */
  public function render_field_settings( $field ) {
    switch( $field['type'] ) {
     case 'true_false':
        acf_render_field_setting($field, array(
          'label'			=> __('Message','acf'),
          'instructions'	=> "Displays text alongside the checkbox",
          'type'			=> 'wysiwyg',
          'name'			=> 'rich_text_message',
          'class'			=> 'field-rich-text-message',
          'tabs'			=> 'text',
          'media_upload' 	=> 0,
        ), true);
        break;
    }
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