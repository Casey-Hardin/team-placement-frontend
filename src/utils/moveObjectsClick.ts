import { Direction, ObjectOrderModel } from "types/common";
import { commitObjects } from "utils/commitObjects";

async function handleMoveObjectsClick<T extends ObjectOrderModel>(
  objects: T[],
  direction: Direction,
  getEndpoint: string,
  saveEndpoint: string,
  onObjectsChange: (objects: T[]) => void,
) {
  /*
  Moves object order within the workspace.

  objects
    Objects represented within a table on the interface.
  direction
    Move an object either up or down within the table in the interface.
  getEndpoint
    Address to collect objects if saving to the workspace is unsuccessful.
  saveEndpoint
    Address to save objects to the workspace.
  onObjectsChange
    Function to change objects represented within a table on the interface.
  */
  // an object must be selected
  const selectedObjects = objects.filter(object => object.selected);
  if (selectedObjects.length === 0) {
    alert("No items selected!");
    return;
  }

  // sort objects ascending for moving up and descending for moving down
  // this helps with assigning new orders to de-selected objects
  const selectedOrders = selectedObjects.map(object => object.order);
  selectedOrders.sort(function(a, b){return direction === Direction.up ? a - b : b - a});

  // collect instructions for moving selected objects
  const newOrders: {[key: number]: number} = {};
  selectedOrders.forEach(order => {
    if (direction === Direction.up) {
      // object cannot be lowered further than its current position
      if (order <= 1 || Object.values(newOrders).includes(order - 1)) {
        newOrders[order] = order;
        return;
      }

      // decrement object order -> move up
      newOrders[order] = order - 1;
    } else {
      // object cannot be raised further than its current position
      if (order >= objects.length || Object.values(newOrders).includes(order + 1)) {
        newOrders[order] = order;
        return;
      }

      // increment object order -> move down
      newOrders[order] = order + 1;
    }
  });

  // move up -> [1, 2, 3, 4, ...]
  // move down -> [..., 4, 3, 2, 1]
  const orders = Array(objects.length).fill(0).map((_, index) => direction === Direction.up ? index + 1 : objects.length - index);

  // move objects either up or down
  objects.forEach(object => {
    // re-order selected objects
    if (Object.keys(newOrders).includes(String(object.order))) {
      object.order = newOrders[object.order];
      return;
    }

    // objects are given the next value in orders from their current position
    // skipping the new locations of selected objects
    if (direction === Direction.up) {
      for (const order of orders) {
        // skip selected orders or objects already ordered based on sort order
        if (Object.values(newOrders).includes(order) || order < object.order) {
          continue;
        }

        // assign order
        object.order = order;
        break;
      }
    } else {
      for (const order of orders) {
        // skip selected orders or objects already ordered based on sort order
        if (Object.values(newOrders).includes(order) || order > object.order) {
          continue;
        }

        // assign order
        object.order = order;
        break;
      }
    }
  });

  // inform the backend objects were moved
  (async () => {
    const success = commitObjects(
      objects,
      getEndpoint,
      saveEndpoint,
      onObjectsChange,
    );
    if (!success) {
      alert("Movement was not successful!");
      return;
    }

    alert(`${selectedObjects.length} items successfully moved in interface and workspace!`);
  })();
}

export {
  handleMoveObjectsClick,
}