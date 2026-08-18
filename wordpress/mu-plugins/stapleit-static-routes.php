<?php
/**
 * Serve approved static build routes from the deployed Staple IT theme.
 *
 * These routes are intentionally explicit while pages are being rebuilt. This
 * avoids depending on WordPress page records for in-progress static templates
 * and keeps the Git repository as the source of truth.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'template_redirect', function () {
    if ( is_admin() || wp_doing_ajax() ) {
        return;
    }

    $request_uri = isset( $_SERVER['REQUEST_URI'] )
        ? wp_unslash( $_SERVER['REQUEST_URI'] )
        : '/';
    $path = wp_parse_url( $request_uri, PHP_URL_PATH );

    if ( ! is_string( $path ) ) {
        return;
    }

    $path = '/' . trim( $path, '/' ) . '/';

    $routes = array(
        '/it-services/'                    => 'static-it-services.php',
        '/it-services/it-support/'         => 'static-it-support.php',
        '/it-services/it-solutions/'       => 'static-it-solutions.php',
        '/it-services/it-consultancy/'     => 'static-it-consultancy.php',
        '/it-services/cybersecurity/'       => 'static-cybersecurity.php',
        '/it-services/ai-integrations/'     => 'static-ai-integrations.php',
        '/about-us/'                        => 'static-about-us.php',
        '/about-us/who-we-support/'         => 'static-who-we-support.php',
        '/about-us/our-partners/'           => 'static-our-partners.php',
        '/about-us/privacy-policy/'         => 'static-privacy-policy.php',
        '/about-us/legal/'                  => 'static-legal.php',
        '/get-in-touch/'                    => 'static-get-in-touch.php',
        '/get-in-touch/it-audit/'           => 'static-it-audit.php',
        '/client-portal/'                   => 'static-client-portal.php',
        '/remote-support/'                  => 'static-remote-support.php',
        '/the-staple-blog/'                 => 'static-the-staple-blog.php',
    );

    if ( ! isset( $routes[ $path ] ) ) {
        return;
    }

    $template = get_template_directory() . '/' . $routes[ $path ];

    if ( ! is_file( $template ) ) {
        return;
    }

    status_header( 200 );
    header( 'X-Robots-Tag: noindex, nofollow, noarchive', true );

    include $template;
    exit;
}, 0 );
