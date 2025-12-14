import { useState } from "react";
import { css } from "@emotion/react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ObjectTable from "components/ObjectTable";
import TeamsButtons from "components/Teams/TeamsButtons";
import TeamDialog from "components/Teams/TeamDialog";
import { BooleanEnum, HeadCell } from "types/common";
import { Person } from "types/peopleCard";
import { Team, TeamTable } from "types/teamsCard";
import { getPeopleNames } from "utils/getPeopleNames";
import { getMetrics } from "utils/getMetrics";
import { Control } from "types/controlsCard";

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

interface TeamsCardProps {
  people: Person[]
  controls: Control[]
  teams: Team[]
  onPeopleChange: (newPeople: Person[]) => void
  onControlsChange: (newControls: Control[]) => void
  onTeamsChange: (newTeams: Team[]) => void
}

function TeamsCard(
{
  people,
  controls,
  teams,
  onPeopleChange,
  onControlsChange,
  onTeamsChange,
} : TeamsCardProps) {
  /*
  Displays a table with team information.

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
  const [teamOpen, setTeamOpen] = useState<Team | null>(null);
  const [leadersOpen, setLeadersOpen] = useState<string[]>([]);

  const handleTeamOpenChange = (newTeam: Team | null) => {
    /*
    Changes a team in the dialogue menu.

    newTeam
      New team to save to the team object in the dialogue menu.
    */
    setTeamOpen(newTeam);

    // collect leaders for the open team
    const leaders = people.filter(person => (
      newTeam !== null
      && person.leader === BooleanEnum.yes
      && person.team === newTeam.name
    )).map(person => person.index);

    // set leaders within the dialogue menu
    setLeadersOpen(leaders);
  };

  const handleLeadersOpenChange = (newLeaders: string[]) => {
    /*
    Changes leaders in the dialogue menu.

    newLeaders
      New leaders for the team object in the dialogue menu.
    */
    setLeadersOpen(newLeaders);
  };

  // convert people to their table data
  const teamsTable: TeamTable[] = [];
  teams.forEach(team => {
    // clone team
    const teamTable = team as TeamTable;

    // people on the team
    const members = people.filter(person => (
      person.team === team.name
    ));
    const leaders = members.filter(person => (
      person.leader === BooleanEnum.yes
    ));

    // assign team metrics
    const metrics = getMetrics(members);
    teamTable.size = metrics.size;
    teamTable.age = metrics.age;
    teamTable.collectiveNew = metrics.collectiveNew;
    teamTable.collectiveNewish = metrics.collectiveNewish;
    teamTable.collectiveOldish = metrics.collectiveOldish;
    teamTable.collectiveOld = metrics.collectiveOld;
    teamTable.male = metrics.male;
    teamTable.female = metrics.female;
    teamTable.firstTime = metrics.firstTime;

    // assign full names of leaders for each team
    teamTable.leaders = getPeopleNames(
      people,
      leaders.map(leader => leader.index)
    );

    // set table rows
    teamsTable.push(teamTable);
  });

  return (
    <>
      <Card css={tableContainerStyle}>
        <CardContent>
          {/* title */}
          <Typography variant="body1" css={titleStyle}>Team</Typography>

          {/* table */}
          <ObjectTable<Team, TeamTable>
            objects={teams}
            headCells={headCells}
            objectsDisplay={teamsTable}
            initialSortKey="name"
            onObjectsChange={onTeamsChange}
            onObjectOpenChange={handleTeamOpenChange}
          />

          {/* buttons */}
          <TeamsButtons
            people={people}
            teams={teams}
            headCells={headCells}
            teamsTable={teamsTable}
            onPeopleChange={onPeopleChange}
            onTeamsChange={onTeamsChange}
            onTeamOpenChange={handleTeamOpenChange}
          />
        </CardContent>
      </Card>

      {/* dialogue menu */}
     <TeamDialog
      people={people}
      controls={controls}
      teams={teams}
      teamOpen={teamOpen}
      leadersOpen={leadersOpen}
      onPeopleChange={onPeopleChange}
      onControlsChange={onControlsChange}
      onTeamsChange={onTeamsChange}
      onTeamOpenChange={handleTeamOpenChange}
      onLeadersOpenChange={handleLeadersOpenChange}
     />
    </>
  );
}

export default TeamsCard