import React from "react";
import * as Config from "../utils/Config";
import * as Types from "../utils/Types";
import {
  createWaypointsTableHead,
  createWaypointsTableBody,
  createWaypointDetails,
} from "../utils/Renderers";

const SideBar = (props: Types.SideBarProps): JSX.Element => {
  return (
    <div className="left">
      <h1>Waypoints</h1>
      <div className="tableFixHead waypoints">
        <table>
          {createWaypointsTableHead(Config.tableHeaderKeys)}
          {createWaypointsTableBody(props.stateManager, Config.tableHeaderKeys)}
        </table>
      </div>
      <h1>Selected waypoint details</h1>
      <div className="tableFixHead waypoint-details">
        <table>{createWaypointDetails(props.stateManager)}</table>
      </div>
    </div>
  );
};

export default SideBar;
