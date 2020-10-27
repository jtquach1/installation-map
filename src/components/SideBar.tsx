import React from "react";
import * as Config from "../utils/Config";
import * as Renderers from "../utils/Renderers";
import * as Types from "../utils/Types";
import FilterOptions from "./FilterOptions";

const SideBar = (props: Types.SideBarProps): JSX.Element => {
  const [state] = props.stateManager;
  const detailsContent =
    state.currentCombinedRows.length === 0 ? (
      <p>
        Select an instance in the table or map to see additional information.
      </p>
    ) : (
      <table>{Renderers.createWaypointDetails(props.stateManager)}</table>
    );

  return (
    <div className="sidebar" style={{ width: props.width }}>
      <div id="description">
        <h1>Description</h1>
        <p>
          This map shows the public and private local instances of the
          cBioPortal. If you are running a local instance that is not included
          in this list, please complete{" "}
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSflQdN956q7Xh5caO8z8jIaF6uMLBkKrSxFvPi8OhNBWB247w/viewform">
            this survey
          </a>{" "}
          to add it to the map.
        </p>
      </div>
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
        <h1>Selected Instance Details</h1>
        <div className="tableFixHead">{detailsContent}</div>
      </div>
    </div>
  );
};

export default SideBar;
