import { css } from "@emotion/react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { Room } from "types/roomsCard";
import { commitObjects } from "utils/commitObjects";
import { capacityField } from "utils/roomFields";

const dialogStyle = css`
  padding: 20px;
`;

interface RoomDialogProps {
  rooms: Room[]
  roomOpen: Room | null
  onRoomsChange: (newRooms: Room[]) => void
  onRoomOpenChange: (room: Room | null) => void
}

function RoomDialog({
  rooms,
  roomOpen,
  onRoomsChange,
  onRoomOpenChange,
} : RoomDialogProps) {
  /*
  Displays a dialog for teams information.

  rooms
    Rooms defined by the user for housing people.
  roomOpen
    Room entry open in the dialogue menu.
  onRoomsChange
    Function to change rooms in the interface.
  onRoomOpenChange
    Function to change the open room in the dialogue menu.
  */
  const handleRoomClose = () => {
    /* Closes the room dialogue window. */
    onRoomOpenChange(null);
  };

  const handleRoomPropertyChange = (key: keyof Room, value: boolean | null | string) => {
    /*
    Edits the value of an attribute for an open room.

    key
      Room attribute for a changed value.
    value
      New value for a room attribute.
    */
    // a room must be open
    if (roomOpen === null) {
      return;
    }

    // value cannot be null
    if (value === null) {
      value = "";
    }

    // set a value
    const room = structuredClone(roomOpen);
    room[key] = value;
    onRoomOpenChange(room);
  };

  const handleSaveRoom = () => {
    /* Saves the open room to the table and workspace. */
    (async () => {
      // a room must be open
      if (roomOpen === null) {
        return;
      }

      // find the index of the room open in the dialogue menu
      const newRooms = [...rooms];
      const roomIndex = newRooms.map(room => room.index).indexOf(roomOpen.index);

      // create a new room or swap the changed room with its existing entry
      if (roomIndex === -1) {
        // find the index of the name of the room open in the dialogue menu
        const nameIndex = newRooms.map(room => room.name).indexOf(roomOpen.name);

        if (nameIndex === -1) {
          // add a new room
          newRooms.push(structuredClone(roomOpen));
        } else {
          // replace existing room
          newRooms.splice(roomIndex, 1);
          newRooms.push(structuredClone(roomOpen));
        }
      } else {
        // modify an existing room
        newRooms.splice(roomIndex, 1);
        newRooms.push(structuredClone(roomOpen));
      }

      // inform the backend an object is saved
      const success = commitObjects(newRooms, "get-rooms", "save-rooms", onRoomsChange);
      if (!success) {
        alert("Saving rooms was not successful!");
        return;
      }

      alert(`Room ${roomOpen.name} successfully saved to interface and workspace!`);

      // close the dialogue window
      handleRoomClose();
    })();
  };

  return (
    <Dialog
      open={roomOpen !== null}
      onClose={handleRoomClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          handleSaveRoom();
        },
      }}
    >
      {/* title */}
      <DialogTitle>Enter Room Information</DialogTitle>
      <DialogContent css={dialogStyle}>
        <Stack spacing={4}>
          {/* name */}
          <TextField
            required
            placeholder="Amazingly Awesome Room Name"
            label="Name"
            value={roomOpen === null ? "" : roomOpen.name}
            variant="standard"
            onChange={(e) => handleRoomPropertyChange("name", e.target.value)}
          />

          {/* capacity */}
          <TextField
            required
            placeholder={capacityField.placeholder}
            error={roomOpen === null ? false : !capacityField.validate(roomOpen.capacity)}
            label="Capacity"
            type="number"
            value={roomOpen === null ? "" : roomOpen.capacity}
            variant="standard"
            onChange={(e) => handleRoomPropertyChange("capacity", e.target.value)}
            helperText={(roomOpen !== null && !capacityField.validate(roomOpen.capacity)) && capacityField.helperText}
          />
        </Stack>
      </DialogContent>

      {/* form controls */}
      <DialogActions>
        <Button onClick={handleRoomClose}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default RoomDialog