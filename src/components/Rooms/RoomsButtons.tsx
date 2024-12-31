import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { exportObjects } from "adaptors/export_objects";
import { DEFAULT_ROOM } from "localConstants";
import { HeadCell } from "types/common";
import { Room } from "types/roomsCard";
import { handleAddObjectClick } from "utils/addObjectClick";
import { handleDeleteObjectsClick } from "utils/deleteObjectsClick";

const buttonContainerStyle = css`
  margin: -10px auto -10px auto;
  width: fit-content;
`;

const toolbarButtonStyle = css`
  margin: 10px;
  min-width: 150px;
`;

function RoomsButtons(
{
  rooms,
  headCells,
  onRoomsChange,
  onRoomOpenChange,
} : {
  rooms: Room[]
  headCells: HeadCell<Room>[]
  onRoomsChange: (newRooms: Room[]) => void
  onRoomOpenChange: (newRoom: Room | null) => void
}) {
  /* Displays buttons to interact with room information. */
  const handleExportObjectsClick = () => {
    /* Exports objects to an Excel workbook. */
    (async () => {
      await exportObjects("rooms", headCells, rooms);
    })();
  }

  return (
    <>
      {/* action buttons */}
      <Box css={buttonContainerStyle}>
        <Button
          variant="contained"
          css={toolbarButtonStyle}
          onClick={() => handleAddObjectClick(rooms, DEFAULT_ROOM, onRoomOpenChange)}
        >
          Add Room
        </Button>
        <Button
          variant="contained"
          css={toolbarButtonStyle}
          onClick={() => handleDeleteObjectsClick(rooms, "get-rooms", "save-rooms", onRoomsChange)}
        >
          Delete Rooms
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

export default RoomsButtons