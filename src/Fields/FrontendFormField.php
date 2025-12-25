<?php

namespace Hirasso\ACFFF\Fields;

class FrontendFormField extends \acf_field_select
{
    /*
    *  __construct
    *
    *  This function will setup the field type data
    */
    public function initialize()
    {
        $this->name = 'frontend_form';
        $this->label = __("Frontend Form");
        $this->category = 'relational';
        $this->defaults = [
            'multiple' 		=> 0,
            'allow_null' 	=> 1,
            'choices'		=> [],
            'default_value'	=> '',
            'ui'			=> 0,
            'ajax'			=> 0,
            'placeholder'	=> 'Select',
            'return_format'	=> 'value'
        ];

    }

    /**
     * @param array<string, mixed> $field
     */
    public function render_field(mixed $field): void
    {
        $field['choices'] = $this->get_choices();
        parent::render_field($field);
    }

    /**
     * @param array<string, mixed> $field
     */
    public function render_field_settings(mixed $field): void
    {
        // allow_null
        acf_render_field_setting($field, [
            'label'			=> __('Allow Null?', 'acf'),
            'instructions'	=> '',
            'name'			=> 'allow_null',
            'type'			=> 'true_false',
            'ui'			=> 1,
        ]);
    }

    /**
     * @return array<int, string>
     */
    public function get_choices(): array
    {
        $choices = [];
        foreach (acfff()->get_frontend_forms_ids() as $id) {
            $choices[$id] = get_the_title($id);
        }
        return $choices;
    }

    /**
     * @param array<string, mixed> $field
     */
    public function load_value(mixed $value, mixed $post_id, mixed $field): int
    {
        return intval($value);
    }

}
