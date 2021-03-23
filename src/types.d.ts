interface Function {
  name: string;
}

export type ModelType = {
  [index: string]: ModelType | number | boolean | string
}

export type RulesType = {
  // need to remove any type, but then I can't get access to 'name' property
  [index: string]: RulesType | Function | any
}
