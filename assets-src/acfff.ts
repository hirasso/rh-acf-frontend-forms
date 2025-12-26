import "./css/acfff.css";

("use strict");

import "./js/autofill.js";

import { register } from "./js/FrontendFormElement.js";
import ImageDrop from "./js/image-drop.js";
import FileInput from "./js/file-input.js";
import MaxLength from "./js/maxlength.js";

import autosize from "autosize";

import type { ACFFField, ACF, ACFRepeaterData } from "./types";

(($, acf) => {
  if (typeof acf === "undefined") {
    console.warn("The global acf object is not defined");
    return;
  }

  register();
  setup();

  /**
   * Setup global acf functions and hooks
   */
  function setup() {
    // add initialized class to fields on initialization
    acf.addAction("new_field", (field) => {
      field.$el.addClass("acfff-initialized");
      initMaxInputInfo(field);
    });

    acf.addAction("new_field/type=image", (field) => {
      new ImageDrop(field);
    });

    acf.addAction("new_field/type=textarea", (field) => {
      initAutosize(field);
    });

    acf.addAction("new_field/type=file", (field) => {
      new FileInput(field);
    });

    // functions
    acf.showSpinner = function () {
      $("html").addClass("is-loading-form");
    };
    acf.hideSpinner = function () {
      $("html").removeClass("is-loading-form");
    };

    acf.addAction("remove", ($el) => {
      let $repeater = $el.closest(".acf-repeater");
      $el.remove();
      adjustRepeater($el, $repeater, "remove");
    });

    acf.addAction("append", ($el) => {
      adjustRepeater($el, $el.closest(".acf-repeater"), "append");
    });
  }

  function initMaxInputInfo(field: ACFFField) {
    let $info = field.$el.find(".maxlength-info");
    if ($info.length) {
      new MaxLength(field);
    }
  }

  function initAutosize(field: ACFFField) {
    const $input = field.$input();

    $input
      .each((i: number, el: HTMLElement) => {
        autosize(el);
      })
      .on("autosize:resized", function () {
        $(document).trigger("hirasso/acfff/form-resized");
      });
  }

  function adjustRepeater($el: JQuery, $repeater: JQuery, action: string) {
    if (!$repeater.length) {
      return;
    }
    // adjust disabled class
    let o = acf.get_data($repeater);
    let $rows = $repeater.find(".acf-row:not(.acf-clone)");
    let $lastRow = $rows.last();
    let $addRow = $lastRow.find('[data-event="add-row"]');
    $addRow.toggleClass("is-disabled", o.max > 0 && $rows.length >= o.max);

    switch (action) {
      case "append":
        focusFirstInput($lastRow);
        break;
      case "remove":
        break;
    }

    $(document).trigger("hirasso/acfff/form-resized");
  }

  /**
   * Focus the first input of the new row
   */
  function focusFirstInput($el: JQuery) {
    setTimeout(() => {
      const $input = $el.find<HTMLInputElement>("input:first");

      if (!$input.length) {
        return;
      }

      $input.trigger("focus");
    }, 1);
  }
})(jQuery, window.acf);
