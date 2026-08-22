<?php
/**
 * Versioned Staple IT knowledge used to ground Cora.
 *
 * This is intentionally curated rather than scraped at request time. The
 * website catalogue remains the commercial source of truth and the language
 * model receives only the small, relevant subset selected below.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function stapleit_cora_knowledge_version() {
    return '2026-08-22.1';
}

function stapleit_cora_knowledge_records() {
    return array(
        'identity' => array(
            'keywords' => array( 'staple it', 'where', 'epsom', 'surrey', 'hours', 'open', 'contact', 'phone', 'email' ),
            'content'  => 'Staple IT is an Epsom, Surrey IT provider for businesses, charities and individuals. Public support hours are Monday to Friday, 9am to 5pm. The public telephone number is 01372 309 707 and the contact form is the correct place for an enquiry.',
        ),
        'packages' => array(
            'keywords' => array( 'package', 'price', 'cost', 'support', 'staff', 'team', 'basic', 'standard', 'premium', 'sole trader' ),
            'content'  => 'Sole trader support is tailored and price on application. Basic starts from £35 per staff member, per month for teams of five or more. Standard starts from £55 per staff member, per month for teams of five or more and adds stronger security, backup and identity protection. Premium starts from £75 per staff member, per month for teams of five or more and includes Microsoft 365 Business Premium plus enhanced Microsoft security and data protection. A written proposal confirms final scope, eligibility and price.',
        ),
        'onboarding' => array(
            'keywords' => array( 'move', 'switch', 'provider', 'onboard', 'onboarding', 'changeover', 'start', 'audit', 'review' ),
            'content'  => 'The support journey is: an initial no-obligation conversation, a review of the current setup, then managed onboarding. Staple IT can work directly with an existing IT provider and other suppliers to make the changeover smoother. A free IT audit confirms what is genuinely needed.',
        ),
        'managed_support' => array(
            'keywords' => array( 'helpdesk', 'unlimited', 'monitor', 'patch', 'device', 'warranty', 'portal', 'engineer', 'remote support' ),
            'content'  => 'Published managed support includes unlimited helpdesk support, UK-based engineers, a dedicated point of contact and clear response times. The published standard service areas include 24/7 monitoring, remote device management, Windows and software updates, mobile device management, next-generation antivirus, device and software management, hardware and warranty tracking, a client support portal, managed onboarding, regular check-ins, fixed monthly pricing and a three-month rolling agreement.',
        ),
        'microsoft' => array(
            'keywords' => array( 'microsoft', 'm365', '365', 'business premium', 'entra', 'sharepoint', 'teams', 'onedrive', 'copilot' ),
            'content'  => 'Staple IT supports Microsoft 365 administration, identity protection and security. Microsoft 365 Business Premium is published as included only with the Premium support package; it is not a separately priced public add-on. Licensing suitability and quantities are confirmed in the written proposal.',
        ),
        'security' => array(
            'keywords' => array( 'security', 'secure', 'secur', 'phishing', 'password', 'identity', 'antivirus', 'ransomware', 'cyber', 'breach', 'compromise' ),
            'content'  => 'Staple IT offers layered cyber security across devices, email, identities and online services. The Security pack can add stronger monitoring and protection. For a suspected active compromise or cyber incident, the safe next step is to call Staple IT on 01372 309 707; Cora must not ask for credentials or attempt incident response in chat.',
        ),
        'packs' => array(
            'keywords' => array( 'server', 'azure', 'wifi', 'wi-fi', 'network', 'firewall', 'compliance', 'policy', 'cyber essentials', 'ai', 'strategy', 'roadmap', 'disaster', 'recovery', 'add-on', 'pack' ),
            'content'  => 'Optional packs are Server, Azure, Network, Security, Governance and compliance, Cyber Essentials, AI, Strategy and Disaster recovery. Every optional pack is price on application and is recommended only when the customer environment or goals make it relevant. Other available services include on-site support, procurement, VoIP and bespoke project work, all price on application.',
        ),
        'consultancy' => array(
            'keywords' => array( 'consultancy', 'roadmap', 'budget', 'planning', 'governance', 'policy', 'supplier', 'strategy' ),
            'content'  => 'Staple IT consultancy covers practical IT planning, roadmaps, governance, supplier decisions, Microsoft 365 strategy, Cyber Essentials readiness and AI adoption. Advice should be explained in plain English and shaped around the organisation rather than sold as a generic bundle.',
        ),
        'projects' => array(
            'keywords' => array( 'project', 'migration', 'cloud', 'automation', 'voip', 'procurement', 'move', 'solution' ),
            'content'  => 'Staple IT solutions include cloud and Microsoft 365 work, automation, compliance workflows, procurement, VoIP and other fixed-scope or bespoke projects. Project scope and pricing are confirmed after a review and are not publicly fixed.',
        ),
        'boundaries' => array(
            'keywords' => array( 'guarantee', 'book', 'appointment', 'legal', 'medical', 'password', 'code', 'payment', 'card', 'personal data' ),
            'content'  => 'Cora is a service guide, not an engineer inspecting a live environment. Cora cannot diagnose systems, guarantee outcomes, certify compliance, submit enquiries, book calls or process orders. Visitors must not share passwords, security codes, payment details or sensitive personal information. Human review confirms every final recommendation.',
        ),
    );
}

function stapleit_cora_relevant_knowledge( $prompt, $page_path = '' ) {
    $haystack = strtolower( trim( (string) $prompt . ' ' . (string) $page_path ) );
    $records  = stapleit_cora_knowledge_records();
    $scores   = array();

    foreach ( $records as $key => $record ) {
        $score = 0;
        foreach ( $record['keywords'] as $keyword ) {
            if ( strpos( ' ' . $haystack . ' ', strtolower( $keyword ) ) !== false ) {
                $score += strlen( $keyword ) > 8 ? 3 : 2;
            }
        }
        $scores[ $key ] = $score;
    }

    arsort( $scores );
    $selected = array( 'identity', 'packages', 'boundaries' );
    foreach ( $scores as $key => $score ) {
        if ( $score < 1 || in_array( $key, $selected, true ) ) {
            continue;
        }
        $selected[] = $key;
        if ( count( $selected ) >= 6 ) {
            break;
        }
    }

    $lines = array( 'STAPLE IT KNOWLEDGE ' . stapleit_cora_knowledge_version() . ' — USE ONLY THESE FACTS:' );
    foreach ( $selected as $key ) {
        $lines[] = '- ' . $records[ $key ]['content'];
    }
    return implode( "\n", $lines );
}

function stapleit_cora_follow_up_suggestions( $prompt ) {
    $prompt = strtolower( (string) $prompt );
    if ( preg_match( '/secur|phishing|cyber|ransomware|identity|password/', $prompt ) ) {
        return array( 'What protection is included?', 'Do we need a Security pack?', 'What should we review first?' );
    }
    if ( preg_match( '/microsoft|m365|365|teams|sharepoint|onedrive|copilot/', $prompt ) ) {
        return array( 'Which package includes Microsoft 365?', 'Can you review our licences?', 'How would onboarding work?' );
    }
    if ( preg_match( '/server|azure|wifi|wi-fi|network|firewall/', $prompt ) ) {
        return array( 'Which add-on might fit?', 'What would you review first?', 'How does monitoring work?' );
    }
    return array( 'Which package suits our team?', 'What happens during onboarding?', 'Could we start with a free audit?' );
}
