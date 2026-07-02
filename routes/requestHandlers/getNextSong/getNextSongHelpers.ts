import { asc, eq, notInArray, inArray, and, SQL } from "drizzle-orm";
import { flowDb } from "../../../clients/neonDbClient";
import { logDbError } from "../../../helpers/dbHelpers";
import { getTotalSongCount } from "../../../helpers/songDbHelpers";
import { SongEntity, songsTable } from "../../../schema/song-schema";
import { songTagMatchTable } from "../../../schema/songTagMatch-schema";


// TODO if i ever delete this tag, 
// or modify it to mean something else,
// all hell could break loose
const RAP_TAG_ID = 4;

export const getNextSong = async (
    tagId?: number,
    obeyWindown: boolean = true,
): Promise<SongEntity | null> => {
    const excludeRap = checkWinddownTime() && obeyWindown;

    try {
        const filterConditions: SQL[] = [];

        if (tagId != null) {
            const idsSongsWithTag = flowDb
                .select({
                    songId: songTagMatchTable.songId,
                })
                .from(songTagMatchTable)
                .where(
                    and(
                        eq(
                            songTagMatchTable.tagId,
                            tagId,
                        ),
                        eq(
                            songTagMatchTable.isMatch,
                            true
                        )
                    )
                );

            filterConditions.push(
                inArray(
                    songsTable.songId,
                    idsSongsWithTag,
                )
            );
        }

        // TODO should probably cache rap songs.
        if (excludeRap) {
            const rapSongIds = await getRapSongIds();

            if (rapSongIds.length > 0) {
                filterConditions.push(
                    notInArray(
                        songsTable.songId,
                        rapSongIds
                    )
                )
            }
        }

        const rows = await flowDb
            .select()
            .from(songsTable)
            .where(
                filterConditions.length > 0
                ? and(...filterConditions)
                : undefined
            )
            .orderBy(
                asc(
                    songsTable.recency
                )
            )
            .limit(1);

        return rows[0] ?? null;

    } catch (e) {
        logDbError(
            "couldn't fetch next song from pool",
            e
        )
    }

    return null;
}


/**
 * typically, after work, 
 * i wouldn't want to listen to rap songs.
 * 
 * i'd prefer, slower, mellow songs.
 * 
 * returns boolean, now is windown time.
*/
const checkWinddownTime = (

): boolean => {
    // converts server time to Nigerian time
    const nigeriaTime = new Date()
        .toLocaleString(
            "en-US", 
            {
                timeZone: "Africa/Lagos"
            }
        );
    
    const hour = new Date(nigeriaTime).getHours();
    
    // TODO probably shouldn't hardcode this here.
    return hour >= 18 || hour < 9;
}


export const getRapSongIds = async (

): Promise<number[]> => {
    try {
        const rows = await flowDb
            .select({ 
                songId: songTagMatchTable.songId 
            })
            .from(songTagMatchTable)
            .where(
                and(
                    eq(
                        songTagMatchTable.tagId,
                        RAP_TAG_ID
                    ),
                    eq(
                        songTagMatchTable.isMatch,
                        true
                    )
                )
            );

        return rows.map(
            r => r.songId
        );
    } catch (e) {
        logDbError(
            "couldn't fetch rap song ids",
            e
        );
        return [];
    }
};

