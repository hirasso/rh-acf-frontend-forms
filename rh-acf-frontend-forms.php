<?php
/**
 * Plugin Name: RH ACF Frontend Forms
 * Version: 2.0.3
 * Author: Rasso Hilber
 * Description: Frontend forms for Advanced Custom Fields
 * Author URI: https://rassohilber.com
**/

namespace RH\ACF\FF;

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

require_once( __DIR__  . '/includes/class-acff.php' );
require_once( __DIR__  . '/includes/class-acff-permissions.php' );