import { Point } from "react-simple-maps";

export type rowProp = string | Point | number;
export type combinedProp = Point | row[];
export type dispatch = React.Dispatch<action>;
export type zoomHandler = (zoom: number) => void;

export interface row {
  institution: string;
  category: string;
  lab: string;
  address: string;
  coordinates: Point;
  index: number;

  [key: string]: rowProp;
}

export interface combinedRow {
  averageCoordinates: Point;
  rows: row[];

  [key: string]: combinedProp;
}

export interface position {
  coordinates: Point;
  zoom: number;
}

export interface SideBarProps {
  stateManager: stateManager;
}

export interface OrphanTableRowsProps {
  keys: string[];
  stateManager: stateManager;
  givenCombinedRow: combinedRow;
  givenIndex: number;
}

export interface SelectedDetailProps {
  row: row;
  orderedIndex: number;
}

export interface SelectedDetailRowProps {
  markerDetail: markerDetail;
  defaultRowColor: string;
  row: row;
}

export interface MapChartProps {
  stateManager: stateManager;
}

export interface ZoomControlProps {
  stateManager: stateManager;
}

export interface RowMarkerProps {
  givenCombinedRow: combinedRow;
  stateManager: stateManager;
}

export interface PlaceIconProps {
  transform: string;
  markerColor: string;
}

export interface state {
  rows: row[];
  combinedRows: combinedRow[];
  tooltipContent: string;
  currentCombinedRow: combinedRow;
  mousePosition: position;
}

export interface action {
  type: string;
  value: row[] | combinedRow[] | string | combinedRow | position | number;
}

export interface stateManager extends Array<state | dispatch> {
  0: state;
  1: dispatch;
}

export interface markerDetail {
  key: string;
  header: string;
  getRowPropContent: (value: any) => string;
}
