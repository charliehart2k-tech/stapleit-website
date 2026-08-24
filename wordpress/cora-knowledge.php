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
    return '2026-08-24.1';
}

function stapleit_cora_knowledge_records() {
    return array(
        'identity' => array(
            'keywords' => array( 'staple it', 'where', 'epsom', 'surrey', 'hours', 'open', 'contact', 'phone', 'email', 'business', 'businesses', 'charity', 'charities', 'individual', 'individuals' ),
            'content'  => 'Staple IT is an Epsom, Surrey IT provider for businesses, charities and individuals. Public staffed support hours are Monday to Friday, 9am to 5pm. 24/7 references on the website describe monitoring, not a 24/7 staffed helpdesk. The public telephone number is 01372 309 707, the public email address is hello@stapleit.co.uk, and the contact form is the correct place for an enquiry.',
        ),
        'packages' => array(
            'keywords' => array( 'package', 'price', 'cost', 'support', 'staff', 'team', 'basic', 'standard', 'premium', 'sole trader' ),
            'content'  => 'Sole trader support is tailored and price on application. Basic starts from £35 per staff member, per month for teams of five or more and covers day-to-day helpdesk support plus monitoring, patching, device management and business-grade antivirus. Standard starts from £55 per staff member, per month for teams of five or more and includes everything in Basic plus Endpoint Detection and Response, advanced threat detection and response, email security, Multi-Factor Authentication, Conditional Access, privileged account protection, LastPass, Microsoft 365 or Google Workspace backup, Exclaimer and regular security reviews; Microsoft 365 Business Premium or equivalent licensing is required and is sold separately unless specifically included. Premium starts from £75 per staff member, per month for teams of five or more and includes everything in Standard plus Microsoft 365 Business Premium, DNS and web protection, enhanced Microsoft 365 security, Defender for Business and Defender for Office 365 management, stronger access controls and Microsoft Purview configuration where required. Microsoft Defender Suite and Microsoft Purview Suite features are managed and supported where required, but any additional Microsoft licensing required to enable those advanced features is charged separately. A written proposal confirms final scope, eligibility and price.',
        ),
        'onboarding' => array(
            'keywords' => array( 'move', 'switch', 'provider', 'onboard', 'onboarding', 'changeover', 'start', 'audit', 'review' ),
            'content'  => 'The support journey is: an initial no-obligation conversation, a review of the current setup, then managed onboarding. Staple IT can work directly with an existing IT provider and other suppliers to make the changeover smoother. A free IT audit confirms what is genuinely needed.',
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
            'content'  => 'The Server pack is for businesses running physical Windows Servers. It covers ongoing support, 24/7 server health monitoring, patching and security updates, backup oversight and recovery assistance, and core Windows Server services such as Active Directory, Group Policy, DNS, DHCP, file shares, permissions and supported print services.',
        ),
        'pack_azure' => array(
            'keywords' => array( 'azure', 'virtual machine', 'virtual machines', 'vnet', 'cloud infrastructure', 'azure vm' ),
            'content'  => 'The Azure pack is for businesses running systems or virtual machines in Microsoft Azure. Azure resources benefit from dedicated monitoring, maintenance, access control and cost reviews. Using Microsoft 365 by itself does not necessarily mean a business uses Azure.',
        ),
        'pack_network' => array(
            'keywords' => array( 'network', 'wifi', 'wi-fi', 'firewall', 'switch', 'switches', 'access point', 'access points', 'router' ),
            'content'  => 'The Network pack is for managed network infrastructure such as firewalls, switches and Wi-Fi access points. It adds active monitoring, configuration and ongoing management for that network equipment.',
        ),
        'pack_security' => array(
            'keywords' => array( 'security pack', 'stronger security', 'phishing', 'web protection', 'email protection', 'identity protection' ),
            'content'  => 'The Security pack adds stronger protection and monitoring across devices, accounts, email and web use. It is an optional pack and is price on application; a review confirms whether the existing support package already provides enough protection.',
        ),
        'pack_governance' => array(
            'keywords' => array( 'governance', 'compliance', 'policy', 'policies', 'documentation', 'insurer', 'customer questionnaire', 'evidence' ),
            'content'  => 'The Governance and compliance pack helps with IT policies, documentation, evidence and responses to customer or insurer checks. Formal legal, regulatory or certification advice is not included unless specifically agreed.',
        ),
        'pack_cyber_essentials' => array(
            'keywords' => array( 'cyber essentials', 'cyber essentials plus', 'ce+', 'certification', 'certify' ),
            'content'  => 'The Cyber Essentials pack supports readiness, remediation and application preparation for Cyber Essentials or Cyber Essentials Plus. Staple IT can help prepare and remediate, but Cora cannot certify compliance or guarantee a certification result.',
        ),
        'pack_ai' => array(
            'keywords' => array( 'ai pack', 'artificial intelligence', 'copilot', 'chatgpt', 'claude', 'ai platform', 'ai adoption' ),
            'content'  => 'The AI pack is for businesses introducing AI tools safely and practically. It covers readiness, platform choice, secure setup, staff guidance and ongoing administration, including guidance around Microsoft Copilot, ChatGPT Business or Enterprise and Claude Team or Enterprise where suitable.',
        ),
        'pack_strategy' => array(
            'keywords' => array( 'strategy', 'roadmap', 'budget', 'budgeting', 'supplier', 'technology roadmap', 'planning' ),
            'content'  => 'The Strategy pack adds regular IT reviews, budgeting, supplier support and a practical technology roadmap so improvements and growth can be planned rather than handled only when something breaks.',
        ),
        'pack_disaster_recovery' => array(
            'keywords' => array( 'disaster recovery', 'business continuity', 'recovery plan', 'restore', 'rto', 'rpo' ),
            'content'  => 'The Disaster recovery pack creates and tests a structured recovery plan for critical systems and data. Final recovery objectives, scope and testing arrangements are agreed after a review rather than guaranteed by Cora.',
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
    return (bool) preg_match( '/\b(?:it|computer|pc|laptop|device|hardware|software|app|application|system|server|cloud|azure|microsoft|m365|office\s*365|google\s+workspace|security|secure|cyber|phishing|ransomware|network|wi-?fi|firewall|switch|router|internet|vpn|backup|restore|email|outlook|printer|password|identity|mfa|conditional\s+access|sharepoint|onedrive|teams|copilot|chatgpt|ai|voip|phone\s+system|telephony|domain|dns|licen[cs](?:e|es|ed|ing)|subscriptions?|seats?|mailboxes?|tenant|helpdesk|support|remote\s+work|remote\s+staff|data|access|user|users)\b/i', $text );
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
    if ( stapleit_cora_parse_package_team( $text ) !== '' && preg_match( '/\b(?:it\s+support|helpdesk|day-to-day|printer|outlook|better\s+security|stronger\s+security|security\s+evidence|edr|endpoint\s+detection|mfa|conditional\s+access|email\s+security|cloud\s+backup)\b|\b(?:want|need|include|included).{0,24}\bbusiness\s+premium\b/i', $text ) ) return true;
    return false;
}

function stapleit_cora_valid_context_key( $context ) {
    $context = strtolower( (string) $context );
    $context = preg_replace( '/[^a-z0-9_]/', '', $context );
    $allowed = array(
        'package_sole', 'package_basic', 'package_standard', 'package_premium',
        'pack_server', 'pack_azure', 'pack_network', 'pack_security',
        'pack_governance', 'pack_cyber_essentials', 'pack_ai', 'pack_strategy',
        'pack_disaster_recovery', 'onboarding',
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
        'onboarding'              => 'managed onboarding',
    );
    $context = stapleit_cora_valid_context_key( $context );
    return $context !== '' ? $labels[ $context ] : '';
}

function stapleit_cora_context_from_prompt( $prompt ) {
    $text = strtolower( trim( (string) $prompt ) );
    if ( preg_match( '/\b(?:business\s+premium|microsoft\s*365\s+business\s+premium)\b/i', $text ) && preg_match( '/\b(?:licen[cs](?:e|es|ed|ing)|subscriptions?)\b/i', $text ) && preg_match( '/\b(?:price|pricing|cost|how\s+much)\b/i', $text ) ) return '';
    if ( preg_match( '/\b(?:cheapest|least\s+expensive|lowest[-\s]+cost|most\s+affordable)\b/i', $text ) ) return 'package_basic';
    if ( preg_match( '/\bsole[-\s]?trader\b/i', $text ) ) return 'package_sole';
    if ( preg_match( '/\bbasic\b/i', $text ) ) return 'package_basic';
    if ( preg_match( '/\bstandard\b/i', $text ) ) return 'package_standard';
    if ( preg_match( '/\bpremium\b/i', $text ) ) return 'package_premium';
    if ( preg_match( '/\b(?:cyber\s+essentials|ce\+)\b/i', $text ) ) return 'pack_cyber_essentials';
    if ( preg_match( '/\b(?:server\s+pack|physical\s+server|windows\s+server|active\s+directory|group\s+policy|file\s+server)\b/i', $text ) ) return 'pack_server';
    if ( preg_match( '/\b(?:azure|virtual\s+machine|vnet)\b/i', $text ) ) return 'pack_azure';
    if ( preg_match( '/\b(?:network\s+pack|wi-?fi|firewall|access\s+point|network\s+switch|networking)\b/i', $text ) ) return 'pack_network';
    if ( preg_match( '/\bsecurity\s+pack\b/i', $text ) ) return 'pack_security';
    if ( preg_match( '/\b(?:governance|compliance|it\s+polic(?:y|ies)|documentation|evidence)\b/i', $text ) ) return 'pack_governance';
    if ( preg_match( '/\b(?:ai\s+pack|chatgpt|copilot|claude|artificial\s+intelligence|ai\s+tools|ai\s+adoption)\b/i', $text ) ) return 'pack_ai';
    if ( preg_match( '/\b(?:strategy|roadmap|budgeting|technology\s+roadmap)\b/i', $text ) ) return 'pack_strategy';
    if ( preg_match( '/\b(?:disaster\s+recovery|business\s+continuity|recovery\s+plan)\b/i', $text ) ) return 'pack_disaster_recovery';
    if ( preg_match( '/\b(?:switch(?:ing)?|chang(?:e|ing)|mov(?:e|ing))\b/i', $text ) && preg_match( '/\b(?:it\s+providers?|support\s+providers?|msps?|providers?)\b/i', $text ) ) return 'onboarding';
    if ( preg_match( '/\b(?:microsoft\s*365|m365|entra|office\s*365)\b/i', $text ) && preg_match( '/\b(?:secur|protection|protect|phishing|identity|mfa|conditional\s+access|defender)\w*/i', $text ) ) return 'package_standard';
    if ( preg_match( '/\b(?:printer|printing|outlook)\b/i', $text ) && preg_match( '/\b(?:issues?|problems?|help|support|not working|keeps?|breaking|broken|errors?)\b/i', $text ) ) return 'package_basic';
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
    if ( strlen( $text ) > 180 ) return false;
    return (bool) preg_match( '/\b(?:that|it|this|those|them|included|include|includes|cover|covers|come\s+with|what\s+do\s+i\s+get|tell\s+me\s+more|more\s+detail|how\s+much\s+is\s+that|what\s+about)\b/i', $text );
}

function stapleit_cora_context_for_turn( $prompt, $incoming_context = '', $history = array() ) {
    $explicit = stapleit_cora_context_from_prompt( $prompt );
    if ( $explicit !== '' ) return $explicit;
    if ( ! stapleit_cora_is_contextual_follow_up( $prompt ) ) return '';
    $incoming_context = stapleit_cora_valid_context_key( $incoming_context );
    if ( $incoming_context !== '' ) return $incoming_context;
    return stapleit_cora_context_from_history( $history );
}

function stapleit_cora_fast_reply( $prompt, $context = '' ) {
    $text    = strtolower( trim( (string) $prompt ) );
    $context = stapleit_cora_valid_context_key( $context );

    if ( preg_match( '/\b(?:business\s+premium|microsoft\s*365\s+business\s+premium)\b/i', $text ) && preg_match( '/\b(?:licen[cs](?:e|es|ed|ing)|subscriptions?)\b/i', $text ) && preg_match( '/\b(?:price|pricing|cost|how\s+much)\b/i', $text ) ) {
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

    if ( preg_match( '/\b(?:cyber\s+essentials|ce\+)\b/i', $text ) ) {
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

    if ( preg_match( '/\bgoogle\s+workspace\b/i', $text ) ) {
        return 'Yes. Staple IT supports Google Workspace as well as Microsoft 365. The exact licensing and backup position depends on the support package and your current setup, so I will not invent a licence cost.';
    }

    if ( preg_match( '/\b(?:business\s+premium|microsoft\s*365\s+business\s+premium)\b/i', $text ) ) {
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

    if ( preg_match( '/\b(?:chatgpt|copilot|claude|artificial\s+intelligence|ai\s+tools|ai\s+adoption)\b/i', $text ) ) {
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

    if ( preg_match( '/\b(?:hours|opening|open|when\s+are\s+you|when\s+can\s+i\s+call)\b/i', $text ) ) {
        return 'Staffed support is Monday to Friday, 9am–5pm. Device and service monitoring runs 24/7; staffed support does not.';
    }

    if ( preg_match( '/\b(?:contact|phone\s+number|telephone\s+number|email\s+address|email\s+you|call\s+you|get\s+in\s+touch)\b|\bwhat(?:\x{2019}s|\'s|\s+is)\s+your\s+email\b/iu', $text ) ) {
        return 'You can call Staple IT on 01372 309 707 or email hello@stapleit.co.uk.';
    }

    if ( preg_match( '/\b(?:azure|virtual\s+machine|vnet|azure\s+vm)\b/i', $text ) ) {
        return 'The Azure pack covers Microsoft Azure administration, virtual machines, monitoring, maintenance, access control, backup and recovery support, and cost reviews. It is price on application because the scope depends on the Azure resources you actually run.';
    }

    if ( preg_match( '/\b(?:governance|it\s+polic(?:y|ies)|documentation|insurer|customer\s+questionnaire|compliance\s+evidence)\b/i', $text ) ) {
        return 'The Governance & compliance pack covers IT policies, documentation, evidence and help responding to customer or insurer checks. It is price on application; formal legal, regulatory or certification advice is not included unless specifically agreed.';
    }

    if ( preg_match( '/\b(?:strategy|technology\s+roadmap|it\s+roadmap|budgeting|it\s+budget|supplier\s+planning)\b/i', $text ) ) {
        return 'The Strategy pack adds regular IT reviews, budgeting, supplier support and a practical technology roadmap. It is price on application and is intended to make improvements and growth planned rather than purely reactive.';
    }

    if ( preg_match( '/\b(?:disaster\s+recovery|business\s+continuity|recovery\s+plan|rto|rpo)\b/i', $text ) ) {
        return 'The Disaster recovery pack creates and tests a structured recovery plan for critical systems and data. Scope, recovery objectives and testing arrangements are agreed after a review and cannot be set in chat.';
    }

    if ( preg_match( '/\b(?:voip|phone\s+system|telephone\s+system|telephony)\b/i', $text ) ) {
        return 'Yes — VoIP is one of Staple IT’s available services. It is price on application, so the exact solution and project scope are confirmed after reviewing what you use and what needs replacing.';
    }

    if ( preg_match( '/\b(?:which|what)\s+packages?\b/i', $text ) && preg_match( '/\bmicrosoft\s*365\b/i', $text ) && preg_match( '/\b(?:include|included|licen[cs]e)\b/i', $text ) ) {
        return 'Microsoft 365 Business Premium is included with Premium. Standard requires Business Premium or equivalent licensing, sold separately unless specifically included. Basic supports Microsoft 365, but the software licence itself is sold separately.';
    }

    if ( preg_match( '/\b(?:microsoft\s*365|m365|office\s*365|sharepoint|onedrive|teams|entra)\b/i', $text ) ) {
        return 'Staple IT supports Microsoft 365 administration, identity protection and security. If you tell me what you are trying to change or fix, I can explain the relevant support or licensing position without guessing at licence costs.';
    }

    if ( preg_match( '/\b(?:line[- ]of[- ]business|bespoke|custom|proprietary)\b/i', $text ) && preg_match( '/\b(?:app|application|software|system)\b/i', $text ) ) {
        return 'That sounds specific to your environment. Staple IT supports everyday business software where it is properly licensed and supported, but an engineer would need to confirm that particular application and any vendor dependencies before I claim it is covered.';
    }

    if ( preg_match( '/\b(?:weather|football|recipe|movie|film\s+times|horoscope)\b/i', $text ) ) {
        return 'I can only help with Staple IT and business IT questions.';
    }

    if ( preg_match( '/\b(?:how\s+do\s+the\s+packages\s+differ|difference\s+between\s+(?:basic|standard|premium)|compare\s+(?:the\s+)?packages|basic\s+vs\s+standard|standard\s+vs\s+premium)\b/i', $text ) ) {
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

    if ( preg_match( '/\b(?:24\s*(?:\/|x)\s*7|twenty[- ]four\s+seven|round[- ]the[- ]clock)\b/i', $text ) && preg_match( '/\b(?:support|helpdesk|monitor|monitoring|engineer|service)\b/i', $text ) ) {
        return 'Monitoring runs 24/7. The staffed helpdesk is Monday to Friday, 9am–5pm, so 24/7 monitoring should not be read as a 24/7 staffed support desk.';
    }

    if ( preg_match( '/\b(?:edr|endpoint\s+detection|conditional\s+access|mfa|multi[- ]factor|privileged\s+account|email\s+security|anti[- ]phishing)\b/i', $text ) ) {
        return 'Those managed security controls sit in Standard and above for teams of 5+. Standard includes EDR, email security, MFA, Conditional Access and privileged-account protection. Microsoft 365 Business Premium or equivalent licensing is required and sold separately unless specifically included; smaller teams use Tailored support.';
    }

    if ( preg_match( '/\b(?:mdm|mobile\s+device\s+management|device\s+management|remote\s+wipe|device\s+compliance)\b/i', $text ) ) {
        return 'Managed support includes device management, and Standard adds stronger mobile-device controls such as compliance policies, remote wipe and work-application management. The exact policy scope depends on the devices and licensing in use.';
    }

    if ( preg_match( '/\b(?:lastpass|exclaimer|email\s+signature)\b/i', $text ) ) {
        return 'Standard includes LastPass password management and Exclaimer email-signature management, and Premium includes everything in Standard. The published per-person packages apply to teams of 5+.';
    }

    if ( preg_match( '/\b(?:include|included|comes\s+with|licen[cs]e)\b/i', $text ) && preg_match( '/\bmicrosoft\s*365\b/i', $text ) ) {
        return 'Microsoft 365 Business Premium is included with Premium. Standard requires Business Premium or equivalent licensing, sold separately unless specifically included. Basic supports Microsoft 365, but the software licence itself is sold separately.';
    }

    if ( preg_match( '/\b(?:password\s+resets?|reset\s+(?:a\s+)?passwords?|forgot(?:ten)?\s+(?:my|a)\s+password)\b/i', $text ) ) {
        return 'Password resets are part of normal day-to-day helpdesk support. For teams of 5+, that sits within Basic and above; smaller teams use Tailored support.';
    }

    if ( preg_match( '/\b(?:new\s+starter|new\s+user|leaver|offboard|onboard\s+(?:a\s+)?user|joiner)\b/i', $text ) ) {
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
    if ( preg_match( '/\b(?:basic|day-to-day\s+support|day\s+to\s+day\s+support|just\s+support|everyday\s+support|printer|printing|outlook|password\s+reset|general\s+it\s+help)\b/i', $text ) ) return 'basic';
    return '';
}

function stapleit_cora_parse_package_requirements( $prompt ) {
    $text = strtolower( trim( (string) $prompt ) );
    if ( preg_match( '/\b(?:not\s+sure|unsure|don\x{2019}t\s+know|don\'t\s+know)\b/iu', $text ) ) return 'unsure';
    if ( preg_match( '/\b(?:no\s+(?:clients?|insurers?|regulators?|security\s+evidence|questionnaires?)|(?:clients?|insurers?|regulators?)\s+(?:do\s+not|don\x{2019}t|don\'t|does\s+not|doesn\x{2019}t|doesn\'t)\s+(?:ask|require|need)|not\s+(?:asked|required)\s+for\s+security\s+evidence|none|nope)\b/iu', $text ) ) return 'no';
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
    if ( preg_match( '/\b(?:business\s+premium|microsoft\s*365\s+business\s+premium)\b/i', $prompt ) && preg_match( '/\b(?:licen[cs](?:e|es|ed|ing)|subscriptions?)\b/i', $prompt ) && preg_match( '/\b(?:price|pricing|cost|how\s+much)\b/i', $prompt ) ) {
        return array( 'What does Premium include?', 'Can you review our licences?' );
    }
    if ( preg_match( '/secur|phishing|cyber|ransomware|identity|password/', $prompt ) ) {
        return array( 'What protection is included?', 'Do we need a Security pack?', 'What should we review first?' );
    }
    if ( preg_match( '/microsoft|m365|365|teams|sharepoint|onedrive|copilot/', $prompt ) ) {
        return array( 'Which package includes Microsoft 365?', 'Can you review our licences?', 'How would onboarding work?' );
    }
    if ( preg_match( '/server|azure|wifi|wi-fi|network|firewall/', $prompt ) ) {
        return array( 'Which add-on might fit?', 'What would you review first?', 'How does monitoring work?' );
    }
    if ( preg_match( '/ai|copilot|chatgpt|claude/', $prompt ) ) {
        return array( 'Which AI platform might fit?', 'How would you keep our data safe?', 'What would an AI readiness review cover?' );
    }
    if ( preg_match( '/strategy|roadmap|budget|supplier/', $prompt ) ) {
        return array( 'What would the roadmap cover?', 'Can you help plan our budget?', 'How often would we review it?' );
    }
    if ( preg_match( '/\b(?:basic|standard|premium|package)\b/', $prompt ) ) {
        return array( 'What’s included?', 'How do the packages differ?', 'What happens during onboarding?' );
    }
    return array();
}
