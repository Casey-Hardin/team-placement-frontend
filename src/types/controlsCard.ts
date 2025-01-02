interface Control {
  [key: string]: boolean | number | string | string[]
  index: string
  order: number
  personIndex: string
  teamInclude: string[]
  teamExclude: string[]
  roomInclude: string[]
  roomExclude: string[]
  selected: boolean
}

interface ControlTable extends Control {
  firstName: string
  lastName: string
  teamIncludeDisplay: string[]
  teamExcludeDisplay: string[]
  roomIncludeDisplay: string[]
  roomExcludeDisplay: string[]
}

export {
  type Control,
  type ControlTable,
}