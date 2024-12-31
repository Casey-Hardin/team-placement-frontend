interface Nicknames {
  [key: string]: boolean | string | string[]
  index: string
  firstName: string
  lastName: string
  nicknames: string[]
  selected: boolean
}

export {
  type Nicknames,
}