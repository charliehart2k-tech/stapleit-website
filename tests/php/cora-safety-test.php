<?php

define( 'ABSPATH', __DIR__ );
require_once __DIR__ . '/../../wordpress/cora-safety.php';

$cases = array(
    array(
        true,
        'Standard starts from £55 per staff member, per month and adds stronger security, backup and identity protection.',
        'published Standard price',
    ),
    array(
        true,
        'A Security pack may be worth discussing. Its price is confirmed after a review of what you actually need.',
        'price-on-application guidance without an invented amount',
    ),
    array(
        true,
        'Premium starts from £75 per staff member, per month and includes Microsoft 365 Business Premium.',
        'published Premium inclusion',
    ),
    array(
        false,
        'Standard starts at £55 per month.',
        'price missing its per-staff basis',
    ),
    array(
        false,
        'Microsoft 365 Business Premium can be added for an extra £20 per month.',
        'invented add-on price',
    ),
    array(
        false,
        'Please provide your contact details so I can process your request.',
        'unsupported collection and processing claim',
    ),
    array(
        false,
        'Standard includes Microsoft 365 Business Premium.',
        'incorrect package inclusion',
    ),
    array(
        false,
        'I can book a call for you tomorrow.',
        'unsupported booking capability',
    ),
);

$failures = array();
foreach ( $cases as $case ) {
    list( $expected, $reply, $label ) = $case;
    $actual = stapleit_cora_reply_is_safe( $reply );
    if ( $actual !== $expected ) {
        $failures[] = $label . ': expected ' . ( $expected ? 'safe' : 'rejected' );
    }
}

if ( $failures ) {
    fwrite( STDERR, "Cora safety contract failures:\n- " . implode( "\n- ", $failures ) . "\n" );
    exit( 1 );
}

echo 'Cora safety contract: ' . count( $cases ) . " cases passed\n";
