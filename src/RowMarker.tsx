import React from "react";
import { Marker } from "react-simple-maps";
import PlaceIcon from "./PlaceIcon";
import {
  RowMarkerProps,
  handleMarkerTranslate,
  handleMarkerScale,
  handleMarkerOffset,
  displayOnLargeZoom,
  handleMarkerFontSize,
  primaryColor,
  tertiaryColor,
} from "./mapStyleConsts";

const RowMarker = (props: RowMarkerProps): JSX.Element => {
  const { row, zoom, stateManager } = props;
  const { institution, coordinates } = row;
  const [state, dispatch] = stateManager;
  const getMarkerColor =
    row === state.currentMarker ? primaryColor : tertiaryColor;

  return (
    <Marker
      onClick={() => {
        dispatch({ type: "currentMarker", value: row });
      }}
      key={institution}
      coordinates={coordinates}
      onMouseEnter={() => {
        dispatch({ type: "tooltipContent", value: institution });
      }}
      onMouseLeave={() => {
        dispatch({ type: "tooltipContent", value: "" });
      }}
    >
      <PlaceIcon
        transform={handleMarkerTranslate(zoom) + " " + handleMarkerScale(zoom)}
        markerColor={getMarkerColor}
      />
      {displayOnLargeZoom(zoom) && (
        <text
          textAnchor="middle"
          y={handleMarkerOffset(zoom)}
          className="institution"
          style={{ fontSize: handleMarkerFontSize(zoom) }}
        >
          {institution}
        </text>
      )}
    </Marker>
  );
};

export default RowMarker;
