<?php

define( 'ABSPATH', __DIR__ );
require_once __DIR__ . '/../../wordpress/cora-knowledge.php';

$security = stapleit_cora_relevant_knowledge( 'We need help securing Microsoft 365', '/it-services/it-support/' );
$network  = stapleit_cora_relevant_knowledge( 'We have Wi-Fi access points and a firewall', '/it-services/it-support/' );
$server   = stapleit_cora_relevant_knowledge( 'We run a physical Windows Server with Active Directory', '/it-services/it-support/' );
$ai       = stapleit_cora_relevant_knowledge( 'We are considering ChatGPT and Copilot for staff', '/it-services/it-support/' );
$default  = stapleit_cora_relevant_knowledge( 'What do you do?', '/' );

$history_context = array( array( 'role' => 'user', 'content' => "What's the cheapest package?" ) );
$basic_follow_up = stapleit_cora_fast_reply( 'What does that include?', stapleit_cora_context_for_turn( 'What does that include?', '', $history_context ) );
$standard_follow_up = stapleit_cora_fast_reply( 'What’s included?', 'package_standard' );
$contact  = stapleit_cora_relevant_knowledge( 'How can I contact Staple IT and when are you open?', '/' );
$boundary = stapleit_cora_relevant_knowledge( 'Can you guarantee compliance or book a call for me?', '/' );
$functions_source = file_get_contents( __DIR__ . '/../../wordpress/functions.php' );

$checks = array(
    array( strpos( $security, 'Microsoft 365 Business Premium' ) !== false, 'Microsoft knowledge is retrieved for Microsoft 365' ),
    array( strpos( $security, 'layered cyber security' ) !== false, 'security knowledge is retrieved for a security question' ),
    array( strpos( $network, 'managed network infrastructure' ) !== false, 'specific network pack knowledge is retrieved' ),
    array( strpos( $server, 'physical Windows Servers' ) !== false, 'specific server pack knowledge is retrieved' ),
    array( strpos( $ai, 'introducing AI tools safely and practically' ) !== false, 'specific AI pack knowledge is retrieved' ),
    array( strpos( $default, '£35 per staff member, per month' ) !== false, 'commercial source of truth is always present' ),
    array( strpos( $boundary, 'Cora is a service guide' ) !== false, 'Cora boundaries are retrieved when relevant' ),
    array( strpos( $contact, 'hello@stapleit.co.uk' ) !== false, 'approved public contact details are retrieved when relevant' ),
    array( strpos( $security, 'additional Microsoft licensing' ) !== false, 'advanced Microsoft licensing caveat is grounded' ),
    array( strpos( $security, 'Endpoint Detection and Response' ) !== false, 'Standard security controls are grounded' ),
    array( strpos( $security, 'Conditional Access' ) !== false, 'identity controls are grounded for security questions' ),
    array( count( stapleit_cora_follow_up_suggestions( 'Microsoft 365 help' ) ) === 3, 'three contextual suggestions are returned' ),
    array( stapleit_cora_follow_up_suggestions( 'We want to use ChatGPT' )[0] === 'Which AI platform might fit?', 'AI questions receive AI-specific follow-up suggestions' ),
    array( stapleit_cora_context_for_turn( 'What does that include?', '', $history_context ) === 'package_basic', 'ambiguous follow-up recovers Basic context from prior user turn' ),
    array( strpos( $basic_follow_up, 'Basic includes unlimited helpdesk support' ) !== false, 'Basic follow-up answers the package that was just discussed' ),
    array( strpos( $standard_follow_up, 'Standard includes everything in Basic' ) !== false, 'explicit Standard follow-up stays on Standard' ),
    array( stapleit_cora_valid_context_key( 'system_prompt' ) === '', 'untrusted conversation context is restricted to an allow-list' ),
    array( strpos( stapleit_cora_fast_reply( 'We have ten staff and want better Microsoft 365 security' ), 'Standard is the sensible starting point' ) !== false, 'common Microsoft 365 security questions receive a concrete fast answer' ),
    array( strpos( stapleit_cora_fast_reply( 'Outlook and our printer keep having problems' ), 'Basic is the natural starting point' ) !== false, 'day-to-day support questions map to Basic without model inference' ),
    array( strpos( stapleit_cora_fast_reply( 'A client wants Cyber Essentials' ), 'Cyber Essentials pack' ) !== false, 'Cyber Essentials readiness has a deterministic grounded answer' ),
    array( stapleit_cora_fast_reply( 'Can you explain our unusual line-of-business workflow?' ) === '', 'ambiguous questions remain available to the local model' ),
    array( strpos( stapleit_cora_fast_reply( 'How much is a Microsoft 365 Business Premium licence?' ), 'does not publish a standalone Microsoft 365 Business Premium licence price' ) !== false, 'standalone Business Premium licence pricing never maps to managed-support pricing' ),
    array( stapleit_cora_context_from_prompt( 'How much is a Microsoft 365 Business Premium licence?' ) === '', 'standalone Business Premium licence pricing does not inherit Premium support-package context' ),
    array( strpos( $functions_source, '$answers_json = wp_unslash' ) !== false, 'planner AJAX JSON is unslashed before decoding' ),
    array( strpos( $functions_source, 'array_key_exists( $key, $answers )' ) !== false, 'add-on planner accepts partial conversation payloads' ),
    array( strpos( $functions_source, 'Unasked areas are unknown' ) !== false, 'partial add-on plans explicitly preserve unknown unasked areas' ),
);

$failures = array();
foreach ( $checks as $check ) {
    if ( ! $check[0] ) {
        $failures[] = $check[1];
    }
}

if ( $failures ) {
    fwrite( STDERR, "Cora knowledge contract failures:\n- " . implode( "\n- ", $failures ) . "\n" );
    exit( 1 );
}

echo 'Cora knowledge contract: ' . count( $checks ) . " checks passed\n";
