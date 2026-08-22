<?php
/**
 * Deterministic output gates for Cora's local language model.
 *
 * Keep this file independent of WordPress functions so the rules can be
 * exercised directly in CI. The model may suggest wording, but it never gets
 * authority to publish new prices or claim actions the website cannot take.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function stapleit_cora_prompt_guard_response( $prompt ) {
    $prompt = trim( (string) $prompt );

    $sensitive_patterns = array(
        '/\b(?:password|passcode|api[_ -]?key|secret|security\s+code|verification\s+code|otp|one[- ]time\s+code)\s*(?:is|:|=)\s*\S+/iu',
        '/-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/iu',
        '/\b(?:cvv|cvc)\s*(?:is|:|=)?\s*\d{3,4}\b/iu',
        '/\b(?:\d[ -]*?){13,19}\b/u',
    );
    foreach ( $sensitive_patterns as $pattern ) {
        if ( preg_match( $pattern, $prompt ) ) {
            return 'Please do not share passwords, security codes, payment details or other secrets here. If you think an account or device is compromised, call Staple IT on 01372 309 707.';
        }
    }

    if ( preg_match( '/(?:ignore|override|disregard|forget).{0,45}(?:instruction|prompt|rule)|(?:show|reveal|repeat|print).{0,35}(?:system\s+prompt|hidden\s+instruction|developer\s+message)/iu', $prompt ) ) {
        return 'I can help with Staple IT services and practical next steps, but I cannot change or reveal my operating instructions. Tell me what you need help with in your IT environment instead.';
    }

    if ( preg_match( '/\b(?:we are|we\x{2019}re|we\'re|currently|right now).{0,45}(?:ransomware|breach|hacked|compromised|cyber\s+attack)|(?:ransomware|breach|hacked|compromised).{0,35}(?:now|today|active|happening)/iu', $prompt ) ) {
        return 'This may be an active security incident. Please call Staple IT now on 01372 309 707. Do not share passwords, security codes or sensitive data in this chat, and avoid making unverified changes while you wait for an engineer.';
    }

    return '';
}

function stapleit_cora_reply_is_safe( $reply ) {
    $reply = trim( (string) $reply );
    if ( $reply === '' || strlen( $reply ) > 2000 ) {
        return false;
    }

    /* The only public package prices. Every accepted price must retain its
     * per-person and per-month basis; a bare "£55 per month" is misleading. */
    $without_approved_prices = preg_replace(
        '/£\s*(?:35|55|75)\s+per\s+staff\s+member\s*,?\s+per\s+month\b/iu',
        '',
        $reply
    );
    if ( ! is_string( $without_approved_prices ) ) {
        return false;
    }

    if ( preg_match(
        '/£\s*\d|(?:\bGBP\b|\bpounds?\b)\s*\d|\b\d+(?:[.,]\d{1,2})?\s*(?:GBP|pounds?|per\s+(?:staff\s+member|user)|a\s+month|monthly)\b/iu',
        $without_approved_prices
    ) ) {
        return false;
    }

    $blocked_claims = array(
        '/\b(?:provide|send|share|enter)\s+(?:me\s+|us\s+)?(?:your\s+)?(?:contact|personal)\s+details\b/iu',
        '/\b(?:provide|send|share|enter)\s+(?:me\s+|us\s+)?(?:your\s+)?(?:email\s+address|phone\s+number)\b/iu',
        '/\b(?:I|Cora)\s+(?:can|will|shall)\s+(?:process|submit|book|schedule|arrange|open|raise)\b/iu',
        '/\b(?:process|submit)\s+(?:your|the)\s+(?:request|order|application|booking)\b/iu',
        '/\b(?:extra|additional|add-on|licen[cs]e)\b[^.!?\n]{0,60}\b(?:pounds?|monthly|per\s+month)\b/iu',
        '/\bguarantee(?:d|s)?\b/iu',
        '/\b(?:Basic|Standard)\b[^.!?\n]{0,80}\b(?:includes?|comes\s+with)\b[^.!?\n]{0,80}\bMicrosoft\s+365\s+Business\s+Premium\b/iu',
        '/\bMicrosoft\s+365\s+Business\s+Premium\b[^.!?\n]{0,80}\b(?:is\s+included\s+in|comes\s+with)\b[^.!?\n]{0,40}\b(?:Basic|Standard)\b/iu',
        '/\b(?:Gold|Silver|Bronze|Enterprise|Professional|Pro|Essential|Ultimate)\s+(?:support\s+)?package\b/iu',
        '/\b(?:I|Cora|we)\s+(?:have|has|can)\s+(?:checked|inspected|scanned|accessed|connected\s+to)\b/iu',
        '/\b(?:certif(?:y|ies|ied)|ensure|assure)\b[^.!?\n]{0,70}\b(?:compliance|compliant|secure|security)\b/iu',
        '/https?:\/\/|www\./iu',
    );
    foreach ( $blocked_claims as $pattern ) {
        if ( preg_match( $pattern, $reply ) ) {
            return false;
        }
    }

    $without_public_phone = preg_replace( '/(?:\+44\s*\(?0?\)?\s*1372|0\s*1372)\s*309\s*707\b/u', '', $reply );
    if ( ! is_string( $without_public_phone ) || preg_match( '/(?:\+44\s*\d|\b0\d{2,4}[\s-]*\d{3,4}[\s-]*\d{3,4}\b)/u', $without_public_phone ) ) {
        return false;
    }

    return true;
}
