import { useState } from "react";
import { css } from "@emotion/react";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { findPreferredPeople } from "adaptors/find_preferred_people";
import { Nicknames } from "types/nicknamesCard";
import { Person } from "types/peopleCard";
import { commitObjects } from "utils/commitObjects";
import { firstNameField, lastNameField } from "utils/personFields";

const dialogStyle = css`
  padding: 20px;
`;

const listCheckboxStyle = css`
  left: 15px;
  margin-left: 0px;
  margin-right: -20px;
  z-index: 3;
`;

const listStyle = css`
  border: solid 2px black;
  height: 145px;
  margin-bottom: 10px;
  max-height: 145px;
  overflow: auto;
  position: relative;
  width: 100%;
`;

const listItemStyle = css`
  height: 25px;
`;

const listTextStyle = css`
  max-width: 100%;
  white-space: nowrap;
  width: 100%;
`;

const toolbarButtonStyle = css`
  margin: 10px;
  min-width: 150px;
`;

interface NicknamesDialogProps {
  nicknames: Nicknames[]
  people: Person[]
  nicknamesOpen: Nicknames | null
  onNicknamesChange: (newNicknames: Nicknames[]) => void
  onPeopleChange: (newPeople: Person[]) => void
  onNicknamesOpenChange: (nicknames: Nicknames | null) => void
}

function NicknamesDialog({
  nicknames,
  people,
  nicknamesOpen,
  onNicknamesChange,
  onPeopleChange,
  onNicknamesOpenChange,
} : NicknamesDialogProps) {
  /*
  Displays a dialog for nicknames information.

  nicknames
    Current nicknames defined globally for deciphering people preferences.
  people
    People defined by the user to sort into teams and rooms.
  nicknamesOpen
    Nicknames entry open in the dialogue menu.
  onNicknamesChange
    Function to change nicknames in the interface.
  onPeopleChange
    Function to change people in the interface.
  onNicknamesOpenChange
    Function to change the open nicknames entry in the dialogue menu.
  */
  const [nickname, setNickname] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const handleNicknamesClose = () => {
    /* Closes the nicknames dialogue window. */
    onNicknamesOpenChange(null);
  };

  const handleNicknamesPropertyChange = (key: keyof Nicknames, value: null | string | string[]) => {
    /*
    Edits the value of an attribute for an open nicknames entry.

    key
      Nicknames attribute for a changed value.
    value
      New value for a nicknames attribute.
    */
    // nicknames must be open
    if (nicknamesOpen === null) {
      return;
    }

    // value cannot be null
    if (value === null) {
      value = "";
    }

    // set a value
    const nickname = structuredClone(nicknamesOpen);
    nickname[key] = value;
    onNicknamesOpenChange(nickname);
  };

  const handleSaveNicknames = () => {
    /* Saves the open nicknames entry to the workspace. */
    (async () => {
      // nicknames must be open
      if (nicknamesOpen === null) {
        return;
      }

      // find the index of the nicknames entry open in the dialogue menu
      const newNicknames = [...nicknames];
      const nicknamesIndex = newNicknames.map(nickname => nickname.index).indexOf(nicknamesOpen.index);

      // handle nicknames entries before save
      if (nicknamesOpen.nicknames.length === 0) {
        if (nicknamesIndex === -1) {
          // a new nickname entry must have at least one nickname
          alert("At least one nickname must be given for the new entry!")
          return;
        } else {
          // no nicknames remain for an existing entry
          // ask user to proceed with deleting entry
          const proceed = confirm(`No nicknames given for the current entry. Commit to delete it from workspace and interface?`);
          if (!(proceed)) {
            return;
          }

          // remove nicknames entry without nicknames
          newNicknames.splice(nicknamesIndex, 1);
        }
      } else {
        // create a new nicknames entry or swap changed nicknames with its existing entry
        if (nicknamesIndex === -1) {
          // a new nicknames entry
          // attempt to find by name
          const nameIndex = newNicknames.map(
            nickname => `${nickname.firstName} ${nickname.lastName}`
          ).indexOf(`${nicknamesOpen.firstName} ${nicknamesOpen.lastName}`);

          // an existing entry matches based on first and last name
          if (nameIndex !== -1) {
            // combine nicknames from existing and new lists
            const existingNicknames = newNicknames.splice(nameIndex, 1)[0];
            if (existingNicknames !== undefined) {
              nicknamesOpen.nicknames = existingNicknames.nicknames.concat(
                nicknamesOpen.nicknames.filter(name => !existingNicknames.nicknames.includes(name))
              );
            }
          }

          // add new or modified nicknames entry
          newNicknames.push(structuredClone(nicknamesOpen));
        } else {
          // modify existing nicknames entry
          newNicknames.splice(nicknamesIndex, 1);
          newNicknames.push(structuredClone(nicknamesOpen));
        }
      }

      // inform the backend an object is saved
      const success = commitObjects(newNicknames, "get-nicknames", "save-nicknames", onNicknamesChange);
      if (!success) {
        alert("Saving nicknames was not successful!");
        return;
      }

      // nicknames may be added, so people are re-collected for their preferences
      const [newPeople, success_preferred] = await findPreferredPeople(newNicknames, people);
      if (!success_preferred || newPeople === null) {
        return;
      }
      onPeopleChange(newPeople);

      alert(`Nicknames for ${nicknamesOpen.firstName} ${nicknamesOpen.lastName} successfully saved to interface and workspace!`);

      // close the dialogue window
      handleNicknamesClose();
    })();
  };

  const handleAddNicknameClick = () => {
    /* Adds a nickname to the open nicknames entry. */
    // nicknames must be open
    if (nicknamesOpen === null) {
      return;
    }

    // a nickname must exist
    if (nickname === "") {
      alert("A nickname must be specified!")
      return;
    }

    // nickname must not already exist for the nicknames entry
    if (nicknamesOpen.nicknames.includes(nickname)) {
      alert("Nickname is already applied for the current person!")
      return;
    }

    // add nickname to the open nicknames entry
    const newNicknamesOpen = structuredClone(nicknamesOpen);
    newNicknamesOpen.nicknames.push(nickname);
    onNicknamesOpenChange(newNicknamesOpen);

    // reset nickname for further entries
    setNickname("");
  }

  const handleSelectAllClick = (checked: boolean) => {
    /*
    Toggles to selection of all nicknames for the open nicknames entry.

    checked
      True to select all nicknames, otherwise false for de-selection.
    */
    // nicknames must be open
    if (nicknamesOpen === null) {
      return;
    }

    // select all nicknames
    if (checked) {
      setSelected(nicknamesOpen.nicknames);
      return;
    }

    // de-select all nicknames
    setSelected([]);
  };

  const handleSelectChange = (name: string) => {
    /*
    Toggles the selection of a nickname for the open nicknames entry.

    name
      Nickname whose selection was toggled.
    */
    // nicknames are selected if their name is in the selection list
    const newSelected = [...selected];
    if (newSelected.includes(name)) {
      // remove nickname from selection list
      newSelected.splice(newSelected.indexOf(name), 1);
    } else {
      // add nickname to selection list
      newSelected.push(name);
    }

    // set nickname selections
    setSelected(newSelected);
  }

  const handleDeleteNicknamesClick = () => {
    /* Deletes nicknames for the open nicknames entry. */
    // nicknames must be open
    if (nicknamesOpen === null) {
      return;
    }

    // a nickname must be selected
    if (selected.length === 0) {
      alert("No nicknames selected for deletion!");
      return;
    }

    // ask user to proceed with deleting nicknames from open nicknames entry
    const proceed = confirm(`Commit to delete nicknames from interface?`);
    if (!(proceed)) {
      return;
    }

    // remove selected nicknames from the open nicknames entry
    const newNicknamesOpen = structuredClone(nicknamesOpen);
    newNicknamesOpen.nicknames = newNicknamesOpen.nicknames.filter(nickname => !selected.includes(nickname));
    onNicknamesOpenChange(newNicknamesOpen);

    // reset nickname selections
    setSelected([]);
  }

  return (
    <Dialog
      open={nicknamesOpen !== null}
      onClose={handleNicknamesClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          handleSaveNicknames();
        },
      }}
    >
      {/* title */}
      <DialogTitle>Enter Nicknames Information</DialogTitle>
      <DialogContent css={dialogStyle}>
        <Stack spacing={4}>
          {/* first name */}
          <Autocomplete
            options={people.map(person => person.firstName)}
            selectOnFocus
            clearOnBlur
            freeSolo
            value={nicknamesOpen === null ? "" : nicknamesOpen.firstName}
            onInputChange={(_, newValue: string | null) => {handleNicknamesPropertyChange("firstName", newValue)}}
            renderInput={(params) => (
              <TextField
                required
                {...params}
                placeholder={firstNameField.placeholder}
                label="First Name"
                variant="standard"
              />
            )}
          />

          {/* last name */}
          <Autocomplete
            options={people.map(person => person.lastName)}
            selectOnFocus
            clearOnBlur
            freeSolo
            value={nicknamesOpen === null ? "" : nicknamesOpen.lastName}
            onInputChange={(_, newValue: string | null) => {handleNicknamesPropertyChange("lastName", newValue)}}
            renderInput={(params) => (
              <TextField
                required
                {...params}
                placeholder={lastNameField.placeholder}
                label="Last Name"
                variant="standard"
              />
            )}
          />

          {/* nickname */}
          <TextField
            placeholder="Examples: Vinnie, Danger, Lobello"
            label="Nickname"
            value={nickname}
            variant="standard"
            onChange={(e) => setNickname(e.target.value)}
          />

          {/* add button */}
          <Button
            variant="contained"
            css={toolbarButtonStyle}
            onClick={handleAddNicknameClick}
          >
            Add Nickname
          </Button>

          {/* nicknames */}
          <Box>
            {/* title */}
            <Typography component="span">
              {/* select all checkbox */}
              <Checkbox
                color="primary"
                indeterminate={nicknamesOpen !== null && selected.length > 0 && selected.length < nicknamesOpen.nicknames.length}
                checked={nicknamesOpen !== null && nicknamesOpen.nicknames.length > 0 && selected.length === nicknamesOpen.nicknames.length}
                onChange={(e) => handleSelectAllClick(e.target.checked)}
              />
              Nicknames
            </Typography>

            {/* nicknames list */}
            <List css={listStyle}>
              {nicknamesOpen !== null && nicknamesOpen.nicknames.map((name, index) => {
                const labelId = `checkbox-list-label-${name}`;
                return (
                  <ListItem
                  key={index}
                  css={listItemStyle}
                  disablePadding
                  >
                    <ListItemButton css={listItemStyle} onClick={() => handleSelectChange(name)}>
                      {/* nickname checkbox */}
                      <ListItemIcon css={listCheckboxStyle}>
                        <Checkbox
                          edge="start"
                          checked={selected.includes(name)}
                          disableRipple
                          inputProps={{ 'aria-labelledby': labelId }}
                          />
                      </ListItemIcon>

                      {/* nickname text */}
                      <ListItemText css={listTextStyle} id={labelId} primary={name} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>

          {/* delete button */}
          <Button
            variant="contained"
            css={toolbarButtonStyle}
            onClick={handleDeleteNicknamesClick}
          >
            Delete Nicknames
          </Button>
        </Stack>
      </DialogContent>

      {/* form controls */}
      <DialogActions>
        <Button onClick={handleNicknamesClose}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default NicknamesDialog