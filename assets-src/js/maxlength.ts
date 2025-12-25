const $ = window.jQuery;

import type { ACFFField } from "../types.js";

export default class MaxLength {
  $info: JQuery<HTMLElement>;
  max: number;
  $remainingCount: JQuery<HTMLElement>;
  $input: JQuery<HTMLElement>;

  constructor(field: ACFFField) {
    let $el = field.$el;
    this.$info = $el.find(".maxlength-info");
    this.max = parseInt(this.$info.attr("data-maxlength") || "0", 10);
    this.$remainingCount = $el.find(".remaining-count");
    this.$input = field.$input();
    this.$input.on("input maxlength:update", () => this.update());
    this.update();
  }

  update() {
    let value = String(this.$input.val() || "");
    let remaining = this.max - value.length;
    remaining = Math.max(0, remaining);
    if (remaining < 20) {
      this.$info.addClass("is-warning");
    } else {
      this.$info.removeClass("is-warning");
    }
    this.$remainingCount.text(remaining);
    this.$input.val(value.substring(0, this.max));
  }
}
