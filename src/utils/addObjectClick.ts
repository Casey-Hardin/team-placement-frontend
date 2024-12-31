import { ObjectModel } from "types/common";

async function handleAddObjectClick<T extends ObjectModel>(
  objects: T[],
  defaultObject: T,
  onObjectOpenChange: (newObject: T | null) => void
) : Promise<void> {
  /*
  Opens a form dialogue to add an object.

  objects
    Objects represented in the interface.
  defaultObject
    Default attributes for a new object.
  onObjectOpenChange
    Object to show in a form dialogue in the interface.
  */
  // collect the first selected object or use the default object
  const selectedObjects = objects.filter(object => object.selected);
  const newObjectOpen = selectedObjects.length !== 0 ? structuredClone(selectedObjects[0]) : structuredClone(defaultObject);

  // save object to interface for user definition
  newObjectOpen.index = "";
  newObjectOpen.selected = false;
  onObjectOpenChange(newObjectOpen);
}

export {
  handleAddObjectClick,
}