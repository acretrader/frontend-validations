import { startCase } from './utils';

type argumentsType = {
  validatorParam: any,
  fieldName?: string,
}

export function universal(): string {
  return 'Does not meet the requirements';
}

export function minValue({ validatorParam, fieldName }: argumentsType): string {
  return `Minimum is ${fieldName === 'amount' ? '$' : ''}${validatorParam}`;
}

export function maxValue({ validatorParam, fieldName }: argumentsType): string {
  return `Maximum is ${fieldName === 'amount' ? '$' : ''}${validatorParam}`;
}

export function minLength({ validatorParam }: argumentsType): string {
  return `Too short (minimum is ${validatorParam} characters)`;
}

export function maxLength({ validatorParam }: argumentsType): string {
  return `Is too long (maximum is ${validatorParam} characters)`;
}

export function email(): string {
  return 'Please provide a valid email address';
}

export function required(): string {
  return 'Please complete';
}

export function atLeastOneFile(): string {
  return 'At least one file should be uploaded';
}

export function enoughBalance(): string {
  return 'There is currently not enough money in your AcreTrader wallet.';
}

export function oneOf(): string {
  return 'Should be one of options';
}

export function eql({ validatorParam }: argumentsType, value: any): string {
  // return different message if field is boolean (checkbox)
  return ((validatorParam && validatorParam === true) || value === false)
    ? '*Required'
    : `Should be ${validatorParam}`;
}

export function notEql({ validatorParam }: argumentsType): string {
  return `Can't be ${validatorParam}`;
}

export function password(): string {
  return 'Password must be a minimum of eight characters';
}

export function birthday(): string {
  return 'Please enter a valid birth date';
}

export function legalAge(): string {
  return 'You must be at least 18 years old.';
}

export function futureDate(): string {
  return 'The date of birth you entered is in the future.';
}

export function ssn(): string {
  return 'Please enter a valid SSN.';
}

export function sameAs({ validatorParam }: argumentsType): string {
  return `Should be the same as ${startCase(validatorParam)}`;
}

export const requiredIf = required;
export const requiredUnless = required;
export const requiredIfEqual = required;
export const requiredIfNotEqual = required;
export const requitedIfAtRoot = required;
export const requiredIfAnd = required;
export const requiredIfCheckbox = required;
