import React from "react";
import * as Config from "../utils/Config";
import * as Types from "../utils/Types";
import {
  createWaypointsTableHead,
  createWaypointsTableBody,
  createWaypointDetails,
} from "../utils/Renderers";
import FilterOptions from "./FilterOptions";

const SideBar = (props: Types.SideBarProps): JSX.Element => {
  return (
    <div className="left" style={{ width: props.width }}>
      <h1>Waypoints</h1>
      <div className="tableFixHead" id="waypoints">
        <table>
          {createWaypointsTableHead(Config.tableHeaderKeys)}
          {createWaypointsTableBody(props.stateManager, Config.tableHeaderKeys)}
        </table>
      </div>
      <FilterOptions stateManager={props.stateManager} />
      <h1>Selected waypoint details</h1>
      <div className="tableFixHead" id="waypoint-details">
        <table>{createWaypointDetails(props.stateManager)}</table>
      </div>
    </div>
  );
};

export default SideBar;
