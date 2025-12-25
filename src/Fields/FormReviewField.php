<?php

namespace Hirasso\ACFFF\Fields;

class FormReviewField extends \acf_field_message
{
    /*
    *  __construct
    *
    *  This function will setup the field type data
    */
    public function initialize(): void
    {
        $this->name = 'form_review';
        $this->label = __("Form Review");
        $this->category = 'layout';
        $this->defaults = [
            'message'		=> '',
            'esc_html'		=> 0,
            'new_lines'		=> 'wpautop',
        ];

    }

    /**
     * @param array<string, mixed>|null $field
     * @return array<string, mixed>|null
     */
    public function prepare_field(?array $field = null): ?array
    {
        // don't display form reviews on admin
        if (empty($field) || is_admin()) {
            return null;
        }
        return $field;
    }

}
