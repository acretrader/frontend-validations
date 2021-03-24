import { startCase } from './utils';
export function universal() {
    return 'Does not meet the requirements';
}
export function minValue({ validatorParam, fieldName }) {
    return `Minimum is ${fieldName === 'amount' ? '$' : ''}${validatorParam}`;
}
export function maxValue({ validatorParam, fieldName }) {
    return `Maximum is ${fieldName === 'amount' ? '$' : ''}${validatorParam}`;
}
export function minLength({ validatorParam }) {
    return `Too short (minimum is ${validatorParam} characters)`;
}
export function maxLength({ validatorParam }) {
    return `Is too long (maximum is ${validatorParam} characters)`;
}
export function email() {
    return 'Please provide a valid email address';
}
export function required() {
    return 'Please complete';
}
export function atLeastOneFile() {
    return 'At least one file should be uploaded';
}
export function enoughBalance() {
    return 'There is currently not enough money in your AcreTrader wallet.';
}
export function oneOf() {
    return 'Should be one of options';
}
export function eql({ validatorParam }, value) {
    // return different message if field is boolean (checkbox)
    return ((validatorParam && validatorParam === true) || value === false)
        ? '*Required'
        : `Should be ${validatorParam}`;
}
export function notEql({ validatorParam }) {
    return `Can't be ${validatorParam}`;
}
export function password() {
    return 'Password must be a minimum of eight characters';
}
export function birthday() {
    return 'Please enter a valid birth date';
}
export function legalAge() {
    return 'You must be at least 18 years old.';
}
export function futureDate() {
    return 'The date of birth you entered is in the future.';
}
export function ssn() {
    return 'Please enter a valid SSN.';
}
export function sameAs({ validatorParam }) {
    return `Should be the same as ${startCase(validatorParam)}`;
}
export const requiredIf = required;
export const requiredUnless = required;
export const requiredIfEqual = required;
export const requiredIfNotEqual = required;
export const requitedIfAtRoot = required;
export const requiredIfAnd = required;
export const requiredIfCheckbox = required;
//# sourceMappingURL=error-messages.js.map