(($) => {
  window.acfAutoFill = function (id = 0) {
    let $forms = $(".acf-form");

    if (!$forms.length) {
      return false;
    }

    const values = window.acfAutofillValues?.[id];

    if (typeof values !== "object") {
      console.warn("window.acfAutofillValues is not defined");
      return false;
    }

    console.log("Autofilling form...");

    let scrollTop = $(document).scrollTop();

    $forms.each((i, el) => {
      let $form = $(el);
      $form.addClass("is-autofilled");

      $form.find(".fill-password-suggestion").trigger("click");
      fillFields($form, values);

      $form.find("textarea").each((i, ta) => {
        $(ta).trigger("maxlength:update");
        var evt = document.createEvent("Event");
        evt.initEvent("autosize:update", true, false);
        ta.dispatchEvent(evt);
      });

      $form.trigger("autofilled");
    });

    $("html,body").animate({ scrollTop }, 0);

    function fillFields(
      $wrap: JQuery<HTMLElement>,
      values: Record<string, any>,
    ) {
      $.each(values, (key, value) => {
        const $fields = $wrap.find(`.acf-field[data-name="${key}"]`);

        if (!$fields.length) {
          return true;
        }

        $fields.each((i: number, el: HTMLElement) => {
          let $field = $(el);

          if (typeof value === "object" && !(value instanceof Date)) {
            $.each(value, (key, val) => {
              if (typeof key === "number") {
                if (key > 0) {
                  $field.find('[data-event="add-row"]:last').trigger("click");
                }
                fillFields($field.find(".acf-fields").eq(key), val);
              } else {
                fillFields($field, val);
              }
            });
          } else {
            let $inputs = $field.find("input, select, checkbox, textarea");
            fillField($inputs, value, key);
          }
        });
      });
    }

    function fillField(
      $inputs: JQuery<HTMLElement>,
      value: any,
      fieldName: string,
    ) {
      $inputs.each((i: number, el: HTMLElement) => {
        let $input = $(el);
        let type = $input.attr("type");
        let currentValue =
          type === "checkbox" ? $input.prop("checked") : $input.val();

        let debugInfo = {
          $input: el,
          currentValue: currentValue,
          fieldName: fieldName,
          autofillValue: value,
        };

        if (
          type === "hidden" ||
          type === "file" ||
          $input.hasClass("select2-search__field") ||
          $input.parents(".acf-clone").length
        ) {
          return;
        }

        if (currentValue) {
          console.log(
            "[ACFAutoFill] Field already has value, skipping:",
            debugInfo,
          );

          return;
        }

        switch (type) {
          case "checkbox":
            $input.prop("checked", value).trigger("change");
            return;
            break;
        }

        if ($input.hasClass("hasDatepicker")) {
          // @ts-ignore ts doesn't know about the datepicker
          $input.datepicker("setDate", value).trigger("change");
          return;
        }

        // default
        $input.val(value).trigger("change");
      });
    }
  };
})(window.jQuery);
