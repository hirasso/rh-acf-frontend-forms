---
"rh-acf-frontend-forms": major
---

- Disable the jQuery API
- Introduce new php API function `acf_frontend_form()`:

```php
/**
 * Render an ACF Frontend Form
 * @param array<string, mixed> $args – These options are forwarded unmodified to acf_form($args)
 * @see https://www.advancedcustomfields.com/resources/acf_form/
 */
echo acfff()->form([
  /** @see https://www.advancedcustomfields.com/resources/acf_form/ */
])->ajax(
  waitAfterSubmit: 1500,
  resetAfterSubmit: true,
  submitOnChange: false,
)->render();
```
