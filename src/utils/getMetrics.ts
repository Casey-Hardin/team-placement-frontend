import { BooleanEnum, Metrics } from "types/common";
import { Collective, Gender, Person } from "types/peopleCard";

function getStandardDeviation (array: number[]) : number | null {
  /*
  Calculates standard deviation over a data set.

  array
    Values upon which standard deviation will be calculated.

  number
    Standard deviation of the data set.
  */
  // array must have values
  if (array.length === 0) {
    return null
  }

  // calculate standard deviation
  const n = array.length
  const mean = array.reduce((a, b) => a + b) / n
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}

function getMetrics (people: Person[]) : Metrics {
  /*
  Calculates metrics for a set of people.

  people
    Set of people for who metrics will be applied.

  Metrics
    Metrics for the set of people.
  */
  // calculate standard deviation for ages of all team members
  const ageStandardDeviation = getStandardDeviation(people.map(person => Number(person.age)));

  // return team metrics
  return {
    size: String(people.length),
    age: String(ageStandardDeviation === null ? "N / A" : ageStandardDeviation.toFixed(2)),
    collectiveNew: String(people.filter(person => person.collective === Collective.new).length),
    collectiveNewish: String(people.filter(person => person.collective === Collective.newish).length),
    collectiveOldish: String(people.filter(person => person.collective === Collective.oldish).length),
    collectiveOld: String(people.filter(person => person.collective === Collective.old).length),
    male: String(people.filter(person => person.gender === Gender.male).length),
    female: String(people.filter(person => person.gender === Gender.female).length),
    firstTime: String(people.filter(person => person.firstTime === BooleanEnum.yes).length),
  };
}

export {
  getMetrics,
}