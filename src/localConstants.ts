import { BooleanEnum } from "types/common";
import { Control } from "types/controlsCard";
import { Nicknames } from "types/nicknamesCard";
import { Collective, Gender, Person, TeamPlacementStep } from "types/peopleCard";
import { Room } from "types/roomsCard";
import { Team } from "types/teamsCard";

// communication with the backend
//  import.meta.env.VITE_BACKEND_ADDRESS || window.location.protocol + '//' + window.location.host + '/api';
const BACKEND_ADDRESS = "http://127.0.0.1:8000";

// default objects
const DEFAULT_CONTROL: Control = {
  index: "",
  order: 1,
  personIndex: "",
  teamInclude: [],
  teamExclude: [],
  roomInclude: [],
  roomExclude: [],
  selected: false,
}
const DEFAULT_NICKNAMES: Nicknames = {
  index: "",
  firstName: "",
  lastName: "",
  nicknames: [],
  selected: false,
}
const DEFAULT_PERSON: Person = {
  index: "",
  order: 1,
  firstName: "",
  lastName: "",
  age: "",
  gender: Gender.male,
  firstTime: BooleanEnum.yes,
  collective: Collective.new,
  preferredPeopleRaw: "",
  preferredPeople: [],
  leader: BooleanEnum.no,
  team: "",
  teamPlacementStep: TeamPlacementStep.unassigned,
  room: "",
  participant: BooleanEnum.yes,
  selected: false,
}
const DEFAULT_ROOM: Room = {
  index: "",
  name: "",
  capacity: "",
  selected: false,
}
const DEFAULT_TEAM: Team = {
  index: "",
  name: "",
  selected: false,
}

// help button
const HELP_ICON_COLOR = "#FFDD00a0";
const HELP_URL = "www.google.com";

// validation strings
const VALIDATE_WHOLE_NUMBER_TEXT = "Value must be a whole number greater than or equal to 0.";
const VALIDATE_POSITIVE_FLOAT_TEXT = "Value must be a number greater than 0.";
const VALIDATE_POSITIVE_INTEGER_TEXT = "Value must be an integer greater than 0.";
const VALIDATE_STRING_TEXT = "Value must be a string.";
const VALIDATE_SELECT_TEXT = "Value must be empty or a valid option.";

export {
  BACKEND_ADDRESS,
  DEFAULT_CONTROL,
  DEFAULT_NICKNAMES,
  DEFAULT_PERSON,
  DEFAULT_ROOM,
  DEFAULT_TEAM,
  HELP_ICON_COLOR,
  HELP_URL,
  VALIDATE_WHOLE_NUMBER_TEXT,
  VALIDATE_POSITIVE_FLOAT_TEXT,
  VALIDATE_POSITIVE_INTEGER_TEXT,
  VALIDATE_STRING_TEXT,
  VALIDATE_SELECT_TEXT,
}