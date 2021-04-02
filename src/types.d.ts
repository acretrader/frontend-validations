interface ValidatorType {
  (value: any, model?: ModelType): boolean;
  __params?: object,
}

interface ValidatorMakerType {
  (param: any, rootModel?: ModelType): ValidatorType
}

export type ModelType = {
  [index: string]: ModelType | number | boolean | string
}

export type RulesType = {
  [index: string]: RulesType | ValidatorType
}

