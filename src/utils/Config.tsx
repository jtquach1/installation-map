import { Point } from "react-simple-maps";
import * as Types from "./Types";
import * as StateUpdaters from "./StateUpdaters";

/**
 * Constants
 */

export const baseFontSize = 12;
export const baseMarkerSize = 1;
export const baseNameLengthProportion = 2;
export const baseRadius = 5;
export const baseStrokeThickness = 1;
export const baseTranslateOffset = 12;
export const baseZoomThreshold = 16;
export const defaultMarkerColor = "#3786C2";
export const highlightedMarkerColor = "#8bc5f1";
export const maxZoom = 128;
export const minZoom = 1;
export const zoomMultiplier = 2;
export const zoomForFullName = 64;
export const urlQuery: RegExp = /\?/i;
export const mapContainerName = "container";
export const rootContainerName = "root";
export const scrollableTableName = "tableFixHead";
export const waypointsHeadName = "waypoints-head";
export const enableHighlight = "highlighted";
export const disableHighlight = "";

/**
 * World map JSON Url:
 * 10m is the most detailed, but too laggy to zoom/pan on.
 * 110m is the simplest and fastest to work with.
 * 50m and 50m simplified is in between 10m and 110m, in which they're both
 * relatively fast and detailed. 50m simplified is faster.
 * */
export const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

/**
 * Default values
 */
const defaultCoordinates: Point = [0, 0];
const defaultRows: Types.Row[] = [];
const defaultIndex: number = -1;
const defaultVisibility = undefined;
export const defaultCombinedRows: Types.CombinedRow[] = [];
export const defaultCombinedRow: Types.CombinedRow = {
  averageCoordinates: defaultCoordinates,
  rows: defaultRows,
  index: defaultIndex,
  isMarkerVisible: defaultVisibility,
};
const defaultMousePosition: Types.Position = {
  coordinates: defaultCoordinates,
  zoom: minZoom,
};
export const defaultSearchBarContent: string = "";
const defaultToggle: boolean = false;
const defaultMode: boolean = StateUpdaters.checkInFullMode();
export const defaultRow: Types.Row = {
  institution: "",
  category: "",
  lab: "",
  address: "",
  coordinates: [0, 0],
  index: -1,
};
export const defaultState: Types.State = {
  rows: defaultRows,
  allCombinedRows: defaultCombinedRows,
  currentCombinedRows: defaultCombinedRows,
  mousePosition: defaultMousePosition,
  searchBarContent: defaultSearchBarContent,
  useMarkerVisibility: defaultToggle,
  useSearchBar: defaultToggle,
  inFullMode: defaultMode,
  currentRow: defaultRow,
};

/**
 * Configuration for mapping JSON keys to table row header and data cells.
 */
export const markerDetailMap: Types.MarkerDetail[] = [
  {
    key: "institution",
    header: "Institution or Company Name",
    getRowPropContent: (rowProp: string) => rowProp,
  },
  {
    key: "category",
    header: "Category",
    getRowPropContent: (rowProp: string) => rowProp,
  },
  {
    key: "lab",
    header: "Lab / Group",
    getRowPropContent: (rowProp: string) => rowProp,
  },
  {
    key: "address",
    header: "Address",
    getRowPropContent: (rowProp: string) => rowProp,
  },
  {
    key: "coordinates",
    header: "Coordinates",
    getRowPropContent: (rowProp: Point) => {
      const [lng, lat] = rowProp;
      return `(${lng}, ${lat})`;
    },
  },
];

// Configuration for displaying sidebar table keys
export const tableHeaderKeys = ["institution", "lab", "address"];

// Configuration for certain React components to be passed a particular id.
export const componentIds: Types.componentToIdentifier = {
  Marker: (index: number) => `marker-${index}`,
};

// Configuration for rendering MapChart.
export const fullModeDimensions = {
  width: 800,
  height: 550,
  scale: 200,
};

export const smallModeDimensions = {
  width: 600,
  height: 400,
  scale: 100,
};
