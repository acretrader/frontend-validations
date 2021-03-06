import { ModelType, RulesType } from "./types";
import ValidationLevel from './ValidationLevel';
import * as helpers from './helpers';
import * as validators from './validators';

export default function (rules: RulesType, model: ModelType): ValidationLevel {
    return new ValidationLevel(rules, model);
}

export { ValidationLevel, helpers, validators };
