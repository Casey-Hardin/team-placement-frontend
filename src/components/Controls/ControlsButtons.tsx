import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { exportObjects } from "adaptors/export_objects";
import { DEFAULT_CONTROL } from "localConstants";
import { Direction, HeadCell } from "types/common";
import { Control, ControlTable } from "types/controlsCard";
import { Person } from "types/peopleCard";
import { handleAddObjectClick } from "utils/addObjectClick";
import { handleDeleteObjectsClick } from "utils/deleteObjectsClick";
import { handleMoveObjectsClick } from "utils/moveObjectsClick";

const buttonContainerStyle = css`
  margin: -10px auto -10px auto;
  width: fit-content;
`;

const toolbarButtonStyle = css`
  margin: 10px;
  min-width: 150px;
`;

interface ControlsButtonsProps {
  people: Person[]
  controls: Control[]
  headCells: HeadCell<Control>[]
  controlsTable: ControlTable[]
  onControlsChange: (newControls: Control[]) => void
  onControlOpenChange: (newControl: Control | null) => void
}

function ControlsButtons(
{
  people,
  controls,
  headCells,
  controlsTable,
  onControlsChange,
  onControlOpenChange,
} : ControlsButtonsProps) {
  /*
  Buttons to manage controls.

  people
    People defined by the user to sort into teams and rooms.
  controls
    Constraints defined by the user when surting people into teams and rooms.
  headCells
    Column names keyed to their object property.
  controlsTable
    Controls as displayed in the table of the interface.
  onControlsChange
    Function to change user controls in the interface.
  onControlsOpenChange
    Function to change the open controls entry in the dialogue menu.
  */
  const handleAddClick = () => {
    /* Opens a dialogue window for control definition. */
    // multiple people must exist
    if (people.length < 2) {
      alert("At least 2 people are needed to define a control!");
      return;
    }

    // open a control dialogue window
    handleAddObjectClick(controls, DEFAULT_CONTROL, onControlOpenChange);
  };

  const handleExportObjectsClick = () => {
    /* Exports objects to an Excel workbook. */
    (async () => {
      await exportObjects("controls", headCells, controlsTable);
    })();
  }

  return (
    <Box css={buttonContainerStyle}>
      {/* add button */}
      <Button
        variant="contained"
        css={toolbarButtonStyle}
        onClick={handleAddClick}
      >
        Add Control
      </Button>

      {/* delete button */}
      <Button
        variant="contained"
        css={toolbarButtonStyle}
        onClick={() => handleDeleteObjectsClick(controls, "get-controls", "save-controls", onControlsChange)}
      >
        Delete Controls
      </Button>

      {/* move up button */}
      <Button
        variant="contained"
        css={toolbarButtonStyle}
        onClick={() => handleMoveObjectsClick(controls, Direction.up, "get-controls", "save-controls", onControlsChange)}
      >
        Move Up
      </Button>

      {/* move down button */}
      <Button
        variant="contained"
        css={toolbarButtonStyle}
        onClick={() => handleMoveObjectsClick(controls, Direction.down, "get-controls", "save-controls", onControlsChange)}
      >
        Move Down
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

export default ControlsButtons