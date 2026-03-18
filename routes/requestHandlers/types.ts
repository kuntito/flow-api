import { SongEntity } from "../../schema/song-schema";

export type SongWithUrl = {
    id: number;
    title: string;
    artistStr: string;
    durationMillis: number;
    albumArtUrl: string;
    songUrl: string;
};

export const toSongWithUrl = (
    songEntity: SongEntity,
    songUrl: string,
): SongWithUrl => ({
    id: songEntity.songId,
    title: songEntity.songTitle,
    artistStr: songEntity.songArtistName,
    durationMillis: songEntity.songDurationMillis,
    albumArtUrl: songEntity.songAlbumArtUrl,
    songUrl: songUrl,
});