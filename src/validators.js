import get from 'lodash.get';
import { withParams, getValidatorResult } from './helpers';

import * as validators from './validators'; // eslint-disable-line

const emailRegex = /^(?:[A-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]{2,}(?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/; // eslint-disable-line

const getLength = (value) => {
  if (Array.isArray(value)) return value.length;
  if (typeof value === 'object') {
    return Object.keys(value).length;
  }
  return String(value).length;
};

const requiredValidator = (value) => {
  if (Array.isArray(value)) return !!value.length;
  if (value === undefined || value === null) {
    return false;
  }

  if (value === false) {
    return true;
  }

  if (value instanceof Date) {
    // invalid date won't pass
    return !Number.isNaN(value.getTime());
  }

  return !!String(value).trim().length;
};

const birthdayValidator = (value) => {
  if (!requiredValidator(value)) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parts = value.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  // Check the ranges of month and year
  if (year < 1900 || month < 1 || month > 12) return false;

  const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Adjust for leap years
  if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) monthLength[1] = 29;

  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1];
};

const futureDateValidator = value => new Date(value) < new Date();

export const maxDate = param => helpers.withParams(
    { type: 'maxValueDate', value: param },
    value => !requiredValidator(value) || +(new Date(value)) <= +(new Date(param)),
);

export const minDate = param => withParams(
    { type: 'minValueDate', value: param },
    value => !requiredValidator(value) || +(new Date(value)) >= +(new Date(param)),
);

/**
 * One of validator is useless for now
 * @param param
 * @returns {*}
 */
export const oneOf = param => withParams(
    { type: 'oneOf', value: param },
    () => true,
);

export const manyOf = param => withParams(
    { type: 'manyOf', value: param },
    () => true,
);

export const eql = param => withParams(
    { type: 'eql', value: param },
    value => (!requiredValidator(value) || value === param),
);

export const equal = eql;

export const notEql = param => withParams(
    { type: 'notEql', value: param },
    value => (!requiredValidator(value) || value !== param),
);

export const required = param => withParams(
    { type: 'required', value: param },
    requiredValidator,
);

export const requiredIf = param => withParams(
    { type: 'requiredIf', value: param },
    (value, model) => (model[param] ? requiredValidator(value) : true),
);

/**
 * Set required if locator equal passed value
 * @param {Array} param - has to have 2 elements
 * @param {Object} rootModel
 * @param {string} param[0] - name of locator in model
 * @param {string|Array} param[1] - value to locator be equal
 * @returns boolean
 */
export const requiredIfEqual = (param, rootModel) => withParams(
    { type: 'requiredIfEqual', value: param },
    (value) => {
      const val = get(rootModel, param[0]);
      const equalTo = param[1];
      // second param can be array
      const isEqual = Array.isArray(equalTo) ? equalTo.includes(val) : val === equalTo;
      return isEqual ? requiredValidator(value) : true;
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
export const requiredIfNotEqual = (param, rootModel) => withParams(
    { type: 'requiredIfNotEqual', value: param },
    (value) => {
      const val = get(rootModel, param[0]);
      const equalTo = param[1];
      // second param can be array
      const isEqual = Array.isArray(equalTo) ? equalTo.includes(val) : val === equalTo;
      return isEqual ? true : requiredValidator(value);
    },
);

/**
 * Set required if locator. which get from root model, is truthy
 * @param {String} param - path to locator from root model
 * @param {Object} rootModel
 * @returns boolean
 */
export const requiredIfAtRoot = (param, rootModel) => withParams(
    { type: 'requiredIfAtRoot', value: param },
    value => (get(rootModel, param) ? requiredValidator(value) : true),
);

/**
 * Return result of passed required validators
 * @param {Object} param - list of validators
 * @param {Object} rootModel
 * @returns boolean
 */
export const requiredIfAnd = (param, rootModel) => withParams(
    { type: 'requiredIfAnd', value: param },
    (value, vm) => Object.entries(param)
    .some(([validatorName, validatorParam]) => {
      const validator = validators[validatorName];
      return (validator && getValidatorResult(validator(validatorParam, rootModel), value, vm));
    }),
);

export const requiredUnless = param => withParams(
    { type: 'requiredUnless', value: param },
    (value, vm) => (!get(vm, param) ? requiredValidator(value) : true),
);

export const requiredUnlessAtRoot = (param, rootModel) => withParams(
    { type: 'requiredUnlessAtRoot', value: param },
    value => (!get(rootModel, param) ? requiredValidator(value) : true),
);

/**
 * Set required if checkbox in checkbox group is checked
 * @param {Array} param - has to have 2 elements
 * @param {Object} rootModel
 * @param {string} param[0] - name of checkbox group in model
 * @param {Number} param[1] - index of checkbox to check
 * @returns boolean
 */
export const requiredIfCheckbox = (param, rootModel) => withParams(
    { type: 'requiredIfCheckbox', value: param },
    // eslint-disable-next-line no-bitwise
    value => (rootModel[param[0]] & (2 ** param[1]) ? requiredValidator(value) : true),
);

export const regex = param => withParams(
    { type: 'regex', value: param },
    value => !requiredValidator(value) || new RegExp(param).test(value),
);

export const password = param => withParams(
    { type: 'password', value: param },
    value => !requiredValidator(value) || /\S{8,}/.test(value),
);

export const email = param => withParams(
    { type: 'email', value: param },
    value => !requiredValidator(value) || emailRegex.test(value),
);

export const futureDate = param => withParams(
    { type: 'futureDate', value: param },
    (value) => {
      if (!requiredValidator(value) || !birthdayValidator(value)) return true;
      return futureDateValidator(value);
    },
);

export const legalAge = param => withParams(
    { type: 'legalAge', value: param },
    (value) => {
      if (!requiredValidator(value) || !birthdayValidator(value)
          || !futureDateValidator(value)) return true;
      const maxDateParam = +(new Date(new Date().setFullYear(new Date().getFullYear() - 18)));
      return +(new Date(value)) <= maxDateParam;
    },
);

export const birthday = param => withParams(
    { type: 'birthday', value: param },
    birthdayValidator,
);

export const minLength = param => withParams(
    { type: 'minLength', value: param },
    value => (!requiredValidator(value) || getLength(value) >= param),
);

export const maxLength = param => withParams(
    { type: 'maxLength', value: param },
    value => (!requiredValidator(value) || getLength(value) <= param),
);

export const minValue = param => withParams(
    { type: 'minValue', value: param },
    value => (
        !requiredValidator(value) || ((!/\s/.test(value) || value instanceof Date) && +value >= +param)
    ),
);

export const maxValue = param => withParams(
    { type: 'maxValue', value: param },
    value => (
        !requiredValidator(value) || ((!/\s/.test(value) || value instanceof Date) && +value <= +param)
    ),
);
