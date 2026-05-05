# Team Placement - Frontend

[Source Code](https://github.com/Casey-Hardin/team-placement-frontend.git "GitHub Repository")

## Description

Frontend of the Team Placement application.

Problem Statement:
Collective needs an automated way to place people on teams and to assign them to rooms.

Constraints in order of priority:
- Guys and girls cannot room together.
- Team captains must be placed on Teams together.
- First-time-goers must be paired with one of their choices for both teams and room assignments.
- User can guarantee people are together or apart for team or room assignments.
- Teams should be equal within 2 people.
- Collective attendance status is consistent per category and per team.
- Grouping teams by age is encouraged.
- A consistent male-to-female ratio is encouraged.
- Collective attendance status is consistent across rooms.
- Grouping rooms by age is encouraged.

People Information
- First Name
- Last Name
- Gender
- List of Preferred People
- Amount Paid (used for first-time status)
- Donation (used for first-time status)
- Birthday
- Collective Attendance
- Team (when person is a leader)
- Participant (some users are not placed on teams, but still need a room)
- User Guaranteed Preferred People (Team)
- User Guaranteed Separate People (Team)
- User Guaranteed Preferred People (Room)
- User Guaranteed Separate People (Room)

Team Information
- Name
- Leaders are specified in people information

Room Information
- Name
- Room Capacity (not all rooms are the same size)

Assumptions
- Everyone who shows up will be roomed
- Everyone is telling the truth (aside from typos)
- No one will switch room assignments

Goal is to complete team and room assignments while respecting constraints as much as possible.

Strategy:
1. Read people from an Excel file (or interface input).
2. Determine Collective attendance status, age, gender and number per team targets.
3. Remove non-participants.
4. Place leaders in cohorts (sub-teams).
5. Begin with first-time status persons based on amount paid in order of date signed-up.
6. Assign first-time status persons with zero or one possible preferred people to cohorts. Drop preference for a first-time status person if he or she is a leader who selected another leader. Recurse after each add due to maintain placement in order of date signed up.
7. Assign user preferred / separated guarantees in the order that they were defined with step 6 recursion after each assignment - this is to capture preferences of first-time status persons who still have at least 1 preferred person.
8. Assign first-time status persons with 2 or more preferred people remaining to teams based on targets + future possibilities for cohorts to join with leadered teams. Add any first-time status persons with 0 or 1 possibilities and recurse. If after completing the list, there are still first-time status persons with 2 or more preferred people, assign them to a cohort with the option that is better based on targets. If all are equal, then add to the first people in the list of their preferred people. Recurse with the requirements of step 7.
9. Once all first-time status persons have been grouped with at least one person from their list of preferred people, then add any cohorts with 0 or 1 leadered cohort possibilities while adhering to user spearation rules.
10. For any first-time status persons with remaining preferred people that could be satisfied, add in order of 2nd selection overall, 3rd selection for all still remaining, etc. while looking ahead to see if cohort aggregation would prevent all cohorts adding to teams based on targets. If after placement based on preference a cohort only has one leadered cohort possibility, then combine them and recurse.
11. Repeat step 10 based on each collective attendance status.
12. If any are left that haven't been placed on teams, add them based on target order, otherwise add to the first of equally good posibilities.

Future Improvement: For label creation, the @react-pdf/renderer library is used to create PDFs. The library spoofs svg elements, meaning Svg is used instead of svg and Circle is used instead of circle.

Note for Electron Wrapping: the @react-pdf/renderer library requires resolving buffer and events libraries in the vite.config.js. Additional changes are needed to support this library in the repo that does electron packaging.

This frontend is written in TypeScript with the React framework.

## Requirements

node 20.18.0
npm 11.0.0

## Usage

```
npm install
npm run dev
```

## Installation

This application is intended to exist as a renderer process of an Electron-packaged application.

## Branch Management

The Rim Manager frontend has 1 main branch: main.

- main is a development branch. This is meant for packaging as a stand-alone application.

## Repository Structure

index.html is the landing page of this application. It calls the main Typescript function to render page content.

The src folder has 6 main subfolders: adaptors, assets, components, tiles, types and utils.

- adaptors has all functions that connect to the backend through fetch requests separated by page content.
- assets has an image used by the application for the help icon.
- components has all reusable React components meant to be agnostic of Team Placement (except Content). This is mostly loading screens, navigation and tables (plan is to move Team Placement specific components to a "tiles" folder).
- types has all schemas separated by tile content.
- utils has all standalone functions (to be separated by tile content). This is where most calculations happen.

## Building and Running this Application

NPM (node package manager) is the package manager of this application. After cloning the repository, run `npm install` to collect needed libraries.

Run `npm run dev` to launch the script at <http://localhost:5173>.

In production, this application is packaged through Electron.

## Deployment

Push code to main. Pull changes in the submodule of the electron packaging repository.

## Credits

- [Casey Hardin](https://github.com/Casey-Hardin "Casey's GitHub Profile) wrote the frontend.