interface Team {
  [key: string]: boolean | number | string | string[]
  index: string
  name: string
  selected: boolean
}

interface TeamTable extends Team {
  size: string
  age: string
  collectiveNew: string
  collectiveNewish: string
  collectiveOldish: string
  collectiveOld: string
  male: string
  female: string
  firstTime: string
  leaders: string[]
}

export {
  type Team,
  type TeamTable,
}