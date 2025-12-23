/**
 * TypeScript declarations for Advanced Custom Fields JavaScript API
 */

/**
 * ACF Field object
 */
export interface ACFField {
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

/**
 * Advanced Custom Fields global API
 */
export interface ACF {
  /**
   * Add an action hook
   * @param action - Action name (e.g., 'new_field', 'new_field/type=image', 'submit', 'append', 'remove')
   * @param callback - Callback function (receives ACFField for field actions, JQuery for element actions)
   */
  addAction<T extends HTMLElement>(
    action: "remove" | "append" | "submit",
    callback: (arg: JQuery<T>) => void | boolean,
  ): void;
  addAction(
    action: `new_field/type=image`,
    callback: (arg: ACFImageField) => void | boolean,
  ): void;
  addAction(
    action: `new_field/type=file`,
    callback: (arg: ACFImageField) => void | boolean,
  ): void;
  addAction(
    action: "new_field" | `new_field/type=${string}`,
    callback: (arg: ACFField) => void | boolean,
  ): void;

  /**
   * Get an ACFfield based on field key
   */
  getField(key: string): ACFField | undefined;

  /**
   * Get an ACFfield based on $field element
   */
  getInstance($field: JQuery): ACFField | undefined;

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
    reset($form: JQuery): void;
  };

  /**
   * Unload API
   */
  unload: {
    disable(): void;
  };
}

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
 * ACF Image Field - extends ACFField with image-specific methods
 */
export interface ACFImageField extends ACFField {
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
