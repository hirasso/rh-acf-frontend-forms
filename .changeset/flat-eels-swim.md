---
"rh-acf-frontend-forms": major
---

- Disable the jQuery API
- Introduce new php API function `acf_frontend_form()`:

```php
/**
 * Render an ACF Frontend Form
 * @param string $id
 * @param array<string, mixed> $args
 */
echo acfff()->form(
  id: string,
  args: [
    /**
     * These options are forwarded unmodified to acf_form().
     * @see https://www.advancedcustomfields.com/resources/acf_form/
     */
  ]
)->ajax(
  enabled: true,
  waitAfterSubmit: 1500,
  resetAfterSubmit: true,
  submitOnChange: false,
)->render();
```
