## 3.2.8

- changelog.js
- v 3.2.8

## 3.2.7

- introducing: Parcel!
- more robust injection of acff field group settings

## 3.2.6

- fix prepare_field when $field === false

## 3.2.5

- fix namespace and structure

## 3.2.4

- v 3.2.4

## 3.2.3

- truly hide ACFF field group settings for non-admins
- Merge branch 'master' of bitbucket.org:rhilber/rh-acf-frontend-forms
- cleanup
- add list view 'Admin Forms'
- wait for ACF until initialization

## 3.2.2

- Fix missing frontend forms menu item in some cases

## 3.2.1

- add rule to always show frontend_forms for attached post types

## 3.2.0

- v 3.2.0

## 3.1.5

- fix maxlength problems with special chars

## 3.1.4

- pre-commit instead of pre-push
- v 3.1.4

## 3.1.3

- Fix maxlength and ampersands in textfields
- build assets
- Version: 3.1.3

## 3.1.2

- Fix notice if $field false

## 3.1.1

- Alllow only 'text' in rich text message

## 3.1.0

- trim mime types in allowed file types

## 3.0.9

- JavaScript Support for field type 'file'

## 3.0.8

- Don't add has-value to files or images

## 3.0.7

- Add 'has-message' to message fields
- Don't strip tags from rich text message
- Overwrite simple message if there is a rich message
- Allow rich text for message fields

## 3.0.6

- new Version

## 3.0.5

- don't add has-value to repeater, group, flexible content
- Version 3.0.5

## 3.0.4

- add 'onSuccess' to acfFrontendForm()
- Re-activate validate_value
- Update Version

## 3.0.3

- Better prepare_field
- Return links to file fields
- add 'return' to ajax response

## 3.0.2

- Add rich message to true_false

## 3.0.1

- Better check for parent field group (repeaters)

## 3.0.0

- Version 3.0.0 built
- Version 3.0.0

## 2.0.9

- Hide field setting 'layout' for non-admins
- Force 'block' layout for repeaters and groups
- Version 2.0.9

## 2.0.8

- Add 'has-value' to field if it has a value
- Don't display form reviews on admin side
- Re-add form review label
- Hide label for form reviews

## 2.0.7

- New field type 'Form Review'

## 2.0.6

- Load admin styles after ACF

## 2.0.5

- Better filter instructions
- Rename allowed fields hook

## 2.0.4

- Version 2.0.4: Frontend Forms Caps

## 2.0.3

- Restore permissions
- Cleanup :))
- Add filter for acf styles
- Add admin styles earlier
- Never allow frontend_form field type in frontend forms
- Cleanup
- Add field type 'frontend_form'
- Restructuring, add admin css
- Don't save acf frontend forms
- Don't save frontend forms to JSON
- Fix asset URI
- Custom Views
- Better hooks for updating post meta
- Better admin menu
- Re-arrange structure
- Rename hooks
- Add Permissions Class
- Update Version

## 2.0.2

- Fix Updates Check

## 2.0.1

- Update Version

## 2.0.0

- disable unload hook on ajax success
- Better asset URI
- Rename asset files
- Rename everything, centralize updates check

## 1.3.5

- cleanup
- Compatibility with ACF 5.7.13

## 1.3.4

- Remove Logging, Better success event trigger

## 1.3.3

- Change Version

## 1.3.2

- Filter error message
- Fix select2 autofill

## 1.3.1

- Version

## 1.3.0

- Drop rah object in favor of jquery plugin
- Disable Browsersync Snippet
- Make acfFrontendForm() a jquery plugin

## 1.2.9

- Fix autofill and form reset
- Add debug messages
- Call correct hideSpinner
- Minor Fixes

## 1.2.8

- Add BrowserSync Snippet
- Number input has-value toggle

## 1.2.7

- Update Version

## 1.2.6

- Don't autofill already filled fields
- Untrack assets
- Untrack assets
- Add ajax response event

## 1.2.5

- Only filter image preview size in frontend

## 1.2.4

- Change Version Number

## 1.2.3

- Add Readmy
- optimize repeater append and remove actions

## 1.2.1

- fixed form error message
- Exclude more stuff on upload
- Exclude git in upload
- Optimized npm scripts, updated version number

## 1.2

- Renamed “deploy” task to “upload”

## 1.1

- Optimized deploy script
- Added test fish script
- Optimize deploy process
- Improved deploy script
- Update .gitignore
- fixed deploy process
- update plugin version, add plugin update checker

## 1.0

- Add Plugin Update Checker
- fucking mime types :P
- API improvements
- API improvements
- optimize image-drop
- optimize has-value check
- optimize has-value check
- image-drop fixes
- image-drop fixes
- added acf_localize_data to force validation
- Image Drop Optimizations
- Optimize “lateInitializeFields”
- Support options in form data attribute
- Prevent JS double-initialization of fields
- Steps to support multiple same acf_form’s on one page
- fixed rah/acf-form-resized for image-drops
- Added rah/acf-form-resized event trigger
- Added rah/acf-form-resized event trigger
- Fixes, fixes, fixes
- Initial commit

