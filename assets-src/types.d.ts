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
  addAction(
    action: "remove" | "append" | "submit",
    callback: (arg: JQuery) => void | boolean,
  ): void;
  addAction(
    action:
      | "new_field"
      | "new_field/type=image"
      | "new_field/type=textarea"
      | "new_field/type=file",
    callback: (arg: ACFField) => void | boolean,
  ): void;

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
}

declare global {
  interface Window {
    acf: ACF;
    jQuery: JQuery;
  }
}
