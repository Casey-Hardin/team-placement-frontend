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
import TextField from "@mui/material/TextField";
import { BooleanEnum } from "types/common";
import { Control } from "types/controlsCard";
import { Person } from "types/peopleCard";
import { Team } from "types/teamsCard";
import { commitObjects } from "utils/commitObjects";

const dialogStyle = css`
  padding: 20px;
`;

interface TeamDialogProps {
  people: Person[]
  controls: Control[]
  teams: Team[]
  teamOpen: Team | null
  leadersOpen: string[]
  onPeopleChange: (newPeople: Person[]) => void
  onControlsChange: (newControls: Control[]) => void
  onTeamsChange: (newTeams: Team[]) => void
  onTeamOpenChange: (team: Team | null) => void
  onLeadersOpenChange: (newLeaders: string[]) => void
}

function TeamDialog({
  people,
  controls,
  teams,
  teamOpen,
  leadersOpen,
  onPeopleChange,
  onControlsChange,
  onTeamsChange,
  onTeamOpenChange,
  onLeadersOpenChange,
} : TeamDialogProps) {
  /*
  Displays a dialog for teams information.

  people
    People defined by the user to sort into teams and rooms.
  controls
    Constraints defined by the user when surting people into teams and rooms.
  teams
    Teams defined by the user for sorting people.
  teamOpen
    Team entry open in the dialogue menu.
  leadersOpen
    Leaders open in the dialogue menu.
  onPeopleChange
    Function to change people in the interface.
  onControlsChange
    Function to change user controls in the interface.
  onTeamsChange
    Function to change teams in the interface.
  onTeamOpenChange
    Function to change the open team in the dialogue menu.
  onLeadersOpenChange
    Function to change the open leaders in the dialogue menu.
  */
  const handleTeamClose = () => {
    /* Closes the team dialogue window. */
    onTeamOpenChange(null);
  };

  const handleTeamPropertyChange = (key: keyof Team, value: boolean | null | string | string[]) => {
    /*
    Edits the value of an attribute for an open team.

    key
      Team attribute for a changed value.
    value
      New value for a team attribute.
    */
    // a team must be open
    if (teamOpen === null) {
      return;
    }

    // value cannot be null
    if (value === null) {
      value = "";
    }

    // set a value
    const team = structuredClone(teamOpen);
    team[key] = value;
    onTeamOpenChange(team);
  };

  const handleSaveTeam = () => {
    /* Saves the open team to the table and workspace. */
    (async () => {
      // a team must be open
      if (teamOpen === null) {
        return;
      }

      // find the index of the team open in the dialogue menu
      const newTeams = [...teams];
      const teamIndex = newTeams.map(team => team.index).indexOf(teamOpen.index);

      // create a new team or swap the changed team with its existing entry
      if (teamIndex === -1) {
        // find the index of the name of the team open in the dialogue menu
        const nameIndex = newTeams.map(team => team.name).indexOf(teamOpen.name);

        // add a new team if one does not already exist by the same name
        if (nameIndex === -1) {
          newTeams.push(structuredClone(teamOpen));
        }
      } else {
        // modify an existing team
        newTeams.splice(teamIndex, 1);
        newTeams.push(structuredClone(teamOpen));
      }

      // inform the backend an object is saved
      const success_teams = commitObjects(newTeams, "get-teams", "save-teams", onTeamsChange);
      if (!success_teams) {
        alert("Saving teams was not successful!");
        return;
      }

      // set leaders of teams
      const newPeople = [...people];
      newPeople.forEach(person => {
        // assign new team leaders
        if (leadersOpen.includes(person.index)) {
          person.leader = BooleanEnum.yes;
          person.team = teamOpen.name;
        }

        // assign demotions
        if (person.team === teamOpen.name && !leadersOpen.includes(person.index)) {
          person.leader = BooleanEnum.no;
          person.team = "";
        }
      });

      // inform the backend an object is saved
      const success_people = commitObjects(newPeople, "get-people", "save-people", onPeopleChange);
      if (!success_people) {
        alert("Saving people was not successful!");
        return;
      }

      // change controls to reflect leader status
      let newControls = [...controls];
      newControls.forEach(control => {
        const personOpen = newPeople.filter(person => person.index === control.personIndex)[0];
        const leader = personOpen.leader === BooleanEnum.yes;

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

      alert(`Team ${teamOpen.name} successfully saved to interface and workspace!`);

      // close the dialogue window
      handleTeamClose();
    })();
  };

  // people options
  // must be a participant
  // must not be a leader of another team
  people.sort((a, b) => a.firstName.localeCompare(b.firstName));
  const leaderMenuItems = people.filter(person => (
    person.participant === BooleanEnum.yes
    && (
      person.leader === BooleanEnum.no
      || teamOpen === null
      || person.team === teamOpen.name
    )
  )).map(
    (person, index) => {
    return <MenuItem key={index} value={person.index}>{`${person.firstName} ${person.lastName}`}</MenuItem>
  });

  return (
    <Dialog
      open={teamOpen !== null}
      onClose={handleTeamClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          handleSaveTeam();
        },
      }}
    >
      {/* title */}
      <DialogTitle>Enter Team Information</DialogTitle>
      <DialogContent css={dialogStyle}>
        <Stack spacing={4}>
          {/* name */}
          <TextField
            required
            placeholder="Super Awesome Team Name"
            label="Name"
            value={teamOpen === null ? "" : teamOpen.name}
            variant="standard"
            onChange={(e) => handleTeamPropertyChange("name", e.target.value)}
          />

          {/* leaders */}
          <FormControl variant="standard" sx={{ m: 1, width: 300 }} disabled={leaderMenuItems.length === 0}>
            {/* title */}
            <InputLabel id="leaders-label">Team Leaders</InputLabel>

            {/* combo box */}
            <Select
              labelId="leaders-label"
              multiple
              value={teamOpen === null ? [""] : leadersOpen}
              onChange={(e) => onLeadersOpenChange(Array.isArray(e.target.value) ? e.target.value : [e.target.value])}
              MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
            >
              {leaderMenuItems}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>

      {/* form controls */}
      <DialogActions>
        <Button onClick={handleTeamClose}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default TeamDialog