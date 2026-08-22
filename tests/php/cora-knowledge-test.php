<?php

define( 'ABSPATH', __DIR__ );
require_once __DIR__ . '/../../wordpress/cora-knowledge.php';

$security = stapleit_cora_relevant_knowledge( 'We need help securing Microsoft 365', '/it-services/it-support/' );
$network  = stapleit_cora_relevant_knowledge( 'We have Wi-Fi access points and a firewall', '/it-services/it-support/' );
$default  = stapleit_cora_relevant_knowledge( 'What do you do?', '/' );

$checks = array(
    array( strpos( $security, 'Microsoft 365 Business Premium' ) !== false, 'Microsoft knowledge is retrieved for Microsoft 365' ),
    array( strpos( $security, 'layered cyber security' ) !== false, 'security knowledge is retrieved for a security question' ),
    array( strpos( $network, 'Optional packs are Server, Azure, Network' ) !== false, 'pack knowledge is retrieved for network equipment' ),
    array( strpos( $default, '£35 per staff member, per month' ) !== false, 'commercial source of truth is always present' ),
    array( strpos( $default, 'Cora is a service guide' ) !== false, 'Cora boundaries are always present' ),
    array( count( stapleit_cora_follow_up_suggestions( 'Microsoft 365 help' ) ) === 3, 'three contextual suggestions are returned' ),
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
