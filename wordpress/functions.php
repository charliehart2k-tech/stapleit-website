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

    $forms_path = get_template_directory() . '/assets/js/forms.js';
    $version    = file_exists( $forms_path ) ? (string) filemtime( $forms_path ) : null;

    wp_enqueue_script(
        'stapleit-forms',
        get_template_directory_uri() . '/assets/js/forms.js',
        array(),
        $version,
        true
    );
} );

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

add_action( 'rest_api_init', function () {
    register_rest_route( 'stapleit/v1', '/audit', array(
        'methods'             => 'POST',
        'callback'            => 'stapleit_handle_audit_request',
        'permission_callback' => '__return_true',
    ) );
} );

function stapleit_request_ip() {
    if ( ! empty( $_SERVER['HTTP_CF_CONNECTING_IP'] ) ) {
        return sanitize_text_field( wp_unslash( $_SERVER['HTTP_CF_CONNECTING_IP'] ) );
    }

    return ! empty( $_SERVER['REMOTE_ADDR'] )
        ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) )
        : 'unknown';
}

function stapleit_handle_audit_request( WP_REST_Request $request ) {
    $name    = sanitize_text_field( (string) $request->get_param( 'name' ) );
    $email   = sanitize_email( (string) $request->get_param( 'email' ) );
    $consent = sanitize_text_field( (string) $request->get_param( 'contact-consent' ) );
    $website = sanitize_text_field( (string) $request->get_param( 'website' ) );

    if ( $website !== '' ) {
        return new WP_REST_Response( array( 'ok' => true ), 200 );
    }

    if ( $name === '' || ! is_email( $email ) || $consent !== 'yes' ) {
        return new WP_Error(
            'stapleit_invalid_form',
            'Please enter your name, a valid email address and confirm that Staple IT may contact you.',
            array( 'status' => 400 )
        );
    }

    $ip       = stapleit_request_ip();
    $rate_key = 'stapleit_audit_' . md5( $ip );

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
        'post_title'  => sprintf( 'Free IT audit — %s', $name ),
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
    update_post_meta( $lead_id, '_stapleit_consent', 'yes' );
    update_post_meta( $lead_id, '_stapleit_ip', $ip );
    update_post_meta( $lead_id, '_stapleit_received_at', current_time( 'mysql' ) );

    $subject = sprintf( '[Staple IT] Free IT audit request — %s', $name );
    $message = implode( "\n", array(
        'A new free IT audit request has been submitted.',
        '',
        'Name: ' . $name,
        'Email: ' . $email,
        'Consent to contact: Yes',
        'Received: ' . current_time( 'mysql' ),
        'Source: ' . home_url( '/' ),
        '',
        'The enquiry has also been saved in WordPress under Form Enquiries.',
    ) );

    $headers = array(
        'Content-Type: text/plain; charset=UTF-8',
        sprintf( 'Reply-To: %s <%s>', $name, $email ),
    );

    $mail_sent = wp_mail( 'hello@stapleit.co.uk', $subject, $message, $headers );
    update_post_meta( $lead_id, '_stapleit_mail_sent', $mail_sent ? 'yes' : 'no' );

    if ( ! $mail_sent ) {
        error_log( sprintf( 'Staple IT audit enquiry %d saved but wp_mail() returned false.', $lead_id ) );
    }

    return new WP_REST_Response( array(
        'ok'      => true,
        'message' => 'Thanks — your audit request has been received. We’ll get back to you within one working day.',
    ), 200 );
}

add_filter( 'manage_stapleit_lead_posts_columns', function ( $columns ) {
    return array(
        'cb'             => $columns['cb'],
        'title'          => 'Enquiry',
        'stapleit_email' => 'Email',
        'date'           => 'Received',
    );
} );

add_action( 'manage_stapleit_lead_posts_custom_column', function ( $column, $post_id ) {
    if ( $column === 'stapleit_email' ) {
        $email = get_post_meta( $post_id, '_stapleit_email', true );
        if ( $email ) {
            echo '<a href="mailto:' . esc_attr( $email ) . '">' . esc_html( $email ) . '</a>';
        }
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
        'Name'       => get_post_meta( $post->ID, '_stapleit_name', true ),
        'Email'      => get_post_meta( $post->ID, '_stapleit_email', true ),
        'Received'   => get_post_meta( $post->ID, '_stapleit_received_at', true ),
        'Mail sent'  => get_post_meta( $post->ID, '_stapleit_mail_sent', true ),
        'IP address' => get_post_meta( $post->ID, '_stapleit_ip', true ),
    );

    echo '<table class="widefat striped"><tbody>';
    foreach ( $fields as $label => $value ) {
        echo '<tr><th style="width:160px">' . esc_html( $label ) . '</th><td>' . esc_html( (string) $value ) . '</td></tr>';
    }
    echo '</tbody></table>';
}
