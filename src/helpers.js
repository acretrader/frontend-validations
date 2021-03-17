import { upperFirst } from './utils';
import * as validators from './validators';
import * as errorMessages from './error-messages';

export const withParamsFuncName = '__validatorWithParams';

export function withParams(params, validator) {
  if (validator.name === withParamsFuncName) {
    const { $params, $validator } = validator();
    return withParams(Object.assign($params, params), $validator);
  }
  return function __validatorWithParams() {
    return {
      $params: params,
      $validator: (...args) => validator.apply(this, args),
    };
  };
}

export function getValidatorResult(validator, ...args) {
  if (validator.name === withParamsFuncName) {
    const { $validator } = validator();
    validator = $validator; // eslint-disable-line no-param-reassign
  }
  return validator(...args);
}


/**
 * Get validator by validator name
 * It can be built ib vuelidate validator or project`s custom validator
 * @param valName
 * @returns {*}
 */
export function getValidator(valName) {
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
export function getSingleFieldRulesByParams(params = {}, fieldName) {
  const fieldRules = {};
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
          getValidator('legalAge')(),
      );
      fieldRules.futureDate = withParams(
          { fieldName, validatorParam },
          getValidator('futureDate')(),
      );
    }
  });
  return fieldRules;
}

/**
 * Get validation rules for all fields by params from api
 * @param params
 */
export function getFieldsRulesByParams(params) {
  const rules = {};
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
export function getFieldErrorMessageByValidation(valResult) {
  if (!valResult || !valResult.$error) return '';
  const errors = [];
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

export function getFieldRuleByServerResponse(fieldName, value, message) {
  const { notEql } = validators;
  const rule = notEql(value);
  return withParams({
    fieldName,
    value,
    message: upperFirst(message),
  }, rule);
}
