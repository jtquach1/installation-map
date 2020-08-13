import React, { useState, useEffect } from "react";
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
  row,
  setters,
  position,
  geoUrl,
  handleZoomStroke,
  minZoom,
  maxZoom,
  displayDebuggingFeatures,
} from "./mapStyleConsts";

const MapChart = (props: { functions: setters }): JSX.Element => {
  // Promise to get markers for served build
  const [markers, setMarkers] = React.useState([]);
  useEffect(() => {
    const fetchMarkers = async () => {
      const response = await fetch("/static/waypoints.json");
      const markers = await response.json();
      setMarkers(markers);
    };
    fetchMarkers();
  }, []);

  const [mousePosition, setMousePosition] = useState({
    coordinates: [0, 0],
    zoom: minZoom,
  } as position);

  const handleZoomIn = (zoom: number): void => {
    if (zoom < maxZoom) {
      setMousePosition((pos) => ({ ...pos, zoom: pos.zoom * 2 }));
    }
  };

  const handleZoomOut = (zoom: number): void => {
    if (zoom > minZoom) {
      setMousePosition((pos) => ({ ...pos, zoom: pos.zoom / 2 }));
    }
  };

  const handleMoveEnd = (pos: position): void => {
    setMousePosition(pos);
  };

  return (
    <div className="mapchart">
      <div className="controls-wrapper">
        {displayDebuggingFeatures(true, mousePosition)}
        <div className="controls">
          <button onClick={() => handleZoomIn(mousePosition.zoom)}>
            <ZoomIn />
          </button>
          <button onClick={() => handleZoomOut(mousePosition.zoom)}>
            <ZoomOut />
          </button>
        </div>
      </div>
      <ComposableMap data-tip="" projectionConfig={{ scale: 200 }}>
        <ZoomableGroup
          zoom={mousePosition.zoom}
          center={mousePosition.coordinates}
          onMoveEnd={handleMoveEnd}
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
                  strokeWidth={handleZoomStroke(mousePosition.zoom)}
                />
              ))
            }
          </Geographies>
          {markers.map((row: row) => {
            return (
              <RowMarker
                key={row.index}
                row={row}
                setters={props.functions}
                zoom={mousePosition.zoom}
              />
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default MapChart;
