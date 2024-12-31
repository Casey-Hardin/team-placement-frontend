import { useState } from "react";
import { css } from "@emotion/react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ObjectTable from "components/ObjectTable";
import RoomDialog from "components/Rooms/RoomDialog";
import RoomsButtons from "components/Rooms/RoomsButtons";
import { HeadCell } from "types/common";
import { Room } from "types/roomsCard";

// table columns
const headCells: HeadCell<Room>[] = [
  {
    id: "name",
    label: "Name",
  },
  {
    id: "size",
    label: "Size",
  },
  {
    id: "age",
    label: "Age Std.",
  },
  {
    id: "collectiveNew",
    label: "New to Collective",
  },
  {
    id: "collectiveNewish",
    label: "Newer to Collective",
  },
  {
    id: "collectiveOldish",
    label: "Older to Collective",
  },
  {
    id: "collectiveOld",
    label: "Old to Collective",
  },
  {
    id: "male",
    label: "Men",
  },
  {
    id: "female",
    label: "Women",
  },
  {
    id: "firstTime",
    label: "First Time",
  },
];

const tableContainerStyle = css`
  display: inline-block;
  margin: 10px 10px 10px 0px;
  width: calc(100% - 30px);
`;

const titleStyle = css`
  text-align: left;
`;

function RoomsCard(
{
  rooms,
  onRoomsChange,
} : {
  rooms: Room[]
  onRoomsChange: (newRooms: Room[]) => void
}) {
  /* Displays a table with room information. */
  const [roomOpen, setRoomOpen] = useState<Room | null>(null);

  const handleRoomOpenChange = (newRoom: Room | null) => {
    setRoomOpen(newRoom);
  };

  return (
    <>
      <Card css={tableContainerStyle}>
        <CardContent>
          <Typography variant="body1" css={titleStyle}>Room</Typography>
          <ObjectTable<Room>
            objects={rooms}
            identityObjectKey="name"
            headCells={headCells}
            onObjectsChange={onRoomsChange}
            onObjectOpenChange={handleRoomOpenChange}
          />
          <RoomsButtons
            rooms={rooms}
            headCells={headCells}
            onRoomsChange={onRoomsChange}
            onRoomOpenChange={handleRoomOpenChange}
          />
        </CardContent>
      </Card>

     <RoomDialog
      rooms={rooms}
      roomOpen={roomOpen}
      onRoomsChange={onRoomsChange}
      onRoomOpenChange={handleRoomOpenChange}
     />
    </>
  );
}

export default RoomsCard