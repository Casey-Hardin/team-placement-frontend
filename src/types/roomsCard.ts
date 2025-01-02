interface Room {
  [key: string]: boolean | string
  index: string
  name: string
  capacity: string
  selected: boolean
}

interface RoomTable extends Room {
  occupants: string
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