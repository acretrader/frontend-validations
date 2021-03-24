import { ModelType, RulesType } from "./types";
import ValidationLevel from './ValidationLevel';

export default function (rules: RulesType, model: ModelType): ValidationLevel {
    return new ValidationLevel(rules, model);
}

export { ValidationLevel };
