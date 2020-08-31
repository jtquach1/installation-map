import React from "react";
import PlaceIcon from "./PlaceIcon";
import { Marker } from "react-simple-maps";
import {
  getCombinedName,
  displayOnLargeZoom,
  handleMarkerTransform,
  getMapMarkerColor,
  createMarkerText,
} from "../utils/Renderers";
import {
  handleMarkerOnClick,
  handleMarkerOnMouse,
} from "../utils/EventHandlers";
import { getMarkerId } from "../utils/StateUpdaters";
import * as Types from "../utils/Types";

const RowMarker = (props: Types.RowMarkerProps): JSX.Element => {
  const [state, dispatch] = props.stateManager;
  const currentZoom = state.mousePosition.zoom;
  const givenRow = props.givenCombinedRow;
  const currentRow = state.currentCombinedRow;
  const combinedName = getCombinedName(givenRow);
  const zoomedInEnoughToDisplay = displayOnLargeZoom(currentZoom);
  const mapMarkerTransform = handleMarkerTransform(currentZoom);
  const mapMarkerColor = getMapMarkerColor(givenRow, currentRow);

  return (
    <Marker
      onClick={handleMarkerOnClick(dispatch, givenRow)}
      coordinates={givenRow.averageCoordinates}
      onMouseEnter={handleMarkerOnMouse(dispatch, combinedName)}
      onMouseLeave={handleMarkerOnMouse(dispatch)}
      id={getMarkerId(givenRow.index)}
    >
      <PlaceIcon transform={mapMarkerTransform} markerColor={mapMarkerColor} />
      {zoomedInEnoughToDisplay && createMarkerText(combinedName, currentZoom)}
    </Marker>
  );
};

export default RowMarker;
