import { useEffect, useState } from "react";
import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { runTeams } from "adaptors/runTeams";
import { runRooms } from "adaptors/runRooms";
import { startup } from "adaptors/startup";
import AppBar from "components/AppBar";
import ControlsCard from "components/Controls/ControlsCard";
import NicknamesCard from "components/Nicknames/NicknamesCard";
import PeopleCard from "components/People/PeopleCard";
import RoomsCard from "components/Rooms/RoomsCard";
import TeamsCard from "components/Teams/TeamsCard";
import { Control } from "types/controlsCard";
import { Nicknames } from "types/nicknamesCard";
import { Person } from "types/peopleCard";
import { Room } from "types/roomsCard";
import { Team } from "types/teamsCard";
import { commitObjects } from "utils/commitObjects";

const boxStyle = css`
  margin-top: 50px;
  text-align: center;
`;

function Content() {
  /* Defines page content. */
  const [nicknames, setNicknames] = useState<Nicknames[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [resetTeams, setResetTeams] = useState(false);
  const [resetRooms, setResetRooms] = useState(false);

  useEffect(() => {
    /* Imports nicknames, people, controls, teams and rooms from the workspace. */
    (async () => {
      const [newNicknames, newPeople, newControls, newTeams, newRooms] = await startup();
      setPeople(newPeople);
      setControls(newControls);
      setTeams(newTeams);
      setRooms(newRooms);
      setNicknames(newNicknames)
    })();
  }, []);

  const handleNicknamesChange = (newNicknames: Nicknames[]) : void => {
    /*
    Changes the list of nicknames.

    newNicknames
      Nicknames defined by the user.
    */
    setNicknames(newNicknames);
    setResetTeams(true);
    setResetRooms(true);
  };

  const handlePeopleChange = (newPeople: Person[]) : void => {
    /*
    Changes the list of people.

    newPeople
      People defined by the user.
    */
    setPeople(newPeople);
    setResetTeams(true);
    setResetRooms(true);
  };

  const handleControlsChange = (newControls: Control[]) : void => {
    /*
    Changes the list of controls.

    newControls
      Controls defined by the user.
    */
    setControls(newControls);
    setResetTeams(true);
    setResetRooms(true);
  };

  const handleTeamsChange = (newTeams: Team[]) : void => {
    /*
    Changes the list of teams.

    newTeams
      Teams defined by the user.
    */
    setTeams(newTeams);
    setResetTeams(true);
  };

  const handleRoomsChange = (newRooms: Room[]) : void => {
    /*
    Changes the list of rooms.

    newRooms
      Rooms defined by the user.
    */
    setRooms(newRooms);
    setResetRooms(true);
  };

  const handleResetClick = () => {
    /* Resets people, controls, teams and rooms tables. */
    if (people.length === 0 && controls.length === 0 && teams.length === 0 && rooms.length === 0) {
      alert("No table content to delete!");
      return;
    }

    const proceed = confirm("Are you sure you want to clear contents from all tables?");
    if (!proceed) {
      return;
    }

    (async () => {
      // capture objects that did not save properly
      const unsuccessful: string[] = [];

      // inform the backend to clear all objects
      const success_people = await commitObjects([], "get-people", "save-people", handlePeopleChange);
      if (!success_people) {
        unsuccessful.push("people");
      }

      const success_controls = await commitObjects([], "get-controls", "save-controls", handleControlsChange);
      if (!success_controls) {
        unsuccessful.push("controls");
      }

      const success_teams = await commitObjects([], "get-teams", "save-teams", handleTeamsChange);
      if (!success_teams) {
        unsuccessful.push("teams");
      }

      const success_rooms = await commitObjects([], "get-rooms", "save-rooms", handleTeamsChange);
      if (!success_rooms) {
        unsuccessful.push("rooms");
      }

      // alert the user of objects that did not save successfully
      if (unsuccessful.length !== 0) {
        alert(`Objects ${unsuccessful} were not cleared from the workspace!`);
      }
    })();
  };

  const handleRunTeamsClick = () => {
    /* Runs the Teams algorithm. */
    // people and teams are needed for the teams algorithm
    // controls are optional
    if (people.length === 0 || teams.length === 0) {
      alert("People and Teams are needed to perform team analysis!");
      return;
    }

    (async () => {
      // send objects to the backend
      const [newPeople, success] = await runTeams(people, controls, teams);
      if (!success || newPeople === null) {
        return;
      }

      // save updated people to the interface
      setPeople(newPeople);
      setResetTeams(false);
    })();
  }

  const handleRunRoomsClick = () => {
    /* Runs the Rooms algorithm. */
    // people and rooms are needed for the rooms algorithm
    // controls are optional
    if (people.length === 0 || rooms.length === 0) {
      alert("People and Rooms are needed to perform room analysis!");
      return;
    }

    (async () => {
      // send objects to the backend
      const [newPeople, success] = await runRooms(people, controls, rooms);
      if (!success || newPeople === null) {
        return;
      }

      // save updated people to the interface
      setPeople(newPeople);
      setResetRooms(false);
    })();
  }

  return (
    <>
      {/* application title */}
      <AppBar
        resetTeams={resetTeams}
        resetRooms={resetRooms}
        onResetClick={handleResetClick}
        onRunTeamsClick={handleRunTeamsClick}
        onRunRoomsClick={handleRunRoomsClick}
      />

      {/* page content */}
      <Card css={css`height: fit-content;`}>
        <CardContent>
          <Box css={boxStyle}>
            {/* nicknames tile */}
            <NicknamesCard
              nicknames={nicknames}
              people={people}
              onNicknamesChange={handleNicknamesChange}
              onPeopleChange={handlePeopleChange}
            />

            {/* people tile */}
            <PeopleCard
              nicknames={nicknames}
              people={people}
              controls={controls}
              teams={teams}
              onPeopleChange={handlePeopleChange}
              onControlsChange={handleControlsChange}
              onTeamsChange={handleTeamsChange}
            />

            {/* controls tile */}
            <ControlsCard
              people={people}
              controls={controls}
              onControlsChange={handleControlsChange}
            />

            {/* teams tile */}
            <TeamsCard
              people={people}
              teams={teams}
              onPeopleChange={handlePeopleChange}
              onTeamsChange={handleTeamsChange}
            />

            {/* rooms tile */}
            <RoomsCard
              people={people}
              rooms={rooms}
              onPeopleChange={handlePeopleChange}
              onRoomsChange={handleRoomsChange}
            />
          </Box>
        </CardContent>
      </Card>
    </>
  );
}

export default Content