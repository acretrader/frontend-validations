import { upperFirst } from './utils';
import * as validatorsImport from './validators';
import * as errorMessagesImport from './error-messages';
import ValidationLevel from './ValidationLevel';

export const withParamsFuncName = '__validatorWithParams';

const validators: { [index: string]: Function } = validatorsImport;
const errorMessages: { [index: string]: Function} = errorMessagesImport;

type withParamsResultType = {
  [index: string]: object | Function,
  $params: object,
  $validator: Function
}

export function withParams(params: object, validator: Function): Function {
  if (validator.name === withParamsFuncName) {
    const { $params, $validator }: withParamsResultType = validator();
    return withParams(Object.assign($params, params), $validator);
  }
  return function __validatorWithParams(): withParamsResultType {
    return {
      $params: params,
      $validator: (...args: any[]) => validator.apply(this, args),
    };
  };
}

export function getValidatorResult(validator: Function, ...args: any[]): boolean {
  if (validator.name === withParamsFuncName) {
    const { $validator }: withParamsResultType = validator();
    validator = $validator; // eslint-disable-line no-param-reassign
  }
  return validator(...args);
}


/**
 * Get validator by validator name
 * @param valName
 * @returns {*}
 */
export function getValidator(valName: string): Function | false {
  const validator = validators[valName];
  if (validator) {
    return validator;
  }
  return false;
  // throw new Error(`Undefined validator ${valName}`);
}

/**
 * Get rules for field by params from api
 * @param params
 * @param fieldName
 */
export function getSingleFieldRulesByParams(params: object = {}, fieldName: string) {
  const fieldRules: { [index: string]: any } = {};
  Object.entries(params).forEach(([validatorName, valParams]) => {
    // if value false, means rule is switch off
    if (valParams === false || valParams === undefined || valParams === null) return;
    // Try to get validator function
    const validator = getValidator(validatorName);
    // If false, validator is not exist
    if (!validator) return;
    // Params can be object with more params
    // If value param exist get it if not, params is simple
    const validatorParam = valParams.value || valParams;
    // Try to get message from params
    const { message } = valParams;
    // Check if function required params
    // second argument is root model
    const res = validator(validatorParam, this);
    const rule = (typeof res === 'function') ? res : validator;
    // All required variant should be added as required param
    const validatorKey = validatorName.startsWith('required') ? 'required' : validatorName;
    fieldRules[validatorKey] = withParams(
      { fieldName, validatorParam, message },
      rule,
    );
    // Add validator legal age by default to field birthday
    if (validatorKey === 'birthday') {
      fieldRules.legalAge = withParams(
          { fieldName, validatorParam },
          validators.legalAge(),
      );
      fieldRules.futureDate = withParams(
          { fieldName, validatorParam },
          validators.futureDate(),
      );
    }
  });
  return fieldRules;
}

/**
 * Get validation rules for all fields by params from api
 * @param params
 */
export function getFieldsRulesByParams(params: {[index: string]: any}) {
  const rules: {[index: string]: any} = {};
  Object.entries(params).forEach(([fieldName, fieldParam]) => {
    const valParams = params[fieldName].validate;
    // pass model as context to get access to root model in custom validator
    if (valParams) rules[fieldName] = getSingleFieldRulesByParams.call(this, valParams, fieldName);
    // Setup nested rules if it exist
    if (fieldParam.schema) {
      // pass model as context to get access to root model in custom validator
      const nestedRules = getFieldsRulesByParams.call(this, fieldParam.schema);
      // Assign nested rules or set it
      if (rules[fieldName]) {
        Object.assign(rules[fieldName], nestedRules);
      } else {
        rules[fieldName] = nestedRules;
      }
    }
  });
  return rules;
}

/**
 * Get field error message by field validation results
 * @param valResult
 * @returns {string}
 */
export function getFieldErrorMessageByValidation(valResult: ValidationLevel | undefined) {
  if (!valResult || !valResult.$error) return '';
  const errors: string[] = [];
  Object.keys(valResult.$params).forEach((ruleName) => {
    if (!valResult[ruleName]) {
      const ruleParams = valResult.$params[ruleName];
      if (ruleParams && ruleParams.message) {
        errors.push(ruleParams.message);
      } else {
        // try to get validator name by params or as rule name
        const validatorName = (
            (ruleParams && ruleParams.type)
            || ruleName
        );
        const messageFunc = errorMessages[validatorName] || errorMessages.universal;
        // Pass rule params and value
        errors.push(messageFunc((ruleParams || {}), valResult.$model));
      }
    }
  });
  return errors.join('. ');
}

export function getFieldRuleByServerResponse(fieldName: string, value: any, message?: string) {
  const { notEql } = validators;
  const rule = notEql(value);
  return withParams({
    fieldName,
    value,
    message: upperFirst(message),
  }, rule);
}