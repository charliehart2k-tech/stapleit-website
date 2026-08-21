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
    );
    foreach ( $blocked_claims as $pattern ) {
        if ( preg_match( $pattern, $reply ) ) {
            return false;
        }
    }

    return true;
}
