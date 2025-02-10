import { useState } from "react";
import { css } from "@emotion/react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ControlDialog from "components/Controls/ControlDialog";
import ControlsButtons from "components/Controls/ControlsButtons";
import ObjectTable from "components/ObjectTable";
import { HeadCell } from "types/common";
import { Control, ControlTable } from "types/controlsCard";
import { Person } from "types/peopleCard";
import { getPeopleNames } from "utils/getPeopleNames";

// table columns
const headCells: HeadCell<Control>[] = [
  {
    id: "order",
    label: "Order",
  },
  {
    id: "firstName",
    label: "First Name",
  },
  {
    id: "lastName",
    label: "Last Name",
  },
  {
    id: "teamIncludeDisplay",
    label: "Include on Team",
  },
  {
    id: "teamExcludeDisplay",
    label: "Exclude from Team",
  },
  {
    id: "roomIncludeDisplay",
    label: "Include in Room",
  },

  {
    id: "roomExcludeDisplay",
    label: "Exclude from Room",
  },
];

const tableContainerStyle = css`
  display: inline-block;
  margin: 10px 10px 10px 0px;
  width: calc(100% - 30px);
`;

const titleStyle = css`
  text-align: left;
`;

interface ControlsCardProps {
  people: Person[]
  controls: Control[]
  onControlsChange: (newControls: Control[]) => void
}

function ControlsCard(
{
  people,
  controls,
  onControlsChange,
} : ControlsCardProps) {
  /*
  Displays a table with controls information.

  people
    People defined by the user to sort into teams and rooms.
  controls
    Constraints defined by the user when surting people into teams and rooms.
  onControlsChange
    Function to change user controls in the interface.
  */
  const [controlOpen, setControlOpen] = useState<Control | null>(null);

  const handleControlOpenChange = (newControl: Control | null) => {
    /*
    Changes a control in the dialogue menu.

    newControl
      New control to save to the control object in the dialogue menu.
    */
    setControlOpen(newControl);
  };

  // convert people to their table data
  const controlsTable: ControlTable[] = [];
  controls.forEach(control => {
    // clone control
    const controlTable = structuredClone(control) as ControlTable;

    // find the person for whom each control applies
    const personFound = people.filter(person => person.index === control.personIndex)[0];
    if (personFound === undefined) {
      return;
    }
    controlTable.firstName = personFound.firstName;
    controlTable.lastName = personFound.lastName;

    // convert people indices to their full names
    // assign full names of people for each control
    controlTable.teamIncludeDisplay = getPeopleNames(people, control.teamInclude);
    controlTable.teamExcludeDisplay = getPeopleNames(people, control.teamExclude);
    controlTable.roomIncludeDisplay = getPeopleNames(people, control.roomInclude);
    controlTable.roomExcludeDisplay = getPeopleNames(people, control.roomExclude);
    controlsTable.push(controlTable);
  });

  return (
    <>
      <Card css={tableContainerStyle}>
        <CardContent>
          {/* title */}
          <Typography variant="body1" css={titleStyle}>Controls</Typography>

          {/* table */}
          <ObjectTable<Control, ControlTable>
            objects={controls}
            headCells={headCells}
            objectsDisplay={controlsTable}
            initialSortKey="order"
            onObjectsChange={onControlsChange}
            onObjectOpenChange={handleControlOpenChange}
          />

          {/* buttons */}
          <ControlsButtons
            people={people}
            controls={controls}
            headCells={headCells}
            controlsTable={controlsTable}
            onControlsChange={onControlsChange}
            onControlOpenChange={handleControlOpenChange}
          />
        </CardContent>
      </Card>

     <ControlDialog
        people={people}
        controls={controls}
        controlOpen={controlOpen}
        onControlsChange={onControlsChange}
        onControlOpenChange={handleControlOpenChange}
     />
    </>
  );
}

export default ControlsCard