const $ = window.jQuery;

import feather from "feather-icons";
import type { ACFImageField, ImageFieldSettings } from "../types.js";

export default class FileInput {
  acfField: ACFImageField;
  $el: ACFImageField["$el"];
  $input: JQuery<HTMLElement>;
  $clear: JQuery<HTMLElement>;
  $uploader: JQuery<HTMLElement>;
  $instructions: JQuery<HTMLElement>;
  dataSettings: ImageFieldSettings;
  lastInputVal: string | number | string[] | undefined;

  constructor(acfField: ACFImageField) {
    // vars
    this.acfField = acfField;
    this.$el = acfField.$el;

    this.$input = this.$el.find('input[type="file"]');
    this.$clear = this.$el.find('[data-name="remove"]');
    this.$clear.html(feather.icons["x-circle"].toSvg());

    this.$uploader = this.$el.find(".acf-file-uploader");
    this.$instructions = this.$el.find(".instructions");
    this.$instructions.appendTo(this.$uploader);
    this.dataSettings = this.$instructions.data("settings");

    this.setupEvents();
  }

  maybeGet<T>(
    key: string,
    object: any,
    fallback: T | undefined,
  ): T | undefined {
    let value = (object || {})[key];
    return value != null ? value : fallback;
  }

  setupEvents() {
    const eventProps = ($ as any).event.props;
    if ($.inArray("dataTransfer", eventProps) === -1) {
      eventProps.push("dataTransfer");
    }

    this.$uploader.on("dragover", (e) => {
      e.preventDefault();
      this.$uploader.addClass("is-dragover");
    });

    this.$uploader.on("dragleave", () => {
      this.$uploader.removeClass("is-dragover");
    });

    this.$uploader.on("drop", (e) => {
      e.preventDefault();
      this.$uploader.removeClass("is-dragover");
      const inputElement = this.$input.get(0) as HTMLInputElement;
      const dataTransfer = (e as any).dataTransfer as DataTransfer;
      if (inputElement && dataTransfer) {
        inputElement.files = dataTransfer.files;
      }
      this.$input.trigger("change");
      // this.parseFile( e.dataTransfer.files[0] );
    });

    this.$clear.off().on("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.clear();
    });

    this.lastInputVal = this.$input.val();
    this.$input.on("change", () => this.onInputChange(this.$input));
  }

  clear(errors: string[] | false = false) {
    this.acfField.removeAttachment();
    this.$input.val("");
    this.lastInputVal = this.$input.val();
    if (errors) {
      this.acfField.showError(errors.join("<br>"));
    }
  }

  onInputChange($input: JQuery<HTMLElement>) {
    if (this.lastInputVal === $input.val()) {
      return;
    }
    this.lastInputVal = $input.val();
    if ($input.val()) {
      const inputElement = $input[0] as HTMLInputElement;
      const file = inputElement.files?.[0];
      if (file) {
        this.parseFile(file);
      }
    } else {
      this.clear();
    }
  }

  parseFile(file: File) {
    let reader = new FileReader();
    reader.onload = () => {
      let errors = this.getErrors(file);
      if (!errors) {
        this.acfField.removeError();
      } else {
        this.clear(errors);
      }
    };
    reader.readAsDataURL(file);
  }

  getErrors(file: File): string[] | false {
    let errors: string[] = [];

    // Check for max size
    let maxSize = this.maybeGet<{
      value: number;
      error: string;
    }>("max_size", this.dataSettings.restrictions, undefined);
    if (maxSize && file.size / 1000000 > maxSize.value) {
      errors.push(maxSize.error);
    }

    // Check for mime type
    let mimeTypes = this.maybeGet<{
      value: string[];
      error: string;
    }>("mime_types", this.dataSettings.restrictions, undefined);
    if (mimeTypes) {
      let extension = file.name.split(".").pop()?.toLowerCase(); // file extension from input file
      if (extension) {
        let isValidMimeType = $.inArray(extension, mimeTypes.value) > -1; // is extension in acceptable types
        if (!isValidMimeType) {
          errors.push(mimeTypes.error);
        }
      }
    }

    return errors.length ? errors : false;
  }
}
