import { css } from "@emotion/react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import { BooleanEnum } from "types/common";
import { Control } from "types/controlsCard";
import { Person } from "types/peopleCard";
import { commitObjects } from "utils/commitObjects";

const dialogStyle = css`
  padding: 20px;
`;

interface ControlDialogProps {
  people: Person[]
  controls: Control[]
  controlOpen: Control | null
  onControlsChange: (newPeople: Control[]) => void
  onControlOpenChange: (person: Control | null) => void
}

function ControlDialog({
  people,
  controls,
  controlOpen,
  onControlsChange,
  onControlOpenChange,
} : ControlDialogProps) {
  /*
  Displays a dialog for controls information.

  people
    People defined by the user to sort into teams and rooms.
  controls
    Constraints defined by the user when surting people into teams and rooms.
  controlOpen
    Control entry open in the dialogue menu.
  onControlsChange
    Function to change controls in the interface.
  onControlOpenChange
    Function to change the open control in the dialogue menu.
  */
  // find the person associated with the open control
  const personOpen = people.filter(person => controlOpen !== null && person.index === controlOpen.personIndex)[0];

  const handleControlClose = () => {
    /* Closes the control dialogue window. */
    onControlOpenChange(null);
  };

  const handleControlPropertyChange = (key: keyof Control, value: boolean | string | string[]) => {
    /*
    Edits the value of an attribute for an open control.

    key
      Control attribute for a changed value.
    value
      New value for a control attribute.
    */
    // a control must be open
    if (controlOpen === null) {
      return;
    }

    // set a value
    const control = structuredClone(controlOpen);
    control[key] = value;

    // a person cannot be simultaneously included and excluded
    if (key === "teamInclude") {
      control.teamExclude = control.teamExclude.filter(index => !control.teamInclude.includes(index));
    } else if (key === "teamExclude") {
      control.teamInclude = control.teamInclude.filter(index => !control.teamExclude.includes(index));
    } else if (key === "roomInclude") {
      control.roomExclude = control.roomExclude.filter(index => !control.roomInclude.includes(index));
    } else if (key === "roomExclude") {
      control.roomInclude = control.roomInclude.filter(index => !control.roomExclude.includes(index));
    }

    // set the control open in the dialogue menu
    onControlOpenChange(control);
  };

  const handlePersonChange = (index: string) => {
    /*
    Changes the person for whom controls are applied.

    index
      Unique identifier for a person.
    */
    // a control must be open
    if (controlOpen === null) {
      return;
    }

    // find the person with the given index
    const personFound = people.filter(person => controlOpen !== null && person.index === index)[0];
    if (personFound === undefined) {
      return;
    }

    // set a value
    const control = structuredClone(controlOpen);
    control.personIndex = index;
    onControlOpenChange(control);
  }

  const handleSaveControl = () => {
    /* Saves the open control to the interface and workspace. */
    (async () => {
      // a control must be open
      if (personOpen === undefined || controlOpen === null) {
        return;
      }

      // at least one control must be defined to save
      if (
        controlOpen.teamInclude.length === 0
        && controlOpen.teamExclude.length === 0
        && controlOpen.roomInclude.length === 0
        && controlOpen.roomExclude.length === 0
      ) {
        alert("At least one condition must be applied for the open control!");
        return;
      }

      // find the index of the control open in the dialogue menu
      const newControls = [...controls];
      const controlIndex = newControls.map(control => control.index).indexOf(controlOpen.index);

      // create a new control or swap the changed control with its existing entry
      if (controlIndex === -1) {
        // add a new control to the end of the order
        controlOpen.order = newControls.length + 1;
        newControls.push(structuredClone(controlOpen));
      } else {
        // modify an existing control where order is maintained
        newControls.splice(controlIndex, 1);
        newControls.push(structuredClone(controlOpen));
      }

      // inform the backend an object is saved
      (async () => {
        const success = commitObjects<Control>(newControls, "get-controls", "save-controls", onControlsChange);
        if (!success) {
          alert("Saving was not successful!");
          return;
        }

        alert(`Control for ${personOpen.firstName} ${personOpen.lastName} successfully saved to interface and workspace!`);
      })();

      // close the dialogue window
      handleControlClose();
    })();
  };

  // people options
  const allPeopleMenuItems = people.map(
    (person, index) => {
    return <MenuItem key={index} value={person.index}>{`${person.firstName} ${person.lastName}`}</MenuItem>
  });

  // team include and exclude options
  // cannot be the open person
  // must be a participant
  // cannot be a leader when the open person is a leader
  const teamPeopleMenuItems = people.filter(
    person => (
      personOpen === undefined
      || person.index !== personOpen.index
    )
    && person.participant === BooleanEnum.yes
    && (
      personOpen === undefined
      || personOpen.leader !== BooleanEnum.yes
      || person.leader !== BooleanEnum.yes
    )
  ).map(
    (person, index) => {
    return <MenuItem key={index} value={person.index}>{`${person.firstName} ${person.lastName}`}</MenuItem>
  });

  // room include and exclude options
  // cannot be the open person
  const peopleMenuItems = people.filter(
    person => personOpen === undefined || person.index !== personOpen.index
  ).map(
    (person, index) => {
    return <MenuItem key={index} value={person.index}>{`${person.firstName} ${person.lastName}`}</MenuItem>
  });

  return (
    <Dialog
      open={controlOpen !== null}
      onClose={handleControlClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          handleSaveControl();
        },
      }}
    >
      {/* title */}
      <DialogTitle>Enter Control Information</DialogTitle>
      <DialogContent css={dialogStyle}>
        <Stack spacing={4}>
          {/* person */}
          <FormControl variant="standard" sx={{ m: 1, width: 300 }} disabled={people.length < 2}>
            {/* title */}
            <InputLabel id="person-label">Person</InputLabel>

            {/* combo box */}
            <Select
              required
              labelId="person-label"
              value={personOpen === undefined ? "" : personOpen.index}
              onChange={(e) => handlePersonChange(e.target.value)}
            >
              {allPeopleMenuItems}
            </Select>
          </FormControl>

          {/* team include combo box */}
          <FormControl
            variant="standard"
            sx={{ m: 1, width: 300 }}
            disabled={
              people.length < 2
              || teamPeopleMenuItems.length === 0
              || (personOpen !== undefined && personOpen.participant === BooleanEnum.no)
            }
          >
            {/* title */}
            <InputLabel id="team-include-label">Include on Team</InputLabel>

            {/* combo box */}
            <Select
              labelId="team-include-label"
              multiple
              value={controlOpen === null ? [""] : controlOpen.teamInclude}
              onChange={(e) => handleControlPropertyChange("teamInclude", e.target.value)}
            >
              {teamPeopleMenuItems}
            </Select>
          </FormControl>

          {/* team exclude combo box */}
          <FormControl
            variant="standard"
            sx={{ m: 1, width: 300 }}
            disabled={
              people.length < 2
              || teamPeopleMenuItems.length === 0
              || (personOpen !== undefined && personOpen.participant === BooleanEnum.no)
            }
          >
            {/* title */}
            <InputLabel id="team-exclude-label">Exclude from Team</InputLabel>

            {/* combo box */}
            <Select
              labelId="team-exclude-label"
              multiple
              value={controlOpen === null ? [""] : controlOpen.teamExclude}
              onChange={(e) => handleControlPropertyChange("teamExclude", e.target.value)}
            >
              {teamPeopleMenuItems}
            </Select>
          </FormControl>

          {/* room include combo box */}
          <FormControl
            variant="standard"
            sx={{ m: 1, width: 300 }}
            disabled={
              people.length < 2
              || peopleMenuItems.length === 0
            }
          >
            {/* title */}
            <InputLabel id="room-include-label">Include in Room</InputLabel>

            {/* combo box */}
            <Select
              labelId="room-include-label"
              multiple
              value={controlOpen === null ? [""] : controlOpen.roomInclude}
              onChange={(e) => handleControlPropertyChange("roomInclude", e.target.value)}
            >
              {peopleMenuItems}
            </Select>
          </FormControl>

          {/* room exclude combo box */}
          <FormControl
            variant="standard"
            sx={{ m: 1, width: 300 }}
            disabled={
              people.length < 2
              || peopleMenuItems.length === 0
            }
          >
            {/* title */}
            <InputLabel id="room-exclude-label">Exclude from Room</InputLabel>

            {/* combo box */}
            <Select
              labelId="room-exclude-label"
              multiple
              value={controlOpen === null ? [""] : controlOpen.roomExclude}
              onChange={(e) => handleControlPropertyChange("roomExclude", e.target.value)}
            >
              {peopleMenuItems}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>

      {/* form controls */}
      <DialogActions>
        <Button onClick={handleControlClose}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ControlDialog