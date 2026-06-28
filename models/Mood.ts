// TODO consolidate the types in `/routes/types` to `/models`
// TODO should be mood id, even though it backs tagId
export type Mood = {
    tagId: number;
    moodName: string;
    durationMillis: number; // tells client how long the mood should last
}