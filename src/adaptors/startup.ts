import { BACKEND_ADDRESS } from "localConstants";
import { Control } from "types/controlsCard";
import { Nicknames } from "types/nicknamesCard";
import { Person } from "types/peopleCard";
import { Room } from "types/roomsCard";
import { Team } from "types/teamsCard";

interface StartupResponse {
  people: Person[],
  controls: Control[],
  teams: Team[],
  rooms: Room[],
  nicknames: Nicknames[],
}

async function startup() : Promise<[Nicknames[], Person[], Control[], Team[], Room[]]> {
  /*
  Collects nicknames, people, controls, teams and rooms from the workspace on startup.

  Nicknames[]
    Nicknames entries currently in the workspace.
  Person[]
    People currently in the workspace.
  Control[]
    User controls currently in the workspace.
  Team[]
    Teams currently in the workspace.
  Room[]
    Rooms currently in the workspace.
  */
  // communicate with backend
  const response = await fetch(
    `${BACKEND_ADDRESS}/startup`, {
    method: "GET",
    },
  );

  // handle error message
  if (!response.ok) {
    const details = await response.json();
    if (details.detail === "Not Found") {
      const message = "Startup Process could not connect to backend!";
      console.log(message);
      alert(message);
    } else {
      console.log(details.detail);
      alert(details.detail);
    }
    return [
      [] as Nicknames[],
      [] as Person[],
      [] as Control[],
      [] as Team[],
      [] as Room[],
    ];
  }

  // collect and de-select all objects
  const startupResponse: StartupResponse = await response.json();
  startupResponse.people.forEach(person => person.selected = false);
  startupResponse.controls.forEach(control => control.selected = false);
  startupResponse.teams.forEach(team => team.selected = false);
  startupResponse.rooms.forEach(room => room.selected = false);
  startupResponse.nicknames.forEach(nickname => nickname.selected = false);

  // return objects currently in the workspace
  return [
    startupResponse.nicknames,
    startupResponse.people,
    startupResponse.controls,
    startupResponse.teams,
    startupResponse.rooms,
  ];
}

export { startup };