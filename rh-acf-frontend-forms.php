<?php
/**
 * Plugin Name: RH ACF Frontend Forms
 * Version: 3.1.4
 * Author: Rasso Hilber
 * Description: Frontend forms for Advanced Custom Fields
 * Author URI: https://rassohilber.com
**/

namespace ACFF;

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


/**
 * acf_get_path
 *
 * Returns the plugin path to a specified file.
 *
 * @date	28/9/13
 * @since	5.0.0
 *
 * @param	string $filename The specified file.
 * @return	string
 */
function get_path( $filename = '' ) {
	return plugin_dir_path( __FILE__ ) . ltrim($filename, '/');
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
	$file_path = get_path($filename);
	if( file_exists($file_path) ) {
    if( $debug ) pre_dump( $file_path );
		include_once($file_path);
	}
}

/**
 * Returns the prefix for the plugin.
 *
 * @return void
 */
function get_prefix() {
  return 'rh_acff';
}

/**
 * Helper function to get versioned asset urls
 *
 * @param [type] $path
 * @return void
 */
function asset_uri( $path ) {
  $uri = plugins_url( $path, __FILE__ );
  $file = plugin_dir_path( __FILE__ ) . $path;
  if( file_exists( $file ) ) {
    $version = filemtime( $file );
    $uri .= "?v=$version";
  }
  return $uri;
}

/**
 * Checks if we are in a development environment
 *
 * @return boolean
 */
function is_dev() {
  return defined('WP_ENV') && WP_ENV === 'development';
}

/**
 * Returns settings page info
 *
 * @return void
 */
function get_settings_page_info() {
  $prefix = get_prefix();
  $id = "{$prefix}_settings";
  return (object) [
    'id' => $id,
    'slug' => str_replace('_', '-', $id)
  ];
}

foreach([
  'class-acff',
  'class-permissions',
] as $filename) {
  acff_include("includes/$filename.php");
}


$acff = new ACFF();
new Permissions( $acff );
