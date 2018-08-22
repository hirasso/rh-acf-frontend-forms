## RAH ACF Frontend Forms

### Instructions

Initialize the plugin's frontend script like this:

```javascript
$('.acf-form').each((i, el) => {
  let f = rah.acfForm( $(el), {
    ajaxSubmit: true,
    waitAfterSubmit: 1000,
    resetAfterSubmit: true,
    submitOnChange: false
  });
});
```

