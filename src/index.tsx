import React, { useEffect, useReducer } from "react";
import ReactDOM from "react-dom";
import ReactTooltip from "react-tooltip";
import MapChart from "./components/MapChart";
import SideBar from "./components/SideBar";
import { reducer, getUpdatedCombinedRowsByZoom } from "./utils/StateUpdaters";
import * as Config from "./utils/Config";
import "./index.css";

const App = (): JSX.Element => {
  const stateManager = useReducer(reducer, Config.defaultState);
  const [state, dispatch] = stateManager;
  const { rows, combinedRows, mousePosition } = state;
  const { zoom, coordinates } = mousePosition;

  // Promise to get markers for served build
  useEffect(() => {
    const fetchMarkers = async () => {
      const response = await fetch("/static/waypoints.json");
      const markers = await response.json();
      dispatch({ type: "setRows", value: markers });
    };
    fetchMarkers();
  }, [dispatch]);

  /**
   * Only rerenders when current combinedRows differs from previous.
   */
  useEffect(() => {
    dispatch({
      type: "updateCombinedRows",
      value: getUpdatedCombinedRowsByZoom(rows, combinedRows, zoom),
    });
  }, [dispatch, rows, combinedRows, zoom, coordinates]);

  console.log("state.tooltipContent", state.tooltipContent);

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
