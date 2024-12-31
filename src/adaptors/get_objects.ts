import { BACKEND_ADDRESS } from "localConstants";
import { ObjectModel } from "types/common";

async function getObjects<T extends ObjectModel>(endpoint: string) : Promise<T[]> {
  /*
  Collects objects from the workspace.

  endpoint
    Path of endpoint on the backend.

  T[]
    Objects within the workspace.
  */
  // communicate with backend
  const response = await fetch(
    `${BACKEND_ADDRESS}/${endpoint}`, {
    method: "GET",
    },
  );

  // handle error message
  if (!response.ok) {
    const details = await response.json();
    if (details.detail === "Not Found") {
      const message = "Could not connect to backend!";
      console.log(message);
    } else {
      console.log(details.detail);
    }
    return [] as T[];
  }

  // de-select and return all objects
  const objects: T[] = await response.json();
  objects.forEach(object => object.selected = false);

  // return objects
  return objects;
}

export { getObjects };