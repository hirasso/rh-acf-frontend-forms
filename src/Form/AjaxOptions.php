<?php

namespace Hirasso\ACFFF\Form;

final readonly class AjaxOptions
{
    public function __construct(
        public bool $enabled = true,
        public ?int $waitAfterSubmit = 1000,
        public ?bool $resetAfterSubmit = false,
        public ?bool $submitOnChange = false
    ) {
    }
}
