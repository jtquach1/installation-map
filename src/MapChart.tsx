import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
  Point,
} from "react-simple-maps";

interface column {
  institution: string;
  category: string;
  lab: string;
  address: string;
  coordinates: Point | number[];
}

interface setters
  extends Array<
    | React.Dispatch<React.SetStateAction<string>>
    | React.Dispatch<React.SetStateAction<column>>
  > {
  0: React.Dispatch<React.SetStateAction<string>>;
  1: React.Dispatch<React.SetStateAction<column>>;
}

interface position {
  coordinates: Point | number[];
  zoom: number;
}

// World map
const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

const MapChart = (props: { functions: setters }): JSX.Element => {
  const [setTooltipContent, setColumnContent] = props.functions;

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

  // Map default zoom
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  // For zoom in/out buttons
  const handleZoomIn = (): void => {
    if (position.zoom >= 8) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 2 }));
  };

  const handleZoomOut = (): void => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 2 }));
  };

  const handleMoveEnd = (pos: position): void => {
    setPosition(pos);
  };

  const handleZoomFont = (zoom: number): number => {
    return 12 / zoom;
  };

  const handleMarkerScale = (zoom: number): string => {
    return "scale(" + 1 / zoom + ")";
  };

  const handleMarkerTranslate = (zoom: number): string => {
    const x = -12 / zoom;
    const y = -24 / zoom;
    return "translate(" + x + ", " + y + ")";
  };

  const handleZoomY = (zoom: number): number => {
    return 12 / zoom - zoom / 12;
  };

  const handleZoomStroke = (zoom: number): number => {
    return 1 / zoom;
  };

  // Display city names next to markers based on zoom level
  const isVisible = (): boolean => {
    return position.zoom >= 1.5;
  };

  const toPoint = (coordinates: number[]): Point => {
    return [coordinates[0], coordinates[1]];
  };

  return (
    <div className="mapchart">
      <div className="controls-wrapper">
        <text>Zoom: {position.zoom}, </text>
        <text>isVisible(): {isVisible().toString()}, </text>
        <text>
          Coordinates:
          {" (" +
            position.coordinates[0] +
            ", " +
            position.coordinates[1] +
            ")"}
        </text>
        <div className="controls">
          <button onClick={handleZoomIn}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button onClick={handleZoomOut}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
      <ComposableMap data-tip="" projectionConfig={{ scale: 200 }}>
        <ZoomableGroup
          zoom={position.zoom}
          center={toPoint(position.coordinates)}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#EAEAEC"
                  stroke="#D6D6DA"
                  strokeWidth={handleZoomStroke(position.zoom)}
                />
              ))
            }
          </Geographies>
          {markers.map(
            ({ institution, category, lab, address, coordinates }: column) => (
              <Marker
                onClick={() => {
                  setColumnContent({
                    institution,
                    category,
                    lab,
                    address,
                    coordinates,
                  });
                }}
                key={institution}
                coordinates={toPoint(coordinates)}
                onMouseEnter={() => {
                  setTooltipContent(`${institution}`);
                }}
                onMouseLeave={() => {
                  setTooltipContent("");
                }}
              >
                {/* "Place" From Material Design, Apache license version 2.0 */}
                <g
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                  transform={
                    handleMarkerTranslate(position.zoom) +
                    " " +
                    handleMarkerScale(position.zoom)
                  }
                >
                  <circle cx="12" cy="9" r="3" fill-opacity="0" />
                  <path
                    fill="#3786c2"
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  />
                </g>
                {isVisible() && (
                  <text
                    textAnchor="middle"
                    y={handleZoomY(position.zoom)}
                    className="institution"
                    style={{ fontSize: handleZoomFont(position.zoom) }}
                  >
                    {institution}
                  </text>
                )}
              </Marker>
            )
          )}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default MapChart;
