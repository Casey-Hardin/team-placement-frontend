import { useState } from "react";
import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { HeadCell, ObjectModel, ObjectOrder, Order } from "types/common";
import { getComparator } from "utils/comparator";

const SHOW_ALL = "Show All";

const bodyRowStyle = css`
  cursor: pointer;
  white-space: nowrap;

  &:hover td {
    background-color: rgb(245, 245, 245);
  };

  &[aria-checked=true] td {
    background-color: rgb(238, 241, 248);
  };

  &:hover[aria-checked=true] td {
    background-color: rgb(229, 233, 244);
  };
`;

const bodyStickyCellColorStyle = css`
  background-color: #fff;
`;

const bodyStickyCellStyle = css`
  position: sticky;
  z-index: 2;
`;

const firstColumnStyle = css`
  left: 0px;
  min-width: 24px;
`;

const headRowStyle = css`
  background-color: rgb(255, 255, 255);
`;

const headStickyCellStyle = css`
  position: sticky;
  z-index: 3;
`;

const secondColumnStyle = css`
  left: 52px;
`;

const tableStyle = css`
  min-width: 750px;
`;

const toolbarButtonStyle = css`
  margin: 10px;
  min-width: 150px;
`;

const toolbarItemStyle = css`
  flex-grow: 1;
  padding: 5px;
`;

const toolbarStyle = css`
  display: flex;
  flex-flow: row nowrap;
`;

interface ObjectTableProps<T1 extends ObjectModel, T2 extends T1> {
  objects: T1[],
  headCells: HeadCell<T2>[],
  objectsDisplay?: T2[],
  initialSortKey: keyof T2,
  filters?: (keyof T2)[],
  onObjectsChange: (objects: T1[]) => void,
  onObjectOpenChange: (object: T1 | null) => void,
}

function ObjectTable<T1 extends ObjectModel, T2 extends T1>({
  objects,
  headCells,
  objectsDisplay,
  initialSortKey,
  filters,
  onObjectsChange,
  onObjectOpenChange,
} : ObjectTableProps<T1, T2>) {
  /*
  Displays a table with object information.

  objects
    List of objects to select from a table.
  headCells
    Column names keyed to their object property.
  objectsDisplay
    Optional list of displayed objects that are shown in a table.
    This is the objects list when omitted.
  initialSortKey
    Column to initially sort by.
  filters
    Names of columns to filter by.
  onObjectsChange
    Function to change objects for the interface.
  onObjectsOpenChange
    Function to change the object in the dialogue menu.
  */
  const [objectOrder, setObjectOrder] = useState<ObjectOrder<T2>>({order: Order.asc, orderBy: initialSortKey});
  const [page, setPage] = useState<number>(0);
  const [objectsPerPage, setObjectsPerPage] = useState(5);

  // show all objects by default for each filter
  const defaultFilterValues = {} as {[key in keyof T2]: string[]};
  if (filters !== undefined) {
    filters.forEach(columnName => defaultFilterValues[columnName] = [SHOW_ALL]);
  }
  const [filterValues, setFilterValues] = useState<{[key in keyof T2]: string[]}>(defaultFilterValues);

  // if objects display is omitted, then objects is the same as its display
  const objectsTable: T2[] = objectsDisplay === undefined ? [] : objectsDisplay;
  if (objectsDisplay === undefined) {
    objects.forEach(object => {
      // clone object
      const objectDisplay = object as T2;
      objectsTable.push(objectDisplay);
    });
  }

  // filter objects based on filterable columns
  // objects must meet all filters to be visible
  // a forEach loop lost typing for column name, so a for loop was used instead
  let visibleObjects: T2[] = [...objectsTable];
  for (const columnName in filterValues) {
    const values = filterValues[columnName];

    // show all requires no filtering
    if (values.length === 1 && values[0] === SHOW_ALL) {
      continue;
    }

    // filter display objects with any value selected for the filter
    visibleObjects = visibleObjects.filter(object => values.includes(String(object[columnName])));
  }

  // avoid a layout jump when reaching the last page with empty rows
  const emptyRows = page > 0 ? Math.max(0, (page + 1) * objectsPerPage - objectsTable.length) : 0;

  // show objects for the selected page
  visibleObjects = visibleObjects.sort(
    getComparator(objectOrder.order, objectOrder.orderBy)
  ).slice(
    page * objectsPerPage, (page + 1) * objectsPerPage,
  );

  // total pages appears in page selection for the table
  const totalPages = Math.floor((objectsTable.length - 1) / objectsPerPage) + 1;

  // inform user of the number of selected objects
  const selectedLength = objects.filter((e) => e.selected).length;
  const selectedRowsMessage = selectedLength > 0
    ? selectedLength === 1
      ? `${selectedLength} row selected`
      : `${selectedLength} rows selected`
    : "No rows selected";

  const handleObjectClick = (object: T1) => {
    /*
    Shows a dialogue window when an object is clicked.

    object
      Object with information to edit.
    */
    onObjectOpenChange(object);
  };

  const handleCheckboxClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, object: T1) => {
    /*
    Toggles object selection.

    event
      Used to prevent normal checkbox behavior.
    object
      Object toggled by the Checkbox.
    */
    // prevent default checkbox behavior
    event.stopPropagation();

    // mark an object as selected
    object.selected = !object.selected;
    const newObjects = [...objects];
    onObjectsChange(newObjects);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    /*
    Selects all objects from the table.

    event
      Checked to select all objects.
    */
    const newObjects = [...objects];
    newObjects.forEach(e => e.selected = event.target.checked);
    onObjectsChange(newObjects);
  };

  const handleRequestSort = (property: keyof T2) => () => {
    /*
    Reverses the sort order when a column is clicked.

    property
      Key of type Object.
    */
    const isAsc = objectOrder.orderBy === property && objectOrder.order === Order.asc;
    setObjectOrder({order: isAsc ? Order.desc : Order.asc, orderBy: property});
  };

  const handleFilterPropertyChange = (key: keyof T2, value: string | string[]) => {
    /*
    Edits filters for a filterable property of the objects table display.
    Resets to the first page in case the current page is no longer needed to show objects.

    key
      Filterable attribute of an objects display.
    value
      New values used to filter by an objects display attribute.
    */
    // combo box only supports arrays
    let newValue = value;
    if (!Array.isArray(newValue)) {
      newValue = [newValue];
    }

    // filters must have a value
    if (newValue.length === 0) {
      newValue = [SHOW_ALL];
    }

    // show all cannot be selected with other options
    if (newValue.includes(SHOW_ALL)) {
      if (filterValues[key].length === 1 && filterValues[key][0] === SHOW_ALL && value.length !== 0) {
        // de-select show all since a different value was chosen for the filter
        newValue = newValue.filter(value => value !== SHOW_ALL);
      } else {
        // show all was selected therefore de-select all other values of the filter
        newValue = [SHOW_ALL];
      }
    }

    // set a value
    const newFilterValues = structuredClone(filterValues);
    newFilterValues[key] = newValue;
    setFilterValues(newFilterValues);

    // reset to the initial page in case filtering eliminates the current page
    setPage(0);
  };

  const handleChangePage = (newPage: number) => {
    /*
    Sets the current page by index.

    newPage
      New page number for the objects table.
    */
    setPage(newPage);
  };

  const handleChangeObjectsPerPage = (rowCount: number) => {
    /*
    Sets the number of entries displayed on each page of the objects table.
    Resets to the first page in case the current page is no longer needed to show objects.

    rowCount
      Number of objects to show in the objects table.
    */
    setObjectsPerPage(rowCount);
    setPage(0);
  };

  // checkbox in the table header to select all objects on all pages of the table
  const selectAllCheckbox = (objects.length !== undefined && selectedLength !== undefined) &&
  (
    <TableCell padding="checkbox" css={[headStickyCellStyle, firstColumnStyle]}>
      <Checkbox
        color="primary"
        indeterminate={selectedLength > 0 && selectedLength < objects.length}
        checked={objects.length > 0 && selectedLength === objects.length}
        onChange={handleSelectAllClick}
      />
    </TableCell>
  );

  // table header with the first cell sticky
  const header = headCells.map((headCell, index) => (
    <TableCell
      key={index}
      padding="normal"
      sortDirection={objectOrder.orderBy === headCell.id ? objectOrder.order : false}
      css={index === 0 && [headStickyCellStyle, secondColumnStyle]}
    >
      <TableSortLabel
        active={objectOrder.orderBy === headCell.id}
        direction={objectOrder.orderBy === headCell.id ? objectOrder.order : Order.asc}
        onClick={handleRequestSort(headCell.id)}
      >
        {headCell.label}
      </TableSortLabel>
    </TableCell>
  ));

  // rows showing only objects for the selected page of the table
  const objectRows = visibleObjects.map((objectTable, objectIndex) => {
    // find the object for the table display
    const object = objects.filter(item => item.index === objectTable.index)[0];

    // the first column is sticky
    const stickyRowCells = headCells.map((headCell) => headCell.id).filter((_, index) => index < 1).map((key, index) => {
      // only show string or numeric data
      // arrays are also permitted
      const value = objectTable[key] !== null ? String(objectTable[key]) : null;
      if (!["string", "number"].includes(typeof value) || value === null) {
        return;
      }

      // enter data for table cells
      const styles = [secondColumnStyle, bodyStickyCellStyle, bodyStickyCellColorStyle];
      return (
        <TableCell key={index} css={styles}>
          {value}
        </TableCell>
      );
    });

    // subsequent columns
    const rowCells = headCells.map(headCell => headCell.id).filter((_, index) => index > 0).map((key, index) => {
      // only show string or numeric data
      // arrays are also permitted
      const value = objectTable[key] !== null ? String(objectTable[key]) : null;
      if (!["string", "number"].includes(typeof value) || value === null) {
        return;
      }

      // enter data for table cells
      return (
        <TableCell key={index}>
          {value}
        </TableCell>
      );
    });

    // table cell styles
    const styles = [bodyStickyCellStyle, bodyStickyCellColorStyle, firstColumnStyle];

    return (
      <TableRow
        key={objectIndex}
        hover
        onClick={() => handleObjectClick(object)}
        aria-checked={object.selected}
        selected={object.selected}
        css={bodyRowStyle}
      >
        {/* checkbox */}
        <TableCell padding="checkbox" css={styles}>
          <Checkbox
            color="primary"
            checked={object.selected}
            onClick={(e) => handleCheckboxClick(e, object)}
          />
        </TableCell>

        {/* table data */}
        {stickyRowCells}
        {rowCells}
      </TableRow>
    );
  });

  // filter to limit objects in the table
  const filterElements = filters !== undefined && filters.map((columnName, index) => {
    // collect values defined on objects for the column name
    const allOptions = objectsTable.map(object => {
      return String(object[columnName]);
    });
    let options = [...new Set(allOptions)];
    options.sort();
    options = [SHOW_ALL, ...options];

    // create menu items for each option
    const filterMenuItems = options.map((option, optionIndex) => {
      return <MenuItem key={optionIndex} value={option}>{option === "" ? "Unassigned" : option}</MenuItem>
    });

    // title for the filter combo box
    let title = String(columnName).replace(/([A-Z])/g, ' $1').trim();
    title = title.charAt(0).toUpperCase() + title.slice(1);

    return (
      <FormControl key={index} variant="standard" sx={{ m: 1, width: 200 }} disabled={objectsTable.length === 0}>
        {/* title */}
        <InputLabel id={`filter-label-${String(columnName)}`}>Filter {title}</InputLabel>
        
        {/* combo box */}
        <Select
          labelId={`filter-label-${String(columnName)}`}
          multiple
          value={filterValues[columnName]}
          onChange={(e) => handleFilterPropertyChange(columnName, e.target.value)}
          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
        >
          {filterMenuItems}
        </Select>
      </FormControl>
    );
  });

  return (
    <>
      {/* filters */}
      {filters !== undefined &&
      <Box>
        {filterElements}
      </Box>
      }

      {/* table */}
      <TableContainer>
        <Table stickyHeader size="small" css={tableStyle}>
          {/* header */}
          <TableHead>
            <TableRow css={headRowStyle}>
              {selectAllCheckbox}
              {header}
            </TableRow>
          </TableHead>

          {/* body */}
          <TableBody>
            {/* rows */}
            {objectRows}

            {/* empty content to fill table */}
            {emptyRows > 0 && (
              <TableRow style={{height: 33 * emptyRows}}>
                <TableCell colSpan={headCells.length + 1} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* controls */}
      <Toolbar css={toolbarStyle}>
        {/* objects selected */}
        <Typography variant="subtitle1" component="div" css={toolbarItemStyle}>
          {selectedRowsMessage}
        </Typography>

        {/* push content right */}
        <Typography component="div" css={toolbarItemStyle} />

        {/* page controls */}
        <TablePagination
          css={toolbarButtonStyle}
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={objectsTable.length}
          rowsPerPage={objectsPerPage}
          page={totalPages !== 0 ? page : 0}
          onPageChange={(_, newPage) => handleChangePage(newPage)}
          onRowsPerPageChange={(e) => handleChangeObjectsPerPage(parseInt(e.target.value, 10))}
        />
      </Toolbar>
    </>
  );
}

export default ObjectTable