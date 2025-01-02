import { useEffect, useState } from "react";
import { css } from "@emotion/react";
import Bar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import HelpIcon from "assets/help_icon.svg?react";
import { HELP_ICON_COLOR, HELP_URL } from "localConstants";

// extend the global window to include variables passed from preload
declare global {
  interface Window {
      version: () => Promise<string>;
  }
}

const helpIconStyle = css`
  height: 30px;
`;

const resetStyle = css`
  background-color:rgb(219, 197, 113);

  &:hover {
    background-color: rgb(143, 128, 70);
  };
`;

const toolbarButtonStyle = css`
  margin: 10px;
  min-width: 150px;
`;

const toolbarItemStyle = css`
  flex-grow: 1;
  padding: 10px;
`;

const toolbarStyle = css`
  display: flex;
  flex-flow: row nowrap;
`;

interface AppBarProps {
  resetTeams: boolean
  resetRooms: boolean
  onResetClick: () => void
  onRunTeamsClick: () => void
  onRunRoomsClick: () => void
}

const AppBar = ({
  resetTeams,
  resetRooms,
  onResetClick,
  onRunTeamsClick,
  onRunRoomsClick,
} : AppBarProps
) => {
  /*
  Defines the application toolbar.

  onResetClick
    Function to reset the people, controls, teams and rooms objects.
  onRunTeamsClick
    Function to run the teams algorithm to update people.
  onRunRoomsClick
    Function to run the rooms algorithm to update people.
  */
  const [version, setVersion] = useState("");

  useEffect(() => {
    /* Updates the app version from an Electron application. */
    async function getVersion() {
      /* Sets the app version in the title through an IPC process. */
      if (window.version === undefined) {
        return;
      }

      // set the version through an IPC function on the window
      const app_version: string = await window.version();
      setVersion(" - v" + app_version);
    }

    // collect the current app version
    if (version === "") {
      getVersion();
    }
  }, [version])

  return (
    <Bar>
      <Toolbar css={toolbarStyle}>
        {/* app title */}
        <Typography variant="h6" css={toolbarItemStyle}>
            Team Placement{version}
        </Typography>

        {/* run teams algorithm button */}
        <Button
          variant="contained"
          css={resetTeams ? [toolbarButtonStyle, resetStyle] : toolbarButtonStyle}
          onClick={onRunTeamsClick}
        >
          Run Teams
        </Button>

        {/* run rooms algorithm button */}
        <Button
          variant="contained"
          css={resetRooms ? [toolbarButtonStyle, resetStyle] : toolbarButtonStyle}
          onClick={onRunRoomsClick}
        >
          Run Rooms
        </Button>

        {/* reset button */}
        <Button
          variant="contained"
          css={toolbarButtonStyle}
          onClick={onResetClick}
        >
          Reset Tables
        </Button>

        {/* help icon */}
        <a href={`https://${HELP_URL}`} target="_blank">
            <Typography color={HELP_ICON_COLOR}>
            <HelpIcon css={helpIconStyle} fill="currentColor" />
            </Typography>
        </a>
      </Toolbar>
    </Bar>
  )
};

export default AppBar;