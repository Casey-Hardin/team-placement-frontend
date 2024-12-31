import {
  VALIDATE_POSITIVE_INTEGER_TEXT,
  VALIDATE_SELECT_TEXT,
  VALIDATE_STRING_TEXT,
} from "localConstants";
import { InputField, SelectField } from "types/common";
import {
  validatePositiveInteger,
  validateSelect,
  validateString,
} from "utils/validators";

const firstNameField: InputField = {
  placeholder: "John",
  helperText: VALIDATE_STRING_TEXT,
  validate: validateString,
};

const lastNameField: InputField = {
  placeholder: "Doe",
  helperText: VALIDATE_STRING_TEXT,
  validate: validateString,
};

const ageField: InputField = {
  placeholder: "18 - 29ish",
  helperText: VALIDATE_POSITIVE_INTEGER_TEXT,
  validate: validatePositiveInteger,
};

const genderField: SelectField = {
  helperText: VALIDATE_SELECT_TEXT,
  validate: validateSelect,
};

const collectiveField: SelectField = {
  helperText: VALIDATE_SELECT_TEXT,
  validate: validateSelect,
};

const preferredPeopleField: SelectField = {
  helperText: VALIDATE_SELECT_TEXT,
  validate: validateSelect,
};

const teamNameField: InputField = {
  placeholder: "Super Awesome Team Name",
  helperText: VALIDATE_STRING_TEXT,
  validate: validateString,
};

export {
  firstNameField,
  lastNameField,
  ageField,
  genderField,
  collectiveField,
  preferredPeopleField,
  teamNameField,
}