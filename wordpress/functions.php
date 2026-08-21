<?php
/**
 * Staple IT theme functionality deployed from Git.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'wp_enqueue_scripts', function () {
    if ( ! is_front_page() ) {
        return;
    }

    $forms_path  = get_template_directory() . '/assets/js/forms.js';
    $js_version  = file_exists( $forms_path ) ? (string) filemtime( $forms_path ) : null;

    wp_enqueue_script(
        'stapleit-forms',
        get_template_directory_uri() . '/assets/js/forms.js',
        array(),
        $js_version,
        true
    );
} );

/* Keep the public surface lean. These features are unused on Staple IT and
 * add unnecessary output or attack surface. */
add_action( 'after_setup_theme', function () {
    remove_action( 'wp_head', 'wp_generator' );
    remove_action( 'wp_head', 'rsd_link' );
    remove_action( 'wp_head', 'wlwmanifest_link' );
    remove_action( 'wp_head', 'wp_shortlink_wp_head', 10 );
    remove_action( 'wp_head', 'rest_output_link_wp_head' );
    remove_action( 'template_redirect', 'rest_output_link_header', 11 );
    remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
    remove_action( 'wp_print_styles', 'print_emoji_styles' );
} );

add_filter( 'emoji_svg_url', '__return_false' );
add_filter( 'xmlrpc_enabled', '__return_false' );
add_filter( 'xmlrpc_methods', '__return_empty_array' );
add_filter( 'pre_option_default_pingback_flag', '__return_zero' );
add_filter( 'wp_headers', function ( $headers ) {
    unset( $headers['X-Pingback'] );
    return $headers;
} );

/* Sensible sender identity. An authenticated SMTP plugin can override these
 * filters later; until then WordPress will at least identify mail correctly. */
add_filter( 'wp_mail_from', function () {
    return 'hello@stapleit.co.uk';
}, 5 );

add_filter( 'wp_mail_from_name', function () {
    return 'Staple IT';
}, 5 );

/* Homepage metadata and schema live in the static source template. WordPress
 * must not emit a second copy here because the deployed static template is the
 * canonical owner of title, social metadata and structured data. */

add_action( 'init', function () {
    register_post_type( 'stapleit_lead', array(
        'labels' => array(
            'name'          => 'Form Enquiries',
            'singular_name' => 'Form Enquiry',
            'menu_name'     => 'Form Enquiries',
        ),
        'public'              => false,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'menu_icon'           => 'dashicons-email-alt',
        'supports'            => array( 'title' ),
        'capability_type'     => 'post',
        'map_meta_cap'        => true,
        'exclude_from_search' => true,
        'show_in_rest'        => false,
    ) );
} );

/* Browser submissions use admin-ajax.php so form delivery does not depend on
 * REST rewrite routing. */
add_action( 'wp_ajax_nopriv_stapleit_audit', 'stapleit_handle_audit_ajax' );
add_action( 'wp_ajax_stapleit_audit', 'stapleit_handle_audit_ajax' );
add_action( 'wp_ajax_nopriv_stapleit_support_enquiry', 'stapleit_handle_support_enquiry_ajax' );
add_action( 'wp_ajax_stapleit_support_enquiry', 'stapleit_handle_support_enquiry_ajax' );

function stapleit_handle_audit_ajax() {
    stapleit_handle_enquiry_ajax( 'audit' );
}

function stapleit_handle_support_enquiry_ajax() {
    stapleit_handle_enquiry_ajax( 'sole_trader_support' );
}

function stapleit_handle_enquiry_ajax( $enquiry_type ) {
    $request = new WP_REST_Request( 'POST', '/stapleit/v1/enquiry' );
    $request->set_body_params( wp_unslash( $_POST ) );

    $response = stapleit_handle_enquiry_request( $request, $enquiry_type );

    if ( is_wp_error( $response ) ) {
        $error_data = $response->get_error_data();
        $status     = is_array( $error_data ) && isset( $error_data['status'] )
            ? (int) $error_data['status']
            : 400;

        wp_send_json( array(
            'ok'      => false,
            'message' => $response->get_error_message(),
        ), $status );
    }

    wp_send_json( $response->get_data(), $response->get_status() );
}

function stapleit_request_ip() {
    $remote_ip = ! empty( $_SERVER['REMOTE_ADDR'] )
        ? trim( (string) wp_unslash( $_SERVER['REMOTE_ADDR'] ) )
        : '';
    $remote_ip = filter_var( $remote_ip, FILTER_VALIDATE_IP ) ? $remote_ip : 'unknown';

    /* The documented architecture terminates cloudflared on loopback. Only
     * trust its forwarding header on that path; a directly reachable origin
     * must not let a visitor choose the rate-limit identity. */
    if (
        in_array( $remote_ip, array( '127.0.0.1', '::1' ), true ) &&
        ! empty( $_SERVER['HTTP_CF_CONNECTING_IP'] )
    ) {
        $cloudflare_ip = trim( (string) wp_unslash( $_SERVER['HTTP_CF_CONNECTING_IP'] ) );
        if ( filter_var( $cloudflare_ip, FILTER_VALIDATE_IP ) ) {
            return $cloudflare_ip;
        }
    }

    return $remote_ip;
}

function stapleit_handle_audit_request( WP_REST_Request $request ) {
    return stapleit_handle_enquiry_request( $request, 'audit' );
}

function stapleit_handle_support_enquiry_request( WP_REST_Request $request ) {
    return stapleit_handle_enquiry_request( $request, 'sole_trader_support' );
}

function stapleit_handle_enquiry_request( WP_REST_Request $request, $enquiry_type ) {
    $is_support = $enquiry_type === 'sole_trader_support';
    $config     = $is_support
        ? array(
            'label'           => 'Sole trader IT support',
            'subject'         => '[Staple IT] Sole trader support enquiry — %s',
            'opening'         => 'A new sole trader IT support enquiry has been submitted.',
            'success'         => 'Thanks — your enquiry has been received. We’ll get back to you within one working day.',
            'source'          => home_url( '/it-services/it-support/' ),
            'require_details' => true,
        )
        : array(
            'label'           => 'Free IT audit',
            'subject'         => '[Staple IT] Free IT audit request — %s',
            'opening'         => 'A new free IT audit request has been submitted.',
            'success'         => 'Thanks — your audit request has been received. We’ll get back to you within one working day.',
            'source'          => home_url( '/' ),
            'require_details' => false,
        );

    $name         = trim( sanitize_text_field( (string) $request->get_param( 'name' ) ) );
    $email        = trim( sanitize_email( (string) $request->get_param( 'email' ) ) );
    $consent      = sanitize_text_field( (string) $request->get_param( 'contact-consent' ) );
    $website      = sanitize_text_field( (string) $request->get_param( 'website' ) );
    $requirements = trim( sanitize_textarea_field( (string) $request->get_param( 'requirements' ) ) );

    if ( $website !== '' ) {
        return new WP_REST_Response( array( 'ok' => true ), 200 );
    }

    if (
        $name === '' ||
        strlen( $name ) > 120 ||
        ! is_email( $email ) ||
        strlen( $email ) > 254 ||
        $consent !== 'yes' ||
        strlen( $requirements ) > 2000 ||
        ( $config['require_details'] && $requirements === '' )
    ) {
        return new WP_Error(
            'stapleit_invalid_form',
            $config['require_details']
                ? 'Please enter your name, a valid email address, a short description of what you need and confirm that Staple IT may contact you.'
                : 'Please enter your name, a valid email address and confirm that Staple IT may contact you.',
            array( 'status' => 400 )
        );
    }

    $ip       = stapleit_request_ip();
    $rate_key = 'stapleit_' . $enquiry_type . '_' . hash_hmac( 'sha256', $ip, wp_salt( 'nonce' ) );

    if ( get_transient( $rate_key ) ) {
        return new WP_Error(
            'stapleit_rate_limited',
            'Thanks — we already received a request from you very recently. Please wait a moment before trying again.',
            array( 'status' => 429 )
        );
    }

    set_transient( $rate_key, 1, MINUTE_IN_SECONDS );

    $lead_id = wp_insert_post( array(
        'post_type'   => 'stapleit_lead',
        'post_status' => 'private',
        'post_title'  => sprintf( '%s — %s', $config['label'], $name ),
    ), true );

    if ( is_wp_error( $lead_id ) ) {
        delete_transient( $rate_key );
        return new WP_Error(
            'stapleit_store_failed',
            'We could not save your request. Please try again or email hello@stapleit.co.uk.',
            array( 'status' => 500 )
        );
    }

    update_post_meta( $lead_id, '_stapleit_name', $name );
    update_post_meta( $lead_id, '_stapleit_email', $email );
    update_post_meta( $lead_id, '_stapleit_enquiry_type', $config['label'] );
    update_post_meta( $lead_id, '_stapleit_requirements', $requirements );
    update_post_meta( $lead_id, '_stapleit_consent', 'yes' );
    update_post_meta( $lead_id, '_stapleit_received_at', current_time( 'mysql' ) );
    update_post_meta( $lead_id, '_stapleit_source', esc_url_raw( $config['source'] ) );

    $subject       = sprintf( $config['subject'], $name );
    $message_lines = array(
        $config['opening'],
        '',
        'Enquiry type: ' . $config['label'],
        'Name: ' . $name,
        'Email: ' . $email,
        'Consent to contact: Yes',
        'Received: ' . current_time( 'mysql' ),
        'Source: ' . $config['source'],
    );

    if ( $requirements !== '' ) {
        $message_lines[] = '';
        $message_lines[] = 'Requirements:';
        $message_lines[] = $requirements;
    }

    $message_lines = array_merge( $message_lines, array(
        '',
        'The enquiry has also been saved in WordPress under Form Enquiries.',
    ) );
    $message = implode( "\n", $message_lines );

    $headers = array(
        'Content-Type: text/plain; charset=UTF-8',
        sprintf( 'Reply-To: %s <%s>', $name, $email ),
    );

    $mail_error = '';
    $mail_failure_listener = function ( $error ) use ( &$mail_error ) {
        if ( is_wp_error( $error ) ) {
            $mail_error = $error->get_error_message();
        }
    };

    add_action( 'wp_mail_failed', $mail_failure_listener );
    $mail_sent = wp_mail( 'hello@stapleit.co.uk', $subject, $message, $headers );
    remove_action( 'wp_mail_failed', $mail_failure_listener );

    update_post_meta( $lead_id, '_stapleit_mail_sent', $mail_sent ? 'yes' : 'no' );

    if ( $mail_error !== '' ) {
        update_post_meta( $lead_id, '_stapleit_mail_error', sanitize_text_field( $mail_error ) );
    }

    if ( ! $mail_sent ) {
        error_log( sprintf( 'Staple IT %s enquiry %d saved but wp_mail() returned false%s.', $enquiry_type, $lead_id, $mail_error ? ': ' . $mail_error : '' ) );
    }

    return new WP_REST_Response( array(
        'ok'      => true,
        'message' => $config['success'],
    ), 200 );
}

add_filter( 'manage_stapleit_lead_posts_columns', function ( $columns ) {
    return array(
        'cb'             => $columns['cb'],
        'title'          => 'Enquiry',
        'stapleit_type'  => 'Type',
        'stapleit_email' => 'Email',
        'stapleit_mail'  => 'Mail',
        'date'           => 'Received',
    );
} );

add_action( 'manage_stapleit_lead_posts_custom_column', function ( $column, $post_id ) {
    if ( $column === 'stapleit_type' ) {
        $type = get_post_meta( $post_id, '_stapleit_enquiry_type', true );
        echo esc_html( $type ? $type : 'Free IT audit' );
    }

    if ( $column === 'stapleit_email' ) {
        $email = get_post_meta( $post_id, '_stapleit_email', true );
        if ( $email ) {
            echo '<a href="mailto:' . esc_attr( $email ) . '">' . esc_html( $email ) . '</a>';
        }
    }

    if ( $column === 'stapleit_mail' ) {
        $mail_sent = get_post_meta( $post_id, '_stapleit_mail_sent', true );
        echo esc_html( $mail_sent === 'yes' ? 'Sent' : 'Not sent' );
    }
}, 10, 2 );

add_action( 'add_meta_boxes_stapleit_lead', function () {
    add_meta_box(
        'stapleit_enquiry_details',
        'Enquiry details',
        'stapleit_render_enquiry_details',
        'stapleit_lead',
        'normal',
        'high'
    );
} );

function stapleit_render_enquiry_details( WP_Post $post ) {
    $fields = array(
        'Type'         => get_post_meta( $post->ID, '_stapleit_enquiry_type', true ),
        'Name'         => get_post_meta( $post->ID, '_stapleit_name', true ),
        'Email'        => get_post_meta( $post->ID, '_stapleit_email', true ),
        'Requirements' => get_post_meta( $post->ID, '_stapleit_requirements', true ),
        'Source'       => get_post_meta( $post->ID, '_stapleit_source', true ),
        'Received'     => get_post_meta( $post->ID, '_stapleit_received_at', true ),
        'Mail sent'    => get_post_meta( $post->ID, '_stapleit_mail_sent', true ),
        'Mail error'   => get_post_meta( $post->ID, '_stapleit_mail_error', true ),
    );

    echo '<table class="widefat striped"><tbody>';
    foreach ( $fields as $label => $value ) {
        echo '<tr><th scope="row">' . esc_html( $label ) . '</th><td>' . esc_html( (string) $value ) . '</td></tr>';
    }
    echo '</tbody></table>';
}
