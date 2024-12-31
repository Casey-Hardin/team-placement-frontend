import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { exportObjects } from "adaptors/export_objects";
import { DEFAULT_TEAM } from "localConstants";
import { handleAddObjectClick } from "utils/addObjectClick";
import { handleDeleteObjectsClick } from "utils/deleteObjectsClick";
import { Team } from "types/teamsCard";
import { HeadCell } from "types/common";

const buttonContainerStyle = css`
  margin: -10px auto -10px auto;
  width: fit-content;
`;

const toolbarButtonStyle = css`
  margin: 10px;
  min-width: 150px;
`;

function TeamsButtons(
{
  teams,
  headCells,
  convertDisplay,
  onTeamsChange,
  onTeamOpenChange,
} : {
  teams: Team[]
  headCells: HeadCell<Team>[]
  convertDisplay: (key: string, value: string) => string
  onTeamsChange: (newTeams: Team[]) => void
  onTeamOpenChange: (newTeam: Team | null) => void
}) {
  /* Displays buttons to interact with team information. */
  const handleExportObjectsClick = () => {
    /* Exports objects to an Excel workbook. */
    (async () => {
      await exportObjects("teams", headCells, teams, convertDisplay);
    })();
  }

  return (
    <>
      {/* action buttons */}
      <Box css={buttonContainerStyle}>
        <Button
          variant="contained"
          css={toolbarButtonStyle}
          onClick={() => handleAddObjectClick(teams, DEFAULT_TEAM, onTeamOpenChange)}
        >
          Add Team
        </Button>
        <Button
          variant="contained"
          css={toolbarButtonStyle}
          onClick={() => handleDeleteObjectsClick(teams, "get-teams", "save-teams", onTeamsChange)}
        >
          Delete Teams
        </Button>
        <Button
          variant="contained"
          css={toolbarButtonStyle}
          onClick={handleExportObjectsClick}
        >
          Export to Excel
        </Button>
      </Box>
    </>
  );
}

export default TeamsButtons