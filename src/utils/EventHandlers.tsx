import * as Config from "./Config";
import * as Renderers from "./Renderers";
import * as StateUpdaters from "./StateUpdaters";
import * as Types from "./Types";

/////////////////
// MapChart.tsx
/////////////////

export const handleMoveEnd = (stateManager: Types.StateManager) => (
  newPosition: Types.Position
): void => {
  const [state, dispatch] = stateManager;
  const originalPosition = state.mousePosition;
  const gotNewZoom = didZoomChange(newPosition, originalPosition);
  const gotNewCoordinates = didCoordinatesChange(newPosition, originalPosition);

  if (gotNewZoom && gotNewCoordinates) {
    state.mousePosition = newPosition;
  } else if (gotNewZoom) {
    state.mousePosition = {
      ...originalPosition,
      zoom: newPosition.zoom,
    };
  } else if (gotNewCoordinates) {
    state.mousePosition = {
      ...originalPosition,
      coordinates: newPosition.coordinates,
    };
  } else {
    /* The fall-through to return is required because map panning would 
    otherwise trigger a rerender when clicking on a Marker. */
    return;
  }

  dispatch({
    type: "setMousePosition",
    value: state.mousePosition,
  });
};

const didZoomChange = (
  newPosition: Types.Position,
  originalPosition: Types.Position
): boolean => {
  const newZoom = newPosition.zoom;
  const originalZoom = originalPosition.zoom;
  return newZoom !== originalZoom;
};

const didCoordinatesChange = (
  newPosition: Types.Position,
  originalPosition: Types.Position
): boolean => {
  const newCoordinates = newPosition.coordinates;
  const originalCoordinates = originalPosition.coordinates;
  return (
    newCoordinates[0] !== originalCoordinates[0] ||
    newCoordinates[1] !== originalCoordinates[1]
  );
};

/////////////////////
// ZoomControls.tsx
/////////////////////

export const handleZoomIn = (stateManager: Types.StateManager) => (): void => {
  const [state] = stateManager;
  const canZoomIn = state.mousePosition.zoom < Config.maxZoom;
  if (canZoomIn) {
    const newPosition = {
      ...state.mousePosition,
      zoom: state.mousePosition.zoom * Config.zoomMultiplier,
    };

    handleMoveEnd(stateManager)(newPosition);
  }
};

export const handleZoomOut = (stateManager: Types.StateManager) => (): void => {
  const [state] = stateManager;
  const canZoomOut = state.mousePosition.zoom > Config.minZoom;
  if (canZoomOut) {
    const newPosition = {
      ...state.mousePosition,
      zoom: state.mousePosition.zoom / Config.zoomMultiplier,
    };

    handleMoveEnd(stateManager)(newPosition);
  }
};

////////////////////////
// OrphanTableRows.tsx
////////////////////////

export const handleMarkerOnClick = (
  dispatch: Types.Dispatch,
  givenCombinedRow: Types.CombinedRow,
  givenRow: Types.Row
) => (): void => {
  const rowIndexRelativeToSiblings = getRowIndex(givenCombinedRow, givenRow);
  dispatch({ type: "setCurrentCombinedRows", value: [givenCombinedRow] });
  dispatch({ type: "setCurrentRow", value: givenRow });
  handleWaypointsTableScrollbar(
    givenCombinedRow.index,
    rowIndexRelativeToSiblings
  );
};

const getRowIndex = (
  givenCombinedRow: Types.CombinedRow,
  givenRow: Types.Row
): number => {
  const highlightMultipleRows = Renderers.rowIsDefault(givenRow);
  const betweenAnySiblings = givenCombinedRow.rows.indexOf(givenRow);
  const aboveAllSiblings = 0;
  return highlightMultipleRows ? aboveAllSiblings : betweenAnySiblings;
};

export const handleWaypointsTableScrollbar = (
  combinedRowIndex: number,
  rowIndex: number
): void => {
  const waypointsTable = document.getElementsByClassName(
    Config.scrollableTableName
  )[0];
  const firstRowOffset = getFirstRowOffset(combinedRowIndex, rowIndex);
  const tableHeadHeight = getTableHeadHeight();
  if (!waypointsTable || !firstRowOffset || !tableHeadHeight) {
  } else {
    const newVerticalPosition = firstRowOffset - tableHeadHeight;
    waypointsTable.scrollTo({ top: newVerticalPosition, behavior: "smooth" });
  }
};

const getTableHeadHeight = (): number | undefined => {
  const waypointsTableHead = document.getElementById(Config.waypointsHeadName);
  return waypointsTableHead?.offsetHeight;
};

const getFirstRowOffset = (
  combinedRowIndex: number,
  rowIndex: number
): number | undefined => {
  const markerIdentifier = StateUpdaters.getMarkerIdentifier(combinedRowIndex);
  const tableRows = document.getElementsByClassName(markerIdentifier);
  const tableRowToSnapTo = tableRows[rowIndex] as HTMLElement | undefined;
  return !tableRowToSnapTo ? undefined : tableRowToSnapTo.offsetTop;
};

//////////////////////
// FilterOptions.tsx
//////////////////////

export const handleSyncToggle = (
  stateManager: Types.StateManager
) => (): void => {
  const [state, dispatch] = stateManager;
  dispatch({ type: "toggleSync", value: !state.syncMapAndTable });
};

export const handleInputText = (stateManager: Types.StateManager) => (
  event: React.ChangeEvent<HTMLInputElement>
): void => {
  const [, dispatch] = stateManager;
  dispatch({ type: "setSearchBarContent", value: event.target.value });
};

export const handleInputClear = (
  stateManager: Types.StateManager
) => (): void => {
  const [, dispatch] = stateManager;
  dispatch({
    type: "setSearchBarContent",
    value: Config.defaultSearchBarContent,
  });
};
