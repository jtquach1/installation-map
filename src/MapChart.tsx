import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { ReactComponent as ZoomIn } from "./zoom-in.svg";
import { ReactComponent as ZoomOut } from "./zoom-out.svg";
import RowMarker from "./RowMarker";
import {
  geoUrl,
  minZoom,
  maxZoom,
  displayDebuggingFeatures,
  MapChartProps,
  position,
  handleStrokeWidth,
  secondaryColor,
} from "./mapStyleConsts";

const MapChart = (props: MapChartProps): JSX.Element => {
  const { stateManager } = props;
  const [state] = stateManager;
  const markers = state.markers;

  const [mousePosition, setMousePosition] = useState({
    coordinates: [0, 0],
    zoom: minZoom,
  } as position);

  const handleZoomIn = (zoom: number): void => {
    if (zoom < maxZoom) {
      setMousePosition((pos) => ({
        ...pos,
        zoom: pos.zoom * 2,
      }));
    }
  };

  const handleZoomOut = (zoom: number): void => {
    if (zoom > minZoom) {
      setMousePosition((pos) => ({ ...pos, zoom: pos.zoom / 2 }));
    }
  };

  return (
    <div className="mapchart">
      <div className="controls-wrapper">
        {displayDebuggingFeatures(true, mousePosition)}
        <div className="controls">
          <button
            onClick={() => handleZoomIn(mousePosition.zoom)}
            style={{ background: secondaryColor }}
          >
            <ZoomIn />
          </button>
          <button
            onClick={() => handleZoomOut(mousePosition.zoom)}
            style={{ background: secondaryColor }}
          >
            <ZoomOut />
          </button>
        </div>
      </div>
      <ComposableMap data-tip="" projectionConfig={{ scale: 200 }}>
        <ZoomableGroup
          zoom={mousePosition.zoom}
          center={mousePosition.coordinates}
          onMoveEnd={setMousePosition}
          minZoom={minZoom}
          maxZoom={maxZoom}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#EAEAEC"
                  stroke="#D6D6DA"
                  strokeWidth={handleStrokeWidth(mousePosition.zoom)}
                />
              ))
            }
          </Geographies>
          {markers.map((row) => {
            return (
              <RowMarker
                key={row.index}
                row={row}
                zoom={mousePosition.zoom}
                stateManager={stateManager}
              />
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default MapChart;
