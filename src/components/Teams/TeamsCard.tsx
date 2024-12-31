import { useState } from "react";
import { css } from "@emotion/react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ObjectTable from "components/ObjectTable";
import TeamsButtons from "components/Teams/TeamsButtons";
import TeamDialog from "components/Teams/TeamDialog";
import { HeadCell } from "types/common";
import { Person } from "types/peopleCard";
import { Team } from "types/teamsCard";

// table columns
const headCells: HeadCell<Team>[] = [
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
  {
    id: "leaders",
    label: "Leaders",
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

function TeamsCard(
{
  people,
  teams,
  onTeamsChange,
} : {
  people: Person[]
  teams: Team[]
  onTeamsChange: (newTeams: Team[]) => void
}) {
  /* Displays a table with team information. */
  const [teamOpen, setTeamOpen] = useState<Team | null>(null);

  const handleTeamOpenChange = (newTeam: Team | null) => {
    setTeamOpen(newTeam);
  };

  const convertDisplay = (key: string, value: string | string[]) : string => {
    if (key !== "leaders") {
      if (Array.isArray(value)) {
        return value.join(",");
      } else {
        return value;
      }
    }

    const values: string[] = Array.isArray(value) ? value : value.split(",");
    const names = values.map(personIndex => {
      const personPosition = people.map(person => person.index).indexOf(personIndex);
      if (personPosition === -1) {
        return;
      }

      const person = people[personPosition];
      return `${person.firstName} ${person.lastName}`;
    }).filter(name => name !== undefined);
    return names.join(",\n")
  }

  /*
  // convert nicknames to their table data
  const nicknamesTable: NicknamesTable[] = [];
  nicknames.forEach(nickname => {
    const nicknameEntry = nickname as NicknamesTable;
    nicknameEntry.selected = false;
    nicknamesTable.push(nicknameEntry);
  });
  */

  return (
    <>
      <Card css={tableContainerStyle}>
        <CardContent>
          <Typography variant="body1" css={titleStyle}>Team</Typography>
          <ObjectTable<Team>
            objects={teams}
            identityObjectKey="name"
            headCells={headCells}
            convertDisplay={convertDisplay}
            onObjectsChange={onTeamsChange}
            onObjectOpenChange={handleTeamOpenChange}
          />
          <TeamsButtons
            teams={teams}
            headCells={headCells}
            convertDisplay={convertDisplay}
            onTeamsChange={onTeamsChange}
            onTeamOpenChange={handleTeamOpenChange}
          />
        </CardContent>
      </Card>

     <TeamDialog
      people={people}
      teams={teams}
      teamOpen={teamOpen}
      onTeamsChange={onTeamsChange}
      onTeamOpenChange={handleTeamOpenChange}
     />
    </>
  );
}

export default TeamsCard