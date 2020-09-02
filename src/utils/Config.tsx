import { Point } from "react-simple-maps";
import * as Types from "./Types";

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
export const evenRowColor = "#ededed";
export const highlightedMarkerColor = "#8bc5f1";
export const highlightedRowColor = "#c3e3fb";
export const maxZoom = 128;
export const minZoom = 1;
export const oddRowColor = "#f6f6f6";
export const tableHeaderColor = "#dcdcdc";
export const zoomMultiplier = 2;

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
export const defaultCoordinates: Point = [0, 0];
export const defaultRows: Types.row[] = [];
export const defaultIndex: number = -1;
export const defaultVisibility = undefined;
export const defaultCombinedRows: Types.combinedRow[] = [];
export const defaultTooltipContent: string = "";
export const defaultCombinedRow: Types.combinedRow = {
  averageCoordinates: defaultCoordinates,
  rows: defaultRows,
  index: defaultIndex,
  isMarkerVisible: defaultVisibility,
};
export const defaultMousePosition: Types.position = {
  coordinates: defaultCoordinates,
  zoom: minZoom,
};
export const defaultState: Types.state = {
  rows: defaultRows,
  combinedRows: defaultCombinedRows,
  tooltipContent: defaultTooltipContent,
  currentCombinedRow: defaultCombinedRow,
  mousePosition: defaultMousePosition,
};

/**
 * Configuration for mapping JSON keys to table row header and data cells.
 */
export const markerDetailMap: Types.markerDetail[] = [
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
