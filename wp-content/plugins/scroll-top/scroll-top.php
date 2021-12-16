<?php

/**
 * Plugin Name:       Scroll To Top
 * Plugin URI:        https://idenovasi.com/projects/scroll-top/
 * Description:       Adds a flexible Back to Top button to any post/page of your WordPress website.
 * Version:           1.2.0
 * Requires at least: 5.6
 * Requires PHP:      7.2
 * Author:            Idenovasi
 * Author URI:        https://idenovasi.com/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       scroll-top
 * Domain Path:       /languages
 */

// Exit if accessed directly
if (!defined('ABSPATH')) exit;

class Scroll_Top {

    /**
     * PHP5 constructor method.
     */
    public function __construct() {

        // Set the constants needed by the plugin.
        add_action('plugins_loaded', array(&$this, 'constants'), 1);

        // Internationalize the text strings used.
        add_action('plugins_loaded', array(&$this, 'i18n'), 2);

        // Load the functions files.
        add_action('plugins_loaded', array(&$this, 'includes'), 3);

        // Load the admin files.
        add_action('plugins_loaded', array(&$this, 'admin'), 4);
    }

    /**
     * Defines constants used by the plugin.
     */
    public function constants() {

        // Set constant path to the plugin directory.
        define('ST_DIR', trailingslashit(plugin_dir_path(__FILE__)));

        // Set the constant path to the plugin directory URI.
        define('ST_URI', trailingslashit(plugin_dir_url(__FILE__)));

        // Set the constant path to the inc directory.
        define('ST_INCLUDES', ST_DIR . trailingslashit('inc'));

        // Set the constant path to the admin directory.
        define('ST_ADMIN', ST_DIR . trailingslashit('admin'));

        // Set the constant path to the aseets directory.
        define('ST_ASSETS', ST_URI . trailingslashit('assets'));
    }

    /**
     * Loads the translation files.
     */
    public function i18n() {
        load_plugin_textdomain('scroll-top', false, dirname(plugin_basename(__FILE__)) . '/languages/');
    }

    /**
     * Loads the initial files needed by the plugin.
     */
    public function includes() {
        require_once(ST_INCLUDES . 'functions.php');
    }

    /**
     * Loads the admin functions and files.
     */
    public function admin() {
        if (is_admin()) {
            require_once(ST_ADMIN . 'admin.php');
        }
    }
}

new Scroll_Top;
