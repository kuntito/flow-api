// TODO consolidate the types in `/routes/types` to `/models`
export type Mood = {
    tagId: number;
    moodName: string;
    durationMillis: number; // tells client how long the mood should last
}