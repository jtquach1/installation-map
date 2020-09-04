import React from "react";
import ZoomControls from "../components/ZoomControls";
import { ComposableMap, ZoomableGroup } from "react-simple-maps";
import * as Config from "../utils/Config";
import * as EventHandlers from "../utils/EventHandlers";
import * as Renderers from "../utils/Renderers";
import * as Types from "../utils/Types";

const MapChart = (props: Types.MapChartProps): JSX.Element => {
  const [state] = props.stateManager;
  const dimensions = Renderers.handleDimensions(state.inFullMode);

  const fullModeRender = (): JSX.Element => {
    return (
      <div className="mapchart" style={{ width: props.width }}>
        <ZoomControls stateManager={props.stateManager} />
        <ComposableMap
          id={Config.mapContainerName}
          width={dimensions.width}
          height={dimensions.height}
          projection="geoEqualEarth"
          projectionConfig={{ scale: dimensions.scale }}
        >
          <ZoomableGroup
            zoom={state.mousePosition.zoom}
            center={state.mousePosition.coordinates}
            onMoveEnd={EventHandlers.handleMoveEnd(props.stateManager)}
            minZoom={Config.minZoom}
            maxZoom={Config.maxZoom}
          >
            {Renderers.createGeographies(props.stateManager)}
            {Renderers.createRowMarkers(props.stateManager)}
          </ZoomableGroup>
        </ComposableMap>
      </div>
    );
  };

  const smallModeRender = (): JSX.Element => {
    return (
      <div className="mapchart" style={{ width: props.width }}>
        <ComposableMap
          id={Config.mapContainerName}
          width={dimensions.width}
          height={dimensions.height}
          projection="geoMercator"
          projectionConfig={{ scale: dimensions.scale }}
        >
          {Renderers.createGeographies(props.stateManager)}
          {Renderers.createRowMarkers(props.stateManager)}
        </ComposableMap>
      </div>
    );
  };

  return state.inFullMode ? fullModeRender() : smallModeRender();
};

export default MapChart;
