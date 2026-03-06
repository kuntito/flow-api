import { Pool } from "pg";
import { envConfig } from "../envConfig";
import { drizzle } from "drizzle-orm/node-postgres";

export const neonDbClient = new Pool({
    connectionString: envConfig.NEON_CONN_STR,
    // encrypts connection, skips certificate verification (acceptable for personal app)
    ssl: { rejectUnauthorized: false },
});

export const flowDb = drizzle(neonDbClient);