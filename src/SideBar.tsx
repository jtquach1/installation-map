import React from "react";
import {
  createTableHeader,
  createTableRows,
  markerDetailMap,
  createWaypointDetails,
  SideBarProps,
} from "./mapStyleConsts";

const SideBar = (props: SideBarProps): JSX.Element => {
  const { stateManager } = props;
  const keys = ["institution", "lab", "address"];

  return (
    <div className="left">
      <div className="tableFixHead">
        <h1>Waypoints</h1>
        <table>
          {createTableHeader(keys)}
          {createTableRows(stateManager, keys)}
        </table>
      </div>
      <div className="tableFixHead">
        <h1>Selected waypoint details</h1>
        <table>{createWaypointDetails(stateManager, markerDetailMap)}</table>
      </div>
    </div>
  );
};

export default SideBar;
