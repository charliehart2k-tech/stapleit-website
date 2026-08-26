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
    return '2026-08-26.1';
}

function stapleit_cora_knowledge_records() {
    return array(
        'identity' => array(
            'keywords' => array( 'staple it', 'where', 'epsom', 'surrey', 'hours', 'open', 'contact', 'phone', 'email', 'business', 'businesses', 'charity', 'charities', 'individual', 'individuals' ),
            'content'  => 'Staple IT is an Epsom, Surrey IT provider for businesses, charities and individuals. Public staffed support hours are Monday to Friday, 9am to 5pm. 24/7 references describe monitoring, not a 24/7 staffed helpdesk. Public contact details are 01372 309 707, hello@stapleit.co.uk, WhatsApp Business via the public contact page, and 88 Eastdean Avenue, Epsom, KT18 7SN.',
        ),
        'packages' => array(
            'keywords' => array( 'package', 'price', 'cost', 'support', 'staff', 'team', 'basic', 'standard', 'premium', 'sole trader' ),
            'content'  => 'Sole trader support is tailored and price on application. Basic starts from £35 per staff member, per month for teams of five or more and covers day-to-day helpdesk support plus monitoring, patching, device management and business-grade antivirus. Standard starts from £55 per staff member, per month for teams of five or more and includes everything in Basic plus Endpoint Detection and Response, advanced threat detection and response, email security, Multi-Factor Authentication, Conditional Access, privileged account protection, LastPass, Microsoft 365 or Google Workspace backup, Exclaimer and regular security reviews; Microsoft 365 Business Premium or equivalent licensing is required and is sold separately unless specifically included. Premium starts from £75 per staff member, per month for teams of five or more and includes everything in Standard plus Microsoft 365 Business Premium, DNS and web protection, enhanced Microsoft 365 security, Defender for Business and Defender for Office 365 management, stronger access controls and Microsoft Purview configuration where required. Microsoft Defender Suite and Microsoft Purview Suite features are managed and supported where required, but any additional Microsoft licensing required to enable those advanced features is charged separately. A written proposal confirms final scope, eligibility and price.',
        ),
        'onboarding' => array(
            'keywords' => array( 'move', 'switch', 'provider', 'onboard', 'onboarding', 'changeover', 'start', 'audit', 'review' ),
            'content'  => 'The support journey is: an initial no-obligation conversation, a review of devices, Microsoft 365, connectivity, security and costs, then managed onboarding. Staple IT can liaise directly with the existing IT provider and other suppliers so support is ready before the old arrangement ends. The free IT audit is no obligation and helps identify risks, quick wins and sensible next steps.',
        ),
        'managed_support' => array(
            'keywords' => array( 'helpdesk', 'unlimited', 'monitor', 'patch', 'device', 'warranty', 'portal', 'engineer', 'remote support', 'printer', 'printing', 'outlook', 'email', 'software', 'password', 'day-to-day', 'everyday it' ),
            'content'  => 'Published managed support includes unlimited helpdesk support during the public staffed support window, UK-based engineers, a dedicated point of contact and clear response times. The published standard service areas include 24/7 monitoring, remote device management, Windows and software updates, mobile device management, next-generation antivirus, device and software management, hardware and warranty tracking, a client support portal, managed onboarding, regular check-ins, fixed monthly pricing and a three-month rolling agreement. Do not describe 24/7 monitoring as a 24/7 staffed helpdesk.',
        ),
        'microsoft' => array(
            'keywords' => array( 'microsoft', 'm365', '365', 'business premium', 'entra', 'sharepoint', 'teams', 'onedrive', 'copilot', 'defender', 'purview' ),
            'content'  => 'Staple IT supports Microsoft 365 administration, identity protection and security. Microsoft 365 Business Premium is published as included only with the Premium support package; it is not a separately priced public add-on. Standard requires Microsoft 365 Business Premium or equivalent licensing, sold separately unless specifically included. Premium can include management and support of Microsoft Defender Suite and Microsoft Purview Suite features where required, but any additional Microsoft licensing needed to enable those advanced features is charged separately. Licensing suitability and quantities are confirmed in the written proposal.',
        ),
        'security' => array(
            'keywords' => array( 'security', 'secure', 'secur', 'phishing', 'password', 'identity', 'antivirus', 'ransomware', 'cyber', 'breach', 'compromise' ),
            'content'  => 'Staple IT offers layered cyber security across devices, email, identities and online services. Standard includes published controls such as Endpoint Detection and Response, advanced threat detection and automated response, anti-phishing and spam protection, malicious link and attachment scanning, spoofing protection, Multi-Factor Authentication, Conditional Access and privileged account protection. Premium adds enhanced Microsoft 365 security, DNS and web protection and stronger Microsoft security and data-protection management. The optional Security pack can add stronger monitoring and protection when the core package is not enough. For a suspected active compromise or cyber incident, the safe next step is to call Staple IT on 01372 309 707; Cora must not ask for credentials or attempt incident response in chat.',
        ),
        'packs' => array(
            'keywords' => array( 'server', 'azure', 'wifi', 'wi-fi', 'network', 'firewall', 'compliance', 'policy', 'cyber essentials', 'ai', 'strategy', 'roadmap', 'disaster', 'recovery', 'add-on', 'pack' ),
            'content'  => 'Optional packs are Server, Azure, Network, Security, Governance and compliance, Cyber Essentials, AI, Strategy and Disaster recovery. Every optional pack is price on application and is recommended only when the customer environment or goals make it relevant. Other available services include on-site support, procurement, VoIP and bespoke project work, all price on application.',
        ),
        'pack_server' => array(
            'keywords' => array( 'server', 'windows server', 'active directory', 'group policy', 'file server', 'physical server' ),
            'content'  => 'The Server pack is for businesses running physical Windows Servers. It covers day-to-day server support, 24/7 health/performance/service monitoring, patching and security updates, planned maintenance, backup monitoring and recovery assistance, Active Directory, Group Policy, DNS, DHCP, file shares, permissions, supported print services, hardware health, warranty support and lifecycle planning. Major upgrades, migrations and replacement projects may be quoted separately.',
        ),
        'pack_azure' => array(
            'keywords' => array( 'azure', 'virtual machine', 'virtual machines', 'vnet', 'cloud infrastructure', 'azure vm' ),
            'content'  => 'The Azure pack is for businesses running supported Microsoft Azure resources such as virtual machines and storage. It covers administration, 24/7 resource and VM monitoring, patching, planned maintenance, Azure Backup oversight, recovery support, access and permissions, storage management, VM sizing and performance, usage/cost reviews, identification of unused or oversized resources and documentation. Major deployments, migrations and new architecture may be quoted separately. Using Microsoft 365 alone does not necessarily mean Azure is in use.',
        ),
        'pack_network' => array(
            'keywords' => array( 'network', 'wifi', 'wi-fi', 'firewall', 'switch', 'switches', 'access point', 'access points', 'router' ),
            'content'  => 'The Network pack is for managed network infrastructure such as firewalls, switches and Wi-Fi access points. It covers rules and security profiles, VLAN and port configuration, SSIDs and guest networks, site-to-site and remote-access VPNs, DHCP and DNS, uptime/throughput/connectivity monitoring, QoS, firmware updates, ISP liaison, troubleshooting and network security posture reviews.',
        ),
        'pack_security' => array(
            'keywords' => array( 'security pack', 'stronger security', 'phishing', 'web protection', 'email protection', 'identity protection' ),
            'content'  => 'The Security pack adds stronger protection across devices, identities, email and web use. Published areas include EDR, malware/ransomware protection, ITDR and suspicious-account monitoring, privileged-account reviews, anti-phishing and email filtering, spoofing protection, DMARC/DKIM/SPF configuration, DNS/web filtering, malicious-site blocking, security alerts, investigation and improvement recommendations. It is price on application; major remediation and incident response may be quoted separately.',
        ),
        'pack_governance' => array(
            'keywords' => array( 'governance', 'compliance', 'policy', 'policies', 'documentation', 'insurer', 'customer questionnaire', 'evidence' ),
            'content'  => 'The Governance and compliance pack covers IT policies such as Acceptable Use, IT Security, BYOD, Remote Working and password/access policies; asset and system documentation; network diagrams; supplier and critical-service records; governance/risk/access reviews; audit evidence; customer and cyber-insurance questionnaires; due diligence; and business-continuity/disaster-recovery documentation. Formal legal, regulatory or certification advice is not included unless specifically agreed.',
        ),
        'pack_cyber_essentials' => array(
            'keywords' => array( 'cyber essentials', 'cyber essentials plus', 'ce+', 'certification', 'certify' ),
            'content'  => 'The Cyber Essentials pack supports readiness, gap identification, remediation and application preparation for Cyber Essentials or Cyber Essentials Plus. Reviews cover boundary security/firewalls, secure configuration, user access control, malware protection, patch management and software support status, with evidence/application guidance and readiness checks. Certification and assessor fees are separate where applicable; Cora cannot certify compliance or guarantee a result.',
        ),
        'pack_ai' => array(
            'keywords' => array( 'ai pack', 'artificial intelligence', 'copilot', 'chatgpt', 'claude', 'ai platform', 'ai adoption' ),
            'content'  => 'The AI pack is for businesses introducing AI tools safely and practically. It covers readiness and use-case review, platform/licensing comparison, data and security risks, Microsoft Copilot, ChatGPT Business or Enterprise and Claude Team or Enterprise guidance, workspace/admin configuration, access controls, safe-use guidance, staff onboarding, prompting/best-practice guidance, internal AI policy support and ongoing platform/licensing reviews. Third-party AI licences and larger implementation projects are separate.',
        ),
        'pack_strategy' => array(
            'keywords' => array( 'strategy', 'roadmap', 'budget', 'budgeting', 'supplier', 'technology roadmap', 'planning' ),
            'content'  => 'The Strategy pack covers regular IT health reviews, short/long-term technology roadmaps, upgrade/hardware/software/cloud planning, budget forecasting, licence/subscription reviews, supplier/vendor and procurement support, quote comparison, office moves, growth planning, mergers/acquisitions and due diligence, new-site planning and regular strategy meetings. Large transformation and implementation projects may be quoted separately.',
        ),
        'pack_disaster_recovery' => array(
            'keywords' => array( 'disaster recovery', 'business continuity', 'recovery plan', 'restore', 'rto', 'rpo' ),
            'content'  => 'The Disaster recovery pack identifies critical systems/data, dependencies and recovery priorities; defines proposed RTO/RPO targets for agreement; documents contacts, responsibilities and recovery procedures; reviews backup coverage and restore capability; and supports planned recovery/restore testing, post-test reporting, gap remediation and periodic reviews. Additional recovery infrastructure and major remediation are separate. Final recovery objectives are agreed after review, not guaranteed by Cora.',
        ),
        'audiences' => array(
            'keywords' => array( 'charity', 'charities', 'non-profit', 'nonprofit', 'small business', 'sme', 'sole trader', 'freelancer', 'individual' ),
            'content'  => 'Staple IT supports charities and non-profit organisations, small and medium-sized businesses, sole traders, freelancers and individuals. Eligible charities may be able to use charity pricing from relevant technology vendors, but eligibility and actual licence pricing must be confirmed rather than invented by Cora.',
        ),
        'trust' => array(
            'keywords' => array( 'why trust', 'qualified', 'insured', 'experience', 'experienced', 'local', 'call centre', 'personal service', 'long contract', 'lock-in' ),
            'content'  => 'Published trust points are that Staple IT engineers are qualified, experienced and insured; the business is local to Epsom, Surrey; clients deal with people who know their setup rather than a distant call centre; and managed support uses simple rolling agreements rather than lengthy lock-in.',
        ),
        'audit' => array(
            'keywords' => array( 'free audit', 'it audit', 'audit', 'review my it', 'review our it', 'free review', 'overspending', 'quick wins' ),
            'content'  => 'The free IT audit reviews devices, servers and cloud services; Microsoft 365, email, software and licensing; internet, Wi-Fi, networks and business phones; cyber security, backups and disaster recovery; support, suppliers, contracts and recurring costs; and lifecycle risks/opportunities to simplify or reduce costs. It is free and no obligation. After a form submission Staple IT says it will get back within one working day.',
        ),
        'support_terms' => array(
            'keywords' => array( 'contract', 'agreement', 'rolling', 'lock-in', 'fixed monthly', 'response time', '9am', '5pm', '24/7', 'helpdesk' ),
            'content'  => 'Managed support has fixed monthly pricing, a three-month rolling agreement and no long-term lock-in in the published terms. The staffed helpdesk is Monday to Friday, 9am–5pm. Monitoring runs 24/7. Exact priority response targets are confirmed in the written service agreement; Cora must not invent them.',
        ),
        'licensing' => array(
            'keywords' => array( 'licence', 'license', 'licences', 'licenses', 'licensing', 'subscription', 'subscriptions', 'seats', 'mailboxes', 'quantity', 'quantities' ),
            'content'  => 'Software and third-party licence prices are not generally published as standalone prices. Basic supports Microsoft 365 and Google Workspace but licences are separate. Standard requires Microsoft 365 Business Premium or equivalent licensing, normally separate unless specifically included. Premium includes Microsoft 365 Business Premium; extra Microsoft licensing for advanced Defender/Purview Suite features may still be required. Quantities, eligibility and final licence pricing are confirmed in the written proposal.',
        ),
        'backup' => array(
            'keywords' => array( 'backup', 'backups', 'restore', 'restoration', 'onedrive backup', 'sharepoint backup', 'teams backup', 'google workspace backup' ),
            'content'  => 'Standard and Premium include supported Microsoft 365 or Google Workspace cloud backup, monitoring/failure alerts, restoration support and periodic restore testing. Microsoft 365 coverage can include email, OneDrive, SharePoint and Teams where applicable. Server, Azure and disaster-recovery scopes have separate backup/recovery responsibilities appropriate to those environments.',
        ),
        'service_onsite' => array(
            'keywords' => array( 'on-site', 'onsite', 'on site', 'come out', 'visit office', 'engineer on site', 'office move', 'hands-on' ),
            'content'  => 'On-site support is available as ad-hoc hands-on support across Surrey and London when remote support is not the right fit. Published examples include office moves, equipment changes, hands-on troubleshooting and setup requiring an engineer in the room. Scope and timing are agreed beforehand and the service is price on application.',
        ),
        'service_procurement' => array(
            'keywords' => array( 'procurement', 'buy laptop', 'buy laptops', 'supply laptop', 'supply laptops', 'source laptop', 'source laptops', 'laptop', 'laptops', 'new laptop', 'new laptops', 'desktop', 'hardware purchase', 'source hardware', 'peripherals' ),
            'content'  => 'IT procurement can source business-grade laptops, desktops, software and peripherals through trusted distributors. Staple IT can recommend equipment for the job, check compatibility and lifecycle, and handle setup where required. Procurement is price on application rather than a published fixed price.',
        ),
        'service_voip' => array(
            'keywords' => array( 'voip', 'telephony', 'phone system', 'business phones', 'number porting', 'softphone', 'softphones', 'voicemail', 'call group', 'auto-attendant', 'auto attendant' ),
            'content'  => 'VoIP and telephony services can cover business phone-system design, number porting, softphones, voicemail, call groups and auto-attendants, with ongoing support after go-live. Existing numbers can usually be retained subject to the current provider and porting availability. Scope and pricing are confirmed after review and are price on application.',
        ),
        'service_bespoke' => array(
            'keywords' => array( 'bespoke', 'niche system', 'custom system', 'custom software', 'proprietary system', 'unusual requirement', 'niche software' ),
            'content'  => 'Bespoke support is for niche systems and unusual requirements that do not fit a standard box. Staple IT can support such systems where reasonably possible, work with the vendor where needed, be clear about anything outside its expertise, and help plan a migration if replacement is required. Compatibility and exact support scope must be confirmed before Cora claims coverage.',
        ),
        'consultancy' => array(
            'keywords' => array( 'consultancy', 'roadmap', 'budget', 'planning', 'governance', 'policy', 'supplier', 'strategy' ),
            'content'  => 'Staple IT consultancy covers practical IT planning, roadmaps, governance, supplier decisions, Microsoft 365 strategy, Cyber Essentials readiness and AI adoption. Advice should be explained in plain English and shaped around the organisation rather than sold as a generic bundle.',
        ),
        'projects' => array(
            'keywords' => array( 'project', 'migration', 'cloud', 'automation', 'voip', 'telephony', 'phone system', 'procurement', 'move', 'solution' ),
            'content'  => 'Staple IT solutions include cloud and Microsoft 365 work, automation, compliance workflows, procurement, VoIP and other fixed-scope or bespoke projects. Project scope and pricing are confirmed after a review and are not publicly fixed.',
        ),
        'boundaries' => array(
            'keywords' => array( 'guarantee', 'book', 'appointment', 'legal', 'medical', 'password', 'code', 'payment', 'card', 'personal data', 'sla', 'response time' ),
            'content'  => 'Cora is a service guide, not an engineer inspecting a live environment. Cora cannot diagnose systems, guarantee outcomes, certify compliance, submit enquiries, book calls or process orders. Cora must not invent exact SLA response times that are not present in the supplied knowledge. Visitors must not share passwords, security codes, API tokens, payment details or sensitive personal information. Human review confirms every final recommendation.',
        ),
    );
}

function stapleit_cora_relevant_knowledge( $prompt, $page_path = '' ) {
    // The page path must never bias the model toward a product or package.
    $haystack = strtolower( trim( (string) $prompt ) );
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
    $selected = array();
    foreach ( $scores as $key => $score ) {
        if ( $score < 1 ) continue;
        $selected[] = $key;
        if ( count( $selected ) >= 3 ) break;
    }
    if ( ! $selected ) {
        $selected = array( 'identity', 'managed_support' );
    }

    $lines = array( 'STAPLE IT KNOWLEDGE ' . stapleit_cora_knowledge_version() . ' — USE ONLY THESE FACTS:' );
    foreach ( $selected as $key ) {
        $lines[] = '- ' . $records[ $key ]['content'];
    }
    return implode( "\n", $lines );
}

function stapleit_cora_business_it_intent( $prompt ) {
    $text = strtolower( trim( (string) $prompt ) );
    return (bool) preg_match( '/\b(?:it|computers?|pcs?|laptops?|devices?|hardware|software|apps?|applications?|systems?|servers?|cloud|azure|microsoft|m365|office\s*365|google\s+workspace|security|secure|cyber|phishing|ransomware|networks?|wi-?fi|firewalls?|switches?|routers?|internet|vpn|backups?|restore|restores|email|outlook|printers?|passwords?|identity|mfa|conditional\s+access|sharepoint|onedrive|teams|copilot|chatgpt|ai|voip|phone\s+system|telephony|domain|dns|dlp|purview|defender|licen[cs](?:e|es|ed|ing)|subscriptions?|seats?|mailboxes?|tenant|helpdesk|support|remote\s+work|remote\s+staff|business\s+continuity|disaster\s+recovery|procurement|source|supply|mobile\s+devices?|data|access|user|users)\b/i', $text );
}

function stapleit_cora_model_fallback_allowed( $business_it_prompt, $context ) {
    $context = stapleit_cora_valid_context_key( $context );
    if ( ! $business_it_prompt || $context === '' ) return false;
    return strpos( $context, 'package_' ) !== 0;
}

function stapleit_cora_package_discovery_intent( $prompt ) {
    $text = strtolower( trim( (string) $prompt ) );
    if ( preg_match( '/\b(?:which|what|choose|find|recommend|help\s+me\s+choose)\b.{0,42}\b(?:support\s+)?(?:package|plan|tier)\b/i', $text ) ) return true;
    if ( preg_match( '/\b(?:which|what)\s+(?:support|cover)\s+(?:fits|suits|do\s+(?:i|we)\s+need)\b/i', $text ) ) return true;
    if ( stapleit_cora_parse_package_team( $text ) !== '' && preg_match( '/\b(?:it\s+support|support|it\s+help|helpdesk|day-to-day|everyday\s+it\s+support|printer|outlook|better\s+security|stronger\s+security|security\s+evidence|edr|endpoint\s+detection|mfa|conditional\s+access|email\s+security|cloud\s+backup)\b|\b(?:want|need|include|included).{0,24}\bbusiness\s+premium\b/i', $text ) ) return true;
    if ( stapleit_cora_parse_package_team( $text ) !== '' && preg_match( '/\b(?:want|need|choose|take)\b.{0,28}\b(?:basic|standard|premium)\s+(?:package|plan|tier)\b/i', $text ) ) return true;
    return false;
}

function stapleit_cora_valid_context_key( $context ) {
    $context = strtolower( (string) $context );
    $context = preg_replace( '/[^a-z0-9_]/', '', $context );
    $allowed = array(
        'package_sole', 'package_basic', 'package_standard', 'package_premium',
        'pack_server', 'pack_azure', 'pack_network', 'pack_security',
        'pack_governance', 'pack_cyber_essentials', 'pack_ai', 'pack_strategy',
        'pack_disaster_recovery', 'service_onsite', 'service_procurement',
        'service_voip', 'service_bespoke', 'audit', 'microsoft', 'security',
        'managed_support', 'onboarding',
    );
    return in_array( $context, $allowed, true ) ? $context : '';
}

function stapleit_cora_context_label( $context ) {
    $labels = array(
        'package_sole'            => 'Sole trader support',
        'package_basic'           => 'Basic package',
        'package_standard'        => 'Standard package',
        'package_premium'         => 'Premium package',
        'pack_server'             => 'Server pack',
        'pack_azure'              => 'Azure pack',
        'pack_network'            => 'Network pack',
        'pack_security'           => 'Security pack',
        'pack_governance'         => 'Governance & compliance pack',
        'pack_cyber_essentials'   => 'Cyber Essentials pack',
        'pack_ai'                 => 'AI pack',
        'pack_strategy'           => 'Strategy pack',
        'pack_disaster_recovery'  => 'Disaster recovery pack',
        'service_onsite'          => 'on-site support',
        'service_procurement'     => 'IT procurement',
        'service_voip'            => 'VoIP & telephony',
        'service_bespoke'         => 'bespoke support',
        'audit'                   => 'free IT audit',
        'microsoft'               => 'Microsoft 365',
        'security'                => 'cyber security',
        'managed_support'         => 'managed IT support',
        'onboarding'              => 'managed onboarding',
    );
    $context = stapleit_cora_valid_context_key( $context );
    return $context !== '' ? $labels[ $context ] : '';
}

function stapleit_cora_context_from_prompt( $prompt ) {
    $text = strtolower( trim( (string) $prompt ) );
    $business_premium = (bool) preg_match( '/\b(?:business\s+premium|microsoft\s*365\s+business\s+premium|m365\s+business\s+premium)\b/i', $text );
    if ( $business_premium && preg_match( '/\b(?:licen[cs](?:e|es|ed|ing)|subscriptions?)\b/i', $text ) && preg_match( '/\b(?:price|pricing|cost|how\s+much)\b/i', $text ) ) return '';
    if ( preg_match( '/\b(?:cheapest|least\s+expensive|lowest[-\s]+cost|most\s+affordable)\b/i', $text ) ) return 'package_basic';
    if ( preg_match( '/\bsole[-\s]?trader\b/i', $text ) ) return 'package_sole';
    if ( $business_premium && ! preg_match( '/\b(?:premium\s+(?:package|plan|tier)|support\s+package|included\s+with\s+premium)\b/i', $text ) ) return 'microsoft';
    if ( preg_match( '/\bbasic\b/i', $text ) ) return 'package_basic';
    if ( preg_match( '/\bstandard\b/i', $text ) ) return 'package_standard';
    if ( preg_match( '/\bpremium\b/i', $text ) ) return 'package_premium';
    if ( preg_match( '/(?:\bcyber\s+essentials\b|\bce\+)/i', $text ) ) return 'pack_cyber_essentials';
    if ( preg_match( '/\b(?:server\s+pack|physical\s+server|windows\s+server|active\s+directory|group\s+policy|file\s+server)\b/i', $text ) ) return 'pack_server';
    if ( preg_match( '/\b(?:azure|virtual\s+machine|vnet)\b/i', $text ) ) return 'pack_azure';
    if ( preg_match( '/\b(?:network\s+pack|wi-?fi|firewall|access\s+point|network\s+switch|networking|site-to-site\s+vpn|remote-access\s+vpn|qos)\b/i', $text ) ) return 'pack_network';
    if ( preg_match( '/\bsecurity\s+pack\b/i', $text ) ) return 'pack_security';
    if ( preg_match( '/\b(?:merger|acquisition|m\s*&\s*a)\b/i', $text ) && preg_match( '/\b(?:due\s+diligence|planning|it)\b/i', $text ) ) return 'pack_strategy';
    if ( preg_match( '/\b(?:governance|compliance|it\s+polic(?:y|ies)|documentation|evidence|due\s+diligence)\b/i', $text ) ) return 'pack_governance';
    if ( preg_match( '/\b(?:ai\s+pack|chatgpt|copilot|claude|artificial\s+intelligence|ai\s+tools|ai\s+adoption)\b/i', $text ) ) return 'pack_ai';
    if ( preg_match( '/\b(?:strategy|roadmap|budgeting|technology\s+roadmap|merger|acquisition|office\s+move\s+planning)\b/i', $text ) ) return 'pack_strategy';
    if ( preg_match( '/\b(?:disaster\s+recovery|business\s+continuity|recovery\s+plan|recovery\s+procedures?|dependency\s+mapping|restore\s+testing|rto|rpo)\b/i', $text ) ) return 'pack_disaster_recovery';
    if ( preg_match( '/\b(?:on[- ]?site|come\s+out|visit\s+(?:our\s+)?office|engineer\s+(?:in|on)\s+(?:the\s+)?(?:office|site)|hands[- ]on)\b/i', $text ) ) return 'service_onsite';
    if ( preg_match( '/\b(?:procurement|buy|source|supply|quote)\b.{0,30}\b(?:laptops?|desktops?|hardware|peripherals?|devices?)\b|\b(?:laptops?|desktops?|hardware|peripherals?)\b.{0,30}\b(?:procurement|buy|source|supply|quote)\b/i', $text ) ) return 'service_procurement';
    if ( preg_match( '/\b(?:voip|telephony|phone\s+system|business\s+phones?|number\s+porting|softphones?|auto[- ]?attendant|call\s+groups?)\b/i', $text ) ) return 'service_voip';
    if ( preg_match( '/\b(?:bespoke|niche|custom|proprietary|unusual)\b.{0,36}\b(?:system|software|application|app|requirement)\b/i', $text ) ) return 'service_bespoke';
    if ( preg_match( '/\b(?:free\s+it\s+audit|it\s+audit|free\s+audit|review\s+(?:our|my)\s+it|look\s+over\s+(?:our|my)\s+it)\b/i', $text ) ) return 'audit';
    if ( preg_match( '/\b(?:switch(?:ing)?|chang(?:e|ing)|mov(?:e|ing))\b/i', $text ) && preg_match( '/\b(?:it\s+providers?|support\s+providers?|msps?|providers?)\b/i', $text ) ) return 'onboarding';
    if ( preg_match( '/\b(?:purview|data\s+loss\s+prevention|dlp|sensitivity\s+labels?|defender\s+for\s+(?:business|office)|defender\s+suite|advanced\s+defender)\b/i', $text ) ) return 'package_premium';
    if ( preg_match( '/\b(?:microsoft\s*365|m365|entra|office\s*365|sharepoint|onedrive|teams)\b/i', $text ) && preg_match( '/\b(?:secur|protection|protect|phishing|identity|mfa|conditional\s+access|defender)\w*/i', $text ) ) return 'package_standard';
    if ( preg_match( '/\b(?:microsoft\s*365|m365|entra|office\s*365|sharepoint|onedrive|teams)\b/i', $text ) ) return 'microsoft';
    if ( preg_match( '/\b(?:cyber\s+security|cybersecurity|phishing|ransomware|identity\s+security|email\s+security)\b/i', $text ) ) return 'security';
    if ( preg_match( '/\b(?:printer|printing|outlook)\b/i', $text ) && preg_match( '/\b(?:issues?|problems?|help|support|not working|keeps?|breaking|broken|errors?)\b/i', $text ) ) return 'package_basic';
    if ( preg_match( '/\b(?:helpdesk|managed\s+support|managed\s+it|remote\s+support|day-to-day\s+it)\b/i', $text ) ) return 'managed_support';
    return '';
}

function stapleit_cora_context_from_history( $history ) {
    if ( ! is_array( $history ) ) return '';
    foreach ( array_reverse( $history ) as $message ) {
        $content = is_array( $message ) ? (string) ( $message['content'] ?? '' ) : '';
        $context = stapleit_cora_context_from_prompt( $content );
        if ( $context !== '' ) return $context;
    }
    return '';
}

function stapleit_cora_is_contextual_follow_up( $prompt ) {
    $text = strtolower( trim( (string) $prompt ) );
    if ( strlen( $text ) > 200 ) return false;
    return (bool) preg_match( '/\b(?:that|it|this|those|them|included|include|includes|cover|covers|come\s+with|what\s+do\s+i\s+get|tell\s+me\s+more|more\s+detail|how\s+much\s+is\s+that|what\s+about|how\s+does\s+(?:that|it)\s+work|what(?:\x{2019}s|\'s|\s+is)\s+involved|do\s+(?:i|we)\s+need\s+(?:that|it)|is\s+(?:that|it)\s+(?:extra|relevant)|what\s+does\s+(?:that|it)\s+cost|how\s+much\s+does\s+(?:that|it)\s+cost|can\s+you\s+set\s+(?:it|that)\s+up|where\s+is\s+(?:that|it)\s+available|can\s+we\s+(?:keep|retain)\s+(?:our\s+)?(?:existing\s+)?numbers?|what\s+if\s+we\s+fail\s+(?:a\s+)?check|does\s+(?:that|it)\s+mean|would\s+(?:that|it)\s+cover|can\s+(?:that|it)\s+include|how\s+often\s+would\s+(?:that|it))\b/iu', $text );
}

function stapleit_cora_context_for_turn( $prompt, $incoming_context = '', $history = array() ) {
    $explicit = stapleit_cora_context_from_prompt( $prompt );
    if ( $explicit !== '' ) return $explicit;
    if ( ! stapleit_cora_is_contextual_follow_up( $prompt ) ) return '';
    $incoming_context = stapleit_cora_valid_context_key( $incoming_context );
    if ( $incoming_context !== '' ) return $incoming_context;
    return stapleit_cora_context_from_history( $history );
}

function stapleit_cora_contextual_reply( $prompt, $context ) {
    $context = stapleit_cora_valid_context_key( $context );
    if ( $context === '' || ! stapleit_cora_is_contextual_follow_up( $prompt ) ) return '';
    $text = strtolower( trim( (string) $prompt ) );

    if ( $context === 'service_voip' && preg_match( '/\b(?:keep|retain)\s+(?:our\s+)?(?:existing\s+)?numbers?\b/i', $text ) ) {
        return 'Existing numbers can usually be retained, subject to the current provider and porting availability. Number porting is one of the published VoIP service areas.';
    }
    if ( $context === 'service_procurement' && preg_match( '/\bset\s+(?:it|that|them)\s+up\b/i', $text ) ) {
        return 'Yes — setup can be handled where required as part of the agreed procurement work, after compatibility and lifecycle are checked.';
    }
    if ( $context === 'service_onsite' && preg_match( '/\bwhere\b|\bavailable\b/i', $text ) ) {
        return 'Published on-site support is available across Surrey and London when the work is better done in person.';
    }
    if ( $context === 'pack_cyber_essentials' && preg_match( '/\bfail\b.{0,20}\bcheck\b/i', $text ) ) {
        return 'The Cyber Essentials pack includes support addressing failed checks, remediation guidance and preparation for re-testing. Certification and assessor decisions remain with the assessor, not Cora.';
    }

    $details = array(
        'package_sole' => 'Tailored support is shaped around the devices, Microsoft 365 services and day-to-day help actually needed, without forcing a smaller business into the published five-user packages. The exact scope and price are confirmed after a short review.',
        'package_basic' => 'Basic includes unlimited helpdesk support during 9am–5pm Monday to Friday, 24/7 device monitoring, remote device management, Windows and software patching, mobile device management, business-grade antivirus, asset and licence tracking, hardware and warranty management, onboarding and the client portal.',
        'package_standard' => 'Standard includes everything in Basic, then adds EDR, advanced email security, MFA and Conditional Access, privileged-account protection, LastPass, Microsoft 365 or Google Workspace backup, Exclaimer, managed device encryption, Secure Score work and regular security reviews.',
        'package_premium' => 'Premium includes everything in Standard plus Microsoft 365 Business Premium, DNS and web protection, enhanced Microsoft 365 security, Defender for Business and Defender for Office 365 management, stronger access controls and Microsoft Purview configuration where required. Additional Microsoft licensing may still be needed for advanced Defender or Purview Suite features.',
        'pack_server' => 'The Server pack covers supported physical Windows Servers: monitoring, patching, planned maintenance, backup/recovery oversight, Active Directory, Group Policy, DNS, DHCP, file shares, permissions, supported print services, hardware health, warranty support and lifecycle planning.',
        'pack_azure' => 'The Azure pack covers supported Azure virtual machines and resources: administration, monitoring, patching, Azure Backup/recovery, access and permissions, storage, VM sizing/performance, cost reviews, documentation and change planning.',
        'pack_network' => 'The Network pack covers managed firewalls, switches and Wi-Fi: firewall rules and security profiles, VLANs and ports, SSIDs/guest networks, site-to-site and remote-access VPNs, DHCP/DNS, connectivity monitoring, QoS, firmware updates and ISP liaison.',
        'pack_security' => 'The Security pack can add EDR, malware/ransomware protection, ITDR and suspicious-account monitoring, privileged-account reviews, anti-phishing/email filtering, spoofing protection, DMARC/DKIM/SPF, DNS/web filtering, threat investigation and security improvement work.',
        'pack_governance' => 'The Governance & compliance pack covers IT policies, asset/system documentation, network diagrams, supplier and critical-service records, governance/risk/access reviews, audit evidence, customer and insurer questionnaires, due diligence, and business-continuity/disaster-recovery documentation.',
        'pack_cyber_essentials' => 'The Cyber Essentials pack covers readiness and gap review, remediation planning, firewall/boundary security, secure configuration, user access, malware protection, patching/software support status, application/evidence guidance and final readiness checks for Cyber Essentials or Cyber Essentials Plus.',
        'pack_ai' => 'The AI pack covers readiness and use cases, platform/licensing comparison, data and security risks, secure setup, Copilot/ChatGPT/Claude guidance, workspace and admin configuration, access controls, staff onboarding, safe-use guidance, prompting best practice, AI policy support and ongoing reviews.',
        'pack_strategy' => 'The Strategy pack covers regular IT health reviews, technology roadmaps, upgrade/hardware/software/cloud planning, budget forecasting, licence reviews, supplier/procurement support, office moves, growth, mergers/acquisitions, due diligence and new-site planning.',
        'pack_disaster_recovery' => 'The Disaster recovery pack maps critical systems, data and dependencies; plans recovery priorities and RTO/RPO targets; documents contacts, responsibilities and recovery procedures; reviews backup/restore capability; and supports planned recovery testing and post-test remediation.',
        'service_onsite' => 'On-site support is ad-hoc hands-on help across Surrey and London for work that is better done in person, such as office moves, equipment changes, troubleshooting and setup requiring an engineer on site.',
        'service_procurement' => 'IT procurement covers business-grade laptops, desktops, software and peripherals. Staple IT can recommend suitable kit, check compatibility and lifecycle, source through trusted distributors and handle setup where required.',
        'service_voip' => 'VoIP and telephony can cover business phone-system design, number porting, softphones, voicemail, call groups and auto-attendants, with ongoing support after go-live. Existing numbers can usually be retained subject to provider and porting availability.',
        'service_bespoke' => 'Bespoke support is for niche systems and unusual requirements. An engineer would need to confirm the system, licensing and vendor dependencies before coverage is agreed; Staple IT can then support it where reasonably possible, work with the vendor and help plan a migration if replacement is required.',
        'audit' => 'The free IT audit reviews devices, servers/cloud, Microsoft 365 and licensing, connectivity and phones, security/backups/disaster recovery, support/suppliers/contracts/costs and lifecycle risks. It is no obligation and Staple IT says it will get back to the requester within one working day.',
        'microsoft' => 'Staple IT supports Microsoft 365 administration, identity protection and security. Business Premium is included with Premium; Standard requires Business Premium or equivalent licensing separately unless specifically included; Basic supports Microsoft 365 but software licensing is separate.',
        'security' => 'Staple IT provides layered security across devices, email, identities and web use, including EDR, anti-phishing/email protection, MFA, Conditional Access and privileged-account protection, with stronger Microsoft and DNS/web controls where required.',
        'managed_support' => 'Managed support includes a staffed helpdesk Monday to Friday 9am–5pm, 24/7 monitoring, device management, patching, business-grade antivirus, hardware/warranty tracking, onboarding, regular check-ins and a client support portal.',
        'onboarding' => 'Onboarding starts with a conversation and review of the current setup, then Staple IT can coordinate with the existing IT provider and suppliers so the handover is managed rather than left to the customer.',
    );

    if ( preg_match( '/\b(?:price|pricing|cost|how\s+much|extra)\b/i', $text ) ) {
        if ( in_array( $context, array( 'pack_server', 'pack_azure', 'pack_network', 'pack_security', 'pack_governance', 'pack_cyber_essentials', 'pack_ai', 'pack_strategy', 'pack_disaster_recovery', 'service_onsite', 'service_procurement', 'service_voip', 'service_bespoke' ), true ) ) {
            return 'That is price on application. The exact scope and price are confirmed after reviewing what you already use and what you actually need.';
        }
        if ( $context === 'audit' ) return 'The IT audit is free and no obligation.';
        if ( $context === 'package_basic' ) return 'Basic starts from £35 per staff member, per month for teams of 5+.';
        if ( $context === 'package_standard' ) return 'Standard starts from £55 per staff member, per month for teams of 5+; Microsoft 365 Business Premium or equivalent licensing is required and sold separately unless specifically included.';
        if ( $context === 'package_premium' ) return 'Premium starts from £75 per staff member, per month for teams of 5+ and includes Microsoft 365 Business Premium. Additional Microsoft licensing may still be needed for advanced Defender or Purview Suite features.';
        if ( $context === 'package_sole' ) return 'Tailored support is price on application because the scope is shaped around what the smaller business or individual actually needs.';
    }

    if ( preg_match( '/\b(?:do\s+(?:i|we)\s+need|is\s+(?:that|it)\s+relevant)\b/i', $text ) ) {
        $relevance = array(
            'pack_server' => 'It is relevant when you run a physical Windows Server that needs ongoing management. If you only use Microsoft 365 and no physical Windows Server, it may not be needed.',
            'pack_azure' => 'It is relevant when you actually run supported Azure resources such as virtual machines or storage. Microsoft 365 by itself does not mean you need the Azure pack.',
            'pack_network' => 'It is relevant when you want Staple IT to actively manage business firewalls, switches or Wi-Fi access points rather than only troubleshoot connectivity from the user side.',
            'pack_security' => 'It may be relevant when your required protection goes beyond what the chosen core support package already includes. The audit should confirm that before anything is added.',
            'pack_governance' => 'It is relevant when you need written IT policies, documentation, evidence, due-diligence or insurer/customer questionnaire support.',
            'pack_cyber_essentials' => 'It is relevant when you are working toward Cyber Essentials or Cyber Essentials Plus and want readiness, remediation and application support.',
            'pack_ai' => 'It is relevant when the business is introducing AI tools and wants help with platform choice, security, data controls, policy and staff adoption.',
            'pack_strategy' => 'It is relevant when you want planned IT reviews, budgeting, roadmaps and supplier/change planning rather than only reactive support.',
            'pack_disaster_recovery' => 'It is relevant when you need a documented and tested recovery plan beyond simply having backups.',
            'service_onsite' => 'It is useful when the work genuinely needs hands-on attendance rather than remote support.',
            'service_procurement' => 'It is useful when you want Staple IT to recommend, source and help set up business hardware or software rather than buying it independently.',
            'service_voip' => 'It is relevant when you need a new or managed business phone system, number porting, softphones, voicemail, call groups or auto-attendants.',
            'service_bespoke' => 'It is relevant when a niche or custom system does not fit a standard support scope. An engineer still needs to confirm compatibility and vendor dependencies.',
        );
        if ( isset( $relevance[ $context ] ) ) return $relevance[ $context ];
    }

    return $details[ $context ] ?? '';
}

function stapleit_cora_fast_reply( $prompt, $context = '' ) {
    $text    = strtolower( trim( (string) $prompt ) );
    $context = stapleit_cora_valid_context_key( $context );

    $contextual_reply = stapleit_cora_contextual_reply( $prompt, $context );
    if ( $contextual_reply !== '' ) return $contextual_reply;

    if ( preg_match( '/\b(?:business\s+premium|microsoft\s*365\s+business\s+premium|m365\s+business\s+premium)\b/i', $text ) && ( preg_match( '/\b(?:licen[cs](?:e|es|ed|ing)|subscriptions?)\b/i', $text ) || preg_match( '/\bstandalone\b/i', $text ) ) && preg_match( '/\b(?:price|pricing|cost|how\s+much)\b/i', $text ) ) {
        return 'Staple IT does not publish a standalone Microsoft 365 Business Premium licence price on this site. The managed Premium support package includes Business Premium, but that package price is not the standalone Microsoft licence price. A person can confirm the licence price and quantity you need.';
    }

    if ( preg_match( '/\b(?:cheapest|least\s+expensive|lowest[-\s]+cost|most\s+affordable)\b/i', $text ) ) {
        return 'The cheapest published team package is Basic, starting from £35 per staff member, per month for teams of 5+. It covers day-to-day helpdesk support, monitoring, patching, remote device management and business-grade antivirus. Sole-trader support is tailored and price on application.';
    }

    if ( stapleit_cora_is_contextual_follow_up( $text ) && preg_match( '/\b(?:include|included|includes|cover|covers|come\s+with|what\s+do\s+i\s+get|tell\s+me\s+more|more\s+detail)\b/i', $text ) ) {
        if ( $context === 'package_basic' ) {
            return 'Basic includes unlimited helpdesk support during 9am–5pm Monday to Friday, 24/7 device monitoring, remote device management, Windows and software patching, mobile device management, business-grade antivirus, asset and licence tracking, hardware and warranty management, onboarding and access to the client portal. It starts from £35 per staff member, per month for teams of 5+.';
        }
        if ( $context === 'package_standard' ) {
            return 'Standard includes everything in Basic, then adds EDR, advanced email security, MFA and Conditional Access, privileged-account protection, LastPass, Microsoft 365 or Google Workspace backup, Exclaimer and regular security reviews. It starts from £55 per staff member, per month for teams of 5+; Microsoft 365 Business Premium or equivalent licensing is required and sold separately unless specifically included.';
        }
        if ( $context === 'package_premium' ) {
            return 'Premium includes everything in Standard plus Microsoft 365 Business Premium, DNS and web protection, enhanced Microsoft 365 security, Defender for Business and Defender for Office 365 management, stronger access controls and Microsoft Purview configuration where required. It starts from £75 per staff member, per month for teams of 5+. Additional Microsoft licensing may still be required for advanced Defender or Purview Suite features.';
        }
        if ( $context === 'package_sole' ) {
            return 'Sole-trader support is tailored around the devices, Microsoft 365 services and day-to-day help you actually need rather than forcing you into a five-user package. The scope and price are confirmed after a short review, so it is price on application.';
        }
    }

    if ( preg_match( '/(?:\bcyber\s+essentials\b|\bce\+)/i', $text ) ) {
        return 'Yes. The Cyber Essentials pack supports readiness, remediation and application preparation for Cyber Essentials or Cyber Essentials Plus, and it is price on application. We can help review the current setup, identify gaps and work through remediation before the assessment. If you also need IT policies, documentation or evidence for a customer or insurer, the Governance & compliance pack may be useful too.';
    }

    if ( preg_match( '/\b(?:microsoft\s*365|m365|business\s+premium|entra|office\s*365)\b/i', $text ) && preg_match( '/\b(?:secur|protection|protect|phishing|identity|mfa|conditional\s+access|defender)\w*/i', $text ) ) {
        return 'For teams of 5+, Standard is the published starting point for stronger Microsoft 365 security: it adds EDR, email protection, MFA, Conditional Access, privileged-account protection, cloud backup and regular security reviews. Microsoft 365 Business Premium or equivalent licensing is required and sold separately unless specifically included. Smaller teams use Tailored support, so I would need the team size before choosing a core package.';
    }

    if ( preg_match( '/\b(?:printer|printing|outlook)\b/i', $text ) && preg_match( '/\b(?:issues?|problems?|help|support|not working|keeps?|breaking|broken|errors?)\b/i', $text ) ) {
        return 'That is day-to-day support. For teams of 5+, it sits in Basic, which starts from £35 per staff member, per month and covers helpdesk support during 9am–5pm Monday to Friday plus monitoring, patching and remote device management. Smaller teams use Tailored support, so I would need the team size before choosing a core package.';
    }

    if ( preg_match( '/\b(?:what\s+security|security\s+services|cyber\s+security|cybersecurity|protect\s+our|security\s+protection)\b/i', $text ) ) {
        return 'Staple IT provides layered security across devices, email, identities and online services. Published controls include EDR, anti-phishing and email protection, MFA, Conditional Access and privileged-account protection, with stronger Microsoft security and DNS/web protection available where required.';
    }

    if ( preg_match( '/\b(?:backup|backups|back\s+up)\b/i', $text ) && preg_match( '/\b(?:microsoft\s*365|m365|google\s+workspace|email|onedrive|sharepoint|teams|cloud)\b/i', $text ) ) {
        return 'Standard includes Microsoft 365 or Google Workspace backup for supported cloud data, with monitoring, failure alerts, restoration support and periodic restore testing. For teams under five, the support scope is tailored rather than forcing the published per-user package.';
    }

    if ( preg_match( '/\b(?:recovery\s+procedures?|dependency\s+mapping|disaster\s+recovery\s+testing|recovery\s+scenario\s+testing)\b/i', $text ) || ( preg_match( '/\brestore\s+testing\b/i', $text ) && $context === 'pack_disaster_recovery' ) ) {
        return 'The Disaster recovery pack includes documented recovery procedures, dependency mapping, planned recovery scenarios and restore testing, followed by post-test reporting, gap identification and updates to the recovery plan.';
    }

    if ( preg_match( '/\b(?:test\s+restores?|restore\s+testing|test\s+our\s+backups?)\b/i', $text ) ) {
        return 'Standard and Premium include periodic restore testing for supported Microsoft 365 or Google Workspace backup. Server, Azure and Disaster recovery scopes can also include recovery testing appropriate to those environments.';
    }

    if ( preg_match( '/\bgoogle\s+workspace\b/i', $text ) ) {
        return 'Yes. Staple IT supports Google Workspace as well as Microsoft 365. The exact licensing and backup position depends on the support package and your current setup, so I will not invent a licence cost.';
    }

    if ( preg_match( '/\b(?:business\s+premium|microsoft\s*365\s+business\s+premium|m365\s+business\s+premium)\b/i', $text ) ) {
        return 'Microsoft 365 Business Premium is included with Premium, which starts from £75 per staff member, per month for teams of 5+. Standard starts from £55 per staff member, per month and requires Business Premium or equivalent licensing, sold separately unless specifically included. Premium is the clearer fit when you want the Microsoft licence bundled with the managed support and enhanced Microsoft security.';
    }

    if ( preg_match( '/\b(?:price|pricing|cost|how much)\b/i', $text ) && preg_match( '/\b(?:package|support|basic|standard|premium)\b/i', $text ) ) {
        return 'For teams of 5+, Basic starts from £35 per staff member, per month, Standard from £55 per staff member, per month, and Premium from £75 per staff member, per month. Sole-trader support and optional packs are price on application. Your written proposal confirms the final scope, eligibility and price before onboarding.';
    }

    if ( preg_match( '/\b(?:physical\s+server|windows\s+server|active\s+directory|group\s+policy|file\s+server)\b/i', $text ) ) {
        return 'If you run a physical Windows Server, the Server pack is likely relevant. It is price on application and covers ongoing server support, 24/7 health monitoring, patching, backup oversight and recovery assistance, plus core services such as Active Directory, Group Policy, DNS, DHCP, file shares and permissions. We would confirm the exact server roles and support scope before adding it.';
    }

    if ( preg_match( '/\b(?:wi-?fi|firewall|access\s+point|network\s+switch|networking)\b/i', $text ) ) {
        return 'The Network pack is designed for managed firewalls, switches and Wi-Fi access points. It adds active monitoring, configuration and ongoing management for that infrastructure and is price on application. If you are unsure what equipment you have, that is fine — the IT audit can identify it without you needing to know the technical names.';
    }

    if ( preg_match( '/\b(?:chatgpt|copilot|claude|artificial\s+intelligence|ai\s+tools|ai\s+adoption|ai\s+policy)\b/i', $text ) ) {
        return 'The AI pack is for businesses introducing AI tools safely and practically. It covers readiness, platform choice, secure setup, staff guidance and ongoing administration, including Microsoft Copilot, ChatGPT Business or Enterprise and Claude Team or Enterprise where suitable. It is price on application because the right setup depends on your data, licences and how your staff will use it.';
    }

    if ( preg_match( '/\b(?:switch(?:ing)?|chang(?:e|ing)|mov(?:e|ing))\b/i', $text ) && preg_match( '/\b(?:it\s+providers?|support\s+providers?|msps?|providers?)\b/i', $text ) ) {
        return 'We handle the changeover as managed onboarding. We review the current setup, agree what needs moving, and can work directly with the existing IT provider and other suppliers so support is ready before the old arrangement ends.';
    }

    if ( preg_match( '/^(?:hi|hello|hey|hiya|yo|morning|afternoon|evening)[.! ]*$/i', trim( $prompt ) ) ) {
        return 'Hi — what can I help with?';
    }

    if ( preg_match( '/^(?:sorry[ ,.-]*)?(?:wha+t|what|huh|eh|pardon|come again)[?.! ]*$/i', trim( $prompt ) ) ) {
        return 'Which part should I explain? If you mean my last answer, tell me what did not make sense and I’ll put it more plainly.';
    }

    if ( preg_match( '/\b(?:you(?:\x{2019}re|\'re|\s+are)\s+(?:broken|not\s+funny)|this\s+is\s+(?:odd|weird)|that(?:\x{2019}s|\'s|\s+is)\s+(?:odd|weird)|you\s+keep\s+repeating|why\s+do\s+you\s+keep\s+repeating)\b/iu', $text ) ) {
        return 'Fair point. Tell me what you expected me to understand and I’ll try again without forcing it into the wrong answer.';
    }

    if ( preg_match( '/\b(?:free\s+money|give\s+me\s+money)\b/i', $text ) ) {
        return 'I can’t give you money. If you mean reducing IT costs, I can help with licences, support or cloud spend.';
    }

    $licensing_quantity_text = preg_replace( '/\b(?:microsoft\s*365|office\s*365|m365)\b/i', '', $text );
    if ( preg_match( '/\b(?:\d{2,4}\s+(?:licen[cs](?:e|es)|seats?|users?|mailboxes?)|(?:bulk|volume|bespoke|custom|hundreds?|large)\s+(?:licen[cs](?:e|es)|licensing|seats?|users?|mailboxes?))\b/i', $licensing_quantity_text ) ) {
        return 'That is a business IT and licensing request. I can help narrow it down, but I will not invent a bulk price in chat. Tell me which licence or subscription you mean, and whether you need licences only or managed support as well.';
    }

    if ( preg_match( '/\b(?:thanks|thank\s+you|cheers)\b/i', $text ) && strlen( $text ) < 80 ) {
        return 'You’re welcome.';
    }

    if ( preg_match( '/\b(?:what\s+do\s+you(?:\s+actually)?\s+do|what\s+does\s+staple\s+it\s+do|what\s+can\s+you\s+help\s+with|what\s+services)\b/i', $text ) ) {
        return 'Staple IT provides managed IT support plus Microsoft 365, cyber security, networking, servers, Azure, consultancy, AI adoption, VoIP and bespoke project work. I can explain any of those, or help work out which support package is the sensible starting point.';
    }

    if ( preg_match( '/\b(?:charit(?:y|ies)|non[- ]?profit|not[- ]for[- ]profit)\b/i', $text ) && preg_match( '/\b(?:support|help|work\s+with|client|organisation|organization)\b/i', $text ) ) {
        return 'Yes. Staple IT supports businesses, charities and individuals. If you tell me roughly how many people need support and what you want help with, I can narrow down the relevant support route without assuming more than you’ve told me.';
    }

    if ( preg_match( '/\b(?:hours|opening\s+hours|when\s+are\s+you|when\s+can\s+i\s+call|are\s+you\s+open|what\s+time\s+do\s+you\s+open)\b/i', $text ) ) {
        return 'Staffed support is Monday to Friday, 9am–5pm. Device and service monitoring runs 24/7; staffed support does not.';
    }

    if ( preg_match( '/\b(?:contact|phone\s+number|telephone\s+number|email\s+address|email\s+you|call\s+you|get\s+in\s+touch)\b|\bwhat(?:\x{2019}s|\'s|\s+is)\s+your\s+email\b/iu', $text ) ) {
        return 'You can call Staple IT on 01372 309 707 or email hello@stapleit.co.uk.';
    }

    if ( preg_match( '/\b(?:free\s+it\s+audit|it\s+audit|free\s+audit|review\s+(?:our|my)\s+it|look\s+over\s+(?:our|my)\s+it)\b/i', $text ) ) {
        return 'The free IT audit reviews devices, servers and cloud services, Microsoft 365 and licensing, internet/Wi-Fi/networks and business phones, cyber security, backups and disaster recovery, support/suppliers/contracts/costs and lifecycle risks. It is free and no obligation; after an audit request is sent, Staple IT says it will get back to you within one working day.';
    }

    if ( preg_match( '/\b(?:where\s+are\s+you\s+based|where\s+is\s+staple\s+it|your\s+address|office\s+address|based\s+in\s+(?:epsom|surrey))\b/i', $text ) ) {
        return 'Staple IT is based in Epsom, Surrey. The published address is 88 Eastdean Avenue, Epsom, KT18 7SN.';
    }

    if ( preg_match( '/\b(?:whatsapp|whats\s*app)\b/i', $text ) ) {
        return 'Yes — the Get in Touch page has a WhatsApp Business option using Staple IT’s published number, 01372 309 707.';
    }

    if ( preg_match( '/\b(?:why\s+(?:should|would)\s+(?:i|we)\s+(?:use|trust|choose)|are\s+you\s+(?:qualified|insured)|qualified\s+and\s+insured|what\s+makes\s+you\s+different)\b/i', $text ) ) {
        return 'Staple IT publishes that its engineers are qualified, experienced and insured, that the business is local to Epsom, and that clients deal with people who know their setup rather than a distant call centre. Managed support also uses simple rolling agreements rather than lengthy lock-in.';
    }

    if ( preg_match( '/\b(?:on[- ]?site\s+support|come\s+(?:out|to\s+(?:our\s+)?office)|visit\s+(?:our\s+)?office|engineer\s+(?:visit(?:s)?\s+us|(?:in|on)\s+(?:the\s+)?(?:office|site))|hands[- ]on\s+support)\b/i', $text ) ) {
        return 'Yes. On-site support is available across Surrey and London when the work is better done in person. Published examples include office moves, equipment changes, hands-on troubleshooting and setup; scope and timing are agreed beforehand and it is price on application.';
    }

    if ( preg_match( '/\b(?:it\s+procurement|procurement|supply|source|buy|quote)\b(?:.{0,36}\b(?:laptops?|desktops?|hardware|peripherals?|devices?))?\b|\b(?:laptops?|desktops?|hardware|peripherals?)\b.{0,36}\b(?:procurement|supply|source|buy|quote)\b/i', $text ) ) {
        return 'Yes. IT procurement can cover business-grade laptops, desktops, software and peripherals. Staple IT can recommend suitable kit, check compatibility and lifecycle, source through trusted distributors and handle setup where required; pricing is confirmed for the actual items and work required.';
    }

    if ( preg_match( '/\b(?:dmarc|dkim|spf|email\s+authentication(?:\s+records?)?)\b/i', $text ) ) {
        return 'The Security pack explicitly includes DMARC, DKIM and SPF configuration alongside anti-phishing, spoofing protection and wider email-security reviews. The Security pack is price on application.';
    }

    if ( preg_match( '/\b(?:dns\s+filtering|web\s+filtering|web\s+content|malicious\s+(?:site|website)|unsafe\s+downloads?)\b/i', $text ) ) {
        return 'Premium includes DNS filtering and web protection for teams of 5+, with web-content controls where required. The optional Security pack can also include DNS/web filtering and malicious-site blocking where that extra security scope is needed.';
    }

    if ( preg_match( '/\b(?:purview|data\s+loss\s+prevention|\bdlp\b|sensitivity\s+labels?|information\s+protection)\b/i', $text ) ) {
        return 'Premium can include Microsoft Purview configuration, sensitivity labels, information protection and Data Loss Prevention policies where required. Microsoft 365 Business Premium is included with Premium, but additional Microsoft licensing may still be required for advanced Purview Suite features.';
    }

    if ( preg_match( '/\b(?:defender\s+for\s+business|defender\s+for\s+office(?:\s*365)?|defender\s+suite|advanced\s+defender)\b/i', $text ) ) {
        return 'Premium includes management of Microsoft Defender for Business and Defender for Office 365, with broader Defender Suite configuration and management where required. Additional Microsoft licensing may still be required for advanced Defender Suite features.';
    }

    if ( preg_match( '/\b(?:secure\s+score|device\s+encryption|bitlocker|quarterly\s+security\s+reviews?|cyber\s+insurance\s+questionnaires?)\b/i', $text ) ) {
        return 'Standard and Premium include stronger ongoing security work such as Microsoft Secure Score improvement, quarterly security reviews and managed device encryption. Standard also publishes cyber-insurance questionnaire assistance; Governance & compliance can add deeper evidence and documentation support where needed.';
    }

    if ( preg_match( '/\b(?:site[- ]to[- ]site\s+vpn|remote[- ]access\s+vpn|\bvpn\b|\bqos\b|quality\s+of\s+service|dhcp|network\s+dns|firmware\s+updates?|isp\s+liaison|liaise\s+with\s+(?:our\s+)?isp)\b/i', $text ) ) {
        return 'Those are covered areas in the Network pack: site-to-site and remote-access VPNs, DHCP/DNS management, QoS, networking-firmware updates and ISP liaison sit alongside firewall, switch and Wi-Fi management. The Network pack is price on application.';
    }

    if ( preg_match( '/\b(?:azure\s+cost|azure\s+spend|oversized\s+(?:vm|virtual\s+machine)|unused\s+azure|azure\s+backup|azure\s+storage)\b/i', $text ) ) {
        return 'The Azure pack includes supported Azure resource and VM monitoring, Azure Backup oversight and recovery support, storage management, VM sizing reviews, cost monitoring and identification of unused or oversized resources. Major architecture or migration work may be quoted separately.';
    }

    if ( preg_match( '/\b(?:server\s+hardware|server\s+warranty|server\s+lifecycle|server\s+backups?|active\s+directory|group\s+policy|\bgpo\b)\b/i', $text ) ) {
        return 'The Server pack covers supported physical Windows Servers, including hardware health/warranty support and lifecycle planning as well as backup oversight, Active Directory, Group Policy, DNS, DHCP, file shares and permissions. Major upgrades or replacement projects may be quoted separately.';
    }

    if ( preg_match( '/\b(?:azure|virtual\s+machine|vnet|azure\s+vm)\b/i', $text ) ) {
        return 'The Azure pack covers Microsoft Azure administration, virtual machines, monitoring, maintenance, access control, backup and recovery support, and cost reviews. It is price on application because the scope depends on the Azure resources you actually run.';
    }

    if ( preg_match( '/\b(?:merger|acquisition|m\s*&\s*a|new\s+office|office\s+move)\b/i', $text ) && preg_match( '/\b(?:it|planning|due\s+diligence|technology)\b/i', $text ) ) {
        return 'The Strategy pack covers IT planning for growth and major business change, including new offices, office moves, mergers and acquisitions, due diligence, supplier planning and technology roadmaps. It is price on application; implementation work may be quoted separately.';
    }

    if ( preg_match( '/\b(?:governance|it\s+polic(?:y|ies)|documentation|insurer|customer(?:\s+security)?\s+questionnaire|compliance\s+evidence|asset\s+register|network\s+diagram|due\s+diligence)\b/i', $text ) ) {
        return 'The Governance & compliance pack covers IT policies, documentation, evidence and help responding to customer or insurer checks. It is price on application; formal legal, regulatory or certification advice is not included unless specifically agreed.';
    }

    if ( preg_match( '/\b(?:strategy|technology\s+roadmap|it\s+roadmap|budgeting|it\s+budget|supplier\s+planning|new\s+office|office\s+move|merger|acquisition|due\s+diligence)\b/i', $text ) ) {
        return 'The Strategy pack adds regular IT reviews, budgeting, supplier support and a practical technology roadmap. It is price on application and is intended to make improvements and growth planned rather than purely reactive.';
    }

    if ( preg_match( '/\b(?:disaster\s+recovery|business\s+continuity|recovery\s+plan|rto|rpo)\b/i', $text ) ) {
        return 'The Disaster recovery pack creates and tests a structured recovery plan for critical systems and data. Scope, recovery objectives and testing arrangements are agreed after a review and cannot be set in chat.';
    }

    if ( preg_match( '/\b(?:voip|phone\s+system|telephone\s+system|telephony|number\s+porting|port\s+(?:our\s+)?(?:business\s+)?phone\s+numbers?|softphones?|voicemail|call\s+groups?|auto[- ]?attendant)\b/i', $text ) ) {
        return 'Yes. VoIP and telephony can cover business phone-system design, number porting, softphones, voicemail, call groups and auto-attendants, with ongoing support after go-live. Existing numbers can usually be retained subject to the current provider and porting availability; the service is price on application.';
    }

    if ( preg_match( '/\b(?:which|what)\s+packages?\b/i', $text ) && preg_match( '/\bmicrosoft\s*365\b/i', $text ) && preg_match( '/\b(?:include|included|licen[cs]e)\b/i', $text ) ) {
        return 'Microsoft 365 Business Premium is included with Premium. Standard requires Business Premium or equivalent licensing, sold separately unless specifically included. Basic supports Microsoft 365, but the software licence itself is sold separately.';
    }

    if ( preg_match( '/\b(?:microsoft\s*365|m365|office\s*365|sharepoint|onedrive|teams|entra)\b/i', $text ) ) {
        return 'Staple IT supports Microsoft 365 administration, identity protection and security. If you tell me what you are trying to change or fix, I can explain the relevant support or licensing position without guessing at licence costs.';
    }

    if ( preg_match( '/\b(?:line[- ]of[- ]business|bespoke|niche|custom|proprietary|unusual)\b/i', $text ) && preg_match( '/\b(?:app|application|software|system|requirement)\b/i', $text ) ) {
        return 'That fits the bespoke-support category, but an engineer would need to confirm the specific niche system, licensing and vendor dependencies before I claim it is covered. Staple IT can support unusual systems where reasonably possible, work with the vendor where needed, be clear about anything outside its expertise and help plan a migration if replacement is required.';
    }

    if ( preg_match( '/\b(?:weather|football|recipe|movie|film\s+times|horoscope)\b/i', $text ) ) {
        return 'I can only help with Staple IT and business IT questions.';
    }

    if ( preg_match( '/\b(?:how\s+do\s+(?:the\s+)?(?:packages|basic.*standard.*premium)\s+differ|difference\s+between\s+(?:basic|standard|premium)|compare\s+(?:(?:your|the)\s+)?(?:support\s+)?packages|basic\s+vs\s+standard|standard\s+vs\s+premium|what\s+does\s+premium\s+add\s+over\s+standard)\b/i', $text ) ) {
        return 'Basic is the day-to-day support layer. Standard adds managed security, identity protection and cloud backup. Premium adds Microsoft 365 Business Premium plus enhanced Microsoft security and data protection. The published per-person packages are for teams of 5+; smaller teams use Tailored support.';
    }

    if ( preg_match( '/\b(?:minimum|minimum\s+users?|minimum\s+staff|how\s+many\s+(?:users?|people|staff)|five\s+users?)\b/i', $text ) && preg_match( '/\b(?:package|support|staff|users?|people|minimum)\b/i', $text ) ) {
        return 'Basic, Standard and Premium are published for teams of 5 or more. Smaller teams and sole traders use Tailored support rather than being forced into a five-user package.';
    }

    if ( preg_match( '/\b(?:sole[- ]?trader|one[- ]person\s+business|just\s+me)\b/i', $text ) && preg_match( '/\b(?:support|package|help|pricing|price|cost)\b/i', $text ) ) {
        return 'Sole-trader support is Tailored and price on application. It is shaped around the devices, Microsoft 365 services and day-to-day help actually needed rather than forcing a one-person business into the published five-user packages.';
    }

    if ( preg_match( '/\b(?:contract|agreement|lock[- ]?in|rolling)\b/i', $text ) ) {
        return 'Managed support uses a three-month rolling agreement with fixed monthly pricing. There is no long-term lock-in in the published support terms.';
    }

    if ( preg_match( '/\b(?:24\s*(?:\/|x)\s*7|twenty[- ]four\s+seven|round[- ]the[- ]clock)\b/i', $text ) && preg_match( '/\b(?:support|helpdesk|monitor|monitoring|engineers?|staffed|service)\b/i', $text ) ) {
        return 'Monitoring runs 24/7. The staffed helpdesk is Monday to Friday, 9am–5pm; the helpdesk is not staffed around the clock.';
    }

    if ( preg_match( '/\b(?:edr|endpoint\s+detection|conditional\s+access|mfa|multi[- ]factor|privileged\s+account|email\s+security|anti[- ]phishing)\b/i', $text ) ) {
        return 'Those managed security controls sit in Standard and above for teams of 5+. Standard includes EDR, email security, MFA, Conditional Access and privileged-account protection. Microsoft 365 Business Premium or equivalent licensing is required and sold separately unless specifically included; smaller teams use Tailored support.';
    }

    if ( preg_match( '/\b(?:mdm|mobile\s+devices?|company\s+phones?|mobile\s+device\s+management|device\s+management|remote\s+wipe|device\s+compliance|work\s+apps?)\b/i', $text ) ) {
        return 'Managed support includes device management, and Standard adds stronger mobile-device controls such as compliance policies, remote wipe and work-application management. The exact policy scope depends on the devices and licensing in use.';
    }

    if ( preg_match( '/\b(?:lastpass|exclaimer|email\s+signature)\b/i', $text ) ) {
        return 'Standard includes LastPass password management and Exclaimer email-signature management, and Premium includes everything in Standard. The published per-person packages apply to teams of 5+.';
    }

    if ( preg_match( '/\b(?:include|included|comes\s+with|licen[cs]e)\b/i', $text ) && preg_match( '/\bmicrosoft\s*365\b/i', $text ) ) {
        return 'Microsoft 365 Business Premium is included with Premium. Standard requires Business Premium or equivalent licensing, sold separately unless specifically included. Basic supports Microsoft 365, but the software licence itself is sold separately.';
    }

    if ( preg_match( '/\b(?:password\s+resets?|reset\s+(?:a\s+)?(?:user\s+)?passwords?|forgot(?:ten)?\s+(?:my|a|their|his|her)\s+password|forgot\s+their\s+password)\b/i', $text ) ) {
        return 'Password resets are part of normal day-to-day helpdesk support. For teams of 5+, that sits within Basic and above; smaller teams use Tailored support.';
    }

    if ( preg_match( '/\b(?:new\s+starter|new\s+user|leavers?|offboard|onboard\s+(?:a\s+)?user|joiners?|remove\s+access\s+when\s+someone\s+leaves)\b/i', $text ) ) {
        return 'New-starter and leaver management is part of managed support. That includes setting up or removing user access and supported devices as part of the agreed environment; physical device setup can be scoped separately where required.';
    }

    if ( preg_match( '/\b(?:can\s+you|do\s+you)\s+support\s+(?:me|us|our\s+(?:business|company|charity|organisation|organization))\b/i', $text ) ) {
        return 'Staple IT supports businesses, charities and individuals. Tell me what you need help with and, if you are looking at ongoing support, roughly how many people need it.';
    }

    if ( preg_match( '/\b(?:can\s+you|do\s+you)\s+(?:support|help\s+with|manage)\b/i', $text ) && preg_match( '/\b(?:app|application|software|system|platform)\b/i', $text ) ) {
        return 'That specific product is not in my published Staple IT knowledge, so I will not claim it is covered. An engineer would need to confirm the application, licensing, vendor support and any dependencies before it is included in support.';
    }

    if ( preg_match( '/\b(?:can\s+you|do\s+you)\s+(?:support|manage|help\s+with)\s+(.{2,80})[?.!]*$/i', trim( $prompt ) ) ) {
        return 'That specific product or system is not in my published Staple IT knowledge, so I will not claim it is covered. An engineer would need to confirm the product, licensing, vendor support and any dependencies.';
    }

    return '';
}

function stapleit_cora_package_flow_state( $raw ) {
    $state = is_array( $raw ) ? $raw : array();
    return array(
        'team'         => in_array( (string) ( $state['team'] ?? '' ), array( '1', '4', '10', '25' ), true ) ? (string) $state['team'] : '',
        'security'     => in_array( (string) ( $state['security'] ?? '' ), array( 'basic', 'standard', 'premium' ), true ) ? (string) $state['security'] : '',
        'requirements' => in_array( (string) ( $state['requirements'] ?? '' ), array( 'yes', 'no', 'unsure' ), true ) ? (string) $state['requirements'] : '',
    );
}

function stapleit_cora_parse_package_team( $prompt ) {
    $text = strtolower( trim( (string) $prompt ) );
    if ( preg_match( '/\b(?:just\s+me|only\s+me|sole[-\s]?trader|one\s+person)\b/i', $text ) ) return '1';
    if ( preg_match( '/\b2\s*[–-]\s*4\b/i', $text ) ) return '4';
    if ( preg_match( '/\b5\s*[–-]\s*19\b/i', $text ) ) return '10';
    if ( preg_match( '/(?:^|\b)20\s*\+/i', $text ) ) return '25';
    $count = 0;
    if ( preg_match( '/^\s*(\d{1,3})\s*$/', $text, $match ) ) {
        $count = (int) $match[1];
    } elseif ( preg_match( '/\b(?:we\s+(?:have|are)|team\s+of|staff\s+of|there\s+are)\s+(\d{1,3})(?:\s*(?:staff|people|users?|employees?|of\s+us))?\b/i', $text, $match ) ) {
        $count = (int) $match[1];
    } elseif ( preg_match( '/\b(\d{1,3})\s+(?:staff|people|users?|employees?)\b/i', $text, $match ) ) {
        $count = (int) $match[1];
    } else {
        $number_words = array(
            'one' => 1, 'two' => 2, 'three' => 3, 'four' => 4, 'five' => 5,
            'six' => 6, 'seven' => 7, 'eight' => 8, 'nine' => 9, 'ten' => 10,
            'eleven' => 11, 'twelve' => 12, 'thirteen' => 13, 'fourteen' => 14,
            'fifteen' => 15, 'sixteen' => 16, 'seventeen' => 17, 'eighteen' => 18,
            'nineteen' => 19, 'twenty' => 20,
        );
        $words = implode( '|', array_keys( $number_words ) );
        if ( preg_match( '/\b(' . $words . ')\s+(?:staff|people|users?|employees?|of\s+us)\b/i', $text, $match ) || preg_match( '/\b(?:team\s+of|we\s+(?:have|are))\s+(' . $words . ')\b/i', $text, $match ) ) {
            $count = $number_words[ strtolower( $match[1] ) ] ?? 0;
        }
    }
    if ( $count === 1 ) return '1';
    if ( $count >= 2 && $count <= 4 ) return '4';
    if ( $count >= 5 && $count <= 19 ) return '10';
    if ( $count >= 20 ) return '25';
    return '';
}

function stapleit_cora_parse_package_security( $prompt ) {
    $text = strtolower( trim( (string) $prompt ) );
    $already_has_business_premium = (bool) preg_match( '/\b(?:already\s+(?:have|use)|we\s+(?:have|use)|licensed\s+for)\b.{0,36}\bbusiness\s+premium\b/i', $text );
    if ( preg_match( '/\bpremium\b/i', $text ) && ! $already_has_business_premium ) return 'premium';
    if ( preg_match( '/\b(?:want|need|include|included|bundled|bundle|get)\b.{0,36}\bbusiness\s+premium\b/i', $text ) || preg_match( '/\bbusiness\s+premium\b.{0,28}\b(?:included|bundled|package)\b/i', $text ) ) return 'premium';
    if ( preg_match( '/\b(?:standard|security\s*\+\s*backup|stronger\s+security|better\s+security|more\s+security|edr|conditional\s+access|mfa|cloud\s+backup|email\s+security|phishing|identity\s+protection)\b/i', $text ) ) return 'standard';
    if ( preg_match( '/\b(?:basic|day-to-day\s+support|day\s+to\s+day\s+support|just\s+support|everyday\s+(?:it\s+)?support|printer|printing|outlook|password\s+reset|general\s+it\s+help)\b/i', $text ) ) return 'basic';
    return '';
}

function stapleit_cora_parse_package_requirements( $prompt ) {
    $text = strtolower( trim( (string) $prompt ) );
    if ( preg_match( '/\b(?:not\s+sure|unsure|don\x{2019}t\s+know|don\'t\s+know)\b/iu', $text ) ) return 'unsure';
    if ( preg_match( '/\b(?:no\s+(?:clients?|insurers?|regulators?|security\s+evidence|security\s+questionnaires?|questionnaires?)|(?:clients?|insurers?|regulators?)\s+(?:do\s+not|don\x{2019}t|don\'t|does\s+not|doesn\x{2019}t|doesn\'t)\s+(?:ask|require|need)|not\s+(?:asked|required)\s+for\s+security\s+evidence|none|nope)\b/iu', $text ) ) return 'no';
    if ( preg_match( '/\b(?:yes|yeah|yep|we\s+do|they\s+do|client|insurer|regulator|audit\s+evidence|security\s+evidence|questionnaire)\b/i', $text ) ) return 'yes';
    if ( preg_match( '/^\s*no\s*$/i', $text ) ) return 'no';
    return '';
}

function stapleit_cora_package_flow_result( $state ) {
    $state = stapleit_cora_package_flow_state( $state );
    if ( $state['team'] === '1' || $state['team'] === '4' ) {
        return array(
            'reply'       => 'The published per-person packages start at five staff, so Tailored support is the correct route. Pricing is confirmed around what you need.',
            'context'     => 'package_sole',
            'suggestions' => array( 'What does Tailored include?', 'Start again' ),
        );
    }
    if ( $state['team'] === '' ) return array();

    $tier = $state['security'];
    if ( $state['requirements'] === 'yes' && ( $tier === '' || $tier === 'basic' ) ) $tier = 'standard';
    if ( $tier === 'standard' || $tier === 'premium' ) {
        // Evidence cannot lower these tiers, so do not ask a redundant question.
    } elseif ( $tier === 'basic' && $state['requirements'] === '' ) {
        return array();
    } elseif ( $tier === '' ) {
        return array();
    }

    if ( $tier === 'basic' ) {
        $reply = 'Basic is the starting point. It starts from £35 per staff member, per month for teams of 5+ and covers day-to-day helpdesk support, monitoring, patching, device management and business-grade antivirus.';
    } elseif ( $tier === 'standard' ) {
        $reply = 'Standard is the starting point. It starts from £55 per staff member, per month for teams of 5+ and adds EDR, email security, MFA, Conditional Access, cloud backup, LastPass, Exclaimer and regular security reviews. Microsoft 365 Business Premium or equivalent licensing is required and sold separately unless specifically included.';
    } else {
        $reply = 'Premium is the starting point. It starts from £75 per staff member, per month for teams of 5+ and includes Microsoft 365 Business Premium plus enhanced Microsoft security and data protection.';
    }
    return array(
        'reply'       => $reply,
        'context'     => 'package_' . $tier,
        'suggestions' => array( 'What’s included?', 'How do the packages differ?', 'Start again' ),
    );
}

function stapleit_cora_package_flow_question( $state ) {
    $state = stapleit_cora_package_flow_state( $state );
    if ( $state['team'] === '' ) {
        return array(
            'field'       => 'team',
            'reply'       => 'How many people need IT support?',
            'suggestions' => array( 'Just me', '2–4 people', '5–19 people', '20+ people' ),
        );
    }
    if ( $state['security'] === '' ) {
        return array(
            'field'       => 'security',
            'reply'       => 'How much protection do you want included?',
            'suggestions' => array( 'Day-to-day support', 'Security + backup', 'Microsoft 365 Business Premium' ),
        );
    }
    return array(
        'field'       => 'requirements',
        'reply'       => 'Do clients, insurers or regulators ask for security evidence?',
        'suggestions' => array( 'Yes', 'No', 'Not sure' ),
    );
}

function stapleit_cora_package_flow_is_confusion( $prompt ) {
    $text = strtolower( trim( (string) $prompt ) );
    return (bool) preg_match( '/^(?:sorry[ ,.-]*)?(?:what|what do you mean|huh|eh|pardon|come again|explain(?: that)?|can you explain(?: that)?|i(?:\x{2019}m|\'m) confused|not sure what you mean|what are you asking)[?.! ]*$/iu', $text );
}

function stapleit_cora_package_flow_is_frustration( $prompt ) {
    $text = strtolower( trim( (string) $prompt ) );
    return (bool) preg_match( '/\b(?:you(?:\x{2019}re|\'re|\s+are)\s+broken|this\s+is\s+(?:odd|weird|broken)|that(?:\x{2019}s|\'s|\s+is)\s+(?:odd|weird|broken)|you\s+keep\s+repeating|stop\s+repeating|why\s+do\s+you\s+keep\s+(?:asking|repeating))\b/iu', $text );
}

function stapleit_cora_package_flow_explain_question( $state ) {
    $question = stapleit_cora_package_flow_question( $state );
    if ( $question['field'] === 'team' ) {
        return 'I’m asking roughly how many people would need ongoing IT support, because the published Basic, Standard and Premium packages start at five people. A rough number is fine.';
    }
    if ( $question['field'] === 'security' ) {
        return 'I mean the level of cover you want us to manage: mainly day-to-day IT support, stronger security and backup, or Microsoft 365 Business Premium included. I only use that answer to narrow the starting package.';
    }
    return 'I’m checking whether a client, insurer or regulator expects security evidence from you, because that can change a Basic recommendation to Standard.';
}

function stapleit_cora_package_flow_should_leave_for_general_chat( $prompt, $state ) {
    $text = strtolower( trim( (string) $prompt ) );
    if ( ! stapleit_cora_business_it_intent( $text ) ) return false;
    if ( preg_match( '/\b(?:how\s+much|price|pricing|cost|quote|licen[cs](?:e|es|ed|ing)|subscription)\b/i', $text ) && preg_match( '/\b(?:microsoft|m365|365|business\s+premium|azure|server|security|backup|voip|phone|network|firewall|domain|email)\b/i', $text ) ) return true;
    if ( preg_match( '/^(?:what|why|how|can|could|do|does|is|are|tell\s+me|explain)\b/i', $text ) ) return true;

    $before = stapleit_cora_package_flow_state( $state );
    $after  = $before;
    if ( $after['team'] === '' ) {
        $parsed = stapleit_cora_parse_package_team( $text );
        if ( $parsed !== '' ) $after['team'] = $parsed;
    }
    if ( $after['security'] === '' ) {
        $parsed = stapleit_cora_parse_package_security( $text );
        if ( $parsed !== '' ) $after['security'] = $parsed;
    }
    if ( $after['requirements'] === '' ) {
        $parsed = stapleit_cora_parse_package_requirements( $text );
        if ( $parsed !== '' ) $after['requirements'] = $parsed;
    }
    return $after === $before;
}

function stapleit_cora_package_flow_step( $prompt, $raw_state = array() ) {
    $state = stapleit_cora_package_flow_state( $raw_state );
    $text  = trim( (string) $prompt );

    if ( preg_match( '/\bstart\s+again\b/i', $text ) ) {
        $state = stapleit_cora_package_flow_state( array() );
    }

    if ( preg_match( '/\b(?:stop|cancel|exit|leave)\s+(?:the\s+)?package\s+(?:finder|flow)|\b(?:stop|cancel)\s+this\b|\bjust\s+chat\b/i', $text ) ) {
        return array(
            'reply'       => 'No problem — I’ve stopped the package finder. Ask me anything about your IT.',
            'suggestions' => stapleit_cora_follow_up_suggestions( '' ),
            'state'       => stapleit_cora_package_flow_state( array() ),
            'context'     => '',
            'complete'    => true,
        );
    }

    $question = stapleit_cora_package_flow_question( $state );

    if ( preg_match( '/^(?:hi|hello|hey|hiya|yo)[.! ]*(?:cora)?[.! ]*$/i', $text ) ) {
        return array(
            'reply'       => 'Hi. We can carry on finding a package, or you can ask me something else. ' . $question['reply'],
            'suggestions' => $question['suggestions'],
            'state'       => $state,
            'complete'    => false,
        );
    }

    if ( stapleit_cora_package_flow_is_confusion( $text ) ) {
        return array(
            'reply'       => stapleit_cora_package_flow_explain_question( $state ),
            'suggestions' => $question['suggestions'],
            'state'       => $state,
            'complete'    => false,
        );
    }

    if ( stapleit_cora_package_flow_is_frustration( $text ) ) {
        $stuck = (bool) preg_match( '/\b(?:broken|keep\s+repeating|stop\s+repeating|keep\s+asking)\b/i', strtolower( $text ) );
        return array(
            'reply'       => $stuck
                ? 'Fair point — I got stuck in the package finder. I can restart it, stop it, or carry on from the last useful answer.'
                : 'You’re right — that was too rigid. ' . stapleit_cora_package_flow_explain_question( $state ),
            'suggestions' => $stuck ? array( 'Start again', 'Stop package finder' ) : $question['suggestions'],
            'state'       => $state,
            'complete'    => false,
        );
    }

    if ( stapleit_cora_package_flow_should_leave_for_general_chat( $text, $state ) ) {
        return array(
            'exit_to_general' => true,
            'state'           => stapleit_cora_package_flow_state( array() ),
            'complete'        => true,
        );
    }

    if ( $state['team'] === '' ) {
        $parsed = stapleit_cora_parse_package_team( $text );
        if ( $parsed !== '' ) $state['team'] = $parsed;
    }
    if ( $state['security'] === '' ) {
        $parsed = stapleit_cora_parse_package_security( $text );
        if ( $parsed !== '' ) $state['security'] = $parsed;
    }
    if ( $state['requirements'] === '' ) {
        $parsed = stapleit_cora_parse_package_requirements( $text );
        if ( $parsed !== '' ) $state['requirements'] = $parsed;
    }

    $result = stapleit_cora_package_flow_result( $state );
    if ( $result ) return array_merge( $result, array( 'state' => $state, 'complete' => true ) );

    $question = stapleit_cora_package_flow_question( $state );
    return array(
        'reply'       => $question['reply'],
        'suggestions' => $question['suggestions'],
        'state'       => $state,
        'complete'    => false,
    );
}

function stapleit_cora_follow_up_suggestions( $prompt ) {
    $prompt = strtolower( (string) $prompt );
    if ( preg_match( '/\b(?:business\s+premium|microsoft\s*365\s+business\s+premium|m365\s+business\s+premium)\b/i', $prompt ) && preg_match( '/\b(?:licen[cs](?:e|es|ed|ing)|subscriptions?)\b/i', $prompt ) && preg_match( '/\b(?:price|pricing|cost|how\s+much)\b/i', $prompt ) ) {
        return array( 'What does Premium include?', 'Can you review our licences?' );
    }
    if ( preg_match( '/\b(?:chatgpt|copilot|claude|artificial\s+intelligence|ai\s+tools?|ai\s+adoption)\b/i', $prompt ) ) {
        return array( 'Which AI platform might fit?', 'How would you keep our data safe?', 'What would an AI readiness review cover?' );
    }
    if ( preg_match( '/(?:\bcyber\s+essentials\b|\bce\+)/i', $prompt ) ) {
        return array( 'What does the readiness review cover?', 'What evidence would we need?', 'What if we fail a check?' );
    }
    if ( preg_match( '/secur|phishing|cyber|ransomware|identity|password|dmarc|dkim|spf|defender|purview/', $prompt ) ) {
        return array( 'What protection is included?', 'Do we need a Security pack?', 'What should we review first?' );
    }
    if ( preg_match( '/\b(?:procurement|laptops?|desktops?|hardware|peripherals?)\b/i', $prompt ) ) {
        return array( 'Can you source the hardware?', 'Can you set it up too?', 'How is procurement priced?' );
    }
    if ( preg_match( '/\b(?:on[- ]?site|visit\s+our\s+office|engineer\s+on\s+site|hands[- ]on)\b/i', $prompt ) ) {
        return array( 'Where is on-site support available?', 'What work can be done on site?', 'How is on-site work priced?' );
    }
    if ( preg_match( '/\b(?:voip|telephony|phone\s+system|number\s+porting|softphones?|auto[- ]?attendant)\b/i', $prompt ) ) {
        return array( 'Can we keep our numbers?', 'What phone features can you manage?', 'How is VoIP priced?' );
    }
    if ( preg_match( '/\b(?:free\s+audit|it\s+audit|review\s+our\s+it)\b/i', $prompt ) ) {
        return array( 'What does the audit cover?', 'How do I request the audit?' );
    }
    if ( preg_match( '/microsoft|m365|365|teams|sharepoint|onedrive/', $prompt ) ) {
        return array( 'Which package includes Microsoft 365?', 'Can you review our licences?', 'How would onboarding work?' );
    }
    if ( preg_match( '/server|azure|wifi|wi-fi|network|firewall|vpn|qos/', $prompt ) ) {
        return array( 'Which add-on might fit?', 'What would you review first?', 'How does monitoring work?' );
    }
    if ( preg_match( '/strategy|roadmap|budget|supplier|merger|acquisition/', $prompt ) ) {
        return array( 'What would the roadmap cover?', 'Can you help plan our budget?', 'How often would we review it?' );
    }
    if ( preg_match( '/\b(?:basic|standard|premium|package)\b/', $prompt ) ) {
        return array( 'What’s included?', 'How do the packages differ?', 'What happens during onboarding?' );
    }
    return array();
}
