<?php

$route_source = file_get_contents( __DIR__ . '/../../wordpress/mu-plugins/stapleit-static-routes.php' );
$page_source  = file_get_contents( __DIR__ . '/../../site/holding/index.html' );
$script_source = file_get_contents( __DIR__ . '/../../site/assets/js/holding.js' );

$checks = array(
    array( strpos( $route_source, "'/holding-login/' === \$path" ) !== false, 'holding login uses an exact server-side route' ),
    array( strpos( $route_source, "'POST' !== \$method" ) !== false, 'holding login rejects non-POST requests' ),
    array( strpos( $route_source, "wp_verify_nonce( \$nonce, 'stapleit_holding_login' )" ) !== false, 'holding login verifies its CSRF nonce' ),
    array( strpos( $route_source, 'wp_signon(' ) !== false, 'holding login delegates password verification to WordPress' ),
    array( strpos( $route_source, "user_can( \$user, 'edit_theme_options' )" ) !== false, 'holding login requires site-builder capability' ),
    array( strpos( $route_source, '$attempts >= 5' ) !== false, 'holding login limits repeated attempts' ),
    array( strpos( $route_source, '15 * MINUTE_IN_SECONDS' ) !== false, 'holding login lockout has a bounded duration' ),
    array( strpos( $route_source, "in_array( \$remote_ip, array( '127.0.0.1', '::1' ), true )" ) !== false, 'forwarded IP is trusted only from the loopback Tunnel' ),
    array( strpos( $route_source, "'https://staging.stapleitdev.co.uk/'" ) !== false, 'successful login redirects only to the fixed staging origin' ),
    array( strpos( $page_source, 'action="/holding-login/"' ) !== false, 'holding form posts to the local server-side handler' ),
    array( strpos( $page_source, "wp_nonce_field( 'stapleit_holding_login', 'holding_nonce' )" ) !== false, 'holding form emits the matching nonce' ),
    array( strpos( $page_source, 'autocomplete="current-password"' ) !== false, 'holding password field supports password managers' ),
    array( strpos( $page_source, 'name="pwd" value=' ) === false, 'holding page never embeds a password value' ),
    array( strpos( $script_source, 'holding-password' ) === false, 'holding JavaScript never reads the password field' ),
);

$failures = array();
foreach ( $checks as $check ) {
    if ( ! $check[0] ) {
        $failures[] = $check[1];
    }
}

if ( $failures ) {
    fwrite( STDERR, "Holding-page authentication contract failures:\n- " . implode( "\n- ", $failures ) . "\n" );
    exit( 1 );
}

echo 'Holding-page authentication contract: ' . count( $checks ) . " checks passed\n";
