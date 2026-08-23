<?php

define( 'ABSPATH', __DIR__ );
require_once __DIR__ . '/../../wordpress/cora-knowledge.php';

$security = stapleit_cora_relevant_knowledge( 'We need help securing Microsoft 365', '/it-services/it-support/' );
$network  = stapleit_cora_relevant_knowledge( 'We have Wi-Fi access points and a firewall', '/it-services/it-support/' );
$server   = stapleit_cora_relevant_knowledge( 'We run a physical Windows Server with Active Directory', '/it-services/it-support/' );
$ai       = stapleit_cora_relevant_knowledge( 'We are considering ChatGPT and Copilot for staff', '/it-services/it-support/' );
$default  = stapleit_cora_relevant_knowledge( 'What do you do?', '/' );

$checks = array(
    array( strpos( $security, 'Microsoft 365 Business Premium' ) !== false, 'Microsoft knowledge is retrieved for Microsoft 365' ),
    array( strpos( $security, 'layered cyber security' ) !== false, 'security knowledge is retrieved for a security question' ),
    array( strpos( $network, 'managed network infrastructure' ) !== false, 'specific network pack knowledge is retrieved' ),
    array( strpos( $server, 'physical Windows Servers' ) !== false, 'specific server pack knowledge is retrieved' ),
    array( strpos( $ai, 'introducing AI tools safely and practically' ) !== false, 'specific AI pack knowledge is retrieved' ),
    array( strpos( $default, '£35 per staff member, per month' ) !== false, 'commercial source of truth is always present' ),
    array( strpos( $default, 'Cora is a service guide' ) !== false, 'Cora boundaries are always present' ),
    array( strpos( $default, 'hello@stapleit.co.uk' ) !== false, 'approved public contact details are grounded' ),
    array( strpos( $security, 'additional Microsoft licensing' ) !== false, 'advanced Microsoft licensing caveat is grounded' ),
    array( strpos( $security, 'Endpoint Detection and Response' ) !== false, 'Standard security controls are grounded' ),
    array( strpos( $security, 'Conditional Access' ) !== false, 'identity controls are grounded for security questions' ),
    array( count( stapleit_cora_follow_up_suggestions( 'Microsoft 365 help' ) ) === 3, 'three contextual suggestions are returned' ),
    array( stapleit_cora_follow_up_suggestions( 'We want to use ChatGPT' )[0] === 'Which AI platform might fit?', 'AI questions receive AI-specific follow-up suggestions' ),
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
