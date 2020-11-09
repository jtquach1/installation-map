import { Point } from "react-simple-maps";
import * as Config from "./Config";
import * as EventHandlers from "./EventHandlers";
import * as Renderers from "./Renderers";
import * as Types from "./Types";

//////////////
// index.tsx
//////////////

export const reducer = (
  state: Types.State,
  action: Types.Action
): Types.State => {
  switch (action.type) {
    case "setRows":
      return { ...state, rows: action.value as Types.Row[] };
    case "setAllCombinedRows":
      return {
        ...state,
        allCombinedRows: action.value as Types.CombinedRow[],
      };
    case "setCurrentCombinedRows":
      return {
        ...state,
        currentCombinedRows: action.value as Types.CombinedRow[],
      };
    case "setMousePosition":
      return { ...state, mousePosition: action.value as Types.Position };
    case "setSearchBarContent":
      return { ...state, searchBarContent: action.value as string };
    case "setCurrentRow":
      return { ...state, currentRow: action.value as Types.Row };
    case "setDisplayDetailedMap":
      return { ...state, displayDetailedMap: action.value as boolean };
    case "toggleSync":
      return { ...state, syncMapAndTable: action.value as boolean };
    default:
      return state;
  }
};

export const getJsonMarkers = (
  dispatch: Types.Dispatch
): React.EffectCallback => () => {
  const fetchMarkers = async (): Promise<void> => {
    const response: Response = await fetch("/static/waypoints.json");
    const markers: Types.Row[] = await response.json();
    dispatch({ type: "setRows", value: markers });
  };
  fetchMarkers();
};

export const updateAllAndCurrentCombinedRows = (
  stateManager: Types.StateManager
): React.EffectCallback => () => {
  const [state, dispatch] = stateManager;
  const updatedCombinedRows = updateAllCombinedRowsByZoom(
    state.rows,
    Config.defaultCombinedRows,
    state.mousePosition.zoom
  );
  const updatedCurrentCombinedRows = updateCurrentCombinedRows(
    updatedCombinedRows,
    state.currentCombinedRows
  );
  scrollToEarliestCurrentRow(updatedCurrentCombinedRows, updatedCombinedRows);
  dispatch({
    type: "setAllCombinedRows",
    value: updatedCombinedRows,
  });
  dispatch({
    type: "setCurrentCombinedRows",
    value: updatedCurrentCombinedRows,
  });
};

export const renderJsonMap = (
  stateManager: Types.StateManager
): React.EffectCallback => {
  const [state, dispatch] = stateManager;
  return () => {
    const zoom = state.mousePosition.zoom;
    const shouldDisplayDetailedMap = zoom >= Config.zoomForDetailedMap;
    dispatch({
      type: "setDisplayDetailedMap",
      value: shouldDisplayDetailedMap,
    });
  };
};

const updateCurrentCombinedRows = (
  allCombinedRows: Types.CombinedRow[],
  currentCombinedRows: Types.CombinedRow[]
): Types.CombinedRow[] => {
  const childRows = Renderers.getFlattenedChildRows(currentCombinedRows);
  const parentCombinedRows = childRows.map(findExistingParent(allCombinedRows));
  const uniqueParents = parentCombinedRows.filter(firstInstanceOfCombinedRow);
  return uniqueParents;
};

const findExistingParent = (combinedRows: Types.CombinedRow[]) => (
  row: Types.Row
): Types.CombinedRow => {
  const existingParent = combinedRows.find(parentContainsGivenRow(row));
  return !existingParent ? Config.defaultCombinedRow : existingParent;
};

const parentContainsGivenRow = (givenRow: Types.Row) => (
  parentCombinedRow: Types.CombinedRow
): Types.Row | undefined => {
  return parentCombinedRow.rows.find((row) => row === givenRow);
};

const firstInstanceOfCombinedRow = (
  givenRow: Types.CombinedRow,
  index: number,
  parentRows: Types.CombinedRow[]
): boolean => {
  return parentRows.indexOf(givenRow) === index;
};

const scrollToEarliestCurrentRow = (
  currentRows: Types.CombinedRow[],
  allRows: Types.CombinedRow[]
): void => {
  const earliestRow = getEarliestCombinedRow(currentRows, allRows);
  if (!!earliestRow) {
    const multipleRowIndex = 0;
    EventHandlers.handleWaypointsTableScrollbar(
      earliestRow.index,
      multipleRowIndex
    );
  }
};

const getEarliestCombinedRow = (
  currentRows: Types.CombinedRow[],
  allRows: Types.CombinedRow[]
): Types.CombinedRow | undefined => {
  const defaultIndex = allRows.length;
  const earliestIndex = currentRows.reduce(getEarliestIndexSoFar, defaultIndex);
  const earliestCombinedRow = currentRows.find(
    (currentRow) => currentRow.index === earliestIndex
  );
  return earliestCombinedRow;
};

const getEarliestIndexSoFar = (
  earliestIndexSoFar: number,
  currentCombinedRow: Types.CombinedRow
): number => {
  return currentCombinedRow.index <= earliestIndexSoFar
    ? currentCombinedRow.index
    : earliestIndexSoFar;
};

const updateAllCombinedRowsByZoom = (
  rows: Types.Row[],
  combinedRows: Types.CombinedRow[],
  zoom: number
): Types.CombinedRow[] => {
  return rows.reduce(collectNearbyRowsByZoom(zoom), combinedRows);
};

const collectNearbyRowsByZoom = (zoom: number) => (
  accumulatedRows: Types.CombinedRow[],
  givenRow: Types.Row
): Types.CombinedRow[] => {
  const parentIndex = findParentCombinedRowIndex(
    accumulatedRows,
    givenRow,
    zoom
  );
  const parentExists = parentIndex !== -1;
  return parentExists
    ? getRowsWithUpdatedParent(givenRow, accumulatedRows, parentIndex)
    : getRowsWithNewParent(givenRow, accumulatedRows);
};

const getRowsWithUpdatedParent = (
  givenRow: Types.Row,
  combinedRows: Types.CombinedRow[],
  parentIndex: number
): Types.CombinedRow[] => {
  const parentCombinedRow = combinedRows[parentIndex];
  const siblingRows = parentCombinedRow.rows;
  const newCoordinates = computeAverageCoordinates(siblingRows, givenRow);
  const newRows = updateExistingRows(siblingRows, givenRow);
  const updatedParent = createCombinedRow(newCoordinates, newRows, parentIndex);
  combinedRows[parentIndex] = updatedParent;
  return combinedRows;
};

const getRowsWithNewParent = (
  givenRow: Types.Row,
  combinedRows: Types.CombinedRow[]
): Types.CombinedRow[] => {
  const newCoordinates = givenRow.coordinates;
  const newRows = [givenRow];
  const newParentIndex = combinedRows.length;
  const newParent = createCombinedRow(newCoordinates, newRows, newParentIndex);
  combinedRows = [...combinedRows, newParent];
  return combinedRows;
};

const findParentCombinedRowIndex = (
  combinedRows: Types.CombinedRow[],
  givenRow: Types.Row,
  zoom: number
): number => {
  const givenCoordinates = givenRow.coordinates;
  const maxRadius = Config.baseRadius / zoom;
  return combinedRows.findIndex((parentCombinedRow) => {
    const parentCoordinates = parentCombinedRow.averageCoordinates;
    return areCoordinatesWithinRange(
      parentCoordinates,
      givenCoordinates,
      maxRadius
    );
  });
};

const areCoordinatesWithinRange = (
  parentCoordinates: Point,
  givenCoordinates: Point,
  maxRadius: number
): boolean => {
  /* We use Euclidean distance here because the RSM Markers are rendered using 
  the d3-geo coordinate system, which is similar to the Cartesian system. The 
  former is centered at the Equator and Prime Meridian at (0, 0), where one 
  can consider the Equator the X axis and the Prime Meridian the Y axis. */
  const [parentLng, parentLat] = parentCoordinates;
  const [givenLng, givenLat] = givenCoordinates;
  const diffLng = givenLng - parentLng;
  const diffLat = givenLat - parentLat;
  return diffLng * diffLng + diffLat * diffLat <= maxRadius * maxRadius;
};

const computeAverageCoordinates = (
  siblingRows: Types.Row[],
  currentRow: Types.Row
): Point => {
  const totalPoint = siblingRows.reduce(
    collectCoordinates,
    currentRow.coordinates
  );
  const [totalLng, totalLat] = totalPoint;
  const newLength = siblingRows.length + 1;
  const averageLng = totalLng / newLength;
  const averageLat = totalLat / newLength;
  return [averageLng, averageLat];
};

const collectCoordinates = (
  accumulatedCoordinates: Point,
  currentRow: Types.Row
): Point => {
  const [accumulatedLng, accumulatedLat] = accumulatedCoordinates;
  const [currentLng, currentLat] = currentRow.coordinates;
  const newLng = accumulatedLng + currentLng;
  const newLat = accumulatedLat + currentLat;
  return [newLng, newLat];
};

const updateExistingRows = (
  siblingRows: Types.Row[],
  givenRow: Types.Row
): Types.Row[] => {
  const givenRowExistsInRows = siblingRows.some((row) => row === givenRow);
  return givenRowExistsInRows ? siblingRows : [...siblingRows, givenRow];
};

const createCombinedRow = (
  averageCoordinates: Point,
  rows: Types.Row[],
  index: number
): Types.CombinedRow => {
  /* Marker visibility is undefined until after its DOM element has been 
  rendered for the very first time; this is because visibility depends on the 
  dimensions of the DOM element. */
  return {
    averageCoordinates: averageCoordinates,
    rows: rows,
    index: index,
    isMarkerVisible: undefined,
  };
};

const elementIsInViewport = (
  element: HTMLElement | null,
  limits: Types.Limits
): Types.Visibility => {
  const rectangle = element?.getBoundingClientRect();
  const elementNotValid = !element || 1 !== element.nodeType;
  if (elementNotValid || !rectangle || !limits) {
    return undefined;
  } else {
    const withinVerticalBounds = rectInVerticalBounds(rectangle, limits);
    const withinHorizontalBounds = rectInHorizontalBounds(rectangle, limits);
    return withinVerticalBounds && withinHorizontalBounds;
  }
};

const rectInVerticalBounds = (
  rectangle: DOMRect,
  limits: Types.Limits
): boolean => {
  return !limits
    ? false
    : rectangle.bottom >= limits.top && rectangle.top <= limits.bottom;
};

const rectInHorizontalBounds = (
  rectangle: DOMRect,
  limits: Types.Limits
): boolean => {
  return !limits
    ? false
    : rectangle.right >= limits.left && rectangle.left <= limits.right;
};

export const updateMarkerVisibilities = (
  stateManager: Types.StateManager
): React.EffectCallback => () => {
  const [state, dispatch] = stateManager;
  const limits = getViewportLimits();
  state.allCombinedRows.forEach(mutateVisibility(limits));
  state.currentCombinedRows.forEach(mutateVisibility(limits));
  dispatch({
    type: "setAllCombinedRows",
    value: state.allCombinedRows,
  });
  dispatch({
    type: "setCurrentCombinedRows",
    value: state.currentCombinedRows,
  });
};

const getViewportLimits = (): Types.Limits => {
  const mapContainer = document.getElementById(Config.mapContainerName);
  const rectangle = mapContainer?.getBoundingClientRect();
  if (!rectangle) {
    return undefined;
  }
  const top = rectangle.top;
  const bottom = rectangle.bottom;
  const right = rectangle.right;
  const left = rectangle.left;
  return { top, right, bottom, left };
};

const mutateVisibility = (limits: Types.Limits) => (
  combinedRow: Types.CombinedRow
): void => {
  combinedRow.isMarkerVisible = getMarkerVisibility(combinedRow.index, limits);
};

const getMarkerVisibility = (
  index: number,
  limits: Types.Limits
): Types.Visibility => {
  const elementId = getMarkerIdentifier(index);
  const svgMarker = document.getElementById(elementId);
  const isMarkerVisible = elementIsInViewport(svgMarker, limits);
  return isMarkerVisible;
};

//////////////////
// RowMarker.tsx
//////////////////

export const getMarkerIdentifier = (index: number): string => {
  return Config.componentIds.Marker(index);
};

///////////////
// Config.tsx
///////////////

export const checkInFullMode = (): boolean => {
  const parameters = getWindowUrlParameters();
  return !parameters.small;
};

const getWindowUrlParameters = (): Types.Parameters => {
  const windowUrl = window.location.href;
  const queryLocation = windowUrl.search(Config.urlQuery) + 1;
  const query = windowUrl.slice(queryLocation);
  const parameters = query
    .split("&")
    .map((assignment) => assignment.split("="))
    .reduce(collectParameters, {} as Types.Parameters);
  return parameters;
};

const collectParameters = (
  accumulatedParameters: Types.Parameters,
  currentAssignment: string[]
): Types.Parameters => {
  const [variable, value] = currentAssignment;
  accumulatedParameters[variable] = value;
  return accumulatedParameters;
};
