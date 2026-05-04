import { SongTagEntity } from "../../schema/songTagTypes-schema"

export type SongTagType = {
    tagId: number;
    tagName: string;
    tagDescription: string;
}

export const toSongTag = (
    songTagEntity: SongTagEntity,
): SongTagType => ({
    tagId: songTagEntity.tagId,
    tagName: songTagEntity.tagName,
    tagDescription: songTagEntity.tagDescription,
});