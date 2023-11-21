

// Validate that only numbers can be entered
export const validInputs = (...inputs: number[]): boolean => inputs.every( input => Number.isFinite(input));

// Validate that only positive numbers can be entered.
export const validatePositiveNumber = (...inputs: number[]): boolean => inputs.every( input => input > 0);