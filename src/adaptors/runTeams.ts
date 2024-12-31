import { BACKEND_ADDRESS } from "localConstants";
import { Control } from "types/controlsCard";
import { Person } from "types/peopleCard";
import { Team } from "types/teamsCard";

async function runTeams(people: Person[], controls: Control[], teams: Team[]) : Promise<[Person[] | null, boolean]> {
  /*
  Runs the Teams algorithm from the workspace.

  people
    People to group into teams based on demographics and preferences.
  controls
    Optional user controls to consider when assigning people to teams.
  teams
    Teams where people will be placed.

  Person[] | null
    People updated with teams from the algorithm or null if unsuccessful.
  boolean
    True if the call was successful otherwise false.
  */
  // communicate with backend
  const response = await fetch(
    `${BACKEND_ADDRESS}/run-teams`, {
    method: "POST",
    body: JSON.stringify({people: people, controls: controls, teams: teams}),
    headers: {"Content-Type": "application/json"},
    },
  );

  // handle error message
  if (!response.ok) {
    const details = await response.json();
    console.log(details.detail.msg);
    alert(details.detail.msg);
    return [null, response.ok];
  }

  // return updated people and success status
  const newPeople: Person[] | null = await response.json();
  return [newPeople, response.ok];
}

export { runTeams };