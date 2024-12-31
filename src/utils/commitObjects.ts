import { getObjects } from "adaptors/get_objects";
import { saveObject } from "adaptors/save_objects";
import { ObjectModel } from "types/common";

async function commitObjects<T extends ObjectModel>(
  newObjects: T[],
  getEndpoint: string,
  saveEndpoint: string,
  onObjectsChange: (newObjects: T[]) => void
) : Promise<boolean> {
  /*
  Changes objects in the workspace and the interface.

  newObjects
    New objects created by a user.
  getEndpoint
    Address to collect objects if saving is unsuccessful.
  saveEndpoint
    Address to save objects.
  onObjectsChange
    Function to change objects for the interface.

  boolean
    True if objects saved otherwise false.
  */
  return (async () => {
    // save objects to the backend
    const [savedObjects, success] = await saveObject<T>(saveEndpoint, newObjects);

    // re-collect objects from backend if save is unsuccessful
    let objects: T[] | null = savedObjects;
    if (!success || objects === null) {
      objects = await getObjects<T>(getEndpoint);
    }

    // set object in the interface and return whether the save was successful
    onObjectsChange(objects);
    return success;
  })();
}

export {
  commitObjects
}