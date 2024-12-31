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
import { sizeField } from "utils/roomFields";

const dialogStyle = css`
  padding: 20px;
`;

function RoomDialog({
  rooms,
  roomOpen,
  onRoomsChange,
  onRoomOpenChange,
} : {
  rooms: Room[]
  roomOpen: Room | null
  onRoomsChange: (newRooms: Room[]) => void
  onRoomOpenChange: (room: Room | null) => void
}) {
  /* Displays a dialog for room information. */
  const handleRoomClose = () => {
    /* Closes the room dialogue window. */
    onRoomOpenChange(null);
  };

  const handleRoomPropertyChange = (key: keyof Room, value: boolean | null | string | string[]) => {
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

      // create a new room or swap the changed room with its existing entry
      const newRooms = [...rooms];
      const roomIndex = newRooms.map(room => room.index).indexOf(roomOpen.index);
      if (roomIndex === -1) {
        newRooms.push(structuredClone(roomOpen));
      } else {
        newRooms.splice(roomIndex, 1);
        newRooms.push(structuredClone(roomOpen));
      }

      // inform the backend an object is saved
      (async () => {
        const success = commitObjects(newRooms, "get-rooms", "save-rooms", onRoomsChange);
        if (!success) {
          alert("Saving was not successful!");
          return;
        }

        alert(`Room ${roomOpen.name} successfully saved to interface and workspace!`);
      })();
    })();

    // close the dialogue window
    handleRoomClose();
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
      <DialogTitle>Enter Room Information</DialogTitle>
      <DialogContent css={dialogStyle}>
        <Stack spacing={4}>
          <TextField
            required
            placeholder="Amazingly Awesome Room Name"
            label="Name"
            value={roomOpen === null ? "" : roomOpen.name}
            variant="standard"
            onChange={(e) => handleRoomPropertyChange("name", e.target.value)}
          />
          <TextField
            required
            placeholder={sizeField.placeholder}
            error={roomOpen === null ? false : !sizeField.validate(roomOpen.size)}
            label="Size"
            type="number"
            value={roomOpen === null ? "" : roomOpen.size}
            variant="standard"
            onChange={(e) => handleRoomPropertyChange("size", e.target.value)}
            helperText={(roomOpen !== null && !sizeField.validate(roomOpen.size)) && sizeField.helperText}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleRoomClose}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default RoomDialog