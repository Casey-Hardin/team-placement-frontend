import { BACKEND_ADDRESS } from "localConstants";
import { Nicknames } from "types/nicknamesCard";
import { Person } from "types/peopleCard";

async function findPreferredPeople(nicknames: Nicknames[], people: Person[]) : Promise<[Person[] | null, boolean]> {
  /*
  Updates people with preferences from nicknames.

  nicknames
    Nicknames defined by the user.
  people
    People as defined prior to a change in nicknames.

  Person[] | null
    People with updated preferences.
  boolean
    True if the call was successful otherwise false.
  */
  // communicate with backend
  const response = await fetch(
    `${BACKEND_ADDRESS}/find-preferred-people`, {
    method: "POST",
    body: JSON.stringify({nicknames: nicknames, people: people}),
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
  const results: Person[] | null = await response.json();
  if (results !== null) {
    results.forEach(person => person.selected = false);
  }
  return [results, response.ok];
}

export { findPreferredPeople };