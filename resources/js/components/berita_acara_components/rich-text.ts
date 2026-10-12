/**
 * True when an HTML string from RichTextEditor carries no readable text —
 * an untouched TipTap document serializes to `<p></p>`, which is truthy
 * as a string but means "empty" to the user. Used by step-2 validation
 * so a required paragraph can't be satisfied by an empty editor.
 */
export function isRichTextEmpty(value: string | null | undefined): boolean {
    if (!value || !value.trim()) {
        return true;
    }

    const text = value
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return text.length === 0;
}
