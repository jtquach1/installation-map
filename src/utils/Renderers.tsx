import React from "react";
import RowMarker from "../components/RowMarker";
import OrphanTableRows from "../components/OrphanTableRows";
import SelectedDetail from "../components/SelectedDetail";
import { Geographies, Geography, Point } from "react-simple-maps";
import * as Config from "./Config";
import * as Types from "./Types";

/////////////////
// MapChart.tsx
/////////////////

export const handleDimensions = (inFullMode: boolean): Types.Dimensions => {
  return inFullMode ? Config.fullModeDimensions : Config.smallModeDimensions;
};

export const createGeographies = (
  stateManager: Types.StateManager
): JSX.Element => {
  const [state] = stateManager;
  const thinStrokeWidth = handleStrokeWidth(state.mousePosition.zoom);
  return (
    <React.Fragment>
      {renderStates(state.displayDetailedMap, thinStrokeWidth)}
      {renderCountries(state.displayDetailedMap, thinStrokeWidth)}
    </React.Fragment>
  );
};

const handleStrokeWidth = (zoom: number): number => {
  const newStrokeWidth = Config.baseStrokeThickness / zoom;
  return newStrokeWidth;
};

const renderStates = (
  displayDetailedMap: boolean,
  thinStrokeWidth: number
): JSX.Element | null => {
  const geoUrl = Config.detailedMapWithStates;
  return displayDetailedMap ? (
    <Geographies geography={geoUrl}>
      {({ geographies }) =>
        geographies.map(createGeography(thinStrokeWidth, ""))
      }
    </Geographies>
  ) : null;
};

const renderCountries = (
  displayDetailedMap: boolean,
  thinStrokeWidth: number
): JSX.Element => {
  const thickStrokeWidth = thinStrokeWidth * 2;
  const countryStrokeWidth = displayDetailedMap
    ? thickStrokeWidth
    : thinStrokeWidth;
  const countryGeoClass = displayDetailedMap ? "border" : "";
  const geoUrl = displayDetailedMap
    ? Config.detailedMapNoStates
    : Config.simpleMap;
  return (
    <Geographies geography={geoUrl}>
      {({ geographies }) =>
        geographies.map(createGeography(countryStrokeWidth, countryGeoClass))
      }
    </Geographies>
  );
};

const createGeography = (strokeWidth: number, geoClass: string) => (
  geo: any
): JSX.Element => {
  return (
    <Geography
      key={geo.rsmKey}
      geography={geo}
      fill="#EAEAEC"
      stroke="#D6D6DA"
      strokeWidth={strokeWidth}
      className={geoClass}
    />
  );
};

export const createRowMarkers = (
  stateManager: Types.StateManager
): JSX.Element => {
  const [state] = stateManager;
  const originalMarkers = state.allCombinedRows;
  const visibleMarkers: Types.FilterPredicate = getFilterPredicate(state);
  const invisibleMarkers: Types.FilterPredicate = (
    combinedRow: Types.CombinedRow
  ) => !visibleMarkers(combinedRow);
  return state.syncMapAndTable ? (
    <React.Fragment>
      {originalMarkers
        .filter(visibleMarkers)
        .map(createRowMarker(stateManager, true))}
      {originalMarkers
        .filter(invisibleMarkers)
        .map(createRowMarker(stateManager, false))}
    </React.Fragment>
  ) : (
    <React.Fragment>
      {originalMarkers.map(createRowMarker(stateManager, true))}
    </React.Fragment>
  );
};

const createRowMarker = (
  stateManager: Types.StateManager,
  isVisible: boolean
) => (givenRow: Types.CombinedRow, givenIndex: number): JSX.Element => {
  return (
    <RowMarker
      key={givenIndex}
      givenCombinedRow={givenRow}
      stateManager={stateManager}
      isVisible={isVisible}
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
  pos: Types.Position
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

const givenInCurrentRows = (
  givenRow: Types.CombinedRow,
  currentRows: Types.CombinedRow[]
): boolean => {
  const parentExists = currentRows.some(sameCoordinatesAndRows(givenRow));
  return parentExists;
};

const sameCoordinatesAndRows = (currentRow: Types.CombinedRow) => (
  givenRow: Types.CombinedRow
): boolean => {
  const sameCoordinates = averageCoordinatesAreSame(
    currentRow.averageCoordinates,
    givenRow.averageCoordinates
  );
  const sameRows = rowsAreSame(currentRow.rows, givenRow.rows);
  return sameCoordinates && sameRows;
};

const averageCoordinatesAreSame = (
  currentCoordinates: Point,
  givenCoordinates: Point
): boolean => {
  const [currentX, currentY] = currentCoordinates;
  const [givenX, givenY] = givenCoordinates;
  const sameX = currentX === givenX;
  const sameY = currentY === givenY;
  return sameX && sameY;
};

const rowsAreSame = (
  currentRows: Types.Row[],
  givenRows: Types.Row[]
): boolean => {
  /**
   * Since it's not possible to override === in JS, I had to define equality
   * checking for row and row[]. Equality is defined both ways since one can
   * input [] as currentRows, in which the first reduce will return true
   * regardless of what givenRows is.
   */
  const givenSameAsCurrent = currentRows.reduce(
    checkAllRowsFoundInOther(givenRows),
    true
  );
  const currentSameAsGiven = givenRows.reduce(
    checkAllRowsFoundInOther(currentRows),
    true
  );
  return givenSameAsCurrent && currentSameAsGiven;
};

const checkAllRowsFoundInOther = (otherRows: Types.Row[]) => (
  werePreviousRowsFound: boolean,
  thisRow: Types.Row
): boolean => {
  const isThisRowFound = otherRows.some(thisRowEqualsOther(thisRow));
  return werePreviousRowsFound && isThisRowFound;
};

const thisRowEqualsOther = (thisRow: Types.Row) => (
  otherRow: Types.Row
): boolean => {
  /**
   * It is okay to use === here since state.rows, from which both thisRow
   * and otherRow are taken from, doesn't change besides from the initial
   * promise that fetches the waypoints JSON.
   */
  return thisRow === otherRow;
};

export const getCombinedName = (combinedRow: Types.CombinedRow): string => {
  const originalRows = combinedRow.rows;
  const existsMoreThanOneRow = originalRows.length > 1;
  const remainingRows = originalRows.slice(1);
  const leadingInstitution = originalRows[0].institution;
  const combinedName = remainingRows.reduce(nameReducer, leadingInstitution);
  const name = existsMoreThanOneRow ? combinedName : leadingInstitution;
  return name;
};

const nameReducer = (accumulator: string, current: Types.Row): string => {
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
  numberOfRows: number,
  zoom: number
): JSX.Element => {
  const offsetFromMarker = handleMarkerOffset(zoom);
  const nameFontSize = handleMarkerFontSize(zoom);
  const displayedPair = getDisplayedPair(zoom, numberOfRows, combinedName);
  const displayedName = displayedPair.name;
  const displayedStyle = displayedPair.fontStyle;
  return (
    <text
      textAnchor="middle"
      y={offsetFromMarker}
      style={{ fontStyle: displayedStyle }}
    >
      <tspan x="0" style={{ fontSize: nameFontSize }}>
        {displayedName}
      </tspan>
      {displaySubtitle(displayedName, nameFontSize)}
    </text>
  );
};

const displaySubtitle = (
  displayedName: string,
  nameFontSize: number
): JSX.Element | null => {
  const showsNumberOfInstallations = displayedName
    .toLocaleLowerCase()
    .includes("installations");
  const subtitleMultiplier = 0.8;
  const subtitleFontSize = subtitleMultiplier * nameFontSize;
  return showsNumberOfInstallations ? (
    <tspan x="0" dy="1.2em" style={{ fontSize: subtitleFontSize }}>
      Click for details
    </tspan>
  ) : null;
};

const getDisplayedPair = (
  zoom: number,
  numberOfRows: number,
  combinedName: string
): Types.DisplayedPair => {
  const canDisplayFullName = zoom > Config.zoomForFullName;
  const existsMoreThanOneRow = numberOfRows > 1;
  if (canDisplayFullName) {
    return { name: combinedName, fontStyle: "normal" };
  } else if (existsMoreThanOneRow) {
    const truncatedName = `${numberOfRows} Instances`;
    return { name: truncatedName, fontStyle: "italic" };
  } else {
    const truncatedName = getTruncatedName(zoom, combinedName);
    return { name: truncatedName, fontStyle: "normal" };
  }
};

////////////////
// Sidebar.tsx
////////////////

export const createWaypointsTableHead = (keys: string[]): JSX.Element => {
  return (
    <thead id="waypoints-head">
      <tr>
        {keys.map((key: string, index: number) => (
          <th key={index}>{key}</th>
        ))}
      </tr>
    </thead>
  );
};

export const createWaypointsTableBody = (
  stateManager: Types.StateManager,
  keys: string[]
): JSX.Element => {
  const [state] = stateManager;
  const originalRows = state.allCombinedRows;
  const filterPredicate = getFilterPredicate(state);
  return (
    <tbody>
      {originalRows
        .filter(filterPredicate)
        .map(createOrphanTableRows(keys, stateManager))}
    </tbody>
  );
};

const getFilterPredicate = (state: Types.State): Types.FilterPredicate => {
  const searchBarToggled =
    state.searchBarContent !== Config.defaultSearchBarContent;
  const visibilityToggled = state.syncMapAndTable;
  if (searchBarToggled && visibilityToggled) {
    return includesQueryAndVisible(state);
  } else if (searchBarToggled) {
    return doesCombinedRowIncludeQuery(state);
  } else if (visibilityToggled) {
    return isMarkerVisible;
  } else {
    return noFilter;
  }
};

const includesQueryAndVisible = (state: Types.State) => (
  combinedRow: Types.CombinedRow
): boolean => {
  const includesQuery = doesCombinedRowIncludeQuery(state);
  return includesQuery(combinedRow) && isMarkerVisible(combinedRow);
};

const doesCombinedRowIncludeQuery = (state: Types.State) => (
  combinedRow: Types.CombinedRow
): boolean => {
  const searchQuery = state.searchBarContent;
  const childRows = combinedRow.rows;
  const foundInAnyChildren = childRows.some(doesRowIncludeQuery(searchQuery));
  return foundInAnyChildren;
};

export const doesRowIncludeQuery = (query: string) => (
  row: Types.Row
): boolean => {
  const keys = Config.tableHeaderKeys;
  const caseInsensitiveQuery = query.toLowerCase();
  const foundInAnyKey = keys.some((key) => {
    const rowProp = row[key].toString();
    const caseInsensitiveRowProp = rowProp.toLowerCase();
    return caseInsensitiveRowProp.includes(caseInsensitiveQuery);
  }, false);
  return foundInAnyKey;
};

const isMarkerVisible = (combinedRow: Types.CombinedRow): boolean => {
  return combinedRow.isMarkerVisible as boolean;
};

const noFilter = (_combinedRow: Types.CombinedRow): boolean => {
  return true;
};

const createOrphanTableRows = (
  keys: string[],
  stateManager: Types.StateManager
) => (givenCombinedRow: Types.CombinedRow, givenIndex: number): JSX.Element => {
  return (
    <OrphanTableRows
      key={givenIndex}
      keys={keys}
      stateManager={stateManager}
      givenCombinedRow={givenCombinedRow}
    />
  );
};

export const createWaypointDetails = (
  stateManager: Types.StateManager
): JSX.Element => {
  const [state] = stateManager;
  const shouldDisplaySingleRow = state.currentRow !== Config.defaultRow;
  const rows = shouldDisplaySingleRow
    ? [state.currentRow]
    : getFlattenedChildRows(state.currentCombinedRows);
  return <React.Fragment>{rows.map(createSelectedDetail)}</React.Fragment>;
};

export const getFlattenedChildRows = (
  combinedRows: Types.CombinedRow[]
): Types.Row[] => {
  return combinedRows
    .map((combinedRow) => combinedRow.rows)
    .reduce((flattened, rows) => flattened.concat(rows), []);
};

const createSelectedDetail = (row: Types.Row, index: number): JSX.Element => {
  return <SelectedDetail key={index} row={row} orderedIndex={index} />;
};

////////////////////////
// OrphanTableRows.tsx
////////////////////////

export const getHighlightClass = (
  givenRow: Types.CombinedRow,
  currentRows: Types.CombinedRow[]
) => (shouldHighlight: boolean): string => {
  const selectedSameCombinedRow = givenInCurrentRows(givenRow, currentRows);
  return selectedSameCombinedRow && shouldHighlight
    ? Config.enableHighlight
    : Config.disableHighlight;
};

export const handleHighlight = (
  currentRow: Types.Row,
  givenRow: Types.Row
): boolean => {
  const highlightSiblings = rowIsDefault(currentRow);
  const highlightSingle = currentRow === givenRow;
  const shouldHighlight = highlightSiblings || highlightSingle;
  return shouldHighlight;
};

export const rowIsDefault = (givenRow: Types.Row): boolean => {
  return givenRow === Config.defaultRow;
};
