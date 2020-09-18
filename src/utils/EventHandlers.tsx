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
  const zoomLevelChanged = newPosition.zoom !== originalPosition.zoom;
  zoomLevelChanged
    ? dispatch({
        type: "setMousePosition",
        value: newPosition,
      })
    : dispatch({
        type: "setMousePosition",
        value: {
          ...originalPosition,
          coordinates: newPosition.coordinates,
        },
      });
};

/////////////////////
// ZoomControls.tsx
/////////////////////

export const handleZoomIn = (stateManager: Types.StateManager) => (): void => {
  const [state, dispatch] = stateManager;
  const currentPosition = state.mousePosition;
  const canZoomIn = currentPosition.zoom < Config.maxZoom;
  canZoomIn &&
    dispatch({
      type: "setMousePosition",
      value: {
        ...currentPosition,
        zoom: currentPosition.zoom * Config.zoomMultiplier,
      },
    });
};

export const handleZoomOut = (stateManager: Types.StateManager) => (): void => {
  const [state, dispatch] = stateManager;
  const currentPosition = state.mousePosition;
  const canZoomOut = currentPosition.zoom > Config.minZoom;
  canZoomOut &&
    dispatch({
      type: "setMousePosition",
      value: {
        ...currentPosition,
        zoom: currentPosition.zoom / Config.zoomMultiplier,
      },
    });
};

////////////////////////
// OrphanTableRows.tsx
////////////////////////

export const handleMarkerOnClick = (
  dispatch: Types.Dispatch,
  givenCombinedRow: Types.CombinedRow,
  givenRow: Types.Row
) => (): void => {
  const highlightMultipleRows = Renderers.rowIsDefault(givenRow);
  const betweenAnySiblings = givenCombinedRow.rows.indexOf(givenRow);
  const aboveAllSiblings = 0;
  const rowIndexRelativeToSiblings = highlightMultipleRows
    ? aboveAllSiblings
    : betweenAnySiblings;
  dispatch({ type: "setCurrentCombinedRows", value: [givenCombinedRow] });
  dispatch({ type: "setCurrentRow", value: givenRow });
  handleWaypointsTableScrollbar(
    givenCombinedRow.index,
    rowIndexRelativeToSiblings
  );
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

export const handleVisibilityToggle = (
  stateManager: Types.StateManager
) => (): void => {
  const [state, dispatch] = stateManager;
  dispatch({ type: "toggleVisibility", value: !state.useMarkerVisibility });
};

export const handleInputText = (stateManager: Types.StateManager) => (
  event: React.ChangeEvent<HTMLInputElement>
): void => {
  const [, dispatch] = stateManager;
  dispatch({ type: "toggleSearchBarQuery", value: true });
  dispatch({ type: "setSearchBarContent", value: event.target.value });
};

export const handleInputClear = (
  stateManager: Types.StateManager
) => (): void => {
  const [, dispatch] = stateManager;
  dispatch({ type: "toggleSearchBarQuery", value: false });
  dispatch({
    type: "setSearchBarContent",
    value: Config.defaultSearchBarContent,
  });
};
