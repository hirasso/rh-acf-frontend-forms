<?php

namespace Hirasso\ACFFF\Form;

final class JSOptions
{
    public function __construct(
        public ?AjaxOptions $ajax = new AjaxOptions(),
    ) {
    }
}
