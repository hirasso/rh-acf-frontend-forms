/**
 * TypeScript declarations for Advanced Custom Fields JavaScript API
 */

/**
 * ACF Field object
 */
export interface ACFFField {
  /** The field's jQuery element */
  $el: JQuery;

  /** Get the field's input element(s) */
  $input(): JQuery;

  /** Field type */
  type: string;

  /** Field key */
  key: string;

  /** Field name */
  name: string;

  /** Get field value */
  val(): any;

  /** Set field value */
  val(value: any): void;

  /** Show error message */
  showError(message: string): void;

  /** Remove error message */
  removeError(): void;

  /** Field data */
  data: {
    type: string;
    required: number;
    key: string;
    name: string;
  };

  /** Get something from this field's data */
  get(key: string): any;
}

/**
 * Data returned from acf.get_data() for repeater fields
 */
export interface ACFRepeaterData {
  /** Maximum number of rows allowed */
  max: number;

  /** Minimum number of rows required */
  min: number;

  [key: string]: any;
}

/** the type of acf.data */
export type ACFGlobalConfig = {
  validation?: boolean;

  select2L10n: Record<string, any>;

  google_map_api: string;

  datePickerL10n: {
    closeText: string;
    currentText: string;
    nextText: string;
    prevText: string;
    weekHeader: string;
    monthNames: string[];
    monthNamesShort: string[];
    dayNames: string[];
    dayNamesMin: string[];
    dayNamesShort: string[];
    isRTL: boolean | null;
    [key: string]: any;
  };

  dateTimePickerL10n: {
    timeOnlyTitle: string;
    timeText: string;
    hourText: string;
    minuteText: string;
    secondText: string;
    millisecText: string;
    microsecText: string;
    timezoneText: string;
    currentText: string;
    closeText: string;
    selectText: string;
    amNames: string[];
    pmNames: string[];
    isRTL: boolean | null;
    [key: string]: any;
  };

  colorPickerL10n: Record<string, any>;

  iconPickerA11yStrings: Record<string, any>;

  iconPickeri10n: Record<string, string>;

  mimeTypeIcon: string;

  mimeTypes: Record<string, string>;

  admin_url: string;
  ajaxurl: string;
  nonce: string;

  acf_version: string;
  wp_version: string;

  browser: string;
  locale: string;
  rtl: boolean;

  screen?: string;
  post_id?: number | string | null;

  editor: "classic" | "block" | string;

  is_pro: boolean;
  debug: boolean;
  StrictMode: boolean;
};

type ACFKey = keyof ACFGlobalConfig;

/**
 * Advanced Custom Fields global API
 */
export type ACF = {
  data: ACFGlobalConfig;

  /** Get a property from acf.data */
  get<K extends ACFKey>(key: K): ACFGlobalConfig[K];

  /** Set a property in acf.data */
  set<K extends ACFKey>(key: K, value?: ACFGlobalConfig[K]): ACFGlobalConfig;

  /**
   * Add an action hook
   * @param action - Action name (e.g., 'new_field', 'new_field/type=image', 'submit', 'append', 'remove')
   * @param callback - Callback function (receives ACFFField for field actions, JQuery for element actions)
   */
  addAction<T extends HTMLElement>(
    action: "remove" | "append",
    callback: (arg: JQuery<T>) => void | boolean,
  ): void;
  addAction(
    action: "validation_success",
    callback: (
      $form: JQuery<HTMLFormElement>,
      valdation: Record<any, any>,
    ) => void,
  );
  addAction(
    action: "submit",
    callback: ($form: JQuery<HTMLFormElement>) => void,
  );
  addAction(
    action: `new_field/type=image` | `new_field/type=file`,
    callback: (arg: ACFFFileField) => void | boolean,
  ): void;
  addAction(
    action: "new_field" | `new_field/type=${string}`,
    callback: (arg: ACFFField) => void | boolean,
  ): void;

  /**
   * Get an ACFfield based on field key
   */
  getField(key: string | JQuery): ACFFField | undefined;

  /**
   * Get an ACFfield based on $field element
   */
  getInstance($field: JQuery): ACFFField | undefined;

  /**
   * Trigger an action hook
   */
  doAction(action: string, ...args: any[]): void;

  /**
   * Get data from an ACF element
   * @param $el - jQuery element
   */
  get_data($el: JQuery): ACFRepeaterData;

  /**
   * Show loading spinner
   */
  showSpinner(): void;

  /**
   * Hide loading spinner
   */
  hideSpinner(): void;

  /**
   * Lock a form
   */
  lockForm($form: JQuery): void;

  /**
   * Unlock a form
   */
  unlockForm($form: JQuery): void;

  /**
   * Validation API
   */
  validation: {
    enable(): void;
    reset($form: JQuery<HTMLFormElement>): void;
    disable(): void;
  };

  /**
   * Validate a form
   *
   * @param form – A jQuery instance of the HTMLFormElement
   * @param event – Will be re-triggered if validation passes. Do not use
   * @param reset – If errors, notices etc. should be reset after validation
   */
  validateForm(args: {
    form: JQuery<HTMLFormElement>;
    event?: SubmitEvent | JQuery.Event<SubmitEvent>;
    reset?: boolean;
    loading?: () => void;
    complete?: () => void;
    failure?: () => void;
    success?: ($form: JQuery<HTMLFormElement>) => void;
  }): void;

  /**
   * An ACF validator Backbone.js Model instance
   */
  validator: {
    id: "Validator";
  };

  /**
   * Unload API
   */
  unload: {
    enable(): void;
    disable(): void;
  };
};

/**
 * Image field data settings
 */
export interface ImageFieldSettings {
  restrictions?: {
    max_size?: {
      value: number;
      error: string;
    };
    mime_types?: {
      value: string[];
      error: string;
    };
  };
}

/**
 * ACF Image Field - extends ACFFField with image-specific methods
 */
export interface ACFFFileField extends ACFFField {
  /** Remove attachment from field */
  removeAttachment(): void;
}

declare global {
  interface Window {
    acf: ACF;
    jQuery: JQueryStatic;
    acfAutofillValues?: Record<string, any>[];
    acfAutoFill: () => void;
  }
}
