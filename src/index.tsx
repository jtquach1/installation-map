import React, { useEffect, useReducer } from "react";
import ReactDOM from "react-dom";
import ReactTooltip from "react-tooltip";
import MapChart from "./MapChart";
import SideBar from "./SideBar";
import * as Config from "./Config";
import * as Functions from "./Functions";
import "./index.css";

const App = (): JSX.Element => {
  const stateManager = useReducer(Functions.reducer, Config.defaultState);
  const [state, dispatch] = stateManager;

  // Promise to get markers for served build
  useEffect(() => {
    const fetchMarkers = async (): Promise<void> => {
      const response = await fetch("/static/waypoints.json");
      const markers = await response.json();
      dispatch({ type: "setRows", value: markers });
    };
    fetchMarkers();
  }, [dispatch]);

  // Only rerenders when current combinedRows differs from previous
  useEffect(() => {
    dispatch({
      type: "updateCombinedRows",
      value: Functions.getUpdatedCombinedRowsByZoom(
        state.rows,
        state.combinedRows,
        state.mousePosition.zoom
      ),
    });
  }, [dispatch, state.rows, state.combinedRows, state.mousePosition.zoom]);

  return (
    <div id="wrapper">
      <SideBar stateManager={stateManager} />
      <MapChart stateManager={stateManager} />
      <ReactTooltip>{state.tooltipContent}</ReactTooltip>
    </div>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
