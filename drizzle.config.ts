import { defineConfig } from 'drizzle-kit';
import { envConfig } from './envConfig';

export default defineConfig({
    schema: "./schema/*.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: envConfig.NEON_CONN_STR
    }
});