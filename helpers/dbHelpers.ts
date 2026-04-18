/**
 * formats db error messages on new line.
 * and logs on the console.
 *
 * e.g. \
 * \* \
 * could not run `isDbTableEmpty` for table: nextSong \
 * errorMessage: Failed query... \
 * db error: column "posInQueue" does not exist \
 * \*
 */
export const logDbError = (message: string, e: unknown) => {
    const constructedMessage = "*" +
        "\n" +
        message + 
        "\n" +
        "errorMessage: " + (e as Error).message +
        "\n" +
        "db error: " + (e as any)?.cause +
        "\n" +
        "*";

    console.log(constructedMessage);
}

/**
 * postgres error code for unique constraint violation.
 * happens when inserting a duplicate value into a unique column.
 */
const PG_UNIQUE_VIOLATION_CODE = '23505';

export const isPgUniqueViolation = (e: any): boolean => {
    return e?.cause?.code === PG_UNIQUE_VIOLATION_CODE;
};