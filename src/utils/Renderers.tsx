import React from "react";
import RowMarker from "../components/RowMarker";
import OrphanTableRows from "../components/OrphanTableRows";
import SelectedDetail from "../components/SelectedDetail";
import { Geographies, Geography } from "react-simple-maps";
import * as Config from "./Config";
import * as Types from "./Types";

/////////////////
// MapChart.tsx
/////////////////

export const createGeographies = (
  stateManager: Types.stateManager
): JSX.Element => {
  const [state] = stateManager;
  const currentZoom = state.mousePosition.zoom;
  const strokeWidth = handleStrokeWidth(currentZoom);
  return (
    <Geographies geography={Config.geoUrl}>
      {({ geographies }) => geographies.map(createGeography(strokeWidth))}
    </Geographies>
  );
};

const handleStrokeWidth = (zoom: number): number => {
  const newStrokeWidth = Config.baseStrokeThickness / zoom;
  return newStrokeWidth;
};

const createGeography = (strokeWidth: number) => (geo: any): JSX.Element => {
  return (
    <Geography
      key={geo.rsmKey}
      geography={geo}
      fill="#EAEAEC"
      stroke="#D6D6DA"
      strokeWidth={strokeWidth}
    />
  );
};

export const createRowMarkers = (
  stateManager: Types.stateManager
): JSX.Element[] => {
  const [state] = stateManager;
  return state.combinedRows.map(createRowMarker(stateManager));
};

const createRowMarker = (stateManager: Types.stateManager) => (
  givenCombinedRow: Types.combinedRow,
  givenIndex: number
) => {
  return (
    <RowMarker
      key={givenIndex}
      givenCombinedRow={givenCombinedRow}
      stateManager={stateManager}
    />
  );
};

const handleMarkerOffset = (zoom: number): number => {
  const newTranslateOffset = Config.baseTranslateOffset / zoom;
  return newTranslateOffset;
};

const handleMarkerFontSize = (zoom: number): number => {
  const newFontSize = Config.baseFontSize / zoom;
  return newFontSize;
};

const getTruncatedName = (zoom: number, name: string): string => {
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
): JSX.Element | undefined => {
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
  ) : undefined;
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

////////////////
// Sidebar.tsx
////////////////

export const createWaypointsTableHead = (keys: string[]): JSX.Element => {
  return (
    <thead id="waypoints-head">
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
  const originalRows = state.combinedRows;
  const filterPredicate = isMarkerVisible;
  return (
    <tbody>
      {originalRows
        .filter(filterPredicate)
        .map(createOrphanTableRows(keys, stateManager))}
    </tbody>
  );
};

const isMarkerVisible = (combinedRow: Types.combinedRow) => {
  return combinedRow.isMarkerVisible;
};

const createOrphanTableRows = (
  keys: string[],
  stateManager: Types.stateManager
) => (givenCombinedRow: Types.combinedRow, givenIndex: number) => {
  return (
    <OrphanTableRows
      key={givenIndex}
      keys={keys}
      stateManager={stateManager}
      givenCombinedRow={givenCombinedRow}
      givenIndex={givenIndex}
    />
  );
};

export const createWaypointDetails = (
  stateManager: Types.stateManager
): JSX.Element[] => {
  const [state] = stateManager;
  const rows = state.currentCombinedRow.rows;
  return rows.map(createSelectedDetail);
};

const createSelectedDetail = (row: Types.row, index: number) => {
  return <SelectedDetail key={index} row={row} orderedIndex={index} />;
};

////////////////////////
// OrphanTableRows.tsx
////////////////////////

export const getTableRowColor = (
  givenCombinedRow: Types.combinedRow,
  currentCombinedRow: Types.combinedRow,
  givenIndex: number
): string => {
  const selectedSameCombinedRow = givenCombinedRow === currentCombinedRow;
  const defaultRowColor = getDefaultRowColor(givenIndex);
  return selectedSameCombinedRow ? Config.highlightedRowColor : defaultRowColor;
};

///////////////////////
// SelectedDetail.tsx
///////////////////////

export const getDefaultRowColor = (rowIndex: number): string => {
  const rowIsEven = rowIndex % 2 === 0;
  return rowIsEven ? Config.evenRowColor : Config.oddRowColor;
};
