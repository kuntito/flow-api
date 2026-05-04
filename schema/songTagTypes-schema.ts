import { sql } from "drizzle-orm";
import { pgTable, text, check, serial } from "drizzle-orm/pg-core";

export const songTagTypesTN = "songTagTypes"
export const songTagTypesTable = pgTable(songTagTypesTN, {
    tagId: serial("id")
        .primaryKey(),
    tagName: text("name")
        .unique()
        .notNull(),
    tagDescription: text("description")
        .notNull(),
}, (table) => ([
    check(
        "description_not_empty",
        sql`trim(${table.tagDescription}) <> ''`
    ),
]));

export type SongTagEntity = typeof songTagTypesTable.$inferSelect;

export type SongTagInsertEntity = typeof songTagTypesTable.$inferInsert;