import React from "react";
import * as Config from "./Config";
import * as Functions from "./Functions";
import * as Types from "./Types";

const SideBar = (props: Types.SideBarProps): JSX.Element => {
  return (
    <div className="left">
      <h1>Waypoints</h1>
      <div className="tableFixHead waypoints">
        <table>
          {Functions.createWaypointsTableHead(Config.tableHeaderKeys)}
          {Functions.createWaypointsTableBody(
            props.stateManager,
            Config.tableHeaderKeys
          )}
        </table>
      </div>
      <h1>Selected waypoint details</h1>
      <div className="tableFixHead waypoint-details">
        <table>{Functions.createWaypointDetails(props.stateManager)}</table>
      </div>
    </div>
  );
};

export default SideBar;
