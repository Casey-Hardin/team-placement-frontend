import { BACKEND_ADDRESS } from "localConstants";
import { ObjectModel } from "types/common";

async function saveObject<T1 extends ObjectModel>(endpoint: string, object: T1[]) : Promise<[T1[] | null, boolean]> {
  /*
  Saves an object or list of objects to the workspace.

  endpoint
    Path of endpoint on the backend.
  object | null
    Object(s) to save to the workspace.

  boolean
    True if the call was successful otherwise false.
  */
  // communicate with backend
  const response = await fetch(
    `${BACKEND_ADDRESS}/${endpoint}`, {
    method: "POST",
    body: JSON.stringify(object),
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

  // return success status
  const results: T1[] | null = await response.json();
  if (results !== null) {
    results.forEach(object => object.selected = false);
  }
  return [results, response.ok];
}

export { saveObject };