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

/**
 * Defaults
 */
const defaults = {
  ajaxSubmit: true,
  waitAfterSubmit: 1000,
  resetAfterSubmit: true,
  submitOnChange: false,
  onSuccess: (response: AjaxResponse) => {},
};

class ACFFrontendForm {
  static defaults = defaults;
  options: typeof defaults;
  $form: JQuery<HTMLFormElement>;
  $ajaxResponse?: JQuery<HTMLElement>;

  constructor(el: HTMLFormElement, options: Partial<typeof defaults> = {}) {
    let $form = $<HTMLFormElement>(el);
    this.options = { ...defaults, ...options };
    this.$form = $form;

    // return if there is no form element
    if (!$form.length) {
      console.warn("Form element doesn't exist");
      return;
    }
    // return if global acf object doesn't exist
    if (typeof acf === "undefined") {
      console.warn("The global acf object is not defined");
      return;
    }
    // return if form has already been initialized
    if ($form.hasClass("rh-is-initialized")) {
      return;
    }
    $form.addClass("rh-is-initialized");

    acf.doAction("append", $form);
    acf.validation.enable();

    this.$form.find(".acf-field input").each((i, el) => {
      this.adjustHasValueClass($(el));
    });

    this.createAjaxResponse();
    this.setupForm();
    this.setupInputs();
    this.hideConditionalFields();

    this.$form.data("RHFrontendForm", this);
  }

  setupForm() {
    if (this.options.ajaxSubmit) {
      this.$form.addClass("is-ajax-submit");
    }

    this.$form.find('[data-event="add-row"]').removeClass("acf-icon");

    // disable the confirmation for repeater remove-row buttons
    this.$form.on("click", '[data-event="remove-row"]', function () {
      $(this).trigger("click");
    });
  }

  doAjaxSubmit() {
    // Fix for Safari Webkit – empty file inputs
    // https://stackoverflow.com/a/49827426/586823
    const $fileInputs = $('input[type="file"]:not([disabled])', this.$form);
    $fileInputs.each((i, input) => {
      const fileInput = input as HTMLInputElement;
      if (fileInput.files && fileInput.files.length > 0) {
        return;
      }
      $(input).prop("disabled", true);
    });

    var formData = new FormData(this.$form[0]);

    // Re-enable empty file $fileInputs
    $fileInputs.prop("disabled", false);

    acf.lockForm(this.$form);
    this.$form.addClass("rh-is-locked");

    $.ajax({
      url: window.location.href,
      method: "post",
      data: formData,
      cache: false,
      processData: false,
      contentType: false,
    }).done((response: AjaxResponse) => {
      this.handleAjaxResponse(response);
      this.options.onSuccess?.(response);
    });
  }

  handleAjaxResponse(response: any) {
    acf.hideSpinner();
    this.showAjaxResponse(response);
    if (!response.success) {
      return;
    }
    acf.unload.disable();
    setTimeout(() => {
      this.$form.removeClass("show-ajax-response");
      acf.unlockForm(this.$form);
      acf.validation.reset(this.$form);
      this.$form.removeClass("rh-is-locked");
      if (this.options.resetAfterSubmit) {
        this.resetForm();
      }
    }, this.options.waitAfterSubmit);
  }

  createAjaxResponse() {
    this.$ajaxResponse = $('<div class="acf-ajax-response"></div>');
    this.$form.find(".acf-form-submit").append(this.$ajaxResponse);
  }

  showAjaxResponse(response: AjaxResponse) {
    let message = ((response || {}).data || {}).message;
    if (!message) {
      console.warn(
        "[rh-acf-frontend-forms] No response message found in AJAX response",
      );
      return;
    }
    this.$form.trigger("rh/show-ajax-response", response);
    this.$form.trigger("rh/acf-frontend-form/response", response);
    this.$ajaxResponse
      ?.text(message)
      .toggleClass("is--error", response.success === false);

    this.$form.addClass("show-ajax-response");
  }

  resetForm() {
    const form = this.$form.get(0) as HTMLFormElement;
    form.reset();
    this.$form
      .find(".acf-field")
      .find("input,textarea,select")
      .trigger("change");
    this.$form.find(".acf-field").removeClass("has-value has-focus");
  }

  hideConditionalFields() {
    this.$form.find(".acf-field.hidden-by-conditional-logic").hide();
  }

  setupInputs() {
    let selector = "input,textarea,select";
    this.$form.on("keyup keydown change", selector, (e) =>
      this.adjustHasValueClass($(e.currentTarget)),
    );
    this.$form.on("change", selector, (e) => this.maybeSubmitForm(e));
    this.$form.on("focus", selector, (e) => this.onInputFocus(e.currentTarget));
    this.$form.on("blur", selector, (e) => this.onInputBlur(e.currentTarget));
  }

  adjustHasValueClass($input: JQuery<HTMLElement>) {
    const $field = $input.parents(".acf-field:first");
    const field = acf.getInstance($field);

    if (!field) {
      return;
    }

    const types = [
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
    ];

    const type = field.data.type;
    const val = field.val();

    if (types.includes(type)) {
      $field.toggleClass("has-value", !!val);
    }
  }

  maybeSubmitForm(e: JQuery.TriggeredEvent) {
    if (this.options.submitOnChange) {
      this.$form[0].requestSubmit();
    }
  }

  onInputFocus(el: HTMLElement) {
    this.$field(el).addClass("has-focus");
  }
  onInputBlur(el: HTMLElement) {
    this.$field(el).removeClass("has-focus");
  }
  $field(input: HTMLElement) {
    return $(input).parents(".acf-field:first");
  }
}

/**
 * A custom element that automatically initializes an ACF frontend form
 */
export class ACFFrontendFormElement extends HTMLElement {
  static register() {
    if (!window.customElements.get("acf-frontend-form")) {
      window.customElements.define("acf-frontend-form", ACFFrontendFormElement);
    }
  }

  /**
   * [initialized] getter and setter
   */
  get loaded(): boolean {
    return this.hasAttribute("loaded");
  }
  set loaded(value: boolean) {
    this.toggleAttribute("loaded", value);
  }

  connectedCallback() {
    if (this.loaded) return;

    const form = this.closest("form");
    if (!form) {
      return console.error("No form found");
    }

    if (!form.querySelector("input[name=_acf_screen][value=acf_form]")) {
      return console.error("Something seems off with the acf form");
    }

    new ACFFrontendForm(form);

    this.loaded = true;
  }
}
