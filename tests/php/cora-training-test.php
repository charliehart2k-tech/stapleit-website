<?php

define( 'ABSPATH', __DIR__ );
require_once __DIR__ . '/../../wordpress/cora-safety.php';
require_once __DIR__ . '/../../wordpress/cora-knowledge.php';

$failures = array();
$checks = 0;

function cora_training_check( $condition, $message ) {
    global $failures, $checks;
    $checks++;
    if ( ! $condition ) $failures[] = $message;
}

function cora_training_reply( $prompt ) {
    $context = stapleit_cora_context_for_turn( $prompt, '', array() );
    return stapleit_cora_fast_reply( $prompt, $context );
}

$groups = array(
    'audit' => array(
        'prompts' => array( 'What does the free IT audit cover?', 'Can you review our IT for free?', 'Tell me about your IT audit', 'What do you look at in the free audit?' ),
        'has' => array( 'free IT audit', 'Microsoft 365', 'backups' ),
        'not' => array( '£35', 'guarantee' ),
    ),
    'onsite' => array(
        'prompts' => array( 'Can you come to our office?', 'Do you offer on-site support?', 'Can an engineer visit us in Surrey?', 'We need hands-on support at our workplace' ),
        'has' => array( 'Surrey and London', 'price on application' ),
        'not' => array( 'Basic', '24/7 staffed' ),
    ),
    'procurement' => array(
        'prompts' => array( 'Can you supply laptops?', 'Can you source business desktops for us?', 'Do you handle IT procurement?', 'Can you quote for new laptops and peripherals?' ),
        'has' => array( 'business-grade', 'compatibility', 'lifecycle' ),
        'not' => array( '£35', 'guarantee' ),
    ),
    'voip' => array(
        'prompts' => array( 'Can you replace our phone system with VoIP?', 'Can you port our business phone numbers?', 'Do you manage softphones and voicemail?', 'Can you set up an auto-attendant and call groups?' ),
        'has' => array( 'number porting', 'softphones', 'price on application' ),
        'not' => array( '£35', 'guaranteed' ),
    ),
    'bespoke' => array(
        'prompts' => array( 'We have a bespoke application, can you support it?', 'What about a niche system unique to our business?', 'Can you support custom software?', 'We rely on a proprietary system with an unusual requirement' ),
        'has' => array( 'engineer would need to confirm', 'vendor' ),
        'not' => array( 'Yes, we can support', 'Basic is', 'Standard is' ),
    ),
    'dmarc' => array(
        'prompts' => array( 'Do you configure DMARC?', 'Can you sort DKIM and SPF?', 'We need DMARC DKIM and SPF managed', 'Can you help with email authentication records?' ),
        'has' => array( 'Security pack', 'DMARC', 'DKIM', 'SPF' ),
        'not' => array( 'Basic includes', 'free' ),
    ),
    'purview' => array(
        'prompts' => array( 'Do you manage Microsoft Purview?', 'Can you set up DLP?', 'What about sensitivity labels?', 'Can you configure information protection?' ),
        'has' => array( 'Premium', 'additional Microsoft licensing' ),
        'not' => array( 'Basic', 'guarantee' ),
    ),
    'defender' => array(
        'prompts' => array( 'Do you manage Defender for Business?', 'What about Defender for Office 365?', 'Can you manage Microsoft Defender Suite?', 'Is advanced Defender management included?' ),
        'has' => array( 'Premium', 'Defender' ),
        'not' => array( 'Basic includes', 'free' ),
    ),
    'security_operations' => array(
        'prompts' => array( 'Do you work on Microsoft Secure Score?', 'Is device encryption managed?', 'Do you do quarterly security reviews?', 'Can you help with cyber insurance questionnaires?' ),
        'has' => array( 'Standard', 'Premium' ),
        'not' => array( 'Basic includes', '24/7 staffed' ),
    ),
    'network_advanced' => array(
        'prompts' => array( 'Can you manage our site-to-site VPN?', 'Do you configure QoS?', 'Can you handle DHCP DNS and firmware updates?', 'Will you liaise with our ISP for network faults?' ),
        'has' => array( 'Network pack', 'price on application' ),
        'not' => array( 'Basic', 'Premium' ),
    ),
    'azure_advanced' => array(
        'prompts' => array( 'Can you review Azure spend?', 'Do you manage Azure Backup?', 'Can you identify oversized Azure VMs?', 'Do you manage Azure storage and cost optimisation?' ),
        'has' => array( 'Azure pack', 'cost' ),
        'not' => array( 'Basic', 'Premium' ),
    ),
    'server_advanced' => array(
        'prompts' => array( 'Do you monitor server hardware and warranty?', 'Can you manage Active Directory and Group Policy?', 'What about server backups and lifecycle planning?', 'Can you manage DNS DHCP and file shares on our Windows Server?' ),
        'has' => array( 'Server pack', 'Windows Server' ),
        'not' => array( 'Basic is', 'Premium is' ),
    ),
    'cyber_essentials' => array(
        'prompts' => array( 'Can you help us get Cyber Essentials?', 'We need Cyber Essentials Plus readiness', 'Can you help remediate Cyber Essentials gaps?', 'Will you prepare us for CE+ checks?' ),
        'has' => array( 'Cyber Essentials pack', 'remediation' ),
        'not' => array( 'guarantee a certification', 'certify compliance' ),
    ),
    'governance' => array(
        'prompts' => array( 'Our insurer wants IT policies', 'Can you help with a customer security questionnaire?', 'We need an asset register and network diagram', 'Can you help with due diligence and compliance evidence?' ),
        'has' => array( 'Governance & compliance pack' ),
        'not' => array( 'legal advice is included', 'guaranteed' ),
    ),
    'ai' => array(
        'prompts' => array( 'We want to introduce ChatGPT Business', 'Can you help us roll out Copilot safely?', 'What about Claude Team for staff?', 'Can you help write an AI policy and train staff?' ),
        'has' => array( 'AI pack', 'secure' ),
        'not' => array( 'Basic', 'Standard is', 'Premium is' ),
    ),
    'strategy' => array(
        'prompts' => array( 'Can you build us an IT roadmap?', 'Can you help plan next year’s IT budget?', 'We are opening a new office and need IT planning', 'Can you help with IT due diligence for an acquisition?', 'We are buying another business and need IT due diligence', 'We are taking over another company and need technology planning' ),
        'has' => array( 'Strategy pack' ),
        'not' => array( 'Basic', 'Premium' ),
    ),
    'dr' => array(
        'prompts' => array( 'We need a disaster recovery plan', 'Can you help define RTO and RPO?', 'Do you test recovery procedures?', 'We need dependency mapping and restore testing' ),
        'has' => array( 'Disaster recovery pack' ),
        'not' => array( 'guaranteed', 'Basic' ),
    ),
    'location' => array(
        'prompts' => array( 'Where are you based?', 'What is your address?', 'Where is Staple IT?', 'Are you based in Epsom?' ),
        'has' => array( 'Epsom', 'Surrey' ),
        'not' => array( 'package' ),
    ),
    'trust' => array(
        'prompts' => array( 'Why should we trust Staple IT?', 'Are you qualified and insured?', 'What makes you different from a big call centre?', 'Why would I choose you?' ),
        'has' => array( 'qualified', 'insured' ),
        'not' => array( 'guarantee', 'best MSP' ),
    ),
    'hours' => array(
        'prompts' => array( 'What hours is the helpdesk open?', 'Are you staffed 24/7?', 'When can I call support?', 'Do engineers work round the clock?' ),
        'has' => array( '9am–5pm', '24/7' ),
        'not' => array( '24/7 staffed support' ),
    ),
    'backup' => array(
        'prompts' => array( 'Do you back up OneDrive?', 'Can you back up SharePoint and Teams?', 'Do you back up Google Workspace?', 'Do you test restores?' ),
        'has' => array( 'Standard', 'restore testing' ),
        'not' => array( 'guarantee' ),
    ),
    'mdm' => array(
        'prompts' => array( 'Can you manage company phones?', 'Do you support remote wipe?', 'Can you enforce device compliance?', 'Do you manage work apps on mobile devices?' ),
        'has' => array( 'device management' ),
        'not' => array( 'guarantee' ),
    ),
    'packages' => array(
        'prompts' => array( 'How do Basic Standard and Premium differ?', 'Compare your support packages', 'What is the difference between Basic and Standard?', 'What does Premium add over Standard?' ),
        'has' => array( 'Basic', 'Standard', 'Premium' ),
        'not' => array( 'Most popular' ),
    ),
    'licensing_boundary' => array(
        'prompts' => array( 'How much is a Microsoft 365 Business Premium licence?', 'What does a standalone Business Premium subscription cost?', 'Can you give me the standalone M365 Business Premium price?', 'What is your per-seat Business Premium licence price?' ),
        'has' => array( 'does not publish a standalone' ),
        'not' => array( '£35', '£55', '£75' ),
    ),
    'password' => array(
        'prompts' => array( 'Can you reset a user password?', 'Do password resets count as support?', 'Someone forgot their password, can you help?', 'Can the helpdesk reset passwords?' ),
        'has' => array( 'Password resets', 'day-to-day helpdesk' ),
        'not' => array( 'specific product' ),
    ),
    'starters' => array(
        'prompts' => array( 'Can you set up a new starter?', 'Can you offboard a leaver?', 'Do you manage joiners and leavers?', 'Can you remove access when someone leaves?' ),
        'has' => array( 'New-starter and leaver management' ),
        'not' => array( 'specific product' ),
    ),
);

foreach ( $groups as $group_name => $group ) {
    foreach ( $group['prompts'] as $prompt ) {
        $reply = cora_training_reply( $prompt );
        cora_training_check( $reply !== '', $group_name . ': deterministic reply missing for ' . $prompt );
        if ( $reply === '' ) continue;
        cora_training_check( stapleit_cora_reply_is_safe( $reply ), $group_name . ': unsafe reply for ' . $prompt );
        cora_training_check( str_word_count( strip_tags( $reply ) ) <= 110, $group_name . ': reply too long for ' . $prompt );
        foreach ( $group['has'] as $needle ) cora_training_check( stripos( $reply, $needle ) !== false, $group_name . ': missing ' . $needle . ' for ' . $prompt );
        foreach ( $group['not'] as $needle ) cora_training_check( stripos( $reply, $needle ) === false, $group_name . ': forbidden ' . $needle . ' for ' . $prompt );
    }
}

$context_groups = array(
    'pack_server' => array( 'detail' => 'Active Directory', 'need' => 'physical Windows Server' ),
    'pack_azure' => array( 'detail' => 'Azure Backup', 'need' => 'Microsoft 365 by itself' ),
    'pack_network' => array( 'detail' => 'VLAN', 'need' => 'firewalls' ),
    'pack_security' => array( 'detail' => 'DMARC', 'need' => 'core support package' ),
    'pack_governance' => array( 'detail' => 'network diagrams', 'need' => 'written IT policies' ),
    'pack_cyber_essentials' => array( 'detail' => 'patching', 'need' => 'Cyber Essentials' ),
    'pack_ai' => array( 'detail' => 'staff onboarding', 'need' => 'introducing AI' ),
    'pack_strategy' => array( 'detail' => 'budget', 'need' => 'planned IT reviews' ),
    'pack_disaster_recovery' => array( 'detail' => 'RTO', 'need' => 'recovery plan' ),
    'service_onsite' => array( 'detail' => 'Surrey and London', 'need' => 'hands-on' ),
    'service_procurement' => array( 'detail' => 'business-grade laptops', 'need' => 'recommend' ),
    'service_voip' => array( 'detail' => 'number porting', 'need' => 'phone system' ),
    'service_bespoke' => array( 'detail' => 'vendor', 'need' => 'niche' ),
);
foreach ( $context_groups as $context => $expect ) {
    $detail = stapleit_cora_contextual_reply( 'What does that include?', $context );
    cora_training_check( stripos( $detail, $expect['detail'] ) !== false, $context . ': contextual detail lost' );
    $price = stapleit_cora_contextual_reply( 'How much does that cost?', $context );
    cora_training_check( stripos( $price, 'price on application' ) !== false, $context . ': POA boundary lost' );
    $need = stapleit_cora_contextual_reply( 'Do we need it?', $context );
    cora_training_check( stripos( $need, $expect['need'] ) !== false, $context . ': relevance follow-up lost' );
}

$package_contexts = array(
    'package_basic' => array( 'detail' => '24/7 device monitoring', 'price' => '£35' ),
    'package_standard' => array( 'detail' => 'Conditional Access', 'price' => '£55' ),
    'package_premium' => array( 'detail' => 'Microsoft Purview', 'price' => '£75' ),
    'package_sole' => array( 'detail' => 'Tailored support', 'price' => 'price on application' ),
);
foreach ( $package_contexts as $context => $expect ) {
    cora_training_check( stripos( stapleit_cora_contextual_reply( 'What does that include?', $context ), $expect['detail'] ) !== false, $context . ': detail follow-up failed' );
    cora_training_check( stripos( stapleit_cora_contextual_reply( 'How much is that?', $context ), $expect['price'] ) !== false, $context . ': price follow-up failed' );
}

$package_matrix = array(
    array( 'context' => 'package_sole', 'prompts' => array(
        'I am one person and need IT support', 'We are 2 people and need ongoing IT support', 'We have 3 staff and need helpdesk support', 'We are four people and need stronger security',
        'I am a sole trader and need support', 'There are 4 of us and we need IT help'
    ) ),
    array( 'context' => 'package_basic', 'prompts' => array(
        'We have 5 staff, day-to-day support, no security evidence', 'We are 8 people and just need Outlook and printer support, no client security evidence',
        'We have 10 staff and need everyday IT support, no insurers ask for evidence', 'We have 19 staff, day-to-day support, no security questionnaires'
    ) ),
    array( 'context' => 'package_standard', 'prompts' => array(
        'We have 5 staff and need better security', 'We are 8 people and need EDR', 'We have 12 staff and want Conditional Access',
        'We have 19 employees and need email security', 'We are 15 staff and need cloud backup and MFA',
        'We have 9 staff, day-to-day IT help, and a client asks for security evidence',
        'We already have Business Premium, 12 staff, and need better security'
    ) ),
    array( 'context' => 'package_premium', 'prompts' => array(
        'We have 5 staff and want Microsoft 365 Business Premium included', 'We are 8 people and want Business Premium bundled',
        'We have 12 staff and need the Premium package', 'We are 20 staff and want Microsoft 365 Business Premium included'
    ) ),
);
foreach ( $package_matrix as $group ) {
    foreach ( $group['prompts'] as $prompt ) {
        cora_training_check( stapleit_cora_package_discovery_intent( $prompt ), 'package intent missed: ' . $prompt );
        $result = stapleit_cora_package_flow_step( $prompt, array() );
        cora_training_check( ! empty( $result['complete'] ), 'package flow incomplete for ' . $prompt );
        cora_training_check( ( $result['context'] ?? '' ) === $group['context'], 'package flow misrouted ' . $prompt . ' to ' . ( $result['context'] ?? 'none' ) );
    }
}

$routing_negatives = array(
    'How much is a Microsoft 365 Business Premium licence?', 'We already have Microsoft 365 Business Premium',
    'Can you manage our firewall?', 'We need Cyber Essentials', 'Tell me about the Network pack',
    'Do you supply laptops?', 'Can you port our phone numbers?', 'Can you come on site?',
    'What does the free audit cover?', 'Do you configure DMARC?', 'Can you manage Azure Backup?',
    'We need a disaster recovery plan', 'Can you build an IT roadmap?', 'Do you support Sage 50?',
    'What are your support hours?', 'Where are you based?', 'Can you help with a bespoke application?'
);
foreach ( $routing_negatives as $prompt ) {
    cora_training_check( ! stapleit_cora_package_discovery_intent( $prompt ), 'false package discovery intent: ' . $prompt );
}

$intent_positive = array(
    'We need 700 Microsoft licences', 'Can you source 40 laptops?', 'Our VPN keeps dropping', 'We need a new firewall',
    'Can you migrate a server?', 'We need Azure VM help', 'Can you configure SharePoint?', 'We need DLP',
    'Can you manage our phone system?', 'We need an IT roadmap', 'Can you help with Cyber Essentials?', 'Our printer is broken',
    'We need email security', 'Can you review our backups?', 'We need remote support', 'Can you manage mobile devices?',
    'Can you help with Copilot?', 'We need a business continuity plan', 'Can you review our Microsoft licensing?',
    'Our users cannot access OneDrive', 'Can you help with a niche business application?'
);
foreach ( $intent_positive as $prompt ) cora_training_check( stapleit_cora_business_it_intent( $prompt ), 'business IT intent missed: ' . $prompt );

$intent_negative = array(
    'Who won the football?', 'What is the weather?', 'Give me a chicken recipe', 'What films are on tonight?', 'Write me a poem',
    'What is the capital of France?', 'Tell me a joke', 'What time is sunset?', 'How do I grow tomatoes?', 'Who is the prime minister?'
);
foreach ( $intent_negative as $prompt ) cora_training_check( ! stapleit_cora_business_it_intent( $prompt ), 'non-IT intent classified as business IT: ' . $prompt );

$retrieval = array(
    array( 'prompt' => 'We need help with DMARC and phishing', 'has' => 'DMARC/DKIM/SPF' ),
    array( 'prompt' => 'We need an asset register and IT policies', 'has' => 'Acceptable Use' ),
    array( 'prompt' => 'We need a tested RTO and RPO recovery plan', 'has' => 'RTO/RPO' ),
    array( 'prompt' => 'Can you help with ChatGPT and AI policy', 'has' => 'internal AI policy' ),
    array( 'prompt' => 'Can you source laptops for us', 'has' => 'business-grade laptops' ),
    array( 'prompt' => 'Can you manage softphones and port numbers', 'has' => 'number porting' ),
    array( 'prompt' => 'Can you come on site in Surrey', 'has' => 'Surrey and London' ),
    array( 'prompt' => 'What does the free IT audit cover', 'has' => 'lifecycle risks' ),
    array( 'prompt' => 'We use Azure VMs and want cost reviews', 'has' => 'unused or oversized' ),
    array( 'prompt' => 'We run Active Directory and need server lifecycle support', 'has' => 'lifecycle planning' ),
);
foreach ( $retrieval as $case ) {
    $knowledge = stapleit_cora_relevant_knowledge( $case['prompt'], '/it-services/it-support/' );
    cora_training_check( stripos( $knowledge, $case['has'] ) !== false, 'retrieval missed ' . $case['has'] . ' for ' . $case['prompt'] );
    cora_training_check( stripos( $knowledge, 'Page in progress' ) === false && stripos( $knowledge, 'rebuilding this page' ) === false, 'placeholder copy leaked into Cora knowledge' );
}

$natural_followups = array(
    array( 'context' => 'service_voip', 'prompt' => 'Can we keep our existing numbers?', 'has' => 'usually be retained' ),
    array( 'context' => 'service_procurement', 'prompt' => 'Can you set it up?', 'has' => 'setup can be handled' ),
    array( 'context' => 'service_onsite', 'prompt' => 'Where is that available?', 'has' => 'Surrey and London' ),
    array( 'context' => 'pack_cyber_essentials', 'prompt' => 'What if we fail a check?', 'has' => 're-testing' ),
    array( 'context' => 'pack_network', 'prompt' => 'How does that work?', 'has' => 'firewall rules' ),
    array( 'context' => 'pack_ai', 'prompt' => 'Would that cover staff onboarding?', 'has' => 'staff onboarding' ),
    array( 'context' => 'pack_strategy', 'prompt' => 'How much does it cost?', 'has' => 'price on application' ),
    array( 'context' => 'audit', 'prompt' => 'How much is that?', 'has' => 'free' ),
);
foreach ( $natural_followups as $case ) {
    cora_training_check( stapleit_cora_is_contextual_follow_up( $case['prompt'] ), 'natural follow-up not recognised: ' . $case['prompt'] );
    $reply = stapleit_cora_fast_reply( $case['prompt'], $case['context'] );
    cora_training_check( stripos( $reply, $case['has'] ) !== false, 'natural follow-up failed for ' . $case['context'] . ': ' . $case['prompt'] );
    cora_training_check( stapleit_cora_reply_is_safe( $reply ), 'natural follow-up unsafe for ' . $case['context'] . ': ' . $case['prompt'] );
}

$records = stapleit_cora_knowledge_records();
cora_training_check( count( $records ) >= 29, 'knowledge record count regressed below 29' );
$record_text = json_encode( $records );
cora_training_check( stripos( $record_text, 'Page in progress' ) === false, 'placeholder page text was learned by Cora' );
cora_training_check( stripos( $record_text, 'rebuilding this page' ) === false, 'placeholder rebuild text was learned by Cora' );
foreach ( array( 'pack_server', 'pack_azure', 'pack_network', 'pack_security', 'pack_governance', 'pack_cyber_essentials', 'pack_ai', 'pack_strategy', 'pack_disaster_recovery', 'service_onsite', 'service_procurement', 'service_voip', 'service_bespoke', 'audit', 'licensing', 'backup' ) as $required_record ) {
    cora_training_check( isset( $records[ $required_record ] ), 'missing trained knowledge record: ' . $required_record );
}

if ( $failures ) {
    fwrite( STDERR, "Cora training corpus failures:\n- " . implode( "\n- ", $failures ) . "\n" );
    exit( 1 );
}

echo 'Cora training corpus: ' . $checks . " checks passed\n";
