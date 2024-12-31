const validateFloat = (value: string | undefined): boolean => {
    return validateRange(value, -Infinity, Infinity);
}

const validatePositiveFloat = (value: string | undefined): boolean => {
    return validateRange(value, 0, Infinity);
}

const validatePositiveInteger = (value: string | undefined): boolean => {
    return value === undefined
    || value === ""
    || (
    validateRange(value, 0, Infinity)
    && parseInt(value) == Number(value)
    );
}

const validateRange = (value: string | undefined, min: number, max: number): boolean => {
/* Value is a number between min and max. */
return value === ""
    || value === undefined
    || !(isNaN(Number(value))
    || Number(value) < min
    || Number(value) > max
    );
}

const validateSelect = (options: string[], value: string | undefined): boolean => {
    return value === undefined || [""].concat(options).includes(value);
}

const validateString = (value: string | undefined): boolean => {
    return value === undefined || typeof value === 'string';
}

const validateWholeNumber = (value: string | undefined): boolean => {
    return validatePositiveInteger(value) || Number(value) === 0;
}

export {
  validateFloat,
  validatePositiveFloat,
  validatePositiveInteger,
  validateSelect,
  validateString,
  validateRange,
  validateWholeNumber,
}