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

/**
 * Return a rate-limit identity without trusting an arbitrary forwarded header.
 *
 * Cloudflare reaches this WordPress origin through the loopback-only Tunnel.
 */
function stapleit_holding_request_ip() {
    $remote_ip = isset( $_SERVER['REMOTE_ADDR'] )
        ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) )
        : '';

    if (
        in_array( $remote_ip, array( '127.0.0.1', '::1' ), true )
        && isset( $_SERVER['HTTP_CF_CONNECTING_IP'] )
    ) {
        $cloudflare_ip = sanitize_text_field( wp_unslash( $_SERVER['HTTP_CF_CONNECTING_IP'] ) );
        if ( filter_var( $cloudflare_ip, FILTER_VALIDATE_IP ) ) {
            return $cloudflare_ip;
        }
    }

    return filter_var( $remote_ip, FILTER_VALIDATE_IP ) ? $remote_ip : 'unknown';
}

/**
 * Return to the holding page with a generic, non-enumerating error state.
 */
function stapleit_holding_login_error( $state ) {
    nocache_headers();
    wp_safe_redirect( '/holding/?login=' . rawurlencode( $state ) . '#preview-login', 303 );
    exit;
}

/**
 * Confirm that the current browser session may view the staging build.
 *
 * Authentication alone is insufficient: only users with the existing
 * site-builder capability may pass the holding page.
 */
function stapleit_holding_preview_is_authorised() {
    return is_user_logged_in() && current_user_can( 'edit_theme_options' );
}

/**
 * Keep the WordPress REST surface behind the same staging entitlement.
 */
add_filter( 'rest_authentication_errors', function ( $result ) {
    if ( null !== $result ) {
        return $result;
    }

    if ( stapleit_holding_preview_is_authorised() ) {
        return $result;
    }

    return new WP_Error(
        'stapleit_staging_auth_required',
        'Authentication is required to access the staging website.',
        array( 'status' => 401 )
    );
}, 99 );

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

    if ( '/holding-login/' === $path ) {
        $method = isset( $_SERVER['REQUEST_METHOD'] )
            ? strtoupper( sanitize_text_field( wp_unslash( $_SERVER['REQUEST_METHOD'] ) ) )
            : 'GET';

        if ( 'POST' !== $method ) {
            status_header( 404 );
            exit;
        }

        $nonce = isset( $_POST['holding_nonce'] )
            ? sanitize_text_field( wp_unslash( $_POST['holding_nonce'] ) )
            : '';
        if ( ! wp_verify_nonce( $nonce, 'stapleit_holding_login' ) ) {
            stapleit_holding_login_error( 'invalid' );
        }

        $rate_key = 'stapleit_holding_login_' . hash_hmac(
            'sha256',
            stapleit_holding_request_ip(),
            wp_salt( 'nonce' )
        );
        $attempts = (int) get_transient( $rate_key );
        if ( $attempts >= 5 ) {
            stapleit_holding_login_error( 'locked' );
        }

        $username = isset( $_POST['log'] )
            ? sanitize_text_field( wp_unslash( $_POST['log'] ) )
            : '';
        $password = isset( $_POST['pwd'] )
            ? (string) wp_unslash( $_POST['pwd'] )
            : '';

        if ( '' === $username || '' === $password ) {
            set_transient( $rate_key, $attempts + 1, 15 * MINUTE_IN_SECONDS );
            stapleit_holding_login_error( 'failed' );
        }

        $user = wp_signon(
            array(
                'user_login'    => $username,
                'user_password' => $password,
                'remember'      => true,
            ),
            is_ssl()
        );

        if ( is_wp_error( $user ) || ! user_can( $user, 'edit_theme_options' ) ) {
            if ( ! is_wp_error( $user ) ) {
                wp_logout();
            }
            set_transient( $rate_key, $attempts + 1, 15 * MINUTE_IN_SECONDS );
            stapleit_holding_login_error( 'failed' );
        }

        delete_transient( $rate_key );
        wp_set_current_user( $user->ID );
        nocache_headers();
        wp_redirect( 'https://staging.stapleitdev.co.uk/', 303, 'Staple IT holding page' );
        exit;
    }

    /*
     * The holding page is the only public front-end route on this build.
     * Every other path is checked server-side, so changing the address cannot
     * bypass the preview login. Static theme assets are served by Nginx and do
     * not enter this WordPress request path.
     */
    if ( '/holding/' !== $path ) {
        if ( ! stapleit_holding_preview_is_authorised() ) {
            nocache_headers();
            header( 'X-Robots-Tag: noindex, nofollow, noarchive', true );
            wp_safe_redirect( '/holding/', 302, 'Staple IT staging gate' );
            exit;
        }

        /* Never allow an authenticated staging response to enter a shared cache. */
        nocache_headers();
        header( 'X-Robots-Tag: noindex, nofollow, noarchive', true );
    }

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
        '/holding/'                         => 'holding-page.php',
    );

    if ( ! isset( $routes[ $path ] ) ) {
        return;
    }

    $template = get_template_directory() . '/' . $routes[ $path ];

    if ( ! is_file( $template ) ) {
        return;
    }

    status_header( 200 );
    if ( '/holding/' === $path ) {
        nocache_headers();
    }
    header( 'X-Robots-Tag: noindex, nofollow, noarchive', true );

    include $template;
    exit;
}, 0 );
