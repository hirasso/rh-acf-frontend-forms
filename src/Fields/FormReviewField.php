<?php

namespace Hirasso\ACFF\Fields;

class FormReviewField extends \acf_field_message
{
    /*
    *  __construct
    *
    *  This function will setup the field type data
    *
    *  @type	function
    *  @date	5/03/2014
    *  @since	5.0.0
    *
    *  @param	n/a
    *  @return	n/a
    */

    public function initialize()
    {

        // vars
        $this->name = 'form_review';
        $this->label = __("Form Review");
        $this->category = 'layout';
        $this->defaults = [
            'message'		=> '',
            'esc_html'		=> 0,
            'new_lines'		=> 'wpautop',
        ];

    }

    public function prepare_field($field)
    {
        // don't display form reviews on admin
        if (is_admin()) {
            return false;
        }
        return $field;
    }

}
