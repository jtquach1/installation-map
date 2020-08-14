import React from "react";
import { Marker } from "react-simple-maps";
import PlaceIcon from "./PlaceIcon";
import {
  RowMarkerProps,
  handleMarkerTranslate,
  handleMarkerScale,
  displayOnLargeZoom,
  handleZoomY,
  handleZoomFont,
} from "./mapStyleConsts";

const RowMarker = (props: RowMarkerProps): JSX.Element => {
  const { row, setters, zoom } = props;
  const [setTooltipContent, setCurrentMarker] = setters;
  const { institution, coordinates } = row;

  return (
    <Marker
      onClick={() => {
        setCurrentMarker(row);
      }}
      key={institution}
      coordinates={coordinates}
      onMouseEnter={() => {
        setTooltipContent(institution);
      }}
      onMouseLeave={() => {
        setTooltipContent("");
      }}
    >
      <PlaceIcon
        transform={handleMarkerTranslate(zoom) + " " + handleMarkerScale(zoom)}
      />
      {displayOnLargeZoom(zoom) && (
        <text
          textAnchor="middle"
          y={handleZoomY(zoom)}
          className="institution"
          style={{ fontSize: handleZoomFont(zoom) }}
        >
          {institution}
        </text>
      )}
    </Marker>
  );
};

export default RowMarker;
