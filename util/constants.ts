import ms from "ms";

export const albumArtPlaceholderUrl = String.raw`https://sounds-xyz.s3.eu-north-1.amazonaws.com/albumArt/artworkUnknown.png`;

export const s3AlbumArtPrefix = "albumArt/";
export const s3SongPrefix = "tracks/";

/** how long a mood lasts. */
export const MOOD_DURATION_MS = ms("45m");