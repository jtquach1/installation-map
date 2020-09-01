import * as Config from "./Config";
import * as Types from "./Types";

/////////////////
// MapChart.tsx
/////////////////

export const handleMoveEnd = (stateManager: Types.stateManager) => (
  newPosition: Types.position
): void => {
  const [state, dispatch] = stateManager;
  const originalPosition = state.mousePosition;
  const zoomLevelChanged = newPosition.zoom !== originalPosition.zoom;
  return zoomLevelChanged
    ? dispatch({
        type: "updateMousePositionAndRefreshMarkers",
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

export const handleZoomIn = (stateManager: Types.stateManager) => (): void => {
  const [state, dispatch] = stateManager;
  const currentPosition = state.mousePosition;
  const canZoomIn = currentPosition.zoom < Config.maxZoom;
  canZoomIn &&
    dispatch({
      type: "updateMousePositionAndRefreshMarkers",
      value: {
        ...currentPosition,
        zoom: currentPosition.zoom * Config.zoomMultiplier,
      },
    });
};

export const handleZoomOut = (stateManager: Types.stateManager) => (): void => {
  const [state, dispatch] = stateManager;
  const currentPosition = state.mousePosition;
  const canZoomOut = currentPosition.zoom > Config.minZoom;
  canZoomOut &&
    dispatch({
      type: "updateMousePositionAndRefreshMarkers",
      value: {
        ...currentPosition,
        zoom: currentPosition.zoom / Config.zoomMultiplier,
      },
    });
};

//////////////////
// RowMarker.tsx
//////////////////

export const handleMarkerOnMouse = (
  dispatch: Types.Dispatch,
  combinedName?: string
) => (): void => {
  const newTooltipContent = combinedName || Config.defaultTooltipContent;
  dispatch({ type: "setTooltipContent", value: newTooltipContent });
};

////////////////////////
// OrphanTableRows.tsx
////////////////////////

export const handleMarkerOnClick = (
  dispatch: Types.Dispatch,
  givenRow: Types.combinedRow
) => (): void => {
  dispatch({ type: "setCurrentCombinedRow", value: givenRow });
};
