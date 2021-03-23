import Vue from 'vue';
import merge from 'lodash.merge';
import { ModelType, RulesType} from "./types";
import { isObject } from './utils';
import { withParamsFuncName } from './helpers';

export default class ValidationLevel {
  [index: string]: any;
  private _dirty: boolean;
  private _parent: ValidationLevel | undefined;
  private _ownKey: string | undefined;
  private _model: object | undefined;
  $rules: RulesType;
  $params: {
    [index: string]: any,
    message: string,
    value: any,
  };

  constructor(rules: object = {}, model: ModelType | ValidationLevel, ownKey?: string) {
    if (model instanceof  ValidationLevel) {
      this.$set('_parent', model);
    } else {
      this.$set('_model', model);
    }
    this.$setAll({
      _dirty: false,
      $params: {},
      $rules: rules,
      _ownKey: ownKey,
    });
    this._setValidations();
  }

  get _keys(): string[] {
    return Object.keys(this.$rules);
  }

  get _nestedKeys(): string[] {
    return this._keys.filter(k => this._getIsKeyNested(k));
  }

  get _ruleKeys(): string[] {
    return this._keys.filter(k => !this._getIsKeyNested(k));
  }

  get $dirty(): boolean {
    return Boolean(this._dirty || (this._nestedKeys.length && this._nestedKeys.every(k => this[k].$dirty)));
  }

  get $invalid(): boolean {
    return this._ruleKeys.some((k: string): boolean => !this[k])
    || this._nestedKeys.some((k: string): boolean => this[k].$invalid);
  }

  get $error(): boolean {
    return this.$dirty && this.$invalid;
  }

  get $parentModel(): ModelType | undefined {
    return this._parent ? this._parent.$model : null;
  }

  get $model() : any {
    return this.$parentModel ? this.$parentModel[this._ownKey] : this._model;
  }

  $set(name: string, value: any, model: object = this) {
    Vue.set(model, name, value);
  }

  $setAll(data: object, model: ValidationLevel | ModelType = this) {
    if (!data || typeof data !== 'object') return;
    Object.entries(data)
      .forEach(([key, value]) => {
        // If value is object and model exist as object too
        if (isObject(value) && isObject(model[key])) {
          // Call recursive to not lost observe set by field params in object
          this.$setAll(value, model[key]);
        } else {
          this.$set(key, value, model);
        }
      });
  }

  _setDirty(isDirty: boolean): void {
    this.$set('_dirty', isDirty);
    this._nestedKeys.forEach((k) => {
      this[k]._setDirty(isDirty);
    });
  }

  private _getIsKeyNested(key: string): boolean {
    return typeof this.$rules[key] !== 'function';
  }

  private _setValidations(): void {
    this._setNested();
    this._setRules();
  }

  private _setNested(): void {
    this._nestedKeys.forEach((k) => {
      if (this[k]) {
        this[k].$addRules(this.$rules[k]);
      } else {
        this[k] = new ValidationLevel(this.$rules[k], this, k);
      }
    });
  }

  private _setRules(): void {
    this._ruleKeys.forEach((k) => {
      if (this[k] !== undefined) return;
      let validator: Function = this.$rules[k];
      if (validator.name === withParamsFuncName) {
        const { $params, $validator } = validator();
        this.$params[k] = $params;
        validator = $validator;
      }
      Object.defineProperty(this, k, {
        get: () => validator.call(this, this.$model, (this.$parentModel || this.$model)),
        enumerable: true,
      });
    });
  }

  public $touch(): void {
    this._setDirty(true);
  }

  public $reset(): void {
    this._setDirty(false);
  }

  public $addRules(rules: RulesType): void {
    this.$setAll({ $rules: merge(this.$rules, rules) });
    this._setValidations();
  }
}
