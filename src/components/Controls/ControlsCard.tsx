import { useState } from "react";
import { css } from "@emotion/react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ControlDialog from "components/Controls/ControlDialog";
import ControlsButtons from "components/Controls/ControlsButtons";
import ObjectTable from "components/ObjectTable";
import { HeadCell } from "types/common";
import { Control } from "types/controlsCard";
import { Person } from "types/peopleCard";

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
    id: "teamInclude",
    label: "Include on Team",
  },
  {
    id: "teamExclude",
    label: "Exclude from Team",
  },
  {
    id: "roomInclude",
    label: "Include in Room",
  },

  {
    id: "roomExclude",
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

function ControlsCard(
{
  people,
  controls,
  onControlsChange,
} : {
  people: Person[]
  controls: Control[]
  onControlsChange: (newControls: Control[]) => void
}) {
  /* Displays a table with controls information. */
  const [controlOpen, setControlOpen] = useState<Control | null>(null);

  const handleControlOpenChange = (newControl: Control | null) => {
    setControlOpen(newControl);
  };

  const convertDisplay = (key: string, value: string | string[]) : string => {
    if (!["teamInclude", "teamExclude", "roomInclude", "roomExclude"].includes(key)) {
      if (Array.isArray(value)) {
        return value.join(",");
      } else {
        return value;
      }
    }

    const values: string[] = Array.isArray(value) ? value : value.split(",");
    const names = values.map(personIndex => {
      const personPosition = people.map(person => person.index).indexOf(personIndex);
      if (personPosition === -1) {
        return;
      }

      const person = people[personPosition];
      return `${person.firstName} ${person.lastName}`;
    }).filter(name => name !== undefined);
    return names.join(",\n")
  }

  return (
    <>
      <Card css={tableContainerStyle}>
        <CardContent>
          <Typography variant="body1" css={titleStyle}>Controls</Typography>
          <ObjectTable<Control>
            objects={controls}
            identityObjectKey="order"
            headCells={headCells}
            convertDisplay={convertDisplay}
            onObjectsChange={onControlsChange}
            onObjectOpenChange={handleControlOpenChange}
          />
          <ControlsButtons
            controls={controls}
            headCells={headCells}
            convertDisplay={convertDisplay}
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