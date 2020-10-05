import React, { useEffect, useReducer, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import MapChart from "./components/MapChart";
import SideBar from "./components/SideBar";
import * as Config from "./utils/Config";
import * as StateUpdaters from "./utils/StateUpdaters";
import "./index.css";

const App = (): JSX.Element => {
  const stateManager = useReducer(StateUpdaters.reducer, Config.defaultState);
  const [state, dispatch] = stateManager;

  // Update markers from spreadsheet and render
  useEffect(StateUpdaters.getJsonMarkers(dispatch), []);
  useLayoutEffect(StateUpdaters.updateAllAndCurrentCombinedRows(stateManager), [
    state.rows,
    state.mousePosition,
    state.syncMapAndTable,
  ]);

  // Update visibility after all Markers have been rendered into DOM
  useLayoutEffect(StateUpdaters.updateMarkerVisibility(stateManager), [
    state.allCombinedRows,
    state.currentCombinedRows,
  ]);

  // Render detailed map only when zoomed in enough since it lags on min zoom
  useEffect(StateUpdaters.renderJsonMap(stateManager), [
    state.mousePosition.zoom,
  ]);

  const fullModeRender = (): JSX.Element => {
    return (
      <div id="wrapper">
        <SideBar stateManager={stateManager} width="30%" />
        <MapChart stateManager={stateManager} width="70%" />
      </div>
    );
  };

  const smallModeRender = (): JSX.Element => {
    return (
      <div id="wrapper">
        <MapChart stateManager={stateManager} width="100%" />
      </div>
    );
  };

  return state.inFullMode ? fullModeRender() : smallModeRender();
};

const rootElement = document.getElementById(Config.rootContainerName);
ReactDOM.render(<App />, rootElement);
