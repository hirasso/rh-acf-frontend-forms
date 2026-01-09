<?php 

namespace RH\ACFF;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class ACFF_Permissions {

  private $prefix;
  private $hook_allowed_fields = 'rh/acff/allowed-fields';

  public function __construct() {

    $this->prefix = ACFF()->get_prefix();
    
    add_filter('acf/settings/capability', [$this, 'acf_setting_capability']);
    add_filter('acf/settings/show_admin', [$this, 'acf_setting_show_admin'] );
    add_filter('acf/get_field_types', [$this, 'restrict_field_types']);
    add_action('admin_init', [$this, 'grant_frontend_form_cap_to_admins']);
    add_filter('admin_body_class', [$this, 'admin_body_class']);
    
    add_action('acf/render_field_group_settings', [$this, 'render_field_group_settings']);
    add_action('acf/field_group/admin_head', [$this, 'remove_meta_boxes'], 999, 2);
    add_action('admin_menu', [$this, 'remove_acf_submenu_pages'], 999);
    add_action('current_screen', [$this, 'check_current_screen']);
    add_filter('page_row_actions', [$this, 'row_actions'], 10, 2);
    // Disabled: fires too late (after meta caps have been mapped already)
    // add_filter('user_has_cap', [$this, 'user_has_cap'], 10, 3);
    add_filter('map_meta_cap', [$this, 'map_meta_cap'], 10, 4 );
    add_filter('register_post_type_args', [$this, 'register_post_type_args'], 999, 2);
    
    add_filter('bulk_actions-edit-acf-field-group', [$this, 'restrict_bulk_actions'], 20, 1);
    add_action('acf/init', [$this, 'add_settings_page_fields']);

    add_action("acf/prepare_field/name={$this->prefix}_allowed_fields", [$this, 'prepare_field_allowed_fields']);
    add_action("acf/render_field/name={$this->prefix}_allowed_fields", [$this, 'render_field_allowed_fields']);

    add_filter('acf/settings/save_json', [$this, 'acf_save_json'] );

  }

  /**
   * Adds an admin body class with info about acf field group capabilities
   *
   * @param [string] $class
   * @return string
   */
  public function admin_body_class($class) {
    global $pagenow;
    $screen = get_current_screen();
    if( $pagenow !== 'post.php' || $screen->id !== 'acf-field-group' ) {
      return $class;
    }
    if( ACFF()->is_frontend_form( acf_maybe_get_GET('post') ) ) {
      $class .= ' is-edit-acf-frontend-form';
    }
    if( ACFF()->is_super_admin() ) {
      $class .= ' is-acf-super-admin';
    } else {
      $class .= ' is-not-acf-super-admin';
    }
    return $class;
  }

  /**
   * Gets a list of fields that are allowed for frontend forms
   *
   * @return array
   */
  private function get_allowed_frontend_fields() {
    $allowed = (array) get_field("{$this->prefix}_allowed_fields", $this->get_settings_page_id());
    $allowed = apply_filters($this->hook_allowed_fields, $allowed);
    return $allowed;
  }

  /**
   * Add settings page for frontend forms
   *
   * @return void
   */
  public function add_settings_page_fields() {
    $settings_page = ACFF()->get_settings_page_info();

    acf_add_local_field(array(
      'key' => "field_{$this->prefix}_allowed_fields",
      'label' => 'Allowed fields for non-admins',
      'name' => "{$this->prefix}_allowed_fields",
      'type' => 'checkbox',
      'choices' => $this->get_allowed_field_types_choices(),
      'parent' => "group_$settings_page->id"
    ));
    
  }

  /**
   * Get all ACF Field Types
   *
   * @return void
   */
  private function get_allowed_field_types_choices() {
    $choices = [];
    $never_allow = ['frontend_form'];
    $field_types = acf_get_field_types_info();
    foreach( $field_types as $key => $field ) {
      if( in_array($key, $never_allow) ) continue;
      
      $choices[$key] = "{$field['label']}";
    }
    return $choices;
  }

  /**
   * Prints a notice if fields are being filtered by theme
   *
   * @param [array] $field
   * @return void
   */
  public function prepare_field_allowed_fields( $field ) {
    if( !has_filter($this->hook_allowed_fields) ) {
      return $field;
    }
    // show allowed fields
    acf_render_field_wrap(array(
      'label'			=> __('Allowed fields for frontend forms'),
      'instructions' => "Remove the filter <em style='-webkit-user-select: all; user-select:all;'>$this->hook_allowed_fields</em> from your theme to edit fields manually.",
      'type'			=> 'textarea',
      'readonly'  => true,
      'rows'      => 2,
      'value'			=> implode(', ', $this->get_allowed_frontend_fields()),
    ));

    $this->update_settings_field('allowed_fields', $this->get_allowed_frontend_fields());

    return false;
  }

  /**
   * Gets the settings page ID
   *
   * @return void
   */
  private function get_settings_page_id() {
    return "{$this->prefix}_settings";
  }

  /**
   * Get a settings field
   *
   * @param [type] $name
   * @param [type] $format
   * @param [type] $fallback
   * @return void
   */
  private function get_settings_field( $name, $format, $fallback = null ) {
    $value = get_field("{$this->prefix}_{$name}", $this->get_settings_page_id(), $format);
    return $value ? $value : $fallback;
  }

  /**
   * Update a settings field
   *
   * @param [type] $name
   * @param [type] $value
   * @return void
   */
  private function update_settings_field($name, $value) {
    return update_field("{$this->prefix}_{$name}", $value, $this->get_settings_page_id());
  }

  /**
   * Renders a code box with filter documentation
   *
   * @param [array] $field
   * @return void
   */
  public function render_field_allowed_fields( $field ) {
    acf_render_field_wrap(array(
      'label'			=> __('Code Snippet'),
      'instructions'	=> 'Put this code snippet in your theme to filter allowed fields programatically',
      'type'			=> 'textarea',
      'readonly'  => true,
      'rows'      => 2,
      'value'			=> $this->get_code_snippet_allowed_fields(),
    ));
  }

  /**
   * Gets the code snippet for the allowed fields filter
   *
   * @return string
   */
  private function get_code_snippet_allowed_fields() {
    $value = (array) $this->get_settings_field('allowed_fields', false, []);
    $allowed_fields = implode("', \n    '", $value);
    $snippet = "add_filter('$this->hook_allowed_fields', function(\$fields) {";
    $snippet .= "\n  return [\n    '$allowed_fields',\n  ];";
    $snippet .= "\n});";
    return $snippet;
  }

  /**
   * Restricts field types for non-admins
   *
   * @param [array] $groups
   * @return array $groups
   */
  public function restrict_field_types( $groups ) {

    if( !ACFF()->is_frontend_form( acf_maybe_get_GET( 'post') ) ) {
      return $groups;
    }
    $allowed = $this->get_allowed_frontend_fields();
    foreach( $groups as $group_name => $group ) {
      // https://stackoverflow.com/questions/4260086/php-how-to-use-array-filter-to-filter-array-keys/4260168#4260168
      $group = array_intersect_key($group, array_flip($allowed));
      if( count($group) ) {
        $groups[$group_name] = $group;
      } else {
        unset( $groups[$group_name] );
      }
    }
    return $groups;
  }

  
  /**
   * Filter ACF Global Setting 'capability'
   *
   * @param [string] $setting
   * @return $setting
   */
  public function acf_setting_capability($setting) {
    $cap = $this->get_frontend_forms_cap();
    return $cap;
  }

  /**
   * Filter ACF Global setting 'show_admin'
   *
   * @param [string] $setting
   * @return $setting
   */
  public function acf_setting_show_admin( $setting ) {
    if( !ACFF()->is_super_admin() ) {
      return false;
    }
    return $setting;
  }

  /**
   * Returns the minimum capability required to edit frontend forms
   *
   * @return string cap
   */
  private function get_frontend_forms_cap() {
    return apply_filters('rh/acff/settings/capability', 'manage_options');
  }

  /**
   * Grant frontend form capability to roles
   *
   * @return void
   */
  public function grant_frontend_form_cap_to_admins() {
    $cap = $this->get_frontend_forms_cap();
    $admin = get_role('administrator');
    if( !array_key_exists( $cap, $admin->capabilities ) ) {
      $admin->add_cap( $cap );
    }
  }

  

  /**
   * Removes acf field group edit bulk actions for non-admins
   *
   * @param [array] $actions
   * @return array
   */
  public function restrict_bulk_actions( $actions ) {
    if( !ACFF()->is_super_admin() ) {
      return [];
    }
    return $actions;
  }

  /**
  * Filters a user's capabilities depending on specific context and/or privilege.
  *
  * Inspired by https://wordpress.stackexchange.com/questions/4479/editor-can-create-any-new-user-except-administrator
  *
  * @since 2.8.0
  *
  * @param string[] $user_caps    Array of the user's capabilities.
  * @param string   $cap          Capability name.
  * @param int      $user_id      The user ID.
  * @param array    $args         Adds the context to the cap. Typically the object ID.
  */
  public function map_meta_cap( $user_caps, $cap, $user_id, $args ) {
    
    $post = get_post($args[0] ?? false);
    
    if( !$post ) {
      return $user_caps;
    }
    
    if( $cap !== $this->get_frontend_forms_cap() || ACFF()->is_super_admin() ) {
      return $user_caps;
    }

    // deny access to acf field groups that aren't frontend forms
    if( get_post_type($post) === 'acf-field-group' && !ACFF()->is_frontend_form( $post ) ) {
      $user_caps[] = 'do_not_allow';
    }
    
    return $user_caps;
  }

  /**
   * Overwrites deletion capabilities for ACF field groups, to only allow admininstrators
   *
   * @param [array] $args
   * @param [string] $pt
   * @return array $args
   */
  public function register_post_type_args( $args, $pt ) {
    if( $pt !== 'acf-field-group' || ACFF()->is_super_admin() ) {
      return $args;
    }
    foreach( $args['labels'] as $key => $label ) {
      $args['labels'][$key] = str_replace(['Custom Field', 'Field Group'], 'Frontend Form', $label);
    }
    $super_cap = 'manage_options';
    $acff_cap = $this->get_frontend_forms_cap();
    // $args['capabilities']['edit_post'] = $acff_cap;
    // $args['capabilities']['edit_posts'] = $acff_cap;
    // $args['capabilities']['edit_others_posts'] = $acff_cap;
    $args['capabilities']['create_posts'] = $super_cap;
    $args['capabilities']['delete_post'] = $super_cap;
    $args['capabilities']['delete_posts'] = $super_cap;
    
    $args['show_in_menu'] = true;
    $args['menu_icon'] = 'dashicons-welcome-widgets-menus';
    $args['menu_position'] = 1000;
    
    // pre_dump( $args );
    return $args;
  }

  /*
  *  admin_menu
  *
  *  This function will replace the ACF admin menu item with a simpler one for non-admins
  *
  *  @type	action (admin_menu)
  *
  *  @param	n/a
  *  @return	n/a
  */
  public function remove_acf_submenu_pages() {
    $slug = 'edit.php?post_type=acf-field-group';
    $cap = acf_get_setting('capability');
    if( ACFF()->is_super_admin() ) {
      return;
    }
    // remove the default menu item
    // remove_menu_page($slug);
    // add a custom menu item with acff=1 appended, so that submenus won't be added
    // add_menu_page(__("Forms"), __("Forms"), $cap, "$slug&acff=1", false, 'dashicons-welcome-widgets-menus');
  }

  public function row_actions( $actions, $post ) {
    if( ACFF()->is_super_admin() || $post->post_type !== 'acf-field-group' ) {
      return $actions;
    }
    foreach( $actions as $key => $value ) {
      if( $key !== 'edit' ) unset($actions[$key] );
    }
    return $actions;
  }

  /**
   * Restrict access to ACF submenu screens
   *
   * @return void
   */
  public function check_current_screen() {
    $screen = get_current_screen();
    if( !$screen || !in_array($screen->id, ['custom-fields_page_acf-tools', 'custom-fields_page_acf-tools']) ) {
      return;
    }
    $this->die_if_not_admin( 'Sorry, you are not allowed to access this page.' );
  }

  /**
   * Die if current user is not administrator
   *
   * @return void
   */
  private function die_if_not_admin( $message ) {
    if( ACFF()->is_super_admin() ) {
      return;
    }
    $args = [
      'back_link' => true
    ];
    wp_die(
      '<h1>' . __( 'You need a higher level of permission.' ) . '</h1>' .
      '<p>' . __( $message ) . '</p>',
      __('Permission Denied'), 
      $args
    );
  }

  /**
   * Hide field group settings for non-administrators
   *
   * @return void
   */
  public function remove_meta_boxes() {
    
    if( !ACFF()->is_super_admin() ) {
      remove_meta_box('acf-field-group-locations', 'acf-field-group', 'normal');
      remove_meta_box('acf-field-group-options', 'acf-field-group', 'normal');
    }
  }

  
  /**
   * Field Group setting
   *
   * @param [array] $field_group
   * @return void
   */
  public function render_field_group_settings( $field_group ) {
    // if( !ACFF()->is_super_admin() ) {
    //   return;
    // }
    
    $is_frontend_form = !empty($field_group['acff_is_frontend_form']) ? $field_group['acff_is_frontend_form'] : false;
    
    acf_render_field_wrap(array(
      'id'       => 'acff_acff_is_frontend_form',
      'label'			=> __('Frontend Form', 'acf'),
      'instructions'	=> 'Allow as frontend form?',
      'type'			=> 'true_false',
      'name'			=> 'acff_is_frontend_form',
      'prefix'		=> 'acf_field_group',
      'value'			=> $is_frontend_form,
      'ui'			=> 1,
    ));

    $post_type = !empty($field_group['acff_for_post_type']) ? $field_group['acff_for_post_type'] : false;
    acf_render_field_wrap(array(
      'label'			=> __('Frontend Form for', 'acf'),
      'instructions'	=> 'Which post type should this frontend form create?',
      'type'			=> 'select',
      'name'			=> 'acff_for_post_type',
      'prefix'		=> 'acf_field_group',
      'value'			=> $post_type,
      'ui'			  => 0,
      'choices'   => $this->get_post_type_select_choices(),
      'conditional_logic' => [
        'field'     => 'acff_is_frontend_form',
        'operator'  => '==',
        'value'     => '1'
      ]
    ));
  }

  private function get_post_type_select_choices() {
    $post_types = get_post_types([], 'objects');
    $choices = [];
    foreach( $post_types as $pt => $pt_object ) {
      $choices[$pt] = "{$pt_object->labels->name} ({$pt})";
    }
    return $choices;
  }
  

  /**
   * Don't save frontend form field groups 
   *
   * @param [string] $path
   * @return mixed
   */
  function acf_save_json( $path ) {
    
    $field_group = (array) acf_maybe_get_POST( 'acf_field_group' );
    // bail early if no field group in $_POST
    if( empty($field_group) ) return $path;

    // Bail early if this is no frontend form
    $is_frontend_form = (bool) acf_maybe_get( $field_group, 'acff_is_frontend_form' );
    if( !$is_frontend_form ) return $path;
    
    // delete previously saved frontend form json
    $key = acf_maybe_get( $field_group, 'key' );
    if( $key ) {
      remove_filter('acf/settings/save_json', [$this, 'acf_save_json']);
      acf_delete_json_field_group( $key );
      add_filter('acf/settings/save_json', [$this, 'acf_save_json']);
    }
    // return nothing, the field group won't be saved
    return false;
  }

}
