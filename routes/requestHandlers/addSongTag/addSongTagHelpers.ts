import { flowDb } from "../../../clients/neonDbClient";
import { isPgUniqueViolation, logDbError } from "../../../helpers/dbHelpers";
import { SongTagInsertEntity, songTagTypesTable } from "../../../schema/songTagTypes-schema";

type AddSongTagResult = 
    | { 
        success: true;
        statusCode: 201 
    }
    | { 
        success: false;
        reason: 'tag already exists';
        statusCode: 409 
    }
    | { 
        success: false;
        reason: 'error occurred';
        statusCode: 500
    }

export const addSongTagToDb = async (
    songTagEntity: SongTagInsertEntity
): Promise<AddSongTagResult> => {
    try {
        await flowDb
            .insert(songTagTypesTable)
            .values(songTagEntity)

        return { success: true, statusCode: 201 };
    } catch (e) {
        if (isPgUniqueViolation(e)) {
            return {
                success: false,
                reason: 'tag already exists',
                statusCode: 409,
            }
        }

        logDbError(
            "db insert failed, songTagsTable",
            e,
        )

        return {
            success: false,
            reason: 'error occurred',
            statusCode: 500
        };
    }
}


type TagNameValidation = 
| { isValid: true, validatedTagName: string }
| { isValid: false, errorMessage: string }

/**
 * trims the tag name and checks if it's valid.
 */
export const validateTagName = (
    tagName: string
): TagNameValidation => {
    if (tagName == undefined) {
        return {
            isValid: false,
            errorMessage: "tagName is required"
        }
    }

    const trimmedTagName = tagName.trim();

    if (trimmedTagName === '') {
        return {
            isValid: false,
            errorMessage: "tag name cannot be blank"
        }
    }

    if (trimmedTagName.length < 3) {
        return {
            isValid: false,
            errorMessage: "tagName is at least 3 characters",
        }
    }

    return {
        isValid: true,
        validatedTagName: trimmedTagName
    }
}


export type TagDescriptionValidation = 
| { isValid: true, validatedTagDescription: string }
| { isValid: false, errorMessage: string }

/**
 * trims the tag description and checks if it's not empty.
 */
export const validateTagDescription = (
    tagDesc: string
): TagDescriptionValidation => {
    if (tagDesc == undefined) {
        return {
            isValid: false,
            errorMessage: "tagDescription is required"
        }
    }

    const trimmedTagDesc = tagDesc.trim();

    if (trimmedTagDesc === '') {
        return {
            isValid: false,
            errorMessage: "tag description cannot be blank"
        }
    }

    return {
        isValid: true,
        validatedTagDescription: trimmedTagDesc
    }
}