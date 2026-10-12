<?php

namespace App\Support;

/**
 * Renders Berita Acara paragraph fields for the DomPDF blade view.
 *
 * The WYSIWYG editor stores formatting HTML (p/b/i/u/lists/headings);
 * rows written before the editor existed hold legacy plain text. Both
 * shapes are normalized here so old and new records print correctly:
 * plain text is escaped with its line breaks kept, HTML is reduced to
 * the tag set DomPDF handles reliably with every attribute stripped
 * (except a safe text-align style) so hostile markup can't break the
 * document or leak into it.
 */
class BeritaAcaraHtml
{
    /** @var array<string, true> */
    private const ALLOWED_TAGS = [
        'p' => true,
        'br' => true,
        'strong' => true,
        'b' => true,
        'em' => true,
        'i' => true,
        'u' => true,
        's' => true,
        'strike' => true,
        'ol' => true,
        'ul' => true,
        'li' => true,
        'h3' => true,
        'h4' => true,
        'blockquote' => true,
    ];

    /** @var array<string, true> */
    private const DROP_ENTIRELY = [
        'script' => true,
        'style' => true,
    ];

    public static function render(?string $value): string
    {
        if ($value === null || trim($value) === '') {
            return '-';
        }

        // Legacy plain-text rows (pre-WYSIWYG): escape + keep line breaks.
        if (! preg_match('/<[a-z][^>]*>/i', $value)) {
            return nl2br(e($value));
        }

        return self::sanitize($value);
    }

    private static function sanitize(string $html): string
    {
        $dom = new \DOMDocument('1.0', 'UTF-8');
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="utf-8" ?>'.$html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();

        foreach (iterator_to_array($dom->getElementsByTagName('*')) as $el) {
            $tag = strtolower($el->tagName);

            if (isset(self::DROP_ENTIRELY[$tag])) {
                $el->parentNode?->removeChild($el);

                continue;
            }

            if (! isset(self::ALLOWED_TAGS[$tag])) {
                // Unwrap: keep the text, drop the tag.
                $parent = $el->parentNode;
                if ($parent === null) {
                    continue;
                }
                while ($el->firstChild !== null) {
                    $parent->insertBefore($el->firstChild, $el);
                }
                $parent->removeChild($el);

                continue;
            }

            foreach (iterator_to_array($el->attributes) as $attr) {
                if (strtolower($attr->name) === 'style'
                    && preg_match('/^\s*text-align\s*:\s*(left|center|right|justify)\s*;?\s*$/i', $attr->value, $m) === 1
                ) {
                    $el->setAttribute('style', 'text-align: '.strtolower($m[1]).';');

                    continue;
                }

                $el->removeAttribute($attr->name);
            }
        }

        $out = $dom->saveHTML();

        if (! is_string($out) || trim($out) === '') {
            return '-';
        }

        // Drop the encoding processing instruction libxml echoes back
        // from the loadHTML prefix above — it must not reach the PDF.
        $out = trim((string) preg_replace('/<!--\?xml[^>]*-->/', '', $out));

        return $out === '' ? '-' : $out;
    }
}
