import { BooleanEnum } from "types/common"

enum Gender {
  male = "Male",
  female = "Female",
}

enum Collective {
  new = "This will be my first event.",
  newish = "2-5 times",
  oldish = "6-10 times",
  old = "I basically live at Collective.",
}

interface Person {
  [key: string]: boolean | number | string | string[]
  index: string
  order: number
  firstName: string
  lastName: string
  age: string
  gender: Gender
  firstTime: BooleanEnum
  collective: Collective
  preferredPeopleRaw: string
  preferredPeople: string[]
  leader: BooleanEnum
  team: string
  room: string
  participant: BooleanEnum
  selected: boolean
}

interface PersonTable extends Person {
  preferredPeopleDisplay: string[]
}

export {
  Gender,
  Collective,
  type Person,
  type PersonTable,
}