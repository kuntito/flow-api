import { RequestHandler } from "express";
import { validateSearchQuery } from "../../../../helpers/miscHelpers";
import { searchDbSongWithTags } from "./searchSongWithTagsHelpers";

export type SongTag = {
    tagId: number;
    tagName: string;
    tagDescription: string;
}

export type SongWithTagsItem = {
    id: number;
    title: string;
    artistStr: string;
    songTags: SongTag[];
}

type SongWithTagsSearchResponse = {
    success: true;
    itemCount: number;
    searchResults: SongWithTagsItem[];
} | {
    success: false;
    debug: object;
}

const searchSongWithTagReqHandler: RequestHandler<
    {},
    SongWithTagsSearchResponse,
    {},
    { q: string }
> = async (req, res) => {
    const rawQuery = req.query.q;

        const validateRes = validateSearchQuery(rawQuery);
    
        if (!validateRes.success) {
            return res
                .status(400)
                .json({
                    success: false,
                    debug: {
                        message: validateRes.reason
                    }
                });
        }
    
        const searchQuery = validateRes.validatedQuery;

        const songSearchResults = await searchDbSongWithTags(searchQuery);
        if (songSearchResults == null) {
            return res
                .status(500)
                .json({
                    success: false,
                    debug: {
                        errorMessage: "db search for song with tags failed"
                    }
                })
        }

        return res
            .status(200)
            .json({
                success: true,
                itemCount: songSearchResults.length,
                searchResults: songSearchResults,
            });
}

export { searchSongWithTagReqHandler };
