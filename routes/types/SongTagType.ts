import { SongTagEntity } from "../../schema/songTagTypes-schema"

export type SongTagType = {
    tagName: string;
    tagDescription: string;
}

export const toSongTag = (
    songTagEntity: SongTagEntity,
): SongTagType => ({
    tagName: songTagEntity.tagName,
    tagDescription: songTagEntity.tagDescription,
});