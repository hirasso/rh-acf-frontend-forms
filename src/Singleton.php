<?php

namespace Hirasso\ACFF;

if (! defined('ABSPATH')) {
    exit;
} // Exit if accessed directly



/**
 * Singleton Abstract
 *
 * @url reference https://blog.cotten.io/how-to-screw-up-singletons-in-php-3e8c83b63189
 * @template T of self
 * @phpstan-consistent-constructor
 */
abstract class Singleton
{
    /**
     * @var array<class-string<T>, T>
     */
    private static $instances = [];

    protected function __construct()
    {
    }

    /**
     * @return T
     */
    public static function getInstance()
    {
        $class = get_called_class();
        if (!isset(self::$instances[$class])) {
            self::$instances[$class] = new static();
        }
        return self::$instances[$class];
    }

    private function __clone()
    {
    }

    public function __wakeup()
    {
    }
}
