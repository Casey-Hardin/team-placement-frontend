import { BACKEND_ADDRESS } from "localConstants";
import { ObjectModel } from "types/common";

async function saveObject<T1 extends ObjectModel>(endpoint: string, objects: T1[]) : Promise<[T1[] | null, boolean]> {
  /*
  Saves an object or list of objects to the workspace.

  endpoint
    Path of endpoint on the backend.
  objects | null
    Objects to save to the workspace.

  boolean
    True if the call was successful otherwise false.
  */
  // communicate with backend
  const response = await fetch(
    `${BACKEND_ADDRESS}/${endpoint}`, {
    method: "POST",
    body: JSON.stringify(objects),
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
    results.forEach(result => {
      const objectsIndex = objects.map(object => object.index).indexOf(result.index);
      result.selected = objectsIndex === -1 ? false : objects[objectsIndex].selected;
    });
  }
  return [results, response.ok];
}

export { saveObject };