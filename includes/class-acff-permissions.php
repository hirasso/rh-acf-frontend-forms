<?php 

namespace RH\ACF\FF;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class RH_ACFF_Permissions {

  private $prefix = 'rh_acf_ff';
  private $textdomain = 'rh-acf-ff';
  private $hook_allowed_fields = 'rh/acff/allowed-fields-for-non-admins';
  private $hook_setting_capability = 'rh/acff/settings/capability';

  public function __construct() {
    
    add_filter('pre_get_posts', [$this, 'pre_get_posts'], 999);
    add_filter('acf/settings/capability', [$this, 'acf_setting_capability']);
    add_filter('acf/get_field_types', [$this, 'restrict_field_types']);
    add_action('admin_init', [$this, 'grant_frontend_form_cap_to_admins']);
    
    add_action('acf/render_field_group_settings', [$this, 'render_field_group_settings']);
    add_action('acf/field_group/admin_head', [$this, 'remove_meta_boxes'], 999, 2);
    add_action('admin_menu', [$this, 'remove_acf_submenu_pages'], 999);
    add_action('current_screen', [$this, 'check_current_screen']);
    add_filter('page_row_actions', [$this, 'row_actions'], 10, 2);
    // Disabled: fires too late (after meta caps have been mapped already)
    // add_filter('user_has_cap', [$this, 'user_has_cap'], 10, 3);
    add_filter('map_meta_cap', [$this, 'map_meta_cap'], 10, 4 );
    add_filter('register_post_type_args', [$this, 'register_post_type_args'], 10, 2);
    add_filter('views_edit-acf-field-group', [$this, 'restrict_edit_views'], 20, 1);
    add_filter('bulk_actions-edit-acf-field-group', [$this, 'restrict_bulk_actions'], 20, 1);
    add_action('save_post_acf-field-group', [$this, 'save_field_group'], 20);
    add_action('acf/init', [$this, 'add_settings_page']);

    add_action("acf/prepare_field/name={$this->prefix}_allowed_fields", [$this, 'prepare_field_allowed_fields']);
    add_action("acf/render_field/name={$this->prefix}_allowed_fields", [$this, 'render_field_allowed_fields']);

  }

  
  private function get_allowed_frontend_fields() {
    $allowed = get_field("{$this->prefix}_allowed_fields", $this->get_settings_page_id());
    $allowed = apply_filters($this->hook_allowed_fields, $allowed);
    return $allowed;
  }

  private function get_settings_page_id() {
    return "{$this->prefix}_settings";
  }

  /**
   * Add settings page for frontend forms
   *
   * @return void
   */
  public function add_settings_page() {
    $settings_page_id = $this->get_settings_page_id();
    $settings_page_slug = str_replace('_', '-', $settings_page_id);
    
    acf_add_options_page([
      'page_title'    => __('Frontend Forms Settings', $this->textdomain),
      'menu_title'    => __('ACFF Settings', $this->textdomain),
      'menu_slug'     => $settings_page_slug,
      'capability'    => 'manage_options',
      'redirect'      => false,
      'post_id'       => $settings_page_id,
      'parent_slug'   => 'edit.php?post_type=acf-field-group',
    ]);

    
    $field_group_title = __('Frontend Form Settings', $this->textdomain);

    // hack to let us get around the acf-field-group #title check on submit
    $title_hack = '<div class="rh-acf-title-hack hidden" id="titlewrap"><input id="title" value="noop" readonly></input></div>';

    acf_add_local_field_group(array (
      'key' => "group_$settings_page_id",
      'title' => "$field_group_title $title_hack",
      'location' => array (
        array (
          array (
            'param' => 'options_page',
            'operator' => '==',
            'value' => $settings_page_slug,
          ),
        ),
      ),
    )); 
    
    acf_add_local_field(array(
      'key' => "field_{$this->prefix}_allowed_fields",
      'label' => 'Allowed fields for non-admins',
      'name' => "{$this->prefix}_allowed_fields",
      'type' => 'checkbox',
      'choices' => $this->get_acf_field_types(),
      'parent' => "group_$settings_page_id"
    ));
    
  }

  /**
   * Get all ACF Field Types
   *
   * @return void
   */
  private function get_acf_field_types() {
    $field_types = acf_get_field_types_info();
    foreach( $field_types as $key => $field ) {
      $field_types[$key] = $field['label'];
    }
    return $field_types;
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
      'label'			=> __('Allowed fields for non-admins', $this->textdomain),
      'instructions' => 'Remove the filter <em style="-webkit-user-select: all; user-select:all;">rh/acf-ff/allowed-fields-for-non-admins</em> to edit fields manually.',
      'type'			=> 'textarea',
      'readonly'  => true,
      'rows'      => 2,
      'value'			=> implode(', ', $this->get_allowed_frontend_fields()),
    ));

    $this->update_settings_field('allowed_fields', $this->get_allowed_frontend_fields());

    return false;
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
      'label'			=> __('Code Snippet', $this->textdomain),
      'instructions'	=> 'Put this code snippet in your theme to filter allowed fields programatically',
      'type'			=> 'textarea',
      'readonly'  => true,
      'rows'      => 2,
      'value'			=> $this->get_code_snippet_allowed_fields(),
    ));
  }

  private function get_code_snippet_allowed_fields() {
    $value = $this->get_settings_field('allowed_fields', false, []);
    $allowed_fields = implode("', \n    '", $value);
    $snippet = "add_filter('$this->hook_allowed_fields', function(\$fields) {";
    $snippet .= "\n  return [\n    '$allowed_fields',\n  ];";
    $snippet .= "\n});";
    return $snippet;
  }

  /**
   * Checks if current user can access all ACF settings and fields
   *
   * @return boolean
   */
  private function is_acf_super_admin() {
    return current_user_can('administrator');
  }

  /**
   * Restricts field types for non-admins
   *
   * @param [array] $groups
   * @return array $groups
   */
  public function restrict_field_types( $groups ) {
    if( $this->is_acf_super_admin() ) {
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
   * Filter ACF Global Settings
   *
   * @param [type] $settings
   * @return void
   */
  public function acf_setting_capability($setting) {
    $cap = $this->get_frontend_forms_cap();
    return $cap;
  }

  /**
   * Returns the minimum capability required to edit frontend forms
   *
   * @return string cap
   */
  private function get_frontend_forms_cap() {
    return apply_filters($this->hook_setting_capability, 'manage_options');
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
   * Removes acf field group edit views for non-admins
   *
   * @param [type] $views
   * @return array
   */
  public function restrict_edit_views( $views ) {
    if( !$this->is_acf_super_admin() ) {
      return [];
    }
    return $views;
  }

  /**
   * Removes acf field group edit bulk actions for non-admins
   *
   * @param [array] $actions
   * @return array
   */
  public function restrict_bulk_actions( $actions ) {
    if( !$this->is_acf_super_admin() ) {
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
    
    if( $cap !== $this->get_frontend_forms_cap() || $this->is_acf_super_admin() ) {
      return $user_caps;
    }
    
    if( !$this->is_acf_frontend_form( $post ) ) {
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
    if( $pt !== 'acf-field-group' ) {
      return $args;
    }
    $args['capabilities']['delete_post'] = 'manage_options';
    $args['capabilities']['delete_posts'] = 'manage_options';
    return $args;
  }

  /**
   * Checks if a post is an ACF field group for submissions
   *
   * @param [type] $post
   * @return boolean
   */
  private function is_acf_frontend_form( $post ) {
    $post = get_post($post);
    if( $post->post_type !== 'acf-field-group' ) {
      return false;
    }
    $is_frontend_form = (bool) get_post_meta($post->ID, '_is_frontend_form', true);
    return $is_frontend_form;
  }

  /*
  *  admin_menu
  *
  *  This function will remove the ACF submenu items for non-administrators
  *
  *  @type	action (admin_menu)
  *
  *  @param	n/a
  *  @return	n/a
  */
  public function remove_acf_submenu_pages() {
    $slug = 'edit.php?post_type=acf-field-group';
    if( $this->is_acf_super_admin() ) {
      return;
    }
    remove_submenu_page($slug, 'acf-tools');
    remove_submenu_page($slug, 'acf-settings-updates');
    
  }

  public function row_actions( $actions, $post ) {
    if( $this->is_acf_super_admin() || $post->post_type !== 'acf-field-group' ) {
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
    if( $this->is_acf_super_admin() ) {
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
   * Save field group setting in post meta
   *
   * @param [type] $post_id
   * @return void
   */
  public function save_field_group( $post_id ) {
    $field_group = acf_get_field_group($post_id);
    if( isset($field_group['is_frontend_form']) ) {
      $is_frontend_form = !empty($field_group['is_frontend_form']) ? $field_group['is_frontend_form'] : false;
      update_post_meta($post_id, '_is_frontend_form', $is_frontend_form);
    }
  }

  /**
   * Hide field group settings for non-administrators
   *
   * @return void
   */
  public function remove_meta_boxes() {
    if( !$this->is_acf_super_admin() ) {
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
    if( !$this->is_acf_super_admin() ) {
      return $field_group;
    }
    acf_render_field_wrap(array(
      'label'			=> __('Is frontend form', 'acf'),
      'instructions'	=> 'Will this form be used in the frontend?',
      'type'			=> 'true_false',
      'name'			=> 'is_frontend_form',
      'prefix'		=> 'acf_field_group',
      'value'			=> $field_group['is_frontend_form'] ?? false,
      'ui'			=> 1,
    ));
  }

  /**
   * Filter acf_field_groups for editors
   *
   * @param [WP_Query] $q
   * @return $query
   */
  public function pre_get_posts( $q ) {
    if( !is_admin() || !$q->is_main_query() ) {
      return $q;
    }
    if( $this->is_acf_super_admin() ) {
      return $q;
    }
    if( get_current_screen()->id !== 'edit-acf-field-group' ) {
      return $q;
    }
    $meta_query = $q->get('meta_query');
    $meta_query = [
      [
        'key' => '_is_frontend_form',
        'value' => 1,
        'type' => 'NUMERIC'
      ]
    ];
    $q->set('meta_query', $meta_query);
    
    return $q;
  }

}
new RH_ACFF_Permissions();