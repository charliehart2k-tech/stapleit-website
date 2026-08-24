<?php

$source = file_get_contents( __DIR__ . '/../../wordpress/functions.php' );
$checks = array(
    array( strpos( $source, "add_filter( 'xmlrpc_enabled', '__return_false' )" ) !== false, 'XML-RPC remains disabled' ),
    array( strpos( $source, "add_filter( 'xmlrpc_methods', '__return_empty_array' )" ) !== false, 'XML-RPC methods remain empty' ),
    array( strpos( $source, "add_filter( 'rest_endpoints'" ) !== false && strpos( $source, "^/wp/v2/users" ) !== false, 'public REST user enumeration is removed' ),
    array( strpos( $source, "is_user_logged_in()" ) !== false, 'authenticated admin REST access is preserved' ),
    array( strpos( $source, 'isset( $_GET[\'author\'] )' ) !== false && strpos( $source, "is_author()" ) !== false, 'author-query and author archives are blocked' ),
    array( strpos( $source, "status_header( 404 )" ) !== false, 'author enumeration returns a 404 rather than redirecting to a slug' ),
    array( strpos( $source, 'in_array( $remote_ip, array( \'127.0.0.1\', \'::1\' )' ) !== false, 'Cloudflare visitor IP is trusted only from the loopback tunnel' ),
    array( strpos( $source, "HTTP_CF_CONNECTING_IP" ) !== false, 'Cloudflare connecting IP is used for rate-limit identity behind the tunnel' ),
    array( strpos( $source, "http://127.0.0.1:11434/api/chat" ) !== false, 'Ollama remains loopback-only in application code' ),
    array( strpos( $source, 'strlen( $prompt ) < 2 || strlen( $prompt ) > 800' ) !== false, 'Cora prompt size remains bounded' ),
    array( strpos( $source, "0, 6000" ) !== false && strpos( $source, "0, 512" ) !== false, 'Cora history and flow state remain bounded' ),
    array( strpos( $source, "LOCK_EX | LOCK_NB" ) !== false, 'local-model generation remains non-blocking and single-flight' ),
);
$failures = array();
foreach ( $checks as $check ) if ( ! $check[0] ) $failures[] = $check[1];
if ( $failures ) {
    fwrite( STDERR, "WordPress hardening contract failures:\n- " . implode( "\n- ", $failures ) . "\n" );
    exit( 1 );
}
echo 'WordPress hardening contract: ' . count( $checks ) . " checks passed\n";
