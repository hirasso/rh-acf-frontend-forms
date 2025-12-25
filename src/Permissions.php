<?php

namespace Hirasso\ACFFF;

/** Exit if accessed directly */
if (! defined('ABSPATH')) {
    exit;
}

class Permissions
{
    private string $prefix;
    private string $hook_allowed_fields = 'hirasso/acfff/allowed-fields';

    public function __construct(protected ACFFF $acfff)
    {
        $this->prefix = $this->acfff->get_prefix();

        add_filter('acf/settings/capability', [$this, 'acf_setting_capability']);
        add_filter('acf/settings/show_admin', [$this, 'acf_setting_show_admin']);
        add_filter('acf/get_field_types', [$this, 'restrict_field_types']);
        add_action('admin_init', [$this, 'grant_frontend_form_cap_to_admins']);
        add_filter('admin_body_class', [$this, 'admin_body_class']);

        add_action('acf/field_group/render_additional_group_settings', [$this, 'render_field_group_settings']);
        add_action('acf/field_group/admin_head', [$this, 'remove_meta_boxes'], 999, 2);
        add_action('current_screen', [$this, 'check_current_screen']);
        add_filter('page_row_actions', [$this, 'row_actions'], 10, 2);
        // Disabled: fires too late (after meta caps have been mapped already)
        // add_filter('user_has_cap', [$this, 'user_has_cap'], 10, 3);
        add_filter('map_meta_cap', [$this, 'map_meta_cap'], 10, 4);
        add_filter('register_post_type_args', [$this, 'register_post_type_args'], 999, 2);

        add_filter('bulk_actions-edit-acf-field-group', [$this, 'restrict_bulk_actions'], 20, 1);
        add_action('acf/init', [$this, 'add_settings_page_fields']);

        add_action("acf/prepare_field/name={$this->prefix}_allowed_fields", [$this, 'prepare_field_allowed_fields']);
        add_action("acf/render_field/name={$this->prefix}_allowed_fields", [$this, 'render_field_allowed_fields']);

        // add_filter('acf/settings/save_json', [$this, 'acf_save_json']);

    }

    /**
     * Adds an admin body class with info about acf field group capabilities
     */
    public function admin_body_class(string $class): string
    {
        global $pagenow;

        $screen = get_current_screen();
        if ($pagenow !== 'post.php' || $screen->id !== 'acf-field-group') {
            return $class;
        }

        $classes = explode(' ', $class);

        if ($this->acfff->is_frontend_form(acf_maybe_get_GET('post'))) {
            $classes[] = 'is-edit-acf-frontend-form';
        }

        $classes[] = $this->acfff->is_super_admin()
            ? 'is-acf-super-admin'
            : 'is-not-acf-super-admin';

        return $class;
    }

    /**
     * Gets a list of fields that are allowed for frontend forms
     * @return array<int, string>
     */
    private function get_allowed_frontend_fields(): array
    {
        $allowed = (array) get_field("{$this->prefix}_allowed_fields", $this->get_settings_page_id());
        $allowed = apply_filters($this->hook_allowed_fields, $allowed);
        return is_array($allowed) ? $allowed : [];
    }

    /**
     * Add settings page for frontend forms
     */
    public function add_settings_page_fields(): void
    {
        $settings_page = $this->acfff->get_settings_page_info();

        acf_add_local_field([
            'key' => "field_{$this->prefix}_allowed_fields",
            'label' => 'Allowed fields for non-admins',
            'name' => "{$this->prefix}_allowed_fields",
            'type' => 'checkbox',
            'choices' => $this->get_allowed_field_types_choices(),
            'parent' => "group_$settings_page->id"
        ]);

    }

    /**
     * Get all ACF Field Types
     * @return array<string, string>
     */
    private function get_allowed_field_types_choices(): array
    {
        $choices = [];
        $never_allow = ['frontend_form'];

        /** @var array<string, array{
         *  label: string
         * }> $types */
        $types = acf_get_field_types_info();

        foreach ($types as $key => $field) {
            if (in_array($key, $never_allow)) {
                continue;
            }
            $choices[$key] = "{$field['label']}";
        }

        return $choices;
    }

    /**
     * Prints a notice if fields are being filtered by theme
     * @param array<string, mixed>|null $field
     * @return array<string, mixed>|null
     */
    public function prepare_field_allowed_fields(?array $field = null): ?array
    {
        if (empty($field)) {
            return null;
        }

        if (!has_filter($this->hook_allowed_fields)) {
            return $field;
        }

        // show allowed fields
        acf_render_field_wrap([
            'label' => __('Allowed fields for frontend forms'),
            'instructions' => "Remove the filter <em style='-webkit-user-select: all; user-select:all;'>$this->hook_allowed_fields</em> from your theme to edit fields manually.",
            'type' => 'textarea',
            'readonly' => true,
            'rows' => 2,
            'value'	=> implode(', ', $this->get_allowed_frontend_fields()),
        ]);

        $this->update_settings_field('allowed_fields', $this->get_allowed_frontend_fields());

        return null;
    }

    /**
     * Gets the settings page ID
     */
    private function get_settings_page_id(): string
    {
        return "{$this->prefix}_settings";
    }

    /**
     * Get a settings field
     */
    private function get_settings_field(string $name, bool $format): mixed
    {
        return get_field("{$this->prefix}_{$name}", $this->get_settings_page_id(), $format);
    }

    /**
     * Update a settings field
     */
    private function update_settings_field(string $name, mixed $value): bool
    {
        return update_field("{$this->prefix}_{$name}", $value, $this->get_settings_page_id());
    }

    /**
     * Render a code box with filter documentation
     * @param array<string, mixed> $field
     */
    public function render_field_allowed_fields(array $field): void
    {
        acf_render_field_wrap([
            'label'			=> __('Code Snippet'),
            'instructions'	=> 'Put this code snippet in your theme to filter allowed fields programatically',
            'type'			=> 'textarea',
            'readonly'  => true,
            'rows'      => 2,
            'value'			=> $this->get_code_snippet_allowed_fields(),
        ]);
    }

    /**
     * Get the code snippet for the allowed fields filter
     */
    private function get_code_snippet_allowed_fields(): string
    {
        /** @var array<int, string> $value */
        $value = $this->get_settings_field('allowed_fields', false) ?: [];

        $allowed_fields = implode("', \n    '", $value);
        $snippet = "add_filter('$this->hook_allowed_fields', function(\$fields) {";
        $snippet .= "\n  return [\n    '$allowed_fields',\n  ];";
        $snippet .= "\n});";

        return $snippet;
    }

    /**
     * Restrict field types for non-admins
     * @param array<string, mixed> $groups
     * @return array<string, mixed>
     */
    public function restrict_field_types(array $groups): array
    {
        if (!$this->acfff->is_frontend_form(acf_maybe_get_GET('post'))) {
            return $groups;
        }

        $allowed = $this->get_allowed_frontend_fields();

        foreach ($groups as $group_name => $group) {
            // https://stackoverflow.com/questions/4260086/php-how-to-use-array-filter-to-filter-array-keys/4260168#4260168
            $group = array_intersect_key($group, array_flip($allowed));
            if (count($group)) {
                $groups[$group_name] = $group;
            } else {
                unset($groups[$group_name]);
            }
        }

        return $groups;
    }


    /**
     * Filter ACF Global Setting 'capability'
     */
    public function acf_setting_capability(): string
    {
        return $this->get_frontend_forms_cap();
    }

    /**
     * Filter ACF Global setting 'show_admin'
     */
    public function acf_setting_show_admin(bool $setting): bool
    {
        if (!$this->acfff->is_super_admin()) {
            return false;
        }
        return $setting;
    }

    /**
     * Returns the minimum capability required to edit frontend forms
     */
    private function get_frontend_forms_cap(): string
    {
        return (string) apply_filters('hirasso/acfff/settings/capability', 'manage_options');
    }

    /**
     * Grant frontend form capability to roles
     */
    public function grant_frontend_form_cap_to_admins(): void
    {
        $cap = $this->get_frontend_forms_cap();
        $admin = get_role('administrator');

        if (!array_key_exists($cap, $admin->capabilities)) {
            $admin->add_cap($cap);
        }
    }

    /**
     * Remove ACF field group edit bulk actions for non-admins
     * @param array<string, string> $actions
     * @return array<string, string>
     */
    public function restrict_bulk_actions(array $actions): array
    {
        if (!$this->acfff->is_super_admin()) {
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
    * @param array<int, string> $user_caps    Array of the user's capabilities.
    * @param string   $cap          Capability name.
    * @param int      $user_id      The user ID.
    * @param array<int, mixed>    $args         Adds the context to the cap. Typically the object ID.
    * @return array<int, string>
    */
    public function map_meta_cap(array $user_caps, string $cap, int $user_id, array $args): array
    {
        $post = get_post($args[0] ?? false);

        if (!$post) {
            return $user_caps;
        }

        if ($cap !== $this->get_frontend_forms_cap() || $this->acfff->is_super_admin()) {
            return $user_caps;
        }

        // deny access to acf field groups that aren't frontend forms
        if (get_post_type($post) === 'acf-field-group' && !$this->acfff->is_frontend_form($post->ID)) {
            $user_caps[] = 'do_not_allow';
        }

        return $user_caps;
    }

    /**
     * Overwrite deletion capabilities for ACF field groups, to only allow admininstrators
     * @param array<string, mixed> $args
     * @return array<string, mixed>
     */
    public function register_post_type_args(array $args, string $pt): array
    {
        if ($pt !== 'acf-field-group' || $this->acfff->is_super_admin()) {
            return $args;
        }

        foreach ($args['labels'] as $key => $label) {
            $args['labels'][$key] = str_replace(['Custom Field', 'Field Group'], 'Frontend Form', $label);
        }

        $super_cap = 'manage_options';
        $acfff_cap = $this->get_frontend_forms_cap();
        // TODO??
        // $args['capabilities']['edit_post'] = $acfff_cap;
        // $args['capabilities']['edit_posts'] = $acfff_cap;
        // $args['capabilities']['edit_others_posts'] = $acfff_cap;
        $args['capabilities']['create_posts'] = $super_cap;
        $args['capabilities']['delete_post'] = $super_cap;
        $args['capabilities']['delete_posts'] = $super_cap;

        $args['show_in_menu'] = true;
        $args['menu_icon'] = 'dashicons-welcome-widgets-menus';
        $args['menu_position'] = 1000;

        return $args;
    }

    /**
     * @param array<string, string> $actions
     * @return array<string, string>
     */
    public function row_actions(array $actions, \WP_Post $post): array
    {
        if ($this->acfff->is_super_admin() || $post->post_type !== 'acf-field-group') {
            return $actions;
        }
        foreach ($actions as $key => $value) {
            if ($key !== 'edit') {
                unset($actions[$key]);
            }
        }
        return $actions;
    }

    /**
     * Restrict access to ACF submenu screens
     */
    public function check_current_screen(): void
    {
        $screen = get_current_screen();
        if (!$screen || !in_array($screen->id, ['custom-fields_page_acf-tools', 'custom-fields_page_acf-tools'])) {
            return;
        }
        $this->die_if_not_admin('Sorry, you are not allowed to access this page.');
    }

    /**
     * Die if current user is not administrator
     */
    private function die_if_not_admin(string $message): void
    {
        if ($this->acfff->is_super_admin()) {
            return;
        }
        $args = [
            'back_link' => true
        ];
        wp_die(
            '<h1>' . __('You need a higher level of permission.') . '</h1>' .
      '<p>' . __($message) . '</p>',
            __('Permission Denied'),
            $args
        );
    }

    /**
     * Hide field group settings for non-administrators
     */
    public function remove_meta_boxes(): void
    {

        if (!$this->acfff->is_super_admin()) {
            remove_meta_box('acf-field-group-locations', 'acf-field-group', 'normal');
            remove_meta_box('acf-field-group-options', 'acf-field-group', 'normal');
        }
    }

    /**
     * Field Group setting
     * @param array<string, mixed> $field_group
     */
    public function render_field_group_settings(array $field_group): void
    {
        $is_frontend_form = !empty($field_group['acfff_is_frontend_form'])
            ? $field_group['acfff_is_frontend_form'] : false;

        acf_render_field_wrap([
            'id'       => 'acfff_acfff_is_frontend_form',
            'label'			=> __('Frontend Form', 'acf'),
            'instructions'	=> 'Allow as frontend form?',
            'type'			=> 'true_false',
            'name'			=> 'acfff_is_frontend_form',
            'prefix'		=> 'acf_field_group',
            'value'			=> $is_frontend_form,
            'ui'			=> 1,
        ]);

        $post_type = !empty($field_group['acfff_for_post_type'])
            ? $field_group['acfff_for_post_type']
            : '';

        acf_render_field_wrap([
            'label' => __('Frontend Form for', 'acf'),
            'instructions' => 'Which post type should this frontend form create?',
            'type' => 'select',
            'name' => 'acfff_for_post_type',
            'prefix' => 'acf_field_group',
            'value' => $post_type,
            'ui' => false,
            'allow_null' => true,
            'choices' => $this->get_post_type_select_choices(),
            'conditional_logic' => [
                'field'     => 'acfff_is_frontend_form',
                'operator'  => '==',
                'value'     => '1'
            ]
        ]);
    }

    /**
     * @return array<string, string>
     */
    private function get_post_type_select_choices(): array
    {
        $post_types = get_post_types([], 'objects');
        $choices = [];
        foreach ($post_types as $pt => $pt_object) {
            $choices[$pt] = "{$pt_object->labels->name} ({$pt})";
        }
        return $choices;
    }


    /**
     * Don't save frontend form field groups
     *
     * TODO: 22.12.25 Test why that was develped in the first place.
     * But we actually can't NOT save the field group, otherwise our
     * custom field group settings won't work anymore (acfff_is_frontend_form, ...)
     */
    // public function acf_save_json(string $path)
    // {
    //     $field_group = (array) acf_maybe_get_POST('acf_field_group');

    //     // bail early if no field group in $_POST
    //     if (empty($field_group)) {
    //         return $path;
    //     }

    //     // Bail early if this is no frontend form
    //     $is_frontend_form = (bool) acf_maybe_get($field_group, 'acfff_is_frontend_form');
    //     if (!$is_frontend_form) {
    //         return $path;
    //     }

    //     // delete previously saved frontend form json
    //     $key = acf_maybe_get($field_group, 'key');

    //     if ($key) {
    //         remove_filter('acf/settings/save_json', [$this, 'acf_save_json']);
    //         acf_delete_json_field_group($key);
    //         add_filter('acf/settings/save_json', [$this, 'acf_save_json']);
    //     }

    //     // return nothing, the field group won't be saved
    //     return false;
    // }

}
