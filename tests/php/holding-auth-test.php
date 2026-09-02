<?php

$route_source = file_get_contents( __DIR__ . '/../../wordpress/mu-plugins/stapleit-static-routes.php' );
$page_source  = file_get_contents( __DIR__ . '/../../site/holding/index.html' );
$script_source = file_get_contents( __DIR__ . '/../../site/assets/js/holding.js' );

$gate_position   = strpos( $route_source, "if ( '/holding/' !== \$path )" );
$routes_position = strpos( $route_source, '$routes = array(' );

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
    array( strpos( $route_source, 'function stapleit_holding_preview_is_authorised()' ) !== false, 'staging gate has one server-side authorisation decision' ),
    array( strpos( $route_source, "is_user_logged_in() && current_user_can( 'edit_theme_options' )" ) !== false, 'staging requires both authentication and site-builder authorisation' ),
    array( false !== $gate_position, 'every non-holding front-end path enters the staging gate' ),
    array( false !== $gate_position && false !== $routes_position && $gate_position < $routes_position, 'staging gate runs before route templates are served' ),
    array( strpos( $route_source, "wp_safe_redirect( '/holding/', 302, 'Staple IT staging gate' )" ) !== false, 'unauthenticated front-end requests return to the holding page' ),
    array( strpos( $route_source, "add_filter( 'rest_authentication_errors'" ) !== false, 'WordPress REST requests use the same staging authorisation boundary' ),
    array( strpos( $route_source, "'stapleit_staging_auth_required'" ) !== false, 'unauthenticated REST requests fail closed' ),
    array( substr_count( $route_source, 'nocache_headers();' ) >= 4, 'public redirects and protected staging responses are non-cacheable' ),
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
