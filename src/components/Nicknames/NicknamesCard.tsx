import { useState } from "react";
import { css } from "@emotion/react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import NicknamesButtons from "components/Nicknames/NicknamesButtons";
import NicknamesDialog from "components/Nicknames/NicknamesDialog";
import ObjectTable from "components/ObjectTable";
import { HeadCell } from "types/common";
import { Nicknames } from "types/nicknamesCard";
import { Person } from "types/peopleCard";

// table columns
const headCells: HeadCell<Nicknames>[] = [
    {
        id: "firstName",
        label: "First Name",
    },
    {
        id: "lastName",
        label: "Last Name",
    },
    {
      id: "nicknames",
      label: "Nicknames",
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

interface NicknamesCardProps {
  nicknames: Nicknames[]
  people: Person[]
  onNicknamesChange: (newNicknames: Nicknames[]) => void
  onPeopleChange: (newPeople: Person[]) => void
}

function NicknamesCard(
{
  nicknames,
  people,
  onNicknamesChange,
  onPeopleChange,
} : NicknamesCardProps) {
  /*
  Displays a table with nicknames information.

  nicknames
    Current nicknames defined globally for deciphering people preferences.
  people
    People defined by the user to sort into teams and rooms.
  onNicknamesChange
    Function to change nicknames in the interface.
  onPeopleChange
    Function to change people in the interface.
  */
  const [nicknamesOpen, setNicknamesOpen] = useState<Nicknames | null>(null);

  const handleNicknamesOpenChange = (newNicknames: Nicknames | null) => {
    /*
    Changes nicknames in the dialogue menu.

    newNicknames
      New nicknames to save to the nicknames object in the dialogue menu.
    */
    setNicknamesOpen(newNicknames);
  };

  return (
    <>
      <Card css={tableContainerStyle}>
        <CardContent>
          {/* title */}
          <Typography variant="body1" css={titleStyle}>Nicknames</Typography>

          {/* table */}
          <ObjectTable<Nicknames, Nicknames>
            objects={nicknames}
            initialSortKey="firstName"
            headCells={headCells}
            onObjectsChange={onNicknamesChange}
            onObjectOpenChange={handleNicknamesOpenChange}
          />

          {/* buttons */}
          <NicknamesButtons
            nicknames={nicknames}
            people={people}
            headCells={headCells}
            onNicknamesChange={onNicknamesChange}
            onPeopleChange={onPeopleChange}
            onNicknamesOpenChange={handleNicknamesOpenChange}
          />
        </CardContent>
      </Card>

      {/* dialogue menu */}
      <NicknamesDialog
        nicknames={nicknames}
        people={people}
        nicknamesOpen={nicknamesOpen}
        onNicknamesChange={onNicknamesChange}
        onPeopleChange={onPeopleChange}
        onNicknamesOpenChange={handleNicknamesOpenChange}
      />
    </>
  );
}

export default NicknamesCard