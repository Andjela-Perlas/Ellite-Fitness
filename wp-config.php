<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'fitness' );

/** MySQL database username */
define( 'DB_USER', 'root' );

/** MySQL database password */
define( 'DB_PASSWORD', '' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'K`3WLl/k!ei^o*7=(Qm;i}0+kv1?Uo5l{sYE#}#)5yh)s9r4=n[7c5xq4SQ=#`GU' );
define( 'SECURE_AUTH_KEY',  'OI,O6UkxktS}VD;DbJdv7~4EGYl#_oN~^rK`5URg>Dhw._?qnn}-6CtT(c9~T+6,' );
define( 'LOGGED_IN_KEY',    '5$/?% B;{dk[}*c3U.j{[q9++)/!e2m1t *Orl@)l9_9|jE5`]}ZpU5E#KsO7E/D' );
define( 'NONCE_KEY',        'V?Y+9b`bro[]5!cH#[wZHim1^]{WoO$;8f1:}7*&v5-wKd8]zq%<sa$O.eIo ONc' );
define( 'AUTH_SALT',        '&*2XEn6}<JxiQGF9G~MxLIGmH}y.HDH0;iB4O%=If]KuqszGAl:4K&MQR3L]-,^m' );
define( 'SECURE_AUTH_SALT', 'j0GyY[-kS|t+:(>SPrPT+Pt@^t||_E@GXG >iWiiNUSn%AL_g[xJxTFW|%R463c#' );
define( 'LOGGED_IN_SALT',   'rnQl<X:>rHiV,xuoJW~m5;J1L=MU*]310r(be&p5|hKemv%;+JCqfWvR$*9v4@T$' );
define( 'NONCE_SALT',       '.MaPkT(b}=;C`1NZ_uQ5%LKa,L2Co+)@)pD;0e b?*y&U{~e7(=7y)V)S t,|Si;' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wpp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
