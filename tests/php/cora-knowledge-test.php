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
$package_flow_start = stapleit_cora_package_flow_step( 'Start package discovery', array() );
$package_flow_security = stapleit_cora_package_flow_step( 'We have 12 staff and need better security', array() );
$package_flow_small = stapleit_cora_package_flow_step( 'We are 3 people and need ongoing IT support', array() );
$package_flow_basic_question = stapleit_cora_package_flow_step( 'We have 8 staff and just need Outlook and printer support', array() );
$package_flow_basic_no_evidence = stapleit_cora_package_flow_step( 'No', $package_flow_basic_question['state'] );
$package_flow_evidence = stapleit_cora_package_flow_step( 'We are 8 people. We mainly need day-to-day IT help, but a client asks for security evidence', array() );
$package_flow_premium = stapleit_cora_package_flow_step( 'We have 20 staff and want Microsoft 365 Business Premium included', array() );
$package_flow_existing_m365 = stapleit_cora_package_flow_step( 'We have 12 staff and already have Microsoft 365 Business Premium', array() );
$package_flow_existing_m365_security = stapleit_cora_package_flow_step( 'We have 12 staff and already have Microsoft 365 Business Premium and need better security', array() );
$package_flow_written_number = stapleit_cora_package_flow_step( 'We are twelve staff and need better security', array() );
$package_flow_twenty_plus = stapleit_cora_package_flow_step( '20+ people', array() );
$package_flow_m365 = stapleit_cora_package_flow_step( 'We use Microsoft 365 Business Premium', array() );

$checks = array(
    array( strpos( $security, 'Microsoft 365 Business Premium' ) !== false, 'Microsoft knowledge is retrieved for Microsoft 365' ),
    array( strpos( $security, 'layered cyber security' ) !== false, 'security knowledge is retrieved for a security question' ),
    array( strpos( $network, 'managed network infrastructure' ) !== false, 'specific network pack knowledge is retrieved' ),
    array( strpos( $server, 'physical Windows Servers' ) !== false, 'specific server pack knowledge is retrieved' ),
    array( strpos( $ai, 'introducing AI tools safely and practically' ) !== false, 'specific AI pack knowledge is retrieved' ),
    array( strpos( $default, '£35 per staff member, per month' ) === false, 'general questions are not biased with package pricing' ),
    array( strpos( $boundary, 'Cora is a service guide' ) !== false, 'Cora boundaries are retrieved when relevant' ),
    array( strpos( $contact, 'hello@stapleit.co.uk' ) !== false, 'approved public contact details are retrieved when relevant' ),
    array( strpos( $security, 'additional Microsoft licensing' ) !== false, 'advanced Microsoft licensing caveat is grounded' ),
    array( strpos( $security, 'Endpoint Detection and Response' ) !== false, 'Standard security controls are grounded' ),
    array( strpos( $security, 'Conditional Access' ) !== false, 'identity controls are grounded for security questions' ),
    array( strpos( stapleit_cora_relevant_knowledge( 'How much is Standard?', '/' ), '£55 per staff member, per month' ) !== false, 'package pricing is still retrieved when the visitor asks for it' ),
    array( strpos( stapleit_cora_relevant_knowledge( 'Our firewall and Wi-Fi need managing', '/it-services/it-support/' ), '£35 per staff member, per month' ) === false, 'page path does not inject package pricing into network questions' ),
    array( count( stapleit_cora_follow_up_suggestions( 'Microsoft 365 help' ) ) === 3, 'three contextual suggestions are returned' ),
    array( stapleit_cora_follow_up_suggestions( 'We want to use ChatGPT' )[0] === 'Which AI platform might fit?', 'AI questions receive AI-specific follow-up suggestions' ),
    array( stapleit_cora_context_for_turn( 'What does that include?', '', $history_context ) === 'package_basic', 'ambiguous follow-up recovers Basic context from prior user turn' ),
    array( strpos( $basic_follow_up, 'Basic includes unlimited helpdesk support' ) !== false, 'Basic follow-up answers the package that was just discussed' ),
    array( strpos( $standard_follow_up, 'Standard includes everything in Basic' ) !== false, 'explicit Standard follow-up stays on Standard' ),
    array( stapleit_cora_valid_context_key( 'system_prompt' ) === '', 'untrusted conversation context is restricted to an allow-list' ),
    array( strpos( stapleit_cora_fast_reply( 'We need better Microsoft 365 security' ), 'For teams of 5+' ) !== false && strpos( stapleit_cora_fast_reply( 'We need better Microsoft 365 security' ), 'Smaller teams use Tailored support' ) !== false, 'general Microsoft 365 security answers do not overstate package eligibility without team size' ),
    array( strpos( stapleit_cora_fast_reply( 'Outlook and our printer keep having problems' ), 'For teams of 5+' ) !== false && strpos( stapleit_cora_fast_reply( 'Outlook and our printer keep having problems' ), 'Smaller teams use Tailored support' ) !== false, 'day-to-day support answers preserve team eligibility until package discovery has enough information' ),
    array( strpos( stapleit_cora_fast_reply( 'A client wants Cyber Essentials' ), 'Cyber Essentials pack' ) !== false, 'Cyber Essentials readiness has a deterministic grounded answer' ),
    array( stapleit_cora_fast_reply( 'Can you explain our unusual line-of-business workflow?' ) === '', 'ambiguous questions remain available to the local model' ),
    array( strpos( stapleit_cora_fast_reply( 'How much is a Microsoft 365 Business Premium licence?' ), 'does not publish a standalone Microsoft 365 Business Premium licence price' ) !== false, 'standalone Business Premium licence pricing never maps to managed-support pricing' ),
    array( stapleit_cora_context_from_prompt( 'How much is a Microsoft 365 Business Premium licence?' ) === '', 'standalone Business Premium licence pricing does not inherit Premium support-package context' ),
    array( strpos( $functions_source, '$answers_json = wp_unslash' ) !== false, 'planner AJAX JSON is unslashed before decoding' ),
    array( strpos( $functions_source, 'array_key_exists( $key, $answers )' ) !== false, 'add-on planner accepts partial conversation payloads' ),
    array( strpos( $functions_source, 'Unasked areas are unknown' ) !== false, 'partial add-on plans explicitly preserve unknown unasked areas' ),
    array( strpos( $functions_source, 'If a visitor describes immediate physical danger from a device' ) !== false, 'Cora prioritises physical safety over package recommendations' ),
    array( strpos( $functions_source, 'if ( ! $matches ) return array();' ) !== false, 'unclassified prompts do not default to Basic package' ),
    array( strpos( $functions_source, '$fallback_suggestions = $fallback_services ?' ) !== false, 'unclassified prompts do not receive generic sales suggestion chips' ),
    array( strpos( $functions_source, '$device_prompt = (bool) preg_match' ) !== false, 'unclassified device prompts use a safety-first fallback' ),
    array( strpos( $functions_source, '( $device_prompt || $fallback_services || ! $model_allowed ) ? \'\'' ) !== false, 'device, deterministic add-on and non-contextual replies cannot be overridden by the local model' ),
    array( $package_flow_start['complete'] === false && strpos( $package_flow_start['reply'], 'How many people' ) !== false && count( $package_flow_start['suggestions'] ) === 4, 'package discovery starts with all four team-size choices' ),
    array( $package_flow_security['complete'] === true && $package_flow_security['state']['team'] === '10' && $package_flow_security['context'] === 'package_standard', 'free-text 12-staff stronger-security request resolves directly to Standard without model inference' ),
    array( $package_flow_small['complete'] === true && $package_flow_small['context'] === 'package_sole' && strpos( $package_flow_small['reply'], '£35' ) === false, 'teams below five route to Tailored and never receive Basic pricing' ),
    array( $package_flow_basic_question['complete'] === false && $package_flow_basic_question['state']['security'] === 'basic' && strpos( $package_flow_basic_question['reply'], 'security evidence' ) !== false, 'Basic intent asks the one follow-up that can change the recommendation' ),
    array( $package_flow_basic_no_evidence['complete'] === true && $package_flow_basic_no_evidence['context'] === 'package_basic', 'Basic intent with no evidence requirement resolves to Basic' ),
    array( $package_flow_evidence['complete'] === true && $package_flow_evidence['context'] === 'package_standard', 'security evidence escalates day-to-day support to Standard' ),
    array( $package_flow_premium['complete'] === true && $package_flow_premium['context'] === 'package_premium', 'explicit Business Premium inclusion resolves to Premium' ),
    array( $package_flow_existing_m365['complete'] === false && $package_flow_existing_m365['state']['security'] === '', 'already owning Business Premium does not force Premium support' ),
    array( $package_flow_existing_m365_security['complete'] === true && $package_flow_existing_m365_security['context'] === 'package_standard', 'existing Business Premium plus stronger security resolves to Standard' ),
    array( $package_flow_written_number['complete'] === true && $package_flow_written_number['state']['team'] === '10', 'written team sizes are understood without asking for digits' ),
    array( $package_flow_twenty_plus['state']['team'] === '25', '20+ team-size quick reply is parsed correctly' ),
    array( $package_flow_m365['state']['team'] === '', 'Microsoft 365 is never misread as a 365-person team' ),
    array( strpos( $functions_source, 'substr( wp_unslash' ) !== false && strpos( $functions_source, "flow_state" ) !== false, 'package conversation state payload is length-bounded server-side' ),
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
