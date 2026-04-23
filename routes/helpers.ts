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