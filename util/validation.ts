export type ValidationFailure = {
    isValid: false;
    reason: string;
}

export type ValidationSuccess<T> = {
    isValid: true;
    data: T,
}

export type ValidationResult<T> = ValidationFailure | ValidationSuccess<T>;