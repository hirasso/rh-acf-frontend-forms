<?php

namespace Hirasso\ACFFF\Form;

/**
 * Render an ACF Frontend Form
 * - The form will be wrapped in a custom element `<acf-frontend-form></acf-frontend-form>`
 */
final class Form
{
    protected readonly JSOptions $jsOptions;
    protected bool $wrap = true;

    /** @param array<string, mixed> $args */
    public function __construct(
        public array $args,
    ) {
        $this->jsOptions = new JSOptions();
    }

    /**
     * Set AJAX options for this form
     *
     * - true to enable
     * - fase to disable
     * - an object for full control
     */
    public function ajax(bool|AjaxOptions|null $value = true): self
    {
        $this->jsOptions->ajax = is_bool($value)
            ? new AjaxOptions(enabled: $value)
            : $value;

        return $this;
    }

    /**
     * Do not wrap the form in our custom element. If you do this,
     * you need to wrap it yourself using <acf-frontend-form></acf-frontend-form>
     */
    public function unwrap(): self
    {
        $this->wrap = false;
        return $this;
    }

    /**
     * Render the form
     */
    public function render(): ?string
    {
        /** Buffer the acf_form() */
        ob_start();
        acf_form($this->args);
        $vanilla_acf_form = trim(ob_get_clean() ?: '');

        /** return null if acf_form didn't return anything */
        if (empty($vanilla_acf_form)) {
            return null;
        }

        /** Convert the options to JSON */
        $jsOptionsJson = json_encode($this->jsOptions, JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK);

        /** Construct the final body */
        $body = implode("\n", [
            "<script data-acfff-options type='application/json'>$jsOptionsJson</script>",
            $vanilla_acf_form
        ]);

        return $this->wrap
            ? "<acf-frontend-form>$body</acf-frontend-form>"
            : $body;
    }

}
