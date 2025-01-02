import { useState } from "react";
import { css } from "@emotion/react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ObjectTable from "components/ObjectTable";
import RoomDialog from "components/Rooms/RoomDialog";
import RoomsButtons from "components/Rooms/RoomsButtons";
import { HeadCell } from "types/common";
import { Room, RoomTable } from "types/roomsCard";
import { Person } from "types/peopleCard";
import { getMetrics } from "utils/getMetrics";

// table columns
const headCells: HeadCell<Room>[] = [
  {
    id: "name",
    label: "Name",
  },
  {
    id: "capacity",
    label: "Capacity",
  },
  {
    id: "occupants",
    label: "Occupants",
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

interface RoomsCardProps {
  people: Person[]
  rooms: Room[]
  onPeopleChange: (newPeople: Person[]) => void
  onRoomsChange: (newRooms: Room[]) => void
}

function RoomsCard(
{
  people,
  rooms,
  onPeopleChange,
  onRoomsChange,
} : RoomsCardProps) {
  /*
  Displays a table with room information.

  people
    People defined by the user to sort into teams and rooms.
  rooms
    Rooms where people will be housed.
  onPeopleChange
    Function to change people in the interface.
  onRoomsChange
    Function to change rooms in the interface.
  */
  const [roomOpen, setRoomOpen] = useState<Room | null>(null);

  const handleRoomOpenChange = (newRoom: Room | null) => {
    /*
    Changes a room in the dialogue menu.

    newRoom
      New room to save to the room object in the dialogue menu.
    */
    setRoomOpen(newRoom);
  };

  // convert people to their table data
  const roomsTable: RoomTable[] = [];
  rooms.forEach(room => {
    // clone room
    const roomTable = room as RoomTable;

    // people in the room
    const members = people.filter(person => (person.room === room.name));

    // assign team metrics
    const metrics = getMetrics(members);
    roomTable.occupants = metrics.size;
    roomTable.age = metrics.age;
    roomTable.collectiveNew = metrics.collectiveNew;
    roomTable.collectiveNewish = metrics.collectiveNewish;
    roomTable.collectiveOldish = metrics.collectiveOldish;
    roomTable.collectiveOld = metrics.collectiveOld;
    roomTable.male = metrics.male;
    roomTable.female = metrics.female;
    roomTable.firstTime = metrics.firstTime;

    // set table rows
    roomsTable.push(roomTable);
  });

  return (
    <>
      <Card css={tableContainerStyle}>
        <CardContent>
          {/* title */}
          <Typography variant="body1" css={titleStyle}>Room</Typography>

          {/* table */}
          <ObjectTable<Room, RoomTable>
            objects={rooms}
            headCells={headCells}
            objectsDisplay={roomsTable}
            initialSortKey="name"
            onObjectsChange={onRoomsChange}
            onObjectOpenChange={handleRoomOpenChange}
          />

          {/* buttons */}
          <RoomsButtons
            people={people}
            rooms={rooms}
            headCells={headCells}
            roomsTable={roomsTable}
            onPeopleChange={onPeopleChange}
            onRoomsChange={onRoomsChange}
            onRoomOpenChange={handleRoomOpenChange}
          />
        </CardContent>
      </Card>

      {/* dialogue menu */}
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