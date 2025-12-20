<?php
/**
 * Plugin Name: RH ACF Frontend Forms
 * Version: 3.3.1
 * Author: Rasso Hilber
 * Description: Frontend forms for Advanced Custom Fields
 * Author URI: https://rassohilber.com
 * License: GPL-3.0-or-later
 * License URI: http://www.gnu.org/licenses/gpl-3.0.html
 * GitHub Plugin URI: https://github.com/hirasso/rh-acf-frontend-forms
**/

namespace RH\ACFF;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

function ns($function) {
  return __NAMESPACE__ . "\\$function";
}

/*
 * acff_include
 *
 * Includes a file within the ACF plugin.
 *
 * @date	10/3/14
 * @since	5.0.0
 *
 * @param	string $filename The specified file.
 * @return	void
 */
function acff_include( $filename = '', $debug = false ) {
	$file_path = plugin_dir_path( __FILE__ ) . ltrim($filename, '/');
	if( file_exists($file_path) ) {
    if( $debug ) pre_dump( $file_path );
		include_once($file_path);
	}
}

foreach([
  'class.singleton',
  'class.acff',
  'class.permissions',
] as $filename) {
  acff_include("includes/$filename.php");
}

define('ACFF_ROOT', __FILE__ );

/**
 * API Access to ACFF Singleton Instance
 *
 * @return ACFF
 */
function ACFF() {
  return ACFF::getInstance();
}
if( defined('ACF') ) {
  ACFF();
  new ACFF_Permissions();
}