import { useState } from "react";
import { css } from "@emotion/react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ObjectTable from "components/ObjectTable";
import PeopleButtons from "components/People/PeopleButtons";
import PersonDialog from "components/People/PersonDialog";
import { HeadCell } from "types/common";
import { Control } from "types/controlsCard";
import { Nicknames } from "types/nicknamesCard";
import { Person, PersonTable } from "types/peopleCard";
import { Team } from "types/teamsCard";
import { getPeopleNames } from "utils/getPeopleNames";

// table columns
const headCells: HeadCell<Person>[] = [
  {
    id: "order",
    label: "Order",
  },
  {
    id: "firstName",
    label: "First Name",
  },
  {
    id: "lastName",
    label: "Last Name",
  },
  {
    id: "age",
    label: "Age",
  },
  {
    id: "gender",
    label: "Gender",
  },
  {
    id: "firstTime",
    label: "First Time Status",
  },

  {
    id: "collective",
    label: "Collective Status",
  },
  {
    id: "preferredPeopleRaw",
    label: "Preferred People as Written",
  },
  {
    id: "preferredPeopleDisplay",
    label: "Preferred People",
  },
  {
    id: "leader",
    label: "Leader",
  },
  {
    id: "team",
    label: "Team Name",
  },
  {
    id: "room",
    label: "Room Name",
  },
  {
    id: "participant",
    label: "Team Participant",
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

interface PeopleCardProps {
  people: Person[]
  nicknames: Nicknames[]
  controls: Control[]
  teams: Team[]
  onPeopleChange: (newPeople: Person[]) => void
  onControlsChange: (newControls: Control[]) => void
  onTeamsChange: (newTeams: Team[]) => void
}

function PeopleCard(
{
  nicknames,
  people,
  controls,
  teams,
  onPeopleChange,
  onControlsChange,
  onTeamsChange,
} : PeopleCardProps) {
  /*
  Displays a table with people information.

  nicknames
    Nicknames defined globally for deciphering people preferences.
  people
    People defined by the user to sort into teams and rooms.
  controls
    Constraints defined by the user when surting people into teams and rooms.
  teams
    Teams where people will be sorted into.
  onPeopleChange
    Function to change people in the interface.
  onControlsChange
    Function to change user controls in the interface.
  onTeamsChange
    Function to change teams in the interface.
  */
  const [personOpen, setPersonOpen] = useState<Person | null>(null);

  const handlePersonOpenChange = (newPerson: Person | null) => {
    /*
    Changes a person in the dialogue menu.

    newPerson
      New person to save to the person object in the dialogue menu.
    */
    setPersonOpen(newPerson);
  };

  // convert people to their table data
  const peopleTable: PersonTable[] = [];
  people.forEach(person => {
    // clone person
    const personTable = person as PersonTable;

    // assign full names of preferred people for each person
    personTable.preferredPeopleDisplay = getPeopleNames(people, person.preferredPeople);
    peopleTable.push(personTable);
  });

  return (
    <>
      <Card css={tableContainerStyle}>
        <CardContent>
          {/* title */}
          <Typography variant="body1" css={titleStyle}>People</Typography>

          {/* table */}
          <ObjectTable<Person, PersonTable>
            objects={people}
            headCells={headCells}
            objectsDisplay={peopleTable}
            initialSortKey="order"
            filters={["leader", "team", "room", "participant"]}
            onObjectsChange={onPeopleChange}
            onObjectOpenChange={handlePersonOpenChange}
          />

          {/* buttons */}
          <PeopleButtons
            nicknames={nicknames}
            people={people}
            controls={controls}
            teams={teams}
            headCells={headCells}
            peopleTable={peopleTable}
            onPeopleChange={onPeopleChange}
            onControlsChange={onControlsChange}
            onTeamsChange={onTeamsChange}
            onPersonOpenChange={handlePersonOpenChange}
          />
        </CardContent>
      </Card>

      {/* dialogue menu */}
      <PersonDialog
        nicknames={nicknames}
        people={people}
        teams={teams}
        personOpen={personOpen}
        onPeopleChange={onPeopleChange}
        onTeamsChange={onTeamsChange}
        onPersonOpenChange={handlePersonOpenChange}
      />
    </>
  );
}

export default PeopleCard