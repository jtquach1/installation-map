import React, { useEffect, useReducer } from "react";
import ReactDOM from "react-dom";
import ReactTooltip from "react-tooltip";
import "./index.css";
import { reducer, defaultState } from "./mapStyleConsts";
import MapChart from "./MapChart";
import SideBar from "./SideBar";

const App = (): JSX.Element => {
  const stateManager = useReducer(reducer, defaultState);
  const [state, dispatch] = stateManager;

  // Promise to get markers for served build
  useEffect(() => {
    const fetchMarkers = async (): Promise<void> => {
      const response = await fetch("/static/waypoints.json");
      const markers = await response.json();
      dispatch({ type: "setMarkers", value: markers });
    };
    fetchMarkers();
  }, [dispatch]);

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
