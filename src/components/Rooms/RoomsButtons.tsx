import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { exportObjects } from "adaptors/export_objects";
import { DEFAULT_ROOM } from "localConstants";
import { HeadCell } from "types/common";
import { Person } from "types/peopleCard";
import { Room, RoomTable } from "types/roomsCard";
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

interface RoomsButtonsProps {
  people: Person[]
  rooms: Room[]
  headCells: HeadCell<Room>[]
  roomsTable: RoomTable[]
  onPeopleChange: (newPeople: Person[]) => void
  onRoomsChange: (newRooms: Room[]) => void
  onRoomOpenChange: (newRoom: Room | null) => void
}

function RoomsButtons(
{
  people,
  rooms,
  headCells,
  roomsTable,
  onPeopleChange,
  onRoomsChange,
  onRoomOpenChange,
} : RoomsButtonsProps) {
  /*
  Buttons to manage rooms.

  people
    People defined by the user to sort into teams and rooms.
  rooms
    Rooms where people will be housed.
  headCells
    Column names keyed to their object property.
  roomsTable
    Rooms as displayed in the table of the interface.
  onPeopleChange
    Function to change people in the interface.
  onRoomsChange
    Function to change rooms in the interface.
  onRoomOpenChange
    Function to change the open room entry in the dialogue menu.
  */
  const handleDeleteClick = () => {
    /*
    Deletes selected rooms from the rooms table.
    Removes selected rooms from people in people table.
    */
    (async () => {
      // delete selected rooms in the interface and the workspace
      const deleted = await handleDeleteObjectsClick(rooms, "get-rooms", "save-rooms", onRoomsChange);
      if (!deleted) {
        return;
      }

      // remove selected rooms for further processing
      const newRooms = [...rooms.filter(room => !room.selected)];

      // remove room status from people of selected rooms
      const newPeople = [...people];
      newPeople.forEach(person => {
        if (!newRooms.map(room => room.name).includes(person.room)) {
          person.room = "";
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
      await exportObjects("rooms", headCells, roomsTable);
    })();
  }

  return (
    <Box css={buttonContainerStyle}>
      {/* add button */}
      <Button
        variant="contained"
        css={toolbarButtonStyle}
        onClick={() => handleAddObjectClick(rooms, DEFAULT_ROOM, onRoomOpenChange)}
      >
        Add Room
      </Button>

      {/* delete button */}
      <Button
        variant="contained"
        css={toolbarButtonStyle}
        onClick={handleDeleteClick}
      >
        Delete Rooms
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

export default RoomsButtons