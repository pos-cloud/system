export interface FormField {
  id?: string,
  name: string,
  tag: string,
  tagType: string,
  search?: any,
  format?: any,
  values?: any[],
  default?: any,
  validators?: any[],
  focus?: boolean,
  multiple?: boolean,
  class: string
}
