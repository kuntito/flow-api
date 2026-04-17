import { sql } from "drizzle-orm";
import { pgTable, text, check } from "drizzle-orm/pg-core";

export const tagTypesTN = "tag_types"
export const tagTypesTable = pgTable(tagTypesTN, {
    tagName: text("name").primaryKey(),
    tagDescription: text("description").notNull()
}, (table) => ([
    check(
        "description_not_empty",
        sql`trim(${table.tagDescription}) <> ''`
    ),
]));