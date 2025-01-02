import { Person } from "types/peopleCard";

function getPeopleNames(
  people: Person[],
  indices: string[],
) : string[] {
  /*
  Converts a list of people indices to their full names.

  people
    People selected by the user.
  indices
    Unique identifiers for people.

  string[]
    Full names for each person found in the list of people.
  */
  return indices.map(personIndex => {
    // person must be found
    const personPosition = people.map(person => person.index).indexOf(personIndex);
    if (personPosition === -1) {
      return;
    }

    // collect full name of person
    const person = people[personPosition];
    return `${person.firstName} ${person.lastName}`;
  }).filter(name => name !== undefined);
}

export {
  getPeopleNames,
}