// every environment variable should be placed in `requiredVariables`
// this file does two things:
// * ensures every declared environment variable exists at run time. it throws an error for missing variables.

// * provides an object, `envConfig`, that allows dot calls for every variable globally i.e. envConfig.var1

// this file has to be imported in the entry point, `server.ts`
// i.e. `import "./envConfig";`
import dotenv from "dotenv";

// allows project see `process.env` on the terminal
dotenv.config();

const requiredVariables = [
    "NEON_CONN_STR",
    "AWS_REGION",
    "AWS_ACCESS_KEY",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_BUCKET_NAME",
] as const;

for (const key of requiredVariables) {
    if (!process.env[key]) {
        throw new Error(`missing environment variable: ${key}`);
    }
}

// union type of all the variables in `requiredVariables`
// it's functionally equivalent to: "REQ_VAR1" | "REQ_VAR2" | ...
type RequiredVariableKey = (typeof requiredVariables)[number];

// this allows ts to recognize `config.REQ_VAR1`
type ConfigType = Record<RequiredVariableKey, string>;

export const envConfig = Object.fromEntries(
    requiredVariables.map((key) => [key, process.env[key]!])
) as ConfigType;
