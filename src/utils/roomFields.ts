import { VALIDATE_POSITIVE_INTEGER_TEXT } from "localConstants";
import { InputField } from "types/common";
import { validatePositiveInteger } from "utils/validators";

const sizeField: InputField = {
  placeholder: "Number of Occupants",
  helperText: VALIDATE_POSITIVE_INTEGER_TEXT,
  validate: validatePositiveInteger,
};

export {
  sizeField,
}