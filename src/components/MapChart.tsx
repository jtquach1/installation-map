import React from "react";
import ZoomControls from "../components/ZoomControls";
import { ComposableMap, ZoomableGroup } from "react-simple-maps";
import { handleMoveEnd } from "../utils/EventHandlers";
import { createGeographies, createRowMarkers } from "../utils/Renderers";
import * as Config from "../utils/Config";
import * as Types from "../utils/Types";

const MapChart = (props: Types.MapChartProps): JSX.Element => {
  const [state] = props.stateManager;
  return (
    <div className="mapchart">
      <ZoomControls stateManager={props.stateManager} />
      <ComposableMap
        id={Config.mapContainerName}
        height={550}
        projectionConfig={{ scale: 200 }}
      >
        <ZoomableGroup
          zoom={state.mousePosition.zoom}
          center={state.mousePosition.coordinates}
          onMoveEnd={handleMoveEnd(props.stateManager)}
          minZoom={Config.minZoom}
          maxZoom={Config.maxZoom}
        >
          {createGeographies(props.stateManager)}
          {createRowMarkers(props.stateManager)}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default MapChart;
