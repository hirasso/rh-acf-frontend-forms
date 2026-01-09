#### 3.3.1 (2025-12-20)

- Add a time-based honeypot strategy to frontend forms (#e68b1a8)

#### 3.3.0 (2025-12-20)

- Validate time based honeypot (#ce22f75)
- Render a time-based honeypot field (#f692889)
- Migrate to sass@1.97.1 (#6c83859)
- Add support for git updater (#4a5c14c)
- Cleanup (#9a0784f)
- Formatting (#dff3d24)
- PHP 8 compatibility (#00410ef)

#### 3.2.9 (2021-07-06)

- Cleanup (#ebc3081)
- remove code-workspace (#b5138de)
- Remove rh-updater dependency (#923dd75)

#### 3.2.8 (2020-05-27)

- optimize changelog (#60eaf1e)
- Feature: Support for multiline commit messages in changelog 🤓 (#6032d83)
- Move some logic to post-commit (#44b62d0)
- Cleanup ✨ (#4442d79)
- Remove dependency `simpleGit` for changelog generation (#ae3ec10)
- Inject post type location rule for frontend forms (#b8f68a1)
- Add changelog generation to post-comit (#d52febb)
- add dates to changelog versions (#fe0194b)
- Automate changelog generation (#890fd8e)
- update changelog (#431dcd8)
- move changelog generation out of git hook (#fe51342)
- Automated changelog generation (#21fda31)
- v 3.2.8 (#df612e3)

#### 3.2.7 (2020-05-25)

- introducing: Parcel! (#cd3faf2)
- more robust injection of acff field group settings (#bfb1c60)

#### 3.2.6 (2020-05-25)

- fix prepare_field when $field === false (#9d90cbb)

#### 3.2.5 (2020-05-25)

- fix namespace and structure (#d393227)

#### 3.2.4 (2020-05-25)

- v 3.2.4 (#d4a2b0d)

#### 3.2.3 (2020-05-25)

- truly hide ACFF field group settings for non-admins (#2113658)
- cleanup (#57974bb)
- add list view 'Admin Forms' (#bc63177)
- wait for ACF until initialization (#482aeb9)

#### 3.2.2 (2020-05-18)

- Fix missing frontend forms menu item in some cases (#d775274)

#### 3.2.1 (2020-05-18)

- add rule to always show frontend_forms for attached post types (#6b69021)

#### 3.2.0 (2020-05-18)

- v 3.2.0 (#a0ee426)

#### 3.1.5 (2020-05-18)

- fix maxlength problems with special chars (#0b06617)

#### 3.1.4 (2020-05-15)

- pre-commit instead of pre-push (#459ad38)
- v 3.1.4 (#ea1b0a4)

#### 3.1.3 (2020-05-15)

- Fix maxlength and ampersands in textfields (#e78e383)
- build assets (#f30ed35)
- Version: 3.1.3 (#90296ab)

#### 3.1.2 (2020-03-16)

- Fix notice if $field false (#015c93f)

#### 3.1.1 (2020-01-21)

- Alllow only 'text' in rich text message (#b114a34)

#### 3.1.0 (2020-01-16)

- trim mime types in allowed file types (#c88bb21)

#### 3.0.9 (2020-01-15)

- JavaScript Support for field type 'file' (#7eb783f)

#### 3.0.8 (2020-01-15)

- Don't add has-value to files or images (#5d0e46c)

#### 3.0.7 (2020-01-10)

- Add 'has-message' to message fields (#d05c3d4)
- Don't strip tags from rich text message (#1eb8198)
- Overwrite simple message if there is a rich message (#bd605fd)
- Allow rich text for message fields (#3c6e995)

#### 3.0.6 (2020-01-08)

- new Version (#ee36dca)

#### 3.0.5 (2020-01-08)

- don't add has-value to repeater, group, flexible content (#af69487)
- Version 3.0.5 (#4c643ce)

#### 3.0.4 (2019-12-19)

- add 'onSuccess' to acfFrontendForm() (#5916b3c)
- Re-activate validate_value (#eab5e20)
- Update Version (#442ba78)

#### 3.0.3 (2019-12-18)

- Better prepare_field (#1aa390b)
- Return links to file fields (#8932e02)
- add 'return' to ajax response (#a683d96)

#### 3.0.2 (2019-12-16)

- Add rich message to true_false (#b189e8f)

#### 3.0.1 (2019-12-13)

- Better check for parent field group (repeaters) (#8513f3b)

#### 3.0.0 (2019-12-12)

- Version 3.0.0 built (#36d3ea1)
- Version 3.0.0 (#030ca5c)

#### 2.0.9 (2019-12-12)

- Hide field setting 'layout' for non-admins (#3d5dbd0)
- Force 'block' layout for repeaters and groups (#8e9b5e1)
- Version 2.0.9 (#921ff84)

#### 2.0.8 (2019-12-12)

- Add 'has-value' to field if it has a value (#1fe3b18)
- Don't display form reviews on admin side (#5979b36)
- Re-add form review label (#f0bfc14)
- Hide label for form reviews (#e88f880)

#### 2.0.7 (2019-12-11)

- New field type 'Form Review' (#62172e5)

#### 2.0.6 (2019-12-10)

- Load admin styles after ACF (#75f048f)

#### 2.0.5 (2019-11-21)

- Better filter instructions (#51369d8)
- Rename allowed fields hook (#6b39220)

#### 2.0.4 (2019-11-19)

- Version 2.0.4: Frontend Forms Caps (#452d1b3)

#### 2.0.3 (2019-11-15)

- Restore permissions (#57b2c77)
- Cleanup :)) (#edc84b9)
- Add filter for acf styles (#7435e3b)
- Add admin styles earlier (#9d316ed)
- Never allow frontend_form field type in frontend forms (#1217d06)
- Cleanup (#cd5736c)
- Add field type 'frontend_form' (#578b1d8)
- Restructuring, add admin css (#68b71dd)
- Don't save acf frontend forms (#9982f84)
- Don't save frontend forms to JSON (#b9809eb)
- Fix asset URI (#5c6fd8d)
- Custom Views (#a1a343d)
- Better hooks for updating post meta (#195e824)
- Better admin menu (#5f8620d)
- Re-arrange structure (#73371cf)
- Rename hooks (#d658061)
- Add Permissions Class (#f09a3d3)
- Update Version (#65313f9)

#### 2.0.2 (2019-04-27)

- Fix Updates Check (#5b8f9df)

#### 2.0.1 (2019-04-26)

- Update Version (#eb769e9)

#### 2.0.0 (2019-04-26)

- disable unload hook on ajax success (#6ca6a94)
- Better asset URI (#a5456c3)
- Rename asset files (#1099640)
- Rename everything, centralize updates check (#6d3cd49)

#### 1.3.5 (2019-04-14)

- cleanup (#a457251)
- Compatibility with ACF 5.7.13 (#967e868)

#### 1.3.4 (2019-02-05)

- Remove Logging, Better success event trigger (#1933017)

#### 1.3.3 (2019-01-24)

- Change Version (#366f244)

#### 1.3.2 (2019-01-24)

- Filter error message (#70d0e13)
- Fix select2 autofill (#377c6d1)

#### 1.3.1 (2018-11-08)

- Version (#6ae9ced)

#### 1.3.0 (2018-11-08)

- Drop rah object in favor of jquery plugin (#7939e45)
- Disable Browsersync Snippet (#81b6572)
- Make acfFrontendForm() a jquery plugin (#a400b04)

#### 1.2.9 (2018-11-02)

- Fix autofill and form reset (#eea0455)
- Add debug messages (#e03f189)
- Call correct hideSpinner (#fb2f2c3)
- Minor Fixes (#cad969d)

#### 1.2.8 (2018-11-02)

- Add BrowserSync Snippet (#26151c7)
- Number input has-value toggle (#ded2a70)

#### 1.2.7 (2018-10-10)

- Update Version (#8471621)

#### 1.2.6 (2018-10-10)

- Don't autofill already filled fields (#446ffaa)
- Untrack assets (#486aa95)
- Add ajax response event (#c34a2e1)

#### 1.2.5 (2018-08-23)

- Only filter image preview size in frontend (#929986d)

#### 1.2.4 (2018-08-22)

- Change Version Number (#db4191d)

#### 1.2.3 (2018-08-22)

- Add Readmy (#b24af85)
- optimize repeater append and remove actions (#16d370e)

#### 1.2.1 (2018-08-08)

- fixed form error message (#223f17f)
- Exclude more stuff on upload (#372f1e9)
- Exclude git in upload (#46e9adc)
- Optimized npm scripts, updated version number (#72fc6e7)

#### 1.2 (2018-08-02)

- Renamed “deploy” task to “upload” (#2fe274a)

#### 1.1 (2018-08-02)

- Optimized deploy script (#78c916a)
- Added test fish script (#e7974f4)
- Optimize deploy process (#45a99b2)
- Improved deploy script (#9fd530d)
- Update .gitignore (#ba1fe16)
- fixed deploy process (#6da6313)
- update plugin version, add plugin update checker (#5d4ce71)

#### 1.0 (2018-08-01)

- Add Plugin Update Checker (#d87d9f6)
- fucking mime types :P (#b5d73a5)
- API improvements (#af4e8ec)
- optimize image-drop (#51364c4)
- optimize has-value check (#f89edd6)
- image-drop fixes (#1c0acdf)
- added acf_localize_data to force validation (#f54ed88)
- Image Drop Optimizations (#e64b9e5)
- Optimize “lateInitializeFields” (#ad6e8c0)
- Support options in form data attribute (#99e194b)
- Prevent JS double-initialization of fields (#d673bda)
- Steps to support multiple same acf_form’s on one page (#caeab8a)
- fixed rah/acf-form-resized for image-drops (#9c1e7d6)
- Added rah/acf-form-resized event trigger (#b143147)
- Fixes, fixes, fixes (#0ed355a)
- Initial commit (#e39db03)

