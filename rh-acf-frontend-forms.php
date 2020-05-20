<?php
/**
 * Plugin Name: RH ACF Frontend Forms
 * Version: 3.2.3
 * Author: Rasso Hilber
 * Description: Frontend forms for Advanced Custom Fields
 * Author URI: https://rassohilber.com
**/

namespace R;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

global $rh_updater_notice_shown;
add_action('plugins_loaded', function() {
  if( class_exists('\RH_Bitbucket_Updater') ) {
    new \RH_Bitbucket_Updater( __FILE__ );
  } else {
    add_action('admin_notices', function() {
      global $rh_updater_notice_shown;
      if( !$rh_updater_notice_shown && current_user_can('activate_plugins') ) {
        $rh_updater_notice_shown = true;
        echo "<div class='notice notice-warning'><p>RH_Updater is not installed. Custom plugins won't be updated.</p></div>";
      }
    });
  }
});

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
 * Instanciate
 */
function ACFF() {
  return ACFF::getInstance();
}
if( defined('ACF') ) {
  ACFF();
  new ACFF_Permissions();
}