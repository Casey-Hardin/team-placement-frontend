import { useRef } from "react";
import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { exportObjects } from "adaptors/export_objects";
import { findPreferredPeople } from "adaptors/find_preferred_people";
import { DEFAULT_NICKNAMES } from "localConstants";
import { HeadCell } from "types/common";
import { Nicknames } from "types/nicknamesCard";
import { Person } from "types/peopleCard";
import { handleAddObjectClick } from "utils/addObjectClick";
import { handleDeleteObjectsClick } from "utils/deleteObjectsClick";
import { handleChangeFile } from "utils/changeFile";
import { commitObjects } from "utils/commitObjects";

const buttonContainerStyle = css`
  margin: -10px auto -10px auto;
  width: fit-content;
`;

const toolbarButtonStyle = css`
  margin: 10px;
  min-width: 150px;
`;

interface NicknamesButtonsProps {
  nicknames: Nicknames[]
  people: Person[]
  headCells: HeadCell<Nicknames>[]
  onNicknamesChange: (newNicknames: Nicknames[]) => void
  onNicknamesOpenChange: (newNicknames: Nicknames | null) => void
  onPeopleChange: (newPeople: Person[]) => void
}

function NicknamesButtons(
{
  nicknames,
  people,
  headCells,
  onNicknamesChange,
  onPeopleChange,
  onNicknamesOpenChange,
} : NicknamesButtonsProps) {
  /*
  Buttons to manage nicknames.

  nicknames
    Current nicknames defined globally for deciphering people preferences.
  people
    People defined by the user to sort into teams and rooms.
  headCells
    Column names keyed to their object property.
  onNicknamesChange
    Function to change nicknames in the interface.
  onPeopleChange
    Function to change people in the interface.
  onNicknamesOpenChange
    Function to change the open nicknames entry in the dialogue menu.
  */
  // reference to a file input field
  const importFileInput = useRef<HTMLInputElement>(null);

  const handleDeleteClick = () => {
    /*
    Deletes selected nicknames from the nicknames table.
    This intentionally does not update preferred people.
    */
    (async () => {
      await handleDeleteObjectsClick(nicknames, "get-nicknames", "save-nicknames", onNicknamesChange)
    })();
  }

  const handleExportObjectsClick = () => {
    /* Exports objects to an Excel workbook. */
    (async () => {
      await exportObjects("nicknames", headCells, nicknames);
    })();
  }

  const handleImportFileClick = (files: FileList | null) => {
    /*
    Sends a file with nicknames to the backend for collection.
    Combines nicknames with current nicknames and saves to workspace.
    Updates people based on added nicknames and saves to workspace.

    files
      File with nicknames.
    */
    (async () => {
      // collect nicknames from backend
      const foundNicknames = await handleChangeFile<Nicknames>(
        "upload-nicknames-file",
        importFileInput,
        [".json"],
        files,
      );

      // combine found and existing nicknames by first and last name
      const newNicknames = [...nicknames];
      foundNicknames.forEach(nickname => {
        // find new nickname in existing nicknames
        const nameIndex = newNicknames.map(
          newNickname => `${newNickname.firstName} ${newNickname.lastName}`
        ).indexOf(`${nickname.firstName} ${nickname.lastName}`);

        // nickname did not exist before reading the file
        if (nameIndex === -1) {
          newNicknames.push(structuredClone(nickname));
          return;
        }

        // combine nicknames from the new and matching entry
        const existingNicknames = newNicknames[nameIndex];
        existingNicknames.nicknames = existingNicknames.nicknames.concat(
          nickname.nicknames.filter(name => !existingNicknames.nicknames.includes(name))
        );
      });

      // inform backend of combined objects
      newNicknames.forEach(nickname => nickname.selected = false);
      const success = await commitObjects(newNicknames, "get-nicknames", "save-nicknames", onNicknamesChange);
      if (!success) {
        alert("Nicknames collection was not successful!");
        return false;
      }

      // update preferred people for existing people since new nicknames were added
      const [newPeople, success_preferred] = await findPreferredPeople(newNicknames, people);
      if (!success_preferred || newPeople === null) {
        return;
      }
      onPeopleChange(newPeople);
    })();
  }

  return (
    <Box css={buttonContainerStyle}>
      {/* add button */}
      <Button
        variant="contained"
        css={toolbarButtonStyle}
        onClick={() => handleAddObjectClick(nicknames, DEFAULT_NICKNAMES, onNicknamesOpenChange)}
      >
        Add Entry
      </Button>

      {/* import data button */}
      <Button
        variant="contained"
        component="label"
        css={toolbarButtonStyle}
      >
        Import data from JSON
        <input
          hidden
          type="file"
          accept=".json"
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
        Delete Entries
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

export default NicknamesButtons