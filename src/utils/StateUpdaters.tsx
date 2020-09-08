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
    case "setTooltipContent":
      return { ...state, tooltipContent: action.value as string };
    case "setCurrentCombinedRows":
      return {
        ...state,
        currentCombinedRows: action.value as Types.CombinedRow[],
      };
    case "setMousePosition":
      return { ...state, mousePosition: action.value as Types.Position };
    case "setSearchBarContent":
      return { ...state, searchBarContent: action.value as string };
    case "toggleVisibility":
      return { ...state, useMarkerVisibility: action.value as boolean };
    case "toggleSearchBarQuery":
      return { ...state, useSearchBar: action.value as boolean };
    case "setCurrentRow":
      return { ...state, currentRow: action.value as Types.Row };
    default:
      return state;
  }
};

export const getJsonMarkers = (
  dispatch: Types.Dispatch
): React.EffectCallback => {
  return () => {
    const fetchMarkers = async (): Promise<void> => {
      const response: Response = await fetch("/static/waypoints.json");
      const markers: Types.Row[] = await response.json();
      dispatch({ type: "setRows", value: markers });
    };
    fetchMarkers();
  };
};

export const updateAllAndCurrentCombinedRows = (
  stateManager: Types.StateManager
): React.EffectCallback => {
  const [state, dispatch] = stateManager;
  return () => {
    const updatedCombinedRows = getUpdatedCombinedRowsByZoom(
      state.rows,
      Config.defaultCombinedRows,
      state.mousePosition.zoom
    );
    const updatedCurrentCombinedRows = getUpdatedCurrentCombinedRows(
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
};

const getUpdatedCurrentCombinedRows = (
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
  currentRow: Types.CombinedRow
): number => {
  return currentRow.index <= earliestIndexSoFar
    ? currentRow.index
    : earliestIndexSoFar;
};

const getUpdatedCombinedRowsByZoom = (
  rows: Types.Row[],
  allCombinedRows: Types.CombinedRow[],
  zoom: number
): Types.CombinedRow[] => {
  return rows.reduce(collectNearbyRowsByZoom(zoom), allCombinedRows);
};

const collectNearbyRowsByZoom = (zoom: number) => (
  allRows: Types.CombinedRow[],
  givenRow: Types.Row
): Types.CombinedRow[] => {
  const givenCoordinates = givenRow.coordinates;
  const maxRadius = Config.baseRadius / zoom;
  const parentIndex = findParentCombinedRowIndex(
    allRows,
    givenCoordinates,
    maxRadius
  );
  const parentExists = parentIndex !== -1;
  const parentCombinedRow = allRows[parentIndex];

  if (parentExists) {
    const siblingRows = parentCombinedRow.rows;
    const newCoordinates = computeAverageCoordinates(siblingRows, givenRow);
    const newRows = updateExistingRows(siblingRows, givenRow);
    allRows[parentIndex] = createCombinedRow(
      newCoordinates,
      newRows,
      parentIndex
    );
  } else {
    const newCoordinates = givenRow.coordinates;
    const newRows = [givenRow];
    const newParentIndex = allRows.length;
    allRows = [
      ...allRows,
      createCombinedRow(newCoordinates, newRows, newParentIndex),
    ];
  }
  return allRows;
};

const findParentCombinedRowIndex = (
  allRows: Types.CombinedRow[],
  givenCoordinates: Point,
  maxRadius: number
): number => {
  return allRows.findIndex((parentCombinedRow) => {
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
  const totalPoint = siblingRows.reduce(pointReducer, currentRow.coordinates);
  const [totalLng, totalLat] = totalPoint;
  const newLength = siblingRows.length + 1;
  const averageLng = totalLng / newLength;
  const averageLat = totalLat / newLength;
  return [averageLng, averageLat];
};

const pointReducer = (
  runningTotalPoint: Point,
  currentRow: Types.Row
): Point => {
  const [accumulatedLng, accumulatedLat] = runningTotalPoint;
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
  return {
    averageCoordinates: averageCoordinates,
    rows: rows,
    index: index,
    isMarkerVisible: getCombinedRowVisibility(index),
  };
};

const getCombinedRowVisibility = (index: number): Types.Visibility => {
  const elementId = getMarkerIdentifier(index);
  const svgMarker = document.getElementById(elementId);
  const isMarkerVisible = elementIsInViewport(svgMarker);
  return isMarkerVisible;
};

const elementIsInViewport = (element: HTMLElement | null): Types.Visibility => {
  const rectangle = element?.getBoundingClientRect();
  const mapContainer = document.getElementById(Config.mapContainerName);
  const rootContainer = document.getElementById(Config.rootContainerName);
  const elementNotValid = !element || 1 !== element.nodeType;
  if (elementNotValid || !rectangle || !mapContainer || !rootContainer) {
    return undefined;
  } else {
    const limits = getViewportLimits(rootContainer, mapContainer);
    const withinVerticalBounds =
      rectangle.bottom >= limits.bottom && rectangle.top < limits.top;
    const withinHorizontalBounds =
      rectangle.right >= limits.right && rectangle.left < limits.left;
    return withinVerticalBounds && withinHorizontalBounds;
  }
};

const getViewportLimits = (
  rootContainer: HTMLElement,
  mapContainer: HTMLElement
): Types.Limits => {
  const rootHeight = rootContainer.clientHeight;
  const mapHeight = mapContainer.clientHeight;
  const rootWidth = rootContainer.clientWidth;
  const mapWidth = mapContainer.clientWidth;
  const top = rootHeight;
  const bottom = rootHeight - mapHeight;
  const right = rootWidth - mapWidth;
  const left = rootWidth;
  return { top, right, bottom, left };
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
    .reduce((variable, value) => {
      variable[value[0]] = value[1];
      return variable;
    }, {} as Types.Parameters);
  return parameters;
};
