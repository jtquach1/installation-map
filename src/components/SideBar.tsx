import React from "react";
import * as Config from "../utils/Config";
import * as Renderers from "../utils/Renderers";
import * as Types from "../utils/Types";
import FilterOptions from "./FilterOptions";

const SideBar = (props: Types.SideBarProps): JSX.Element => {
  return (
    <div className="sidebar" style={{ width: props.width }}>
      <div id="waypoints">
        <h1>cBioPortal Instances</h1>
        <FilterOptions stateManager={props.stateManager} />
        <div className="tableFixHead">
          <table>
            {Renderers.createWaypointsTableHead(Config.tableHeaderKeys)}
            {Renderers.createWaypointsTableBody(
              props.stateManager,
              Config.tableHeaderKeys
            )}
          </table>
        </div>
      </div>
      <div id="waypoint-details">
        <h1>Selected waypoint details</h1>
        <div className="tableFixHead">
          <table>{Renderers.createWaypointDetails(props.stateManager)}</table>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
