/**
 * `songId` is extracted from the URL as a string.
 *
 * fn determines if the characters in `songId` represent a non-negative integer.
 */
export const isSongIdValid = (songId: string | undefined): boolean => {
    if (!songId) return false;

    for (const ch of songId) {
        if (ch < "0" || ch > "9") return false;
    }

    return true;
};


/**
 * checks a value is a whole number above zero, the shape of an id.
 *
 * anything else returns false.
 */
export const isValidId = (value: unknown): value is number =>
    Number.isInteger(value) && (value as number) > 0;


/**
 * removes extra spaces from a string.
 *
 * trims spaces from both ends, and reduces any run of
 * consecutive spaces in the middle to a single space.
 *
 * e.g. "  moo   farms " becomes "moo farms".
 */
export const removeExtraSpaces = (
    text: string
): string => {
    return text
        .trim()
        .replace(
            /\s{2,}/g,
            " "
        );
}