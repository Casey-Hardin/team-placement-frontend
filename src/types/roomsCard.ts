interface Room {
  [key: string]: boolean | number | string | string[]
  index: string
  name: string
  size: string
  selected: boolean
}

interface RoomTable extends Room {
  age: string
  collectiveNew: string
  collectiveNewish: string
  collectiveOldish: string
  collectiveOld: string
  male: string
  female: string
  firstTime: string
}

export {
  type Room,
  type RoomTable,
}