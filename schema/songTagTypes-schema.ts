import { sql } from "drizzle-orm";
import { pgTable, text, check } from "drizzle-orm/pg-core";

export const songTagTypesTN = "songTagTypes"
export const songTagTypesTable = pgTable(songTagTypesTN, {
    tagName: text("name").primaryKey(),
    tagDescription: text("description").notNull()
}, (table) => ([
    check(
        "description_not_empty",
        sql`trim(${table.tagDescription}) <> ''`
    ),
]));

export type SongTagEntity = typeof songTagTypesTable.$inferSelect;