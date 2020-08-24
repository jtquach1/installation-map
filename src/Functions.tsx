import React from "react";
import RowMarker from "./RowMarker";
import SelectedDetail from "./SelectedDetail";
import OrphanTableRows from "./OrphanTableRows";
import { Geographies, Geography, Point } from "react-simple-maps";
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
  return rows.reduce(
    (combinedRows, givenRow) =>
      collectNearbyRowsByZoom(combinedRows, givenRow, zoom),
    combinedRows
  );
};

const collectNearbyRowsByZoom = (
  combinedRows: Types.combinedRow[],
  givenRow: Types.row,
  zoom: number
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
    combinedRows[parentIndex] = createCombinedRow(newCoordinates, newRows);
  } else {
    const newCoordinates = givenRow.coordinates;
    const newRows = [givenRow];
    combinedRows = [
      ...combinedRows,
      createCombinedRow(newCoordinates, newRows),
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
  rows: Types.row[]
): Types.combinedRow => {
  return { averageCoordinates: averageCoordinates, rows: rows };
};

/////////////////
// MapChart.tsx
/////////////////

export const handleMoveEnd = (
  newPosition: Types.position,
  stateManager: Types.stateManager
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

export const createGeographies = (
  stateManager: Types.stateManager
): JSX.Element => {
  const [state] = stateManager;
  const currentZoom = state.mousePosition.zoom;
  return (
    <Geographies geography={Config.geoUrl}>
      {({ geographies }) =>
        geographies.map((geo) => (
          <Geography
            key={geo.rsmKey}
            geography={geo}
            fill="#EAEAEC"
            stroke="#D6D6DA"
            strokeWidth={handleStrokeWidth(currentZoom)}
          />
        ))
      }
    </Geographies>
  );
};

export const handleStrokeWidth = (zoom: number): number => {
  const newStrokeWidth = Config.baseStrokeThickness / zoom;
  return newStrokeWidth;
};

export const createRowMarkers = (
  stateManager: Types.stateManager
): JSX.Element[] => {
  const [state] = stateManager;
  return state.combinedRows.map((combinedRow, index) => (
    <RowMarker
      key={index}
      givenCombinedRow={combinedRow}
      stateManager={stateManager}
    />
  ));
};

export const createMarkerText = (
  combinedName: string,
  zoom: number
): JSX.Element => {
  const mapMarkerOffset = handleMarkerOffset(zoom);
  const mapMarkerFontSize = handleMarkerFontSize(zoom);
  const truncatedName = getTruncatedName(zoom, combinedName);
  return (
    <text
      textAnchor="middle"
      y={mapMarkerOffset}
      style={{ fontSize: mapMarkerFontSize }}
    >
      {truncatedName}
    </text>
  );
};

export const handleMarkerOffset = (zoom: number): number => {
  const newTranslateOffset = Config.baseTranslateOffset / zoom;
  return newTranslateOffset;
};

export const handleMarkerFontSize = (zoom: number): number => {
  const newFontSize = Config.baseFontSize / zoom;
  return newFontSize;
};

export const getTruncatedName = (zoom: number, name: string): string => {
  const truncatedLength = Math.floor(Config.baseNameLengthProportion * zoom);
  const truncatedLongerThanOriginal = truncatedLength >= name.length;
  const truncatedName = name.slice(0, truncatedLength);
  return truncatedLongerThanOriginal ? truncatedName : truncatedName + "...";
};

/////////////////////
// ZoomControls.tsx
/////////////////////

export const displayDebuggingFeatures = (
  allow: boolean,
  pos: Types.position
): JSX.Element | null => {
  return allow ? (
    <div>
      <span>{`Zoom: ${pos.zoom}, `}</span>
      <span>
        {`Display marker text on large zoom: ${displayOnLargeZoom(pos.zoom)}, `}
      </span>
      <span>
        {`Mouse coordinates: (${pos.coordinates[0]}, ${pos.coordinates[1]})`}
      </span>
    </div>
  ) : null;
};

export const handleZoomIn = (stateManager: Types.stateManager): void => {
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

export const handleZoomOut = (stateManager: Types.stateManager): void => {
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

export const getMapMarkerColor = (
  givenCombinedRow: Types.combinedRow,
  currentCombinedRow: Types.combinedRow
): string => {
  const selectedSameCombinedRow = givenCombinedRow === currentCombinedRow;
  return selectedSameCombinedRow
    ? Config.highlightedMarkerColor
    : Config.defaultMarkerColor;
};

export const getCombinedName = (combinedRow: Types.combinedRow): string => {
  const originalRows = combinedRow.rows;
  const existsMoreThanOneRow = originalRows.length > 1;
  const remainingRows = originalRows.slice(1);
  const leadingInstitution = originalRows[0].institution;
  const combinedName = remainingRows.reduce(nameReducer, leadingInstitution);
  const name = existsMoreThanOneRow ? combinedName : leadingInstitution;
  return name;
};

const nameReducer = (accumulator: string, current: Types.row): string => {
  const accumulatedName = `${accumulator}, ${current.institution}`;
  return accumulatedName;
};

export const displayOnLargeZoom = (zoom: number): boolean => {
  const newZoomThreshold = zoom >= Config.baseZoomThreshold;
  return newZoomThreshold;
};

export const handleMarkerTransform = (zoom: number): string => {
  const markerTranslate = getMarkerTranslate(zoom);
  const markerScale = getMarkerScale(zoom);
  const mapMarkerTransform = `${markerTranslate} ${markerScale}`;
  return mapMarkerTransform;
};

const getMarkerTranslate = (zoom: number): string => {
  const x = -Config.baseTranslateOffset / zoom;
  const y = (-2 * Config.baseTranslateOffset) / zoom;
  return `translate(${x}, ${y})`;
};

const getMarkerScale = (zoom: number): string => {
  const newMarkerSize = Config.baseMarkerSize / zoom;
  return `scale(${newMarkerSize})`;
};

export const handleMarkerOnMouse = (
  dispatch: Types.dispatch,
  combinedName?: string
) => () => {
  const newTooltipContent = combinedName || Config.defaultTooltipContent;
  dispatch({ type: "setTooltipContent", value: newTooltipContent });
};

////////////////
// Sidebar.tsx
////////////////

export const createWaypointsTableHead = (keys: string[]): JSX.Element => {
  return (
    <thead>
      <tr>
        {keys.map((key: string, index: number) => (
          <th key={index} style={{ background: Config.tableHeaderColor }}>
            {key}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export const createWaypointsTableBody = (
  stateManager: Types.stateManager,
  keys: string[]
): JSX.Element => {
  const [state] = stateManager;
  return (
    <tbody>
      {state.combinedRows.map((givenCombinedRow, givenIndex) => (
        <OrphanTableRows
          key={givenIndex}
          keys={keys}
          stateManager={stateManager}
          givenCombinedRow={givenCombinedRow}
          givenIndex={givenIndex}
        />
      ))}
    </tbody>
  );
};

export const createWaypointDetails = (
  stateManager: Types.stateManager
): JSX.Element[] => {
  const [state] = stateManager;
  const rows = state.currentCombinedRow.rows;
  return rows.map((row, index) => (
    <SelectedDetail key={index} row={row} orderedIndex={index} />
  ));
};

//////////////////////////
// OrphanTableRows.tsx
//////////////////////////

export const getTableRowColor = (
  givenCombinedRow: Types.combinedRow,
  currentCombinedRow: Types.combinedRow,
  givenIndex: number
): string => {
  const selectedSameCombinedRow = givenCombinedRow === currentCombinedRow;
  const defaultRowColor = getDefaultRowColor(givenIndex);
  return selectedSameCombinedRow ? Config.highlightedRowColor : defaultRowColor;
};

export const handleMarkerOnClick = (
  dispatch: Types.dispatch,
  givenRow: Types.combinedRow
) => (): void => {
  dispatch({ type: "setCurrentCombinedRow", value: givenRow });
};

///////////////////////////////
// SelectedDetail.tsx
///////////////////////////////

export const getDefaultRowColor = (rowIndex: number): string => {
  const rowIsEven = rowIndex % 2 === 0;
  return rowIsEven ? Config.evenRowColor : Config.oddRowColor;
};