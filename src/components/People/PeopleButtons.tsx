import { useRef } from "react";
import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { exportObjects } from "adaptors/export_objects";
import { findPreferredPeople } from "adaptors/find_preferred_people";
import { DEFAULT_PERSON, DEFAULT_TEAM } from "localConstants";
import { BooleanEnum, Direction, HeadCell } from "types/common";
import { Control } from "types/controlsCard";
import { Nicknames } from "types/nicknamesCard";
import { Person, PersonTable } from "types/peopleCard";
import { Team } from "types/teamsCard";
import { handleAddObjectClick } from "utils/addObjectClick";
import { handleChangeFile } from "utils/changeFile";
import { commitObjects } from "utils/commitObjects";
import { handleDeleteObjectsClick } from "utils/deleteObjectsClick";
import { handleMoveObjectsClick } from "utils/moveObjectsClick";

const buttonContainerStyle = css`
  margin: -10px auto -10px auto;
  width: fit-content;
`;

const toolbarButtonStyle = css`
  margin: 10px;
  min-width: 150px;
`;

interface PeopleButtonsProps {
  nicknames: Nicknames[]
  people: Person[]
  controls: Control[]
  teams: Team[]
  headCells: HeadCell<Person>[]
  peopleTable: PersonTable[]
  onPeopleChange: (newPeople: Person[]) => void
  onControlsChange: (newControls: Control[]) => void
  onTeamsChange: (newTeam: Team[]) => void
  onPersonOpenChange: (newPerson: Person | null) => void
}

function PeopleButtons(
{
  nicknames,
  people,
  controls,
  teams,
  headCells,
  peopleTable,
  onPeopleChange,
  onControlsChange,
  onTeamsChange,
  onPersonOpenChange,
} : PeopleButtonsProps) {
  /*
  Buttons to manage people.

  nicknames
    Nicknames defined globally for deciphering people preferences.
  people
    People defined by the user to sort into teams and rooms.
  controls
    Constraints defined by the user when surting people into teams and rooms.
  teams
    Teams where people will be sorted into.
  headCells
    Column names keyed to their object property.
  peopleTable
    People as displayed in the table of the interface.
  onPeopleChange
    Function to change people in the interface.
  onControlsChange
    Function to change user controls in the interface.
  onTeamsChange
    Function to change teams in the interface.
  onPersonOpenChange
    Function to change the open person entry in the dialogue menu.
  */
  // reference to a file input field
  const importFileInput = useRef<HTMLInputElement>(null);

  const handleDeleteClick = () => {
    /*
    Deletes selected people from the people table.
    Removes selected people from preferred people in people table.
    Deletes controls for selected people.
    Removes selected people from controls they're in and removes controls with no people left.
    */
    (async () => {
      // filter preferred people based on people remaining in the people table after deletion
      let newPeople = [...people];
      newPeople.forEach(person => person.preferredPeople = person.preferredPeople.filter(
        prefPerson => newPeople.map(newPerson => newPerson.index).includes(prefPerson)
      ));

      // delete selected people in the interface and the workspace
      const deleted = await handleDeleteObjectsClick(people, "get-people", "save-people", onPeopleChange)
      if (!deleted) {
        return;
      }

      // remove selected people from people for further processing
      newPeople = [...newPeople.filter(person => !person.selected)];

      // remove controls on selected people
      let newControls = [...controls];
      newControls = newControls.filter(control => newPeople.map(person => person.index).includes(control.personIndex));

      // remove selected people from controls on other people
      newControls.forEach(control => {
        control.teamInclude = control.teamInclude.filter(
          personIndex => newPeople.map(person => person.index).includes(personIndex)
        );
        control.teamExclude = control.teamExclude.filter(
          personIndex => newPeople.map(person => person.index).includes(personIndex)
        );
        control.roomInclude = control.roomInclude.filter(
          personIndex => newPeople.map(person => person.index).includes(personIndex)
        );
        control.roomExclude = control.roomExclude.filter(
          personIndex => newPeople.map(person => person.index).includes(personIndex)
        );
      });

      // remove controls without any people included or excluded after removing selected people
      newControls = newControls.filter(control =>
        control.teamInclude.length !== 0
        || control.teamExclude.length !== 0
        || control.roomInclude.length !== 0
        || control.roomExclude.length !== 0
      );

      // reset order for all controls remaining in the table
      newControls.forEach((control, index) => control.order = index + 1);

      // inform the backend objects were updated
      const success_controls = await commitObjects(
        newControls,
        "get-controls",
        "save-controls",
        onControlsChange,
      );
      if (!success_controls) {
        alert("Controls update was not successful!");
      }
    })();
  }

  const handleExportObjectsClick = () => {
    /* Exports objects to an Excel workbook. */
    (async () => {
      await exportObjects("people", headCells, peopleTable);
    })();
  }

  const handleImportFileClick = (files: FileList | null) => {
    /*
    Sends a file with people to the backend for collection.
    Combines people with current people and saves to workspace.
    Updates teams based on added people and saves to workspace.

    files
      File with people.
    */
    (async () => {
      // collect people from backend
      const foundPeople = await handleChangeFile<Person>(
        "upload-file",
        importFileInput,
        [".xlsx", ".csv", ".json"],
        files,
      );

      // combine found and existing people by first and last name
      const newPeople = [...people];
      foundPeople.forEach(person => {
        // find new person in existing people
        const personIndex = newPeople.map(
          newPerson => `${newPerson.firstName} ${newPerson.lastName}`
        ).indexOf(`${person.firstName} ${person.lastName}`);

        // person did not exist before reading the file
        // add person to end of order
        if (personIndex === -1) {
          person.order = newPeople.length + 1;
          newPeople.push(structuredClone(person));
          return;
        }

        // combine people from the new and matching entry
        // accept current value of optional parameters if the new value is unset
        const existingPerson = newPeople[personIndex];
        existingPerson.age = person.age;
        existingPerson.gender = person.gender;
        existingPerson.firstTime = person.firstTime;
        existingPerson.collective = person.collective;
        existingPerson.preferredPeopleRaw = person.preferredPeopleRaw !== "" ? person.preferredPeopleRaw : existingPerson.preferredPeopleRaw;
        existingPerson.leader = person.leader;
        existingPerson.team = person.team !== "" ? person.team : existingPerson.team;
        existingPerson.participant = person.participant;
      });

      // update preferred people as new people were added
      const [newestPeople, success_preferred] = await findPreferredPeople(nicknames, newPeople);
      if (!success_preferred || newestPeople === null) {
        return;
      }
      onPeopleChange(newestPeople);

      // update teams as new leaders were added
      const newTeams = [...teams];
      const leaders = newestPeople.filter(person => person.leader === BooleanEnum.yes);
      leaders.forEach(leader => {
        if (!newTeams.map(team => team.name).includes(leader.team)) {
          const newTeam = structuredClone(DEFAULT_TEAM);
          newTeam.name = leader.team;
          newTeam.selected = false;
          newTeams.push(newTeam);
          return;
        }
      });

      // inform the backend an object is saved
      const success_teams = commitObjects(newTeams, "get-teams", "save-teams", onTeamsChange);
      if (!success_teams) {
        alert("Saving teams was not successful!");
        return;
      }
    })();
  }

  return (
    <Box css={buttonContainerStyle}>
      {/* add button */}
      <Button
        variant="contained"
        css={toolbarButtonStyle}
        onClick={() => handleAddObjectClick(people, DEFAULT_PERSON, onPersonOpenChange)}
      >
        Add Person
      </Button>

      {/* import data button */}
      <Button
        variant="contained"
        component="label"
        css={toolbarButtonStyle}
      >
        Import data from Excel or JSON
        <input
          hidden
          type="file"
          accept=".xlsx,.csv,.json"
          onChange={(e) => handleImportFileClick(e.target.files)}
          ref={importFileInput}
        />
      </Button>

      {/* delete button */}
      <Button
        variant="contained"
        css={toolbarButtonStyle}
        onClick={handleDeleteClick}
      >
        Delete People
      </Button>

      {/* move up button */}
      <Button
        variant="contained"
        css={toolbarButtonStyle}
        onClick={() => handleMoveObjectsClick(people, Direction.up, "get-people", "save-people", onPeopleChange)}
      >
        Move Up
      </Button>

      {/* move down button */}
      <Button
        variant="contained"
        css={toolbarButtonStyle}
        onClick={() => handleMoveObjectsClick(people, Direction.down, "get-people", "save-people", onPeopleChange)}
      >
        Move Down
      </Button>

      {/* export button */}
      <Button
        variant="contained"
        css={toolbarButtonStyle}
        onClick={handleExportObjectsClick}
      >
        Export to Excel
      </Button>
    </Box>
  );
}

export default PeopleButtons