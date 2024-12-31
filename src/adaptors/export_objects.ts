import { BACKEND_ADDRESS } from "localConstants";
import { Cell, HeadCell, ObjectModel } from "types/common";

async function exportObjects<T1 extends ObjectModel>(
  filename: string,
  headCells: HeadCell<T1>[],
  objects: T1[],
) : Promise<void> {
  /*
  Exports objects to an Excel workbook.

  filename
    Name to prepend to Excel workbook.
  headCells
    Names of headers for columns in the Excel workbook.
  objects
    Objects to save data in the Excel workbook.
  */
  // assign column span to each header column
  const headers: Cell[] = headCells.map(elem => {
    return {
      value: elem.label,
      colSpan: elem.colSpan !== undefined ? elem.colSpan : 1,
    };
  });

  // collect and organize table data
  const data: Cell[][] = [headers].concat(objects.map(object => {
    const dataRow: Cell[] = [];
    for (const [k, v] of Object.entries(object)) {
      // only export object properties that have header columns
      if (headCells.map(headCell => String(headCell.id)).includes(k)) {
        dataRow.push({value: Array.isArray(v) ? v.join(",") : v});
      }
    }
    return dataRow;
  }));

  // communicate with backend
  await fetch(`${BACKEND_ADDRESS}/export-to-excel`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    }).then(
      async response => {
        // handle error message
        if (!response.ok) {
          const details = await response.json();
          console.log(details.detail.message);
          alert(details.detail.msg);
          return details.detail.content;
        }

        // Excel file created by the backend
        return response.blob();
      }
    ).then(
      blob => {
        // name for Excel file
        const name = `${filename}.xlsx`;

        // download Excel file through a temporary "a" tag
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a);
        a.click();

        // clean-up
        a.remove();
    });
}

export { exportObjects };