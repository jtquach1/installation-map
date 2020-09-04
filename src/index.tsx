import React, { useEffect, useReducer } from "react";
import ReactDOM from "react-dom";
import ReactTooltip from "react-tooltip";
import MapChart from "./components/MapChart";
import SideBar from "./components/SideBar";
import * as Config from "./utils/Config";
import * as Renderers from "./utils/Renderers";
import * as StateUpdaters from "./utils/StateUpdaters";
import "./index.css";

const App = (): JSX.Element => {
  const stateManager = useReducer(StateUpdaters.reducer, Config.defaultState);
  const [state, dispatch] = stateManager;

  // Promise to get markers for served build
  useEffect(() => {
    const fetchMarkers = async () => {
      const response = await fetch("/static/waypoints.json");
      const markers = await response.json();
      dispatch({ type: "setRows", value: markers });
    };
    fetchMarkers();
  }, [dispatch]);

  // Only rerenders when current combinedRows differs from previous.
  useEffect(() => {
    dispatch({
      type: "updateCombinedRows",
      value: StateUpdaters.getUpdatedCombinedRowsByZoom(
        state.rows,
        state.combinedRows,
        state.mousePosition.zoom
      ),
    });
  }, [
    dispatch,
    state.rows,
    state.combinedRows,
    state.mousePosition.zoom,
    state.mousePosition.coordinates,
  ]);

  // Display configuration for cBioPortal sidebar vs. full standalone page
  useEffect(() => {
    dispatch({
      type: "setInFullMode",
      value: StateUpdaters.checkInFullMode(),
    });
  }, [dispatch]);

  const fullModeRender = (): JSX.Element => {
    Renderers.setRootElementWidth(Config.fullWidth);
    return (
      <div id="wrapper">
        <SideBar stateManager={stateManager} width="30%" />
        <MapChart stateManager={stateManager} width="70%" />
        <ReactTooltip>{state.tooltipContent}</ReactTooltip>
      </div>
    );
  };

  const smallModeRender = (): JSX.Element => {
    Renderers.setRootElementWidth(Config.smallWidth);
    return (
      <div id="wrapper">
        <MapChart stateManager={stateManager} width="100%" />
      </div>
    );
  };

  return state.inFullMode ? fullModeRender() : smallModeRender();
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
