const $ = window.jQuery;

import feather from "feather-icons";
import type { ACFImageField, ImageFieldSettings } from "../types.js";

export default class ImageDrop {
  acfField: ACFImageField;
  $el: ACFImageField["$el"];
  $input: JQuery<HTMLElement>;
  $imagePreview: JQuery<HTMLElement>;
  $image: JQuery<HTMLImageElement>;
  $clear: JQuery<HTMLElement>;
  $imageUploader: JQuery<HTMLElement>;
  $instructions: JQuery<HTMLElement>;
  dataSettings: ImageFieldSettings;
  currentImageSrc: string | undefined;
  lastInputVal: string | number | string[] | undefined;

  constructor(acfField: ACFImageField) {
    // vars
    this.acfField = acfField;

    this.$el = acfField.$el;

    this.$input = this.$el.find('input[type="file"]');
    this.$imagePreview = this.$el.find(".image-wrap");
    this.$image = this.$imagePreview.find("img");
    this.$clear = this.$el.find('[data-name="remove"]');
    this.$clear.html(feather.icons["x-circle"].toSvg());

    this.$imageUploader = this.$el.find(".acf-image-uploader");
    this.$instructions = this.$el.find(".instructions");
    this.$instructions.appendTo(this.$imageUploader);
    this.dataSettings = this.$instructions.data("settings");

    this.$el.addClass("image-drop");
    this.setupEvents();
    this.renderImage(this.$image.attr("src"));
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

    this.$imageUploader.on("dragover", (e) => {
      e.preventDefault();
      this.$imageUploader.addClass("is-dragover");
    });

    this.$imageUploader.on("dragleave", () => {
      this.$imageUploader.removeClass("is-dragover");
    });

    this.$imageUploader.on("drop", (e) => {
      e.preventDefault();
      this.$imageUploader.removeClass("is-dragover");
      const inputElement = this.$input.get(0) as HTMLInputElement;
      const dataTransfer = (e as any).dataTransfer as DataTransfer;
      if (inputElement && dataTransfer) {
        inputElement.files = dataTransfer.files;
      }
      this.$input.trigger("change");
      // this.parseFile( e.dataTransfer.files[0] );
    });

    this.$clear.unbind().click((e) => {
      e.preventDefault();
      e.stopPropagation();
      this.clear();
    });

    this.currentImageSrc = this.$image.attr("src");

    this.lastInputVal = this.$input.val();
    this.$input.change((e) => this.onInputChange(this.$input));
  }

  renderImage(src: string | undefined) {
    if (typeof src === "undefined" || !src.length) {
      return;
    }

    let img = new Image();
    img.onload = () => {
      let ratio = img.height / img.width;
      if (ratio < 0.5) {
        this.clear([
          `The image can't be more than twice the width of it's height`,
        ]);
        return;
      } else if (ratio > 2) {
        this.clear([
          `The image can't be more than twice the height of it's width`,
        ]);
        return;
      }
      let paddingBottom = Math.floor(ratio * 100);
      this.$imageUploader.css({
        paddingBottom: `${paddingBottom}%`,
      });

      this.$image.attr("src", src);
      this.$imageUploader.addClass("has-value");

      $(document).trigger("rh/acf-form-resized");
    };
    img.src = src;
  }

  clear(errors: string[] | false = false) {
    this.acfField.removeAttachment();
    this.$input.val("");
    this.lastInputVal = this.$input.val();
    this.$imageUploader.css({ paddingBottom: "" });
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
    reader.onload = (e) => {
      let errors = this.getErrors(file);
      if (!errors) {
        this.renderImage(e.target?.result as string);
        this.acfField.removeError();
      } else {
        this.clear(errors);
        this.renderImage(this.currentImageSrc);
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
