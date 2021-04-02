import get from 'lodash.get';
import { ValidatorType, ValidatorMakerType } from './types';
import { withParams, req } from './helpers';
import * as validatorsImport from './validators';
import { ModelType } from './types';

const validators: { [index: string]: ValidatorMakerType } = validatorsImport;

const emailRegex = /^(?:[A-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]{2,}(?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/; // eslint-disable-line

const getLength = (value: any): number => {
  if (Array.isArray(value)) return value.length;
  if (typeof value === 'object') {
    return Object.keys(value).length;
  }
  return String(value).length;
};

const birthdayValidator = (value: string): boolean => {
  if (!req(value)) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parts: string[] = value.split('-');
  const year: number = parseInt(parts[0], 10);
  const month: number = parseInt(parts[1], 10);
  const day: number = parseInt(parts[2], 10);

  // Check the ranges of month and year
  if (year < 1900 || month < 1 || month > 12) return false;

  const monthLength: number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Adjust for leap years
  if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) monthLength[1] = 29;

  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1];
};

const futureDateValidator = (value: string): boolean => new Date(value) < new Date();

export const maxDate = (param: string): ValidatorType => withParams(
    { type: 'maxDate', value: param },
    (value: string): boolean => (
        !req(value) || +(new Date(value)) <= +(new Date(param))
    ),
);

export const minDate = (param: string): ValidatorType => withParams(
    { type: 'minDate', value: param },
    (value: string): boolean => (
        !req(value) || +(new Date(value)) >= +(new Date(param))
    ),
);

/**
 * One of validator is useless for now
 * @param param
 * @returns {*}
 */
export const oneOf = (param: string[]): ValidatorType => withParams(
    { type: 'oneOf', value: param },
    (): boolean => true,
);

export const manyOf = (param: string[]): ValidatorType => withParams(
    { type: 'manyOf', value: param },
    (): boolean => true,
);

export const eql = (param: any): ValidatorType => withParams(
    { type: 'eql', value: param },
    (value: any): boolean => (!req(value) || value === param),
);

export const equal = eql;

export const notEql = (param: any): ValidatorType => withParams(
    { type: 'notEql', value: param },
    (value: any): boolean => (!req(value) || value !== param),
);

export const required = (param: any): ValidatorType => withParams(
    { type: 'required', value: param },
    req,
);

export const requiredIf = (param: string): ValidatorType => withParams(
    { type: 'requiredIf', value: param },
    (value: any, model: ModelType): boolean => (
        model[param] ? req(value) : true
    ),
);

/**
 * Set required if locator equal passed value
 * @param {Array} param - has to have 2 elements
 * @param {Object} rootModel
 * @param {string} param[0] - name of locator in model
 * @param {string|Array} param[1] - value to locator be equal
 * @returns boolean
 */
export const requiredIfEqual = (param: [string, any], rootModel: ModelType): ValidatorType => withParams(
    { type: 'requiredIfEqual', value: param },
    (value: any): boolean => {
      const val: any = get(rootModel, param[0]);
      const equalTo: any = param[1];
      // second param can be array
      const isEqual = Array.isArray(equalTo) ? equalTo.includes(val) : val === equalTo;
      return isEqual ? req(value) : true;
    },
);

/**
 * Set required if locator not equal passed value
 * @param {Array} param - has to have 2 elements
 * @param {Object} rootModel
 * @param {string} param[0] - name of locator in model
 * @param {string|Array} param[1] - value to locator be equal
 * @returns boolean
 */
export const requiredIfNotEqual = (param: [string, any], rootModel: ModelType): ValidatorType => withParams(
    { type: 'requiredIfNotEqual', value: param },
    (value: any): boolean => {
      const val: any = get(rootModel, param[0]);
      const equalTo: any = param[1];
      // second param can be array
      const isEqual = Array.isArray(equalTo) ? equalTo.includes(val) : val === equalTo;
      return isEqual ? true : req(value);
    },
);

/**
 * Set required if locator. which get from root model, is truthy
 * @param {String} param - path to locator from root model
 * @param {Object} rootModel
 * @returns boolean
 */
export const requiredIfAtRoot = (param: string, rootModel: ModelType): ValidatorType => withParams(
    { type: 'requiredIfAtRoot', value: param },
    (value: any): boolean => (
        get(rootModel, param) ? req(value) : true
    ),
);

/**
 * Return result of passed required validators
 * @param {Object} param - list of validators
 * @param {Object} rootModel
 * @returns boolean
 */
export const requiredIfAnd = (param: object, rootModel: ModelType): ValidatorType => withParams(
    { type: 'requiredIfAnd', value: param },
    (value: any, model: ModelType) => Object.entries(param)
    .some(([validatorName, validatorParam]): boolean => {
      const validator: ValidatorMakerType = validators[validatorName];
      return validator && validator(validatorParam, rootModel)(value, model);
    }),
);

export const requiredUnless = (param: string): ValidatorType => withParams(
    { type: 'requiredUnless', value: param },
    (value: any, model: ModelType): boolean => (
        !get(model, param) ? req(value) : true
    ),
);

export const requiredUnlessAtRoot = (param: string, rootModel: ModelType): ValidatorType => withParams(
    { type: 'requiredUnlessAtRoot', value: param },
    (value: any): boolean => (
        !get(rootModel, param) ? req(value) : true
    ),
);

/**
 * Set required if checkbox in checkbox group is checked
 * @param {Array} param - has to have 2 elements
 * @param {Object} rootModel
 * @param {string} param[0] - name of checkbox group in model
 * @param {Number} param[1] - index of checkbox to check
 * @returns boolean
 */
export const requiredIfCheckbox = (param: [string, number], rootModel: ModelType): ValidatorType => withParams(
    { type: 'requiredIfCheckbox', value: param },
    // eslint-disable-next-line no-bitwise
    (value: any) => {
      const rootValue = rootModel[param[0]];
      if (typeof rootValue !== 'number') return true;
      rootValue & (2 ** param[1]) ? req(value) : true
    },
);

export const regex = (param: string): ValidatorType => withParams(
    { type: 'regex', value: param },
    (value: string): boolean => (
      !req(value) || new RegExp(param).test(value)
    ),
);

export const password = (param: boolean): ValidatorType => withParams(
    { type: 'password', value: param },
    (value: any) => !req(value) || /\S{8,}/.test(value),
);

export const email = (param: boolean): ValidatorType => withParams(
    { type: 'email', value: param },
    (value: any): boolean => !req(value) || emailRegex.test(value),
);

export const futureDate = (param: boolean): ValidatorType => withParams(
    { type: 'futureDate', value: param },
    (value: any): boolean => {
      if (!req(value) || !birthdayValidator(value)) return true;
      return futureDateValidator(value);
    },
);

export const legalAge = (param: boolean): ValidatorType => withParams(
    { type: 'legalAge', value: param },
    (value: any): boolean => {
      if (!req(value) || !birthdayValidator(value)
          || !futureDateValidator(value)) return true;
      const maxDateParam = +(new Date(new Date().setFullYear(new Date().getFullYear() - 18)));
      return +(new Date(value)) <= maxDateParam;
    },
);

export const birthday = (param: boolean): ValidatorType => withParams(
    { type: 'birthday', value: param },
    birthdayValidator,
);

export const minLength = (param: number): ValidatorType => withParams(
    { type: 'minLength', value: param },
    (value: any): boolean => (
      !req(value) || getLength(value) >= param
    ),
);

export const maxLength = (param: number): ValidatorType => withParams(
    { type: 'maxLength', value: param },
    (value: any): boolean => (!req(value) || getLength(value) <= param),
);

export const minValue = (param: number | string): ValidatorType => withParams(
    { type: 'minValue', value: param },
    (value: any): boolean => (
        !req(value) || ((!/\s/.test(value) || value instanceof Date) && +value >= +param)
    ),
);

export const maxValue = (param: number | string): ValidatorType => withParams(
    { type: 'maxValue', value: param },
    (value: any): boolean => (
        !req(value) || ((!/\s/.test(value) || value instanceof Date) && +value <= +param)
    ),
);
