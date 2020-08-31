import { Point } from "react-simple-maps";
import * as Config from "./Config";
import * as Types from "./Types";

//////////////
// index.tsx
//////////////

export const reducer = (
  state: Types.state,
  action: Types.action
): Types.state => {
  switch (action.type) {
    case "setRows":
      return { ...state, rows: action.value as Types.row[] };
    case "updateCombinedRows":
      return {
        ...state,
        combinedRows: action.value as Types.combinedRow[],
      };
    case "setTooltipContent":
      return { ...state, tooltipContent: action.value as string };
    case "setCurrentCombinedRow":
      return {
        ...state,
        currentCombinedRow: action.value as Types.combinedRow,
      };
    case "setMousePosition":
      return { ...state, mousePosition: action.value as Types.position };
    case "updateMousePositionAndRefreshMarkers":
      return {
        ...state,
        combinedRows: Config.defaultCombinedRows,
        currentCombinedRow: Config.defaultCombinedRow,
        mousePosition: action.value as Types.position,
      };
    default:
      return state;
  }
};

export const getUpdatedCombinedRowsByZoom = (
  rows: Types.row[],
  combinedRows: Types.combinedRow[],
  zoom: number
): Types.combinedRow[] => {
  return rows.reduce(collectNearbyRowsByZoom(zoom), combinedRows);
};

const collectNearbyRowsByZoom = (zoom: number) => (
  combinedRows: Types.combinedRow[],
  givenRow: Types.row
): Types.combinedRow[] => {
  const markerCoordinates = givenRow.coordinates;
  const maxRadius = Config.baseRadius / zoom;
  const parentIndex = findParentCombinedRowIndex(
    combinedRows,
    markerCoordinates,
    maxRadius
  );
  const parentExists = parentIndex !== -1;
  const parentCombinedRow = combinedRows[parentIndex];

  if (parentExists) {
    const siblingRows = parentCombinedRow.rows;
    const newCoordinates = computeAverageCoordinates(siblingRows, givenRow);
    const newRows = updateExistingRows(siblingRows, givenRow);
    combinedRows[parentIndex] = createCombinedRow(
      newCoordinates,
      newRows,
      parentIndex
    );
  } else {
    const newCoordinates = givenRow.coordinates;
    const newRows = [givenRow];
    const newParentIndex = combinedRows.length;
    combinedRows = [
      ...combinedRows,
      createCombinedRow(newCoordinates, newRows, newParentIndex),
    ];
  }
  return combinedRows;
};

const findParentCombinedRowIndex = (
  combinedRows: Types.combinedRow[],
  givenCoordinates: Point,
  maxRadius: number
): number => {
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
  siblingRows: Types.row[],
  currentRow: Types.row
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
  currentRow: Types.row
): Point => {
  const [accumulatedLng, accumulatedLat] = runningTotalPoint;
  const [currentLng, currentLat] = currentRow.coordinates;
  const newLng = accumulatedLng + currentLng;
  const newLat = accumulatedLat + currentLat;
  return [newLng, newLat];
};

const updateExistingRows = (
  siblingRows: Types.row[],
  givenRow: Types.row
): Types.row[] => {
  const givenRowExistsInRows = siblingRows.some((row) => row === givenRow);
  return givenRowExistsInRows ? siblingRows : [...siblingRows, givenRow];
};

const createCombinedRow = (
  averageCoordinates: Point,
  rows: Types.row[],
  index: number
): Types.combinedRow => {
  return {
    averageCoordinates: averageCoordinates,
    rows: rows,
    index: index,
    isMarkerVisible: getCombinedRowVisibility(index),
  };
};

const getCombinedRowVisibility = (index: number): Types.Visibility => {
  const elementId = getMarkerId(index);
  const svgMarker = document.getElementById(elementId);
  const isMarkerVisible = elementIsInViewport(svgMarker);
  return isMarkerVisible;
};

export const getMarkerId = (index: number): string => {
  return Config.elementIds.Marker(index);
};

const elementIsInViewport = (element: HTMLElement | null): Types.Visibility => {
  const rectangle = element?.getBoundingClientRect();
  const container = document.getElementById("container");
  const elementNotValid = !element || 1 !== element.nodeType;
  if (elementNotValid || !rectangle || !container) {
    return undefined;
  } else {
    const { clientHeight, clientWidth } = container;
    const { top, right, bottom, left } = rectangle;
    const withinVerticalBounds = bottom >= 0 && top < clientHeight;
    const withinHorizontalBounds = right >= 0 && left < clientWidth;
    return withinVerticalBounds && withinHorizontalBounds;
  }
};
