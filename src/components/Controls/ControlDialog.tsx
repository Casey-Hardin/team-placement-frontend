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
import { Control } from "types/controlsCard";
import { Person } from "types/peopleCard";
import { commitObjects } from "utils/commitObjects";

const dialogStyle = css`
  padding: 20px;
`;

function ControlDialog({
  people,
  controls,
  controlOpen,
  onControlsChange,
  onControlOpenChange,
} : {
  people: Person[]
  controls: Control[]
  controlOpen: Control | null
  onControlsChange: (newPeople: Control[]) => void
  onControlOpenChange: (person: Control | null) => void
}) {
  /* Displays a table with controls information. */
  const peopleOpen = people.filter(person => controlOpen !== null && person.index === controlOpen.personIndex);
  let personOpen = null;
  if (peopleOpen.length !== 0) {
    personOpen = peopleOpen[0]; 
  }

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
    onControlOpenChange(control);
  };

  const handlePersonChange = (index: string) => {
    // a control must be open
    if (controlOpen === null) {
      return;
    }

    const peopleFound = people.filter(person => controlOpen !== null && person.index === index);
    let personFound: Person | null = null;
    if (peopleFound.length !== 0) {
      personFound = peopleFound[0]; 
    }
    if (personFound === null) {
      return;
    }

    // set a value
    const control = structuredClone(controlOpen);
    control.personIndex = index;
    control.firstName = personFound.firstName;
    control.lastName = personFound.lastName;
    onControlOpenChange(control);
  }

  const handleSaveControl = () => {
    /* Saves the open control to the table and workspace. */
    (async () => {
      // a control must be open
      if (personOpen === null || controlOpen === null) {
        return;
      }

      // create a new control or swap the changed control with its existing entry
      const newControls = [...controls];
      const controlIndex = newControls.map(control => control.index).indexOf(controlOpen.index);
      if (controlIndex === -1) {
        controlOpen.order = newControls.length + 1;
        newControls.push(structuredClone(controlOpen));
      } else {
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
    })();

    // close the dialogue window
    handleControlClose();
  };

  const allPeopleMenuItems = people.map(
    (person, index) => {
    return <MenuItem key={index} value={person.index}>{`${person.firstName} ${person.lastName}`}</MenuItem>
  });

  const peopleMenuItems = people.filter(
    person => personOpen === null || person.index !== personOpen.index
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
      <DialogTitle>Enter Control Information</DialogTitle>
      <DialogContent css={dialogStyle}>
        <Stack spacing={4}>
          <FormControl variant="standard" sx={{ m: 1, width: 300 }} disabled={people.length === 0}>
            <InputLabel id="person-label">Person</InputLabel>
            <Select
              labelId="person-label"
              value={personOpen === null ? "" : personOpen.index}
              onChange={(e) => handlePersonChange(e.target.value)}
            >
              {allPeopleMenuItems}
            </Select>
          </FormControl>
          <FormControl variant="standard" sx={{ m: 1, width: 300 }} disabled={people.length === 0}>
            <InputLabel id="team-include-label">Include on Team</InputLabel>
            <Select
              labelId="team-include-label"
              multiple
              value={controlOpen === null ? [""] : controlOpen.teamInclude}
              onChange={(e) => handleControlPropertyChange("teamInclude", e.target.value)}
            >
              {peopleMenuItems}
            </Select>
          </FormControl>
          <FormControl variant="standard" sx={{ m: 1, width: 300 }} disabled={people.length === 0}>
            <InputLabel id="team-exclude-label">Exclude from Team</InputLabel>
            <Select
              labelId="team-exclude-label"
              multiple
              value={controlOpen === null ? [""] : controlOpen.teamExclude}
              onChange={(e) => handleControlPropertyChange("teamExclude", e.target.value)}
            >
              {peopleMenuItems}
            </Select>
          </FormControl>
          <FormControl variant="standard" sx={{ m: 1, width: 300 }} disabled={people.length === 0}>
            <InputLabel id="room-include-label">Include in Room</InputLabel>
            <Select
              labelId="room-include-label"
              multiple
              value={controlOpen === null ? [""] : controlOpen.roomInclude}
              onChange={(e) => handleControlPropertyChange("roomInclude", e.target.value)}
            >
              {peopleMenuItems}
            </Select>
          </FormControl>
          <FormControl variant="standard" sx={{ m: 1, width: 300 }} disabled={people.length === 0}>
            <InputLabel id="room-exclude-label">Exclude from Room</InputLabel>
            <Select
              disabled={people.length === 0}
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
      <DialogActions>
        <Button onClick={handleControlClose}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ControlDialog