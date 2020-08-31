import React from "react";
import ZoomControls from "./ZoomControls";
import { ComposableMap, ZoomableGroup } from "react-simple-maps";
import * as Config from "./Config";
import * as Functions from "./Functions";
import * as Types from "./Types";

const MapChart = (props: Types.MapChartProps): JSX.Element => {
  const [state] = props.stateManager;
  return (
    <div className="mapchart">
      <ZoomControls stateManager={props.stateManager} />
      <ComposableMap projectionConfig={{ scale: 200 }}>
        <ZoomableGroup
          zoom={state.mousePosition.zoom}
          center={state.mousePosition.coordinates}
          onMoveEnd={(newPosition) =>
            Functions.handleMoveEnd(newPosition, props.stateManager)
          }
          minZoom={Config.minZoom}
          maxZoom={Config.maxZoom}
        >
          {Functions.createGeographies(props.stateManager)}
          {Functions.createRowMarkers(props.stateManager)}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default MapChart;
