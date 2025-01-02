import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { exportObjects } from "adaptors/export_objects";
import { DEFAULT_TEAM } from "localConstants";
import { BooleanEnum, HeadCell } from "types/common";
import { Person } from "types/peopleCard";
import { Team, TeamTable } from "types/teamsCard";
import { handleAddObjectClick } from "utils/addObjectClick";
import { commitObjects } from "utils/commitObjects";
import { handleDeleteObjectsClick } from "utils/deleteObjectsClick";

const buttonContainerStyle = css`
  margin: -10px auto -10px auto;
  width: fit-content;
`;

const toolbarButtonStyle = css`
  margin: 10px;
  min-width: 150px;
`;

interface TeamsButtonsProps {
  people: Person[]
  teams: Team[]
  headCells: HeadCell<Team>[]
  teamsTable: TeamTable[]
  onPeopleChange: (newPeople: Person[]) => void
  onTeamsChange: (newTeams: Team[]) => void
  onTeamOpenChange: (newTeam: Team | null) => void
}

function TeamsButtons(
{
  people,
  teams,
  headCells,
  teamsTable,
  onPeopleChange,
  onTeamsChange,
  onTeamOpenChange,
} : TeamsButtonsProps) {
  /*
  Buttons to manage teams.

  people
    People defined by the user to sort into teams and rooms.
  teams
    Teams where people will be sorted into.
  headCells
    Column names keyed to their object property.
  teamsTable
    Teams as displayed in the table of the interface.
  onPeopleChange
    Function to change people in the interface.
  onTeamsChange
    Function to change teams in the interface.
  onTeamOpenChange
    Function to change the open team entry in the dialogue menu.
  */
  const handleDeleteClick = () => {
    /*
    Deletes selected teams from the teams table.
    Removes selected teams from people in people table.
    Demotes leaders of selected teams in people table.
    */
    (async () => {
      // delete selected teams in the interface and the workspace
      const deleted = await handleDeleteObjectsClick(teams, "get-teams", "save-teams", onTeamsChange);
      if (!deleted) {
        return;
      }

      // remove selected teams for further processing
      const newTeams = [...teams.filter(team => !team.selected)];

      // remove leadership and team status from people of selected teams
      const newPeople = [...people];
      newPeople.forEach(person => {
        if (!newTeams.map(team => team.name).includes(person.team)) {
          person.team = "";
          person.leader = BooleanEnum.no;
        }
      });

      // inform the backend objects were updated
      const success_people = await commitObjects(
        newPeople,
        "get-people",
        "save-people",
        onPeopleChange,
      );
      if (!success_people) {
        alert("People were not updated successfully!");
      }
    })();
  };

  const handleExportObjectsClick = () => {
    /* Exports objects to an Excel workbook. */
    (async () => {
      await exportObjects("teams", headCells, teamsTable);
    })();
  }

  return (
    <Box css={buttonContainerStyle}>
      {/* add button */}
      <Button
        variant="contained"
        css={toolbarButtonStyle}
        onClick={() => handleAddObjectClick(teams, DEFAULT_TEAM, onTeamOpenChange)}
      >
        Add Team
      </Button>

      {/* delete button */}
      <Button
        variant="contained"
        css={toolbarButtonStyle}
        onClick={handleDeleteClick}
      >
        Delete Teams
      </Button>

      {/* export button */}
      <Button
        variant="contained"
        css={toolbarButtonStyle}
        onClick={handleExportObjectsClick}
      >
        Export to Excel
      </Button>
    </Box>
  );
}

export default TeamsButtons