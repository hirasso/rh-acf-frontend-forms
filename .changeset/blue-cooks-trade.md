---
"rh-acf-frontend-forms": patch
---

Always activate the ACF validation, even on pages without any ACF form. This fixes a bug where ACF form validation would not be activated when first visiting a page **without a form** and then navigating to a page via AJAX (SPA) that **does contain a form**.
