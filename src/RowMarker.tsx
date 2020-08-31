import React from "react";
import PlaceIcon from "./PlaceIcon";
import { Marker } from "react-simple-maps";
import * as Functions from "./Functions";
import * as Types from "./Types";

const RowMarker = (props: Types.RowMarkerProps): JSX.Element => {
  const [state, dispatch] = props.stateManager;
  const currentZoom = state.mousePosition.zoom;
  const givenRow = props.givenCombinedRow;
  const currentRow = state.currentCombinedRow;
  const combinedName = Functions.getCombinedName(givenRow);
  const zoomedInEnoughToDisplay = Functions.displayOnLargeZoom(currentZoom);
  const mapMarkerTransform = Functions.handleMarkerTransform(currentZoom);
  const mapMarkerColor = Functions.getMapMarkerColor(givenRow, currentRow);

  return (
    <Marker
      onClick={Functions.handleMarkerOnClick(dispatch, givenRow)}
      coordinates={givenRow.averageCoordinates}
      onMouseEnter={Functions.handleMarkerOnMouse(dispatch, combinedName)}
      onMouseLeave={Functions.handleMarkerOnMouse(dispatch)}
    >
      <PlaceIcon transform={mapMarkerTransform} markerColor={mapMarkerColor} />
      {zoomedInEnoughToDisplay &&
        Functions.createMarkerText(combinedName, currentZoom)}
    </Marker>
  );
};

export default RowMarker;
