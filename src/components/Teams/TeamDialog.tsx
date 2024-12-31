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
import { Person } from "types/peopleCard";
import { Team } from "types/teamsCard";
import { commitObjects } from "utils/commitObjects";

const dialogStyle = css`
  padding: 20px;
`;

function TeamDialog({
  people,
  teams,
  teamOpen,
  onTeamsChange,
  onTeamOpenChange,
} : {
  people: Person[]
  teams: Team[]
  teamOpen: Team | null
  onTeamsChange: (newTeams: Team[]) => void
  onTeamOpenChange: (team: Team | null) => void
}) {
  /* Displays a dialog for team information. */
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

      // create a new team or swap the changed team with its existing entry
      const newTeams = [...teams];
      const teamIndex = newTeams.map(team => team.index).indexOf(teamOpen.index);
      if (teamIndex === -1) {
        newTeams.push(structuredClone(teamOpen));
      } else {
        newTeams.splice(teamIndex, 1);
        newTeams.push(structuredClone(teamOpen));
      }

      // inform the backend an object is saved
      (async () => {
        const success = commitObjects(newTeams, "get-teams", "save-teams", onTeamsChange);
        if (!success) {
          alert("Saving was not successful!");
          return;
        }

        alert(`Team ${teamOpen.name} successfully saved to interface and workspace!`);
      })();
    })();

    // close the dialogue window
    handleTeamClose();
  };

  const peopleMenuItems = people.map(
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
      <DialogTitle>Enter Team Information</DialogTitle>
      <DialogContent css={dialogStyle}>
        <Stack spacing={4}>
          <TextField
            required
            placeholder="Super Awesome Team Name"
            label="Name"
            value={teamOpen === null ? "" : teamOpen.name}
            variant="standard"
            onChange={(e) => handleTeamPropertyChange("name", e.target.value)}
          />
          <FormControl variant="standard" sx={{ m: 1, width: 300 }} disabled={people.length === 0}>
            <InputLabel id="leaders-label">Team Leaders</InputLabel>
            <Select
              disabled={people.length === 0}
              labelId="leaders-label"
              multiple
              value={teamOpen === null ? [""] : teamOpen.leaders}
              onChange={(e) => handleTeamPropertyChange("leaders", e.target.value)}
            >
              {peopleMenuItems}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleTeamClose}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default TeamDialog