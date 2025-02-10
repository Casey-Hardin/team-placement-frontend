import { css } from "@emotion/react";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { findPreferredPeople } from "adaptors/find_preferred_people";
import { DEFAULT_TEAM } from "localConstants";
import { BooleanEnum } from "types/common";
import { Control } from "types/controlsCard";
import { Nicknames } from "types/nicknamesCard";
import { Collective, Gender, Person } from "types/peopleCard";
import { Team } from "types/teamsCard";
import { commitObjects } from "utils/commitObjects";
import { ageField, firstNameField, lastNameField, teamNameField} from "utils/personFields";

const dialogStyle = css`
  padding: 20px;
`;

interface PersonDialogProps {
  nicknames: Nicknames[]
  people: Person[]
  controls: Control[]
  personOpen: Person | null
  teams: Team[]
  onPeopleChange: (newPeople: Person[]) => void
  onControlsChange: (newControls: Control[]) => void
  onTeamsChange: (newTeams: Team[]) => void
  onPersonOpenChange: (person: Person | null) => void
}

function PersonDialog({
  nicknames,
  people,
  controls,
  teams,
  personOpen,
  onPeopleChange,
  onControlsChange,
  onTeamsChange,
  onPersonOpenChange,
} : PersonDialogProps) {
  /*
  Displays a dialog for people information.

  nicknames
    Current nicknames defined globally for deciphering people preferences.
  controls
    Constraints defined by the user when surting people into teams and rooms.
  people
    People defined by the user to sort into teams and rooms.
  teams
    Teams defined by the user for sorting people.
  peopleOpen
    Person entry open in the dialogue menu.
  onPeopleChange
    Function to change people in the interface.
  onControlsChange
    Function to change user controls in the interface.
  onTeamsChange
    Function to change teams in the interface.
  onPersonOpenChange
    Function to change the open person in the dialogue menu.
  */
  const handlePersonClose = () => {
    /* Closes the person dialogue window. */
    onPersonOpenChange(null);
  };

  const handlePersonPropertyChange = (key: keyof Person, value: boolean | null | string | string[]) => {
    /*
    Edits the value of an attribute for an open person.

    key
      Person attribute for a changed value.
    value
      New value for a person attribute.
    */
    // a person must be open
    if (personOpen === null) {
      return;
    }

    // value cannot be null
    if (value === null) {
      value = "";
    }

    // set a value
    const person = structuredClone(personOpen);
    person[key] = value;

    // non-participants cannot lead teams
    if (key === "participant" && value === BooleanEnum.no) {
      person.team = "";
      person.leader = BooleanEnum.no;
    }

    // leaders of teams must participate
    if (key === "leader" && value === BooleanEnum.yes) {
      person.participant = BooleanEnum.yes;
    }

    // only leaders may have a team defined without the algorithm
    if (key === "leader" && value === BooleanEnum.no) {
      person.team = "";
    }

    // set the open person
    onPersonOpenChange(person);
  };

  const handleSavePerson = () => {
    /* Saves the open person to the workspace. */
    (async () => {
      // a person must be open
      if (personOpen === null) {
        return;
      }

      // all leaders must have a team name
      if (personOpen.leader === BooleanEnum.yes && personOpen.team === "") {
        alert("A team leader must be assigned to a team!");
        return;
      }

      // find the index of the person open in the dialogue menu
      const newPeople = [...people];
      const personIndex = newPeople.map(person => person.index).indexOf(personOpen.index);

      // create a new person or swap the changed person with its existing entry
      if (personIndex === -1) {
        // add a new person to the end of the order
        personOpen.order = newPeople.length + 1;
        newPeople.push(structuredClone(personOpen));
      } else {
        // modify an existing person where order is maintained
        newPeople.splice(personIndex, 1);
        newPeople.push(structuredClone(personOpen));
      }

      // the open person name may change, so people are re-collected for their preferences
      const [foundPeople, success_preferred] = await findPreferredPeople(nicknames, newPeople);
      if (!success_preferred || foundPeople === null) {
        alert("Saving people was not successful!");
        return;
      }
      onPeopleChange(newPeople);

      if (personOpen.leader === BooleanEnum.yes) {
        // change controls to reflect leader status
        let newControls = [...controls];
        newControls.forEach(control => {
          const controlPerson = newPeople.filter(person => person.index === control.personIndex)[0];
          const leader = controlPerson.leader === BooleanEnum.yes;

          control.teamInclude = control.teamInclude.filter(personIndex => {
            const teamPerson = newPeople.filter(person => person.index === personIndex)[0];
            return !leader || teamPerson.leader !== BooleanEnum.yes;
          });
          control.teamExclude = control.teamExclude.filter(personIndex => {
            const teamPerson = newPeople.filter(person => person.index === personIndex)[0];
            return !leader || teamPerson.leader !== BooleanEnum.yes;
          });
        });

        // remove controls without any people included or excluded after removing selected people
        newControls = newControls.filter(control =>
          control.teamInclude.length !== 0
          || control.teamExclude.length !== 0
          || control.roomInclude.length !== 0
          || control.roomExclude.length !== 0
        );

        // reset order for all controls remaining in the table
        newControls.forEach((control, index) => control.order = index + 1);

        // inform the backend objects were updated
        const success_controls = await commitObjects(
          newControls,
          "get-controls",
          "save-controls",
          onControlsChange,
        );
        if (!success_controls) {
          alert("Controls update was not successful!");
        }

        // find the index of the team for the person open in the dialogue menu
        const newTeams = [...teams];
        const teamIndex = newTeams.map(team => team.name).indexOf(personOpen.team);

        // create a new team if does not have an existing entry
        if (teamIndex === -1) {
          // add a new team
          const team: Team = structuredClone(DEFAULT_TEAM);
          team.name = personOpen.team;
          newTeams.push(team);
        }

        // inform the backend a team is saved
        const success_teams = commitObjects(newTeams, "get-teams", "save-teams", onTeamsChange);
        if (!success_teams) {
          alert("Saving teams was not successful!");
          return;
        }
      }

      alert(`Person ${personOpen.firstName} ${personOpen.lastName} successfully saved to interface and workspace!`);

      // close the dialogue window
      handlePersonClose();
    })();
  };

  // gender options
  const genderMenuItems = Object.values(Gender).map((gender, index) => {
    return <MenuItem key={index} value={gender}>{gender}</MenuItem>
  });

  // collective options
  const collectiveMenuItems = Object.values(Collective).map((collectiveStatus, index) => {
    return <MenuItem key={index} value={collectiveStatus}>{collectiveStatus}</MenuItem>
  });

  // people options
  // a person cannot select themselves
  const peopleMenuItems = people.filter(
    person => personOpen === null || person.index !== personOpen.index
  ).map(
    (person, index) => {
    return <MenuItem key={index} value={person.index}>{`${person.firstName} ${person.lastName}`}</MenuItem>
  });

  return (
    <Dialog
      open={personOpen !== null}
      onClose={handlePersonClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          handleSavePerson();
        },
      }}
    >
      {/* title */}
      <DialogTitle>Enter Person Information</DialogTitle>
      <DialogContent css={dialogStyle}>
        <Stack spacing={4}>
          {/* first name */}
          <TextField
            required
            placeholder={firstNameField.placeholder}
            label="First Name"
            value={personOpen === null ? "" : personOpen.firstName}
            variant="standard"
            onChange={(e) => handlePersonPropertyChange("firstName", e.target.value)}
          />

          {/* last name */}
          <TextField
            required
            placeholder={lastNameField.placeholder}
            label="Last Name"
            value={personOpen === null ? "" : personOpen.lastName}
            variant="standard"
            onChange={(e) => handlePersonPropertyChange("lastName", e.target.value)}
          />

          {/* age */}
          <TextField
            required
            placeholder={ageField.placeholder}
            error={personOpen === null ? false : !ageField.validate(personOpen.age)}
            label="Age"
            type="number"
            value={personOpen === null ? "" : personOpen.age}
            variant="standard"
            onChange={(e) => handlePersonPropertyChange("age", e.target.value)}
            helperText={(personOpen !== null && !ageField.validate(personOpen.age)) && ageField.helperText}
          />

          {/* gender */}
          <TextField
            select
            label="Gender"
            value={personOpen === null ? "" : personOpen.gender}
            variant="standard"
            onChange={(e) => handlePersonPropertyChange("gender", e.target.value)}
          >
            {genderMenuItems}
          </TextField>

          {/* first time */}
          <FormControlLabel
            label="First Time Status"
            control={
              <Checkbox
                checked={
                  personOpen === null
                  ? false
                  : personOpen.firstTime === BooleanEnum.yes
                    ? true
                    : false
                }
                onChange={(e) => handlePersonPropertyChange("firstTime", e.target.checked ? BooleanEnum.yes : BooleanEnum.no)}
              />
            }
          />

          {/* collective */}
          <TextField
            select
            label="Collective Status"
            value={personOpen === null ? "" : personOpen.collective}
            variant="standard"
            onChange={(e) => handlePersonPropertyChange("collective", e.target.value)}
          >
            {collectiveMenuItems}
          </TextField>

          {/* preferred people raw */}
          <TextField
            label="Preferred People as Written"
            value={personOpen === null ? "" : personOpen.preferredPeopleRaw}
            variant="standard"
            onChange={(e) => handlePersonPropertyChange("preferredPeopleRaw", e.target.value)}
          />

          {/* preferred people */}
          <FormControl variant="standard" sx={{ m: 1, width: 300 }} disabled={people.length === 0}>
            {/* title */}
            <InputLabel id="preferred-people-label">Preferred People</InputLabel>

            {/* combo box */}
            <Select
              labelId="preferred-people-label"
              multiple
              label="Preferred People"
              value={personOpen === null ? [""] : personOpen.preferredPeople}
              onChange={(e) => handlePersonPropertyChange("preferredPeople", e.target.value)}
            >
              {peopleMenuItems}
            </Select>
          </FormControl>

          {/* leader */}
          <FormControlLabel
            label="Team Leader"
            control={
              <Checkbox
                checked={
                  personOpen === null
                  ? false
                  : personOpen.leader === BooleanEnum.yes
                    ? true
                    : false
                }
                onChange={(e) => handlePersonPropertyChange("leader", e.target.checked ? BooleanEnum.yes : BooleanEnum.no)}
              />
            }
          />

          {/* team */}
          {/* active when leader is yes */}
          {personOpen !== null && personOpen.leader === BooleanEnum.yes &&
            <Autocomplete
              options={teams.map(team => team.name)}
              selectOnFocus
              clearOnBlur
              freeSolo
              value={personOpen === null ? "" : personOpen.team}
              onInputChange={(_, newValue: string | null) => {handlePersonPropertyChange("team", newValue)}}
              renderInput={(params) => (
                <TextField
                  required
                  {...params}
                  placeholder={teamNameField.placeholder}
                  label="Team Name"
                  variant="standard"
                />
              )}
            />
          }

          {/* participant */}
          {/* leaders must participate */}
          <FormControlLabel
            label="Team Participant"
            disabled={personOpen !== null && personOpen.leader === BooleanEnum.yes}
            control={
              <Checkbox
                checked={
                  personOpen === null
                  ? false
                  : personOpen.participant === BooleanEnum.yes
                    ? true
                    : false
                }
                onChange={(e) => handlePersonPropertyChange("participant", e.target.checked ? BooleanEnum.yes : BooleanEnum.no)}
              />
            }
          />
        </Stack>
      </DialogContent>

      {/* form controls */}
      <DialogActions>
        <Button onClick={handlePersonClose}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default PersonDialog