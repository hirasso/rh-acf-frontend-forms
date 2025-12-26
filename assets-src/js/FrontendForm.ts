/**
 * ACF Frontend Form
 * Version: 1.0
 */

const $ = window.jQuery;
const acf = window.acf;

type AjaxResponse = {
  success: boolean;
  data?: {
    message?: string;
  };
};

import type { ACF } from "../types.js";
import { merge } from "es-toolkit/object";
import { debounce } from "es-toolkit/function";

/**
 * Defaults
 */
const defaults = {
  ajax: {
    enabled: true,
    waitAfterSubmit: 50,
    submitOnChange: false,
  },
};

export class FrontendForm {
  static defaults = defaults;
  options: typeof defaults;

  $form: JQuery<HTMLFormElement>;
  $ajaxResponse?: JQuery<HTMLElement>;

  constructor(el: HTMLFormElement, options: Partial<typeof defaults> = {}) {
    this.$form = $<HTMLFormElement>(el);

    /**
     * Using merge instead of spread operator here
     * to support nested objects merge
     */
    this.options = merge(defaults, options);

    /** Bail early if there is no form element */
    if (!(el instanceof HTMLFormElement)) {
      console.error("Form element doesn't exist");
      return;
    }
    // return if global acf object doesn't exist
    if (typeof acf === "undefined") {
      console.warn("The global acf object is not defined");
      return;
    }

    this.initialize();
  }

  /**
   * Run setup
   */
  initialize = async () => {
    /** return if form has already been initialized */
    if (this.$form.hasClass("acfff-initialized")) {
      return;
    }
    this.$form.addClass("acfff-initialized");

    /** @see https://support.advancedcustomfields.com/forums/topic/reinitialize-js-acf-object/ */
    acf.doAction("append", this.$form);
    acf.set(
      "post_id",
      this.$form.find<HTMLInputElement>("#_acf_post_id").val(),
    );
    acf.set("screen", "acf_form");
    acf.set("validation", true);

    /** Disable the defaut validation, we will initialize this this ourselves on submit */
    acf.validation.disable();

    /** Always run our own validation first */
    this.$form.on("submit", (e) => {
      e.preventDefault();

      const validator = this.validate({
        reset: true,
        loading: () => {
          console.log("validation loading...");
        },
        complete: () => {
          console.log("...validation complete!");
        },
        failure: () => {
          console.error("validation error");
        },
        success: ($form) => {
          console.log("validation success:", $form);
          this.submit();
        },
      });
    });

    this.createAjaxResponse();
    this.customizeForm();
    this.watchFields();
    this.hideConditionalFields();
  };

  customizeForm() {
    if (this.options.ajax.enabled) {
      this.$form.addClass("is-ajax-submit");
    }

    this.$form.find('[data-event="add-row"]').removeClass("acf-icon");

    // disable the confirmation for repeater remove-row buttons
    this.$form.on("click", '[data-event="remove-row"]', function () {
      $(this).trigger("click");
    });
  }

  /**
   * Validate this form
   */
  validate = (
    options: Omit<
      Parameters<typeof acf.validateForm>[0],
      "form" | "event"
    > = {},
  ): ACF["validator"] => {
    const $form = this.$form;
    acf.validateForm({ form: $form, ...options });
    return $form.data("acf");
  };

  /**
   * Submit this form via AJAX
   */
  submit = () => {
    if (!this.options.ajax.enabled) {
      this.$form[0].submit();
      return;
    }

    acf.unload.enable();

    // Fix for Safari Webkit – empty file inputs
    // @see https://stackoverflow.com/a/49827426/586823
    const $emptyFileInputs = this.$form
      .find<HTMLInputElement>('input[type="file"]:not([disabled])')
      .filter((i, input) => !input.disabled && !Boolean(input.files));

    $emptyFileInputs.prop("disabled", true);

    const formData = new FormData(this.$form[0]);

    $emptyFileInputs.prop("disabled", false);

    acf.lockForm(this.$form);

    this.$form.addClass("acfff:locked");

    $.ajax({
      url: window.location.href,
      method: "post",
      data: formData,
      cache: false,
      processData: false,
      contentType: false,
    }).done((response: AjaxResponse) => {
      this.handleAjaxResponse(response);
    });
  };

  handleAjaxResponse(response: AjaxResponse) {
    acf.hideSpinner();
    this.showAjaxResponse(response);

    if (!response.success) {
      return;
    }

    this.$form.trigger("acfff/ajax/success", { response });
    acf.unload.disable();

    setTimeout(() => {
      this.$form.removeClass("show-ajax-response");
      acf.unlockForm(this.$form);
      this.$form.removeClass("acfff:locked");

      if (!this.options.ajax.submitOnChange) {
        this.resetForm();
      }
    }, this.options.ajax.waitAfterSubmit);
  }

  createAjaxResponse() {
    this.$ajaxResponse = $(/*html*/ `<div class="acf-ajax-response"></div>`);
    this.$form.find(".acf-form-submit").append(this.$ajaxResponse);
  }

  showAjaxResponse(response: AjaxResponse) {
    let message = ((response || {}).data || {}).message;
    if (!message) {
      return console.warn(
        "[rh-acf-frontend-forms] No response message found in AJAX response",
      );
    }

    this.$form.trigger("hirasso/acfff/response", response);

    this.$ajaxResponse
      ?.text(message)
      .toggleClass("is--error", response.success === false);

    this.$form.addClass("show-ajax-response");
  }

  /**
   * Reset the form back to the defaults
   */
  resetForm() {
    this.$form[0].reset();

    this.$form
      .find(".acf-field")
      .find("input,textarea,select")
      .trigger("change");
  }

  /**
   * Initially hide fields that should be hidden by conditional logic
   */
  hideConditionalFields() {
    this.$form.find(".acf-field.hidden-by-conditional-logic").hide();
  }

  /**
   * Watch fields for changes and react
   */
  watchFields() {
    const selector = "input,textarea,select";

    this.$form.on("input change", selector, ({ currentTarget, type }) => {
      this.setHasValueClass(currentTarget);
      if (type === "change") this.maybeSubmitOnChange();
    });

    this.$form.find(selector).each((i, el) => {
      this.setHasValueClass(el);
    });
  }

  /**
   * Set "has-value" on a field based on it's value
   */
  setHasValueClass = (input: HTMLElement) => {
    const field = acf.getInstance(this.$field(input));

    if (
      !field ||
      ![
        "text",
        "password",
        "url",
        "email",
        "number",
        "textarea",
        "select",
        "true_false",
        "date_picker",
        "time_picker",
        "date_time_picker",
        "oembed",
      ].includes(field.data.type)
    ) {
      return;
    }

    const val = field.val();
    const hasValue = Array.isArray(val) ? val.length > 0 : Boolean(val);

    field.$el.toggleClass("has-value", hasValue);
  };

  /**
   * Submit on Change, debounced
   */
  maybeSubmitOnChange = debounce(() => {
    if (this.options.ajax.submitOnChange) {
      this.submit();
    }
  }, 100);

  /**
   * Get the jQuery wrapped field element, based on an input
   */
  $field(input: HTMLElement | JQuery<HTMLElement>) {
    return $(input).parents(".acf-field:first");
  }
}
