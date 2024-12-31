enum BooleanEnum {
  yes = "Yes",
  no = "No",
}

interface Cell {
  [key: string]: string | number | undefined
  value: string | number | undefined
  colspan?: number
}

enum Direction {
  up = "up",
  down = "down",
}

interface HeadCell<T> {
  id: keyof T,
  label: string,
  colSpan?: number,
}

interface InputField {
  placeholder: string
  helperText: string
  validate: (value: string | undefined) => boolean
  unit?: string
}

interface ObjectModel {
  index: string,
  selected: boolean,
  order?: number,
}

interface ObjectOrderModel extends ObjectModel {
  order: number,
}

enum Order {
  asc = "asc",
  desc = "desc",
}

interface ObjectOrder<T> {
  order: Order,
  orderBy: keyof T,
}

interface SelectField {
  helperText: string
  validate: (options: string[], value: string | undefined) => boolean
}

export {
  type Cell,
  BooleanEnum,
  Direction,
  type HeadCell,
  type InputField,
  type ObjectOrderModel,
  type ObjectModel,
  Order,
  type ObjectOrder,
  type SelectField,
}