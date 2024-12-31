import { ObjectModel } from "types/common";
import { commitObjects } from "utils/commitObjects";

async function handleDeleteObjectsClick<T extends ObjectModel>(
  objects: T[],
  getEndpoint: string,
  saveEndpoint: string,
  onObjectsChange: (objects: T[]) => void,
) : Promise<boolean> {
  /*
  Deletes objects from the workspace.

  objects
    Objects with entries selected for deletion from the interface and workspace.
  getEndpoint
    Address to collect objects if saving is unsuccessful.
  saveEndpoint
    Address to save only non-selected objects.
  onObjectsChange
    Function to change objects for the interface.
  */
  // at least one object must be selected
  const selectedObjects = objects.filter(object => object.selected);
  if (selectedObjects.length === 0) {
    alert("No items selected!");
    return false;
  }

  // ask user to proceed with deleting objects from database
  const proceed = confirm(`Commit to delete items from workspace and interface?`);
  if (!(proceed)) {
    return false;
  }

  // re-assign orders to current objects
  objects.forEach(object => {
    // order must be defined
    if (object.order === undefined) {
      return;
    }

    // number of entries deleted with an order below the current object
    const places = selectedObjects.filter(
      selObject => selObject.order !== undefined
      && object.order !== undefined
      && selObject.order <= object.order
    ).length;

    // new order for each object
    object.order = object.order - places;
  });

  // inform the backend object(s) were deleted
  const success = await commitObjects(
    objects.filter(object => !object.selected),
    getEndpoint,
    saveEndpoint,
    onObjectsChange,
  );
  if (!success) {
    alert("Deletion was not successful!");
    return false;
  }

  alert(`${selectedObjects.length} items successfully deleted from interface and workspace!`);
  return true;
}

export {
  handleDeleteObjectsClick,
}