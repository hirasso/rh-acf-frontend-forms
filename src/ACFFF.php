<?php

namespace Hirasso\ACFFF;

use Hirasso\ACFFF\Fields\FormReviewField;
use Hirasso\ACFFF\Fields\FrontendFormField;
use Hirasso\ACFFF\Form\Form;

if (!defined('ABSPATH')) {
    exit;
} // Exit if accessed directly

class ACFFF
{
    protected Permissions $permissions;
    protected string $prefix = 'rh_acfff';

    public function __construct()
    {
        $this->permissions = new Permissions($this);
        // setup hooks
        $this->register_hooks();
        // always set acf validation to true, so that the form
        // also works if the page is loaded via AJAX
        acf_localize_data(['validation' => 1]);
        // register settings page
    }

    /**
     * Returns the prefix for the plugin.
     */
    public function get_prefix(): string
    {
        return $this->prefix;
    }

    /**
     * Setup action and filter hooks
     */
    public function register_hooks(): void
    {
        // Always initializes the form_head in the frontend
        add_action('template_redirect', 'acf_form_head');

        // Always render a form, on every page. Otherwise, ACF won't fully initialize
        add_action('wp_footer', [$this, 'set_acf_form_data']);

        // internal hooks
        add_action('wp_enqueue_scripts', [$this, 'frontend_assets'], 100);
        add_action('admin_enqueue_scripts', [$this, 'admin_styles'], 999);
        add_filter('acf/prepare_field/type=image', [$this, 'prepare_image_field']);
        add_filter('acf/validate_value', [$this, 'validate_value'], 9, 3);

        add_filter('acf/validate_value/type=text', [$this, 'fix_acf_length_validation'], 20, 4); // Text and Textarea both support maxlength, as of ACF 5.8.11
        add_filter('acf/validate_value/type=textarea', [$this, 'fix_acf_length_validation'], 20, 4);

        add_filter('acf/update_value', [$this, 'update_value'], 10, 3);

        add_filter('pre_get_posts', [$this, 'query_frontend_forms_only'], 999);
        add_filter('views_edit-acf-field-group', [$this, 'list_table_views'], 20, 1);

        add_filter('acf/render_field/type=image', [$this, 'render_upload_instructions']);
        add_filter('acf/render_field/type=file', [$this, 'render_upload_instructions']);
        add_filter('acf/render_field/type=text', [$this, 'render_max_length_info']);
        add_filter('acf/render_field/type=textarea', [$this, 'render_max_length_info']);
        add_action('acf/submit_form', [$this, 'on_submit_form'], 20, 2);

        add_filter('acf/render_field/name=_validate_email', [$this, 'render_time_based_honeypot']);
        add_action('acf/validate_save_post', [$this, 'validate_time_based_honeypot'], 5);

        add_action('acf/include_field_types', [$this, 'include_field_types']);
        add_action('acf/render_field_settings', [$this, 'render_field_settings'], 11);

        add_filter('acf/prepare_field', [$this, 'prepare_field']);
        add_filter('acf/format_value', [$this, 'format_value'], 10, 3);

        // add the settings page
        add_action('acf/init', [$this, 'add_settings_page']);

        add_filter('acf/location/rule_match/post_type', [$this, 'frontend_form_rule_match'], 10, 4);

        add_action('post_submitbox_misc_actions', [$this, 'inject_acfff_field_group_settings']);
    }

    /**
     * Enqueue and dequeue assets
     */
    public function frontend_assets(): void
    {
        // enqueue plugin script
        wp_enqueue_script('rh-acfff', $this->asset_uri('assets/acfff.js'), ['jquery'], null, true);

        // enqueue plugin styles
        wp_enqueue_style('rh-acfff', $this->asset_uri('assets/acfff.css'), [], null, 'all');

        if (apply_filters('hirasso/acfff/deregister-acf-styles', true)) {
            // Removes the default ACF styles
            wp_deregister_style('acf-global');
            wp_deregister_style('acf-input');
            wp_deregister_style('acf-field-group');
        }
    }

    /**
     * Enqueue Admin Styles
     */
    public function admin_styles(): void
    {
        wp_enqueue_style("rh-acfff-admin", $this->asset_uri('assets/acfff-admin.css'));
    }

    /**
     * Helper function to get versioned asset urls
     */
    public function asset_uri(string $path): string
    {
        $uri = plugins_url($path, ACFFF_ROOT);
        $file = $this->get_file_path($path);
        if (file_exists($file)) {
            $version = filemtime($file);
            $uri .= "?v=$version";
        }
        return $uri;
    }

    /**
     * Gets the path of a file
     */
    public function get_file_path(string $path): string
    {
        $path = ltrim($path, '/');
        $file = plugin_dir_path(ACFFF_ROOT) . $path;
        return $file;
    }

    /**
     * Prepares image fields
     * @param  array<string, mixed> $field
     * @return array<string, mixed> $field
     */
    public function prepare_image_field(array $field): array
    {
        if (is_admin()) {
            return $field;
        }
        $field['preview_size'] = 'large';
        return $field;
    }

    /**
     * Renders image field instructions
     * @param  array<string, mixed> $field
     * @return array<string, mixed> $field
     */
    public function render_upload_instructions(array $field): array
    {
        if (is_admin()) {
            return $field;
        }
        $settings = (object) [
            'restrictions' => []
        ];
        $hints = [];

        /** @var string $mime_types */
        $mime_types = acf_maybe_get($field, 'mime_types', '');
        $max_size = acf_maybe_get($field, 'max_size', null);

        if ($mime_types) {
            $mime_types = explode(',', $mime_types);
            $mime_types = array_map('trim', $mime_types);
            $glued_mime_types = $this->glue_last_two($mime_types);
            $settings->restrictions['mime_types'] = [
                'value' => $mime_types,
                'error' => sprintf(__('File type must be %s.', 'acf'), implode(', ', $glued_mime_types)),
            ];
            $hints[] = implode(', ', $glued_mime_types);
        }

        if ($max_size) {
            $settings->restrictions['max_size'] = [
                'value' => $max_size,
                'error' => sprintf(__('File size must must not exceed %s.', 'acf'), acf_format_filesize($max_size)),
            ];
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

    /**
     * @param array<int, string> $array
     * @return array<int, string>
     */
    public function glue_last_two(array $array): array
    {
        // glue together last 2 types
        if (count($array) > 1) {

            $last1 = array_pop($array);
            $last2 = array_pop($array);

            $array[] = $last2 . ' ' . __('or', 'acf') . ' ' . $last1;
        }
        return $array;
    }

    /**
     * @param array<int, string> $mime_types
     */
    public function get_mime_types_error_message(array $mime_types): string
    {
        // glue together last 2 types
        if (count($mime_types) > 1) {

            $last1 = array_pop($mime_types);
            $last2 = array_pop($mime_types);

            $mime_types[] = $last2 . ' ' . __('or', 'acf') . ' ' . $last1;
        }
        return sprintf(__('File type must be %s.', 'acf'), implode(', ', $mime_types));
    }

    public function get_max_size_error_message(): string
    {
        return 'test 123';
    }


    /**
     * Checks if the page is called via ajax, even if not in admin-ajax.php
     */
    public function is_ajax_call(): bool
    {
        return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
    }
    /**
     * Runs after form submit
     * @param array<string, mixed> $form
     */
    public function on_submit_form(array $form, int|string $post_id): void
    {
        $success = apply_filters("rh/acf_form_success", true, $post_id);
        $success = apply_filters("rh/acf_form_success/id={$form['id']}", true, $post_id);
        $this->send_ajax_submit_response($form, $success);
    }
    /**
     * Send the response
     * @param array<string, mixed> $form
     */
    public function send_ajax_submit_response(array $form, bool $success): void
    {
        $custom_return = acf_maybe_get($form, 'return', '');
        if ($custom_return || !$this->is_ajax_call()) {
            return;
        }
        $error_message = __('Something went wrong, please reload the page and try again', 'rh-acf-frontend-forms');

        $error_message = apply_filters("rh/acf_form_error_message", $error_message);
        $error_message = apply_filters("rh/acf_form_error_message/id={$form['id']}", $error_message);

        if ($success) {
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
     * @param array<string, mixed> $field
     */
    public function render_max_length_info(array $field): void
    {
        if (!$field['maxlength'] || is_admin()) {
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
     * @param array<string, mixed> $field
     */
    public function validate_value(string|bool $valid, mixed $value, array $field): string|bool
    {
        if (is_string($valid) || !$this->is_frontend_form_field($field)) {
            return $valid;
        }

        if ($field['required'] && empty($value)) {
            $valid = __('Please fill out this field');
            switch ($field['type']) {
                case 'radio':
                    $valid = __('Please select an option');
                    break;
                case 'image':
                    $valid = __('Please add an image');
                    break;
                case 'file':
                    $valid = __('Please add a file');
                    break;
            }
        }

        $valid = apply_filters('rh/acf_error_message', $valid);

        return $valid;
    }

    /**
     * Correct max length validation failures caused by html entities like & and < for text inputs.
     *
     * @url reference https://support.advancedcustomfields.com/forums/topic/escaping-in-text-fields/
     *
     * @param string|true $valid
     * @param string $value
     * @param array<string, mixed> $field
     * @param string $input_name
     *
     * @return string|true
     */
    public function fix_acf_length_validation($valid, $value, array $field, $input_name)
    {
        if (is_string($valid) && strpos($valid, 'Value must not exceed') === 0) {
            if (!isset($field['maxlength'])) {
                return $valid;
            } // maxlength should  be present here

            // decode html entities (& -> &). particularly: &, <, >, ", '
            $decoded_value = wp_specialchars_decode($value);

            // get new string length
            $decoded_length = mb_strlen(wp_unslash($decoded_value));

            // if the decoded string length fits within the max length, override the validtion.
            if ($decoded_length <= $field['maxlength']) {
                $valid = true;
            }
        }
        return $valid;
    }

    /**
     * Update a value
     * @param array<string, mixed> $field
     */
    public function update_value(mixed $value, string|int $post_id, array $field): mixed
    {
        return $this->maybe_reconvert_ampersands($value);
    }

    /**
     * Re-convert "&amp;" to "&" in strings
     *
     * previously converted by
     * @see wp_kses_normalize_entities
     **/
    private function maybe_reconvert_ampersands(mixed $value): mixed
    {
        if (is_string($value)) {
            $value = wp_specialchars_decode($value);
        }

        return $value;
    }

    /**
     * Returns settings page info
     */
    public function get_settings_page_info(): object
    {
        $id = "{$this->prefix}_settings";

        return (object) [
            'id' => $id,
            'slug' => str_replace('_', '-', $id)
        ];
    }

    /**
     * Adds the ACFFF Settings page
     */
    public function add_settings_page(): void
    {
        $settings_page = $this->get_settings_page_info();

        /**
         * Not everyone has ACF pro
         */
        if (!function_exists('acf_add_options_page')) {
            return;
        }

        /**
         * We only have normal ACF (not pro) available for static analysis
         */
        acf_add_options_page([
            'page_title'    => __('Frontend Forms Settings'),
            'menu_title'    => __('ACFFF Admin'),
            'menu_slug'     => $settings_page->slug,
            'capability'    => 'manage_options',
            'post_id'       => $settings_page->id,
            'parent_slug'   => 'edit.php?post_type=acf-field-group',
        ]);

        $field_group_title = __('Frontend Form Settings');

        acf_add_local_field_group([
            'key' => "group_$settings_page->id",
            'title' => "$field_group_title",
            'location' => [
                [
                    [
                        'param' => 'options_page',
                        'operator' => '==',
                        'value' => $settings_page->slug,
                    ],
                ],
            ],
        ]);
    }


    /**
     * Check if a post is an ACF field group for submissions
     */
    public function is_frontend_form(?int $post_id = 0): bool
    {
        $field_group = acf_get_field_group($post_id);
        return (bool) ($field_group['acfff_is_frontend_form'] ?? false);
    }


    /**
     * Check if a field group is a frontend form for a certain post type
     * @param array<string, mixed> $field_group
     */
    private function is_frontend_form_for_post_type(array $field_group, ?string $post_type = null): bool
    {
        if (!$post_type) {
            return false;
        }

        $is_frontend_form = (bool) ($field_group['acfff_is_frontend_form'] ?? false);
        $for_post_type = $field_group['acfff_for_post_type'] ?? '';
        return $is_frontend_form && $for_post_type === $post_type;
    }

    /**
     * Check if a field is part of a frontend form
     * @param array<string, mixed>|null $field
     */
    private function is_frontend_form_field(?array $field = null): bool
    {
        if (!$field) {
            return false;
        }
        $ancestors = get_post_ancestors($field['ID']);
        $root = count($ancestors) - 1;
        $field_group_id = $ancestors[$root] ?? false;

        if (!$field_group_id) {
            return false;
        }

        return $this->is_frontend_form($field_group_id);
    }

    /**
     * Prepare fields for frontend forms
     * @param array<string, mixed>|null $field
     * @return array<string, mixed>|null
     */
    public function prepare_field(?array $field = null): ?array
    {
        if (empty($field)) {
            return null;
        }

        if (is_admin() && !$this->is_frontend_form_field($field)) {
            return $field;
        }

        if (in_array($field['type'], ['repeater', 'group'])) {
            $field['layout'] = 'block';
        }
        if (in_array($field['type'], ['textarea'])) {
            $field['rows'] = '2';
        }
        if (in_array($field['type'], ['file'])) {
            $field['return_format'] = 'id';
        }


        if ($message = $field['rich_text_message'] ?? false) {
            $message = apply_filters('the_content', $message);
            switch ($field['type']) {
                case 'true_false':
                    $message = strip_tags($message, '<a>');
                    break;
            }
            $field['message'] = $message;
            $field['wrapper']['class'] .= ' has-message';
        }

        if (!in_array($field['type'], ['repeater', 'group', 'flexible_content', 'file', 'image']) && !empty($field['value'])) {
            $field['wrapper']['class'] .= ' has-value';
        }

        return $field;
    }

    /**
     * Format some values from frontend forms
     * @param array<string, mixed> $field
     */
    public function format_value(mixed $value, int|string $post_id, array $field): mixed
    {
        if (!$value || !$this->is_frontend_form_field($field)) {
            return $value;
        }

        if (in_array($field['type'], ['file'])) {
            $file_id = get_field($field['name'], $post_id, false);
            $file_url = wp_get_attachment_url($file_id);
            $value = "<a href='$file_url'>$file_url</a>";
        }

        return $value;
    }

    /**
     * Render additional field settings
     * @param array<string, mixed> $field
     */
    public function render_field_settings(array $field): void
    {
        switch ($field['type']) {
            case 'true_false':
                acf_render_field_setting($field, [
                    'label'      => __('Message', 'acf'),
                    'instructions'  => "Displays text alongside the checkbox",
                    'type'      => 'wysiwyg',
                    'name'      => 'rich_text_message',
                    'class'      => 'field-rich-text-message',
                    'tabs'      => 'text',
                    'media_upload'   => 0,
                ], true);
                break;

            case 'message':
                acf_render_field_setting($field, [
                    'label'      => __('Message', 'acf'),
                    'type'      => 'wysiwyg',
                    'name'      => 'rich_text_message',
                    'class'      => 'field-rich-text-message',
                    'tabs'      => 'text',
                    'media_upload'   => 0,
                ], true);
                break;
        }
    }

    /**
     * Include Custom Field Types
     */
    public function include_field_types(): void
    {
        acf_register_field_type(FormReviewField::class);
        acf_register_field_type(FrontendFormField::class);
    }

    /**
     * Field group edit views
     * @param array<string, string> $views
     * @return array<string, string>
     */
    public function list_table_views(array $views): array
    {
        $views = $this->add_edit_view_frontend_forms($views);
        $views = $this->add_edit_view_admin_forms($views);

        if (!$this->is_super_admin()) {
            return [];
        }

        return $views;
    }

    /**
     * Check if the current user can access all ACF settings and fields
     */
    public function is_super_admin(): bool
    {
        return current_user_can('administrator');
    }

    /**
     * Add Frontend Forms to field group edit views
     * @param array<string, string> $views
     * @return array<string, string>
     */
    private function add_edit_view_frontend_forms(array $views): array
    {
        if (!$count = $this->count_frontend_forms()) {
            return $views;
        }
        $class = $this->is_edit_view_frontend_forms() ? 'current' : '';

        $url = add_query_arg([
            'meta_key' => 'is-frontend-form',
            'meta_value' => '1'
        ], admin_url('edit.php?post_type=acf-field-group'));

        $views['frontend_forms'] = "<a class='$class' href='$url'>Frontend Forms <span class='count'>($count)</span></a>";

        return $views;
    }

    /**
     * Adds Frontend Forms to field group edit views
     * @param array<string, string> $views
     * @return array<string, string>
     */
    private function add_edit_view_admin_forms(array $views): array
    {
        if (!$count = $this->count_admin_forms()) {
            return $views;
        }
        $class = $this->is_edit_view_admin_forms() ? 'current' : '';

        $url = add_query_arg([
            'meta_key' => 'is-frontend-form',
            'meta_value' => '0'
        ], admin_url('edit.php?post_type=acf-field-group'));

        $views['admin_forms'] = "<a class='$class' href='$url'>Admin Forms <span class='count'>($count)</span></a>";

        return $views;
    }

    /**
     * Counts ACF Frontend Forms
     *
     * @return int
     */
    private function count_frontend_forms()
    {
        return count($this->get_frontend_forms());
    }

    /**
     * Counts ACF Frontend Forms
     *
     * @return int
     */
    private function count_admin_forms()
    {
        return count($this->get_admin_forms());
    }

    /**
     * Get field groups from Database
     *
     * @return array<int, array<string, mixed>>
     */
    private function get_field_groups_from_db(): array
    {
        return acf_get_raw_field_groups();
    }

    /**
     * Get all frontend forms
     *
     * @return array<int, array<string, mixed>>
     */
    public function get_frontend_forms(): array
    {
        return array_filter($this->get_field_groups_from_db(), function ($field_group) {
            return (bool) acf_maybe_get($field_group, 'acfff_is_frontend_form', false);
        });
    }

    /**
     * Get all admin forms
     *
     * @return array<int, array<string, mixed>>
     */
    private function get_admin_forms(): array
    {
        return array_filter($this->get_field_groups_from_db(), function ($field_group) {
            return (bool) acf_maybe_get($field_group, 'acfff_is_frontend_form', false) === false;
        });
    }

    /**
     * Get the ids of all frontend forms
     *
     * @return array<int, int>
     */
    public function get_frontend_forms_ids(): array
    {
        return array_column($this->get_frontend_forms(), 'ID');
    }

    /**
     * Get the ids of all admin forms
     *
     * @return array<int, int>
     */
    public function get_admin_forms_ids(): array
    {
        return array_column($this->get_admin_forms(), 'ID');
    }

    /**
     * Filter acf_field_groups for editors
     */
    public function query_frontend_forms_only(\WP_Query $q): void
    {
        if (!is_admin() || !$q->is_main_query() || $q->get('post_type') !== 'acf-field-group') {
            return;
        }

        if (!$this->is_super_admin() || $this->is_edit_view_frontend_forms()) {
            $q->set('post__in', $this->get_frontend_forms_ids());
        } elseif ($this->is_super_admin() && $this->is_edit_view_admin_forms()) {
            $q->set('post__in', $this->get_admin_forms_ids());
        }
    }

    /**
     * Detect edit screen for frontend forms
     *
     * @return boolean
     */
    private function is_edit_view_frontend_forms()
    {
        global $pagenow, $post_type;
        if ($pagenow !== 'edit.php' || $post_type !== 'acf-field-group') {
            return false;
        }
        $meta_key = acf_maybe_get_GET('meta_key');
        $meta_value = intval(acf_maybe_get_GET('meta_value', 0));
        return $meta_key === 'is-frontend-form' && $meta_value === 1;
    }

    /**
     * Detect edit screen for admin forms
     *
     * @return boolean
     */
    private function is_edit_view_admin_forms()
    {
        global $pagenow, $post_type;
        if ($pagenow !== 'edit.php' || $post_type !== 'acf-field-group') {
            return false;
        }
        $meta_key = acf_maybe_get_GET('meta_key');
        $meta_value = intval(acf_maybe_get_GET('meta_value', 0));
        return $meta_key === 'is-frontend-form' && $meta_value === 0;
    }

    /**
     * Rule match for frontend forms
     * @param array<string, mixed> $rule
     * @param array<string, mixed> $options
     * @param array<string, mixed> $field_group
     */
    public function frontend_form_rule_match(bool $match, array $rule, array $options, array $field_group): bool
    {
        /** @var ?string $post_type */
        global $post_type;

        if ($post_type && $this->is_frontend_form_for_post_type($field_group, $post_type)) {
            return true;
        }

        return $match;
    }

    /**
     * Inject ACFFF settings for non-admins
     */
    public function inject_acfff_field_group_settings(): void
    {
        global $field_group;

        if (!is_array($field_group) || $this->is_super_admin()) {
            return;
        }

        $acfff_is_frontend_form = (string) ($field_group['acfff_is_frontend_form'] ?? 0);
        $acfff_for_post_type = (string) ($field_group['acfff_for_post_type'] ?? '');
        $location_rule_name = "acf_field_group[location][group_0][rule_0]";

        ob_start() ?>
    <!-- Start acf frontend forms -->
    <input type='hidden' name='acf_field_group[acfff_is_frontend_form]' value='<?= esc_attr($acfff_is_frontend_form) ?>'></input>
    <input type='hidden' name='acf_field_group[acfff_for_post_type]' value='<?= esc_attr($acfff_for_post_type) ?>'></input>
    <input type="hidden" name='<?= $location_rule_name ?>[param]' value='post_type'></input>
    <input type="hidden" name='<?= $location_rule_name ?>[operator]' value='=='></input>
    <input type="hidden" name='<?= $location_rule_name ?>[value]' value='<?= esc_attr($acfff_for_post_type) ?>'></input>
    <!-- End acf frontend forms -->
<?php echo ob_get_clean();
    }

    /**
     * Render a time-based honeypot field
     */
    public function render_time_based_honeypot(): void
    {
        ob_start(); ?>
      <input type="hidden" name="_acfff_form_started" value="">
      <script>
        document.currentScript.previousElementSibling.value = Math.floor(Date.now() / 1000)
      </script>
      <?php echo ob_get_clean();
    }

    /**
     * Validate the time based honeypot "_acfff_form_started"
     */
    public function validate_time_based_honeypot(): void
    {
        // Not an acf_form()
        if (($_POST['_acf_screen'] ?? null) !== 'acf_form') {
            return;
        }

        $started = $_POST['_acfff_form_started'] ?? null;

        // No such field in the current form
        if (is_null($started)) {
            return;
        }

        // Missing or suspiciously fast submission
        if (time() - (int) $started < 3) {
            acf_add_validation_error(
                '',
                __('Something went wrong. If the issue persists, please contact the site site administrator.', 'acfff')
            );
        }
    }

    /**
     * Always set form validation to true
     */
    public function set_acf_form_data(): void
    {
        /** Only pages without any ACF form need this */
        if (did_action('acf/form_data')) {
            return;
        }
        acf_get_store('form')->set('validation', true);
    }

    /**
     * Create a frontend form
     * @param array<string, mixed> $args – These options are forwarded unmodified to acf_form($args)
     */
    public function form(array $args): Form
    {
        return new Form($args);
    }
}
