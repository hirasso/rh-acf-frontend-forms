
/**
 * ACF Frontend Forms
 * Version: 1.0
 */

global.jQuery = $ = window.jQuery;

import './app/acf-autofill';
import ACFFrontendForm from './app/acf-frontend-form';

window.rah = window.rah || {};

window.rah.acfFrontendForm = function( $form, options = {} ) {
  return new ACFFrontendForm( $form, options );
}
