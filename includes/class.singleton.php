<?php 

namespace RH\ACFF;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

if( !class_exists('\RH\ACFF\Singleton') ) :

/**
 * Singleton Abstract
 * 
 * @url reference https://blog.cotten.io/how-to-screw-up-singletons-in-php-3e8c83b63189
 */
abstract class Singleton {

  private static $instances = array();

  protected function __construct() {}

  public static function getInstance() {
    $class = get_called_class();
    if (!isset(self::$instances[$class])) {
      self::$instances[$class] = new static();
    }
    return self::$instances[$class];
  }

  private function __clone() {}

  public function __wakeup() {}
}

endif;