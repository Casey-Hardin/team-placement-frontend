import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { exportObjects } from "adaptors/export_objects";
import { DEFAULT_CONTROL } from "localConstants";
import { Direction, HeadCell } from "types/common";
import { Control } from "types/controlsCard";
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

function ControlsButtons(
{
  controls,
  headCells,
  convertDisplay,
  onControlsChange,
  onControlOpenChange,
} : {
  controls: Control[]
  headCells: HeadCell<Control>[]
  convertDisplay: (key: string, value: string | string[]) => string
  onControlsChange: (newControls: Control[]) => void
  onControlOpenChange: (newControl: Control | null) => void
}) {
  /* Displays a table with controls information. */
  const handleExportObjectsClick = () => {
    /* Exports objects to an Excel workbook. */
    (async () => {
      await exportObjects("controls", headCells, controls, convertDisplay);
    })();
  }

  return (
    <>
      {/* action buttons */}
      <Box css={buttonContainerStyle}>
        <Button
          variant="contained"
          css={toolbarButtonStyle}
          onClick={() => handleAddObjectClick(controls, DEFAULT_CONTROL, onControlOpenChange)}
        >
          Add Control
        </Button>
        <Button
          variant="contained"
          css={toolbarButtonStyle}
          onClick={() => handleDeleteObjectsClick(controls, "get-controls", "save-controls", onControlsChange)}
        >
          Delete Controls
        </Button>
        <Button
          variant="contained"
          css={toolbarButtonStyle}
          onClick={() => handleMoveObjectsClick(controls, Direction.up, "get-controls", "save-controls", onControlsChange)}
        >
          Move Up
        </Button>
        <Button
          variant="contained"
          css={toolbarButtonStyle}
          onClick={() => handleMoveObjectsClick(controls, Direction.down, "get-controls", "save-controls", onControlsChange)}
        >
          Move Down
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

export default ControlsButtons