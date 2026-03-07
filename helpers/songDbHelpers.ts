import { flowDb } from "../clients/neonDbClient"
import { SongEntity, songsTable } from "../schema/song-schema"
import { eq } from "drizzle-orm";


export const getSongFromDb = async (
    songId: number
): Promise<SongEntity | null> => {
    try {
        const res = await flowDb
            .select()
            .from(songsTable)
            .where(eq(songsTable.songId, songId))
            .limit(1);

        if (res.length === 1) {
            const songEntity = res[0];
            return songEntity;
        }
        
        console.log(`couldn't find songId in db, songId: ${songId}`);
        return null;

    } catch(e) {

        console.log(`couldn't fetch song from db, songId: ${songId}, errorMessage: ${(e as Error).message}`);
        return null;
    }
}