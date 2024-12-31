import { Order } from "types/common";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) : number {
  /*
  Determines if the value for a key on b is more or less than the same value on a.

  a
    First value for comparison.
  b
    Second value for comparison.
  orderBy
    Property of object to sort objects by.

  number
    Negative if out of order, Positive if in order or 0 if objects are tied for the given property.
  */
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<T>(order: Order, orderBy: keyof T): (
  a: T,
  b: T,
) => number {
  /*
  Sorts columns by one of their properties.

  order
    Direction to sort objects in.
  orderBy
    Property of object to sort objects by.

  number
    Negative if out of order, Positive if in order or 0 if objects are tied for the given property.
  */
  return order === Order.desc
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export { getComparator }