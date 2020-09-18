import React from "react";
import PlaceIcon from "./PlaceIcon";
import { Marker } from "react-simple-maps";
import * as Config from "../utils/Config";
import * as EventHandlers from "../utils/EventHandlers";
import * as Renderers from "../utils/Renderers";
import * as StateUpdaters from "../utils/StateUpdaters";
import * as Types from "../utils/Types";

const RowMarker = (props: Types.RowMarkerProps): JSX.Element => {
  const [state, dispatch] = props.stateManager;
  const currentZoom = state.mousePosition.zoom;
  const givenRow = props.givenCombinedRow;
  const currentRows = state.currentCombinedRows;
  const combinedName = Renderers.getCombinedName(givenRow);
  const zoomedInEnoughToDisplay = Renderers.displayOnLargeZoom(currentZoom);
  const mapMarkerTransform = Renderers.handleMarkerTransform(currentZoom);
  const mapMarkerColor = Renderers.getMapMarkerColor(givenRow, currentRows);

  return (
    <Marker
      onClick={EventHandlers.handleMarkerOnClick(
        dispatch,
        givenRow,
        Config.defaultRow
      )}
      coordinates={givenRow.averageCoordinates}
      id={StateUpdaters.getMarkerIdentifier(givenRow.index)}
    >
      <PlaceIcon transform={mapMarkerTransform} markerColor={mapMarkerColor} />
      {zoomedInEnoughToDisplay &&
        Renderers.createMarkerText(
          combinedName,
          givenRow.rows.length,
          currentZoom
        )}
    </Marker>
  );
};

export default RowMarker;
