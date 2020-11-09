import { Point } from "react-simple-maps";

export type RowProp = string | Point | number;
export type CombinedProp = Point | Row[] | number | Visibility;
export type Visibility = boolean | undefined;
export type Parameters = {
  [key: string]: string | undefined;
};
export type Dimensions = {
  width: number;
  height: number;
  scale: number;
};
export type StateProp =
  | Row[]
  | CombinedRow[]
  | string
  | Row
  | Position
  | number
  | boolean;

export type Row = {
  institution: string;
  category: string;
  lab: string;
  address: string;
  coordinates: Point;
  index: number;

  [key: string]: RowProp;
};

export type CombinedRow = {
  index: number;
  averageCoordinates: Point;
  rows: Row[];
  isMarkerVisible: Visibility;

  [key: string]: CombinedProp;
};

export type Position = {
  coordinates: Point;
  zoom: number;
};

export type Action = {
  type: string;
  value: StateProp;
};
export type State = {
  rows: Row[];
  allCombinedRows: CombinedRow[];
  currentCombinedRows: CombinedRow[];
  mousePosition: Position;
  searchBarContent: string;
  inFullMode: boolean;
  currentRow: Row;
  displayDetailedMap: boolean;
  syncMapAndTable: boolean;
};
export type Dispatch = React.Dispatch<Action>;
export type StateManager = [State, Dispatch];

export type MarkerDetail = {
  key: string;
  header: string;
  getRowPropContent: (value: any) => string;
};

export type FilterPredicate = (combinedRow: CombinedRow) => boolean;

export type DisplayedPair = { name: string; fontStyle: string };

export type Limits =
  | {
      top: number;
      right: number;
      bottom: number;
      left: number;
    }
  | undefined;

export interface SideBarProps {
  stateManager: StateManager;
  width: string;
}

export interface FilterOptionsProps {
  stateManager: StateManager;
}

export interface OrphanTableRowsProps {
  keys: string[];
  stateManager: StateManager;
  givenCombinedRow: CombinedRow;
}

export interface SelectedDetailProps {
  row: Row;
  orderedIndex: number;
}

export interface SelectedDetailRowProps {
  markerDetail: MarkerDetail;
  defaultRowColor: string;
  row: Row;
}

export interface MapChartProps {
  stateManager: StateManager;
  width: string;
}

export interface ZoomControlProps {
  stateManager: StateManager;
  width: string;
}

export interface RowMarkerProps {
  givenCombinedRow: CombinedRow;
  stateManager: StateManager;
  isVisible: boolean;
}

export interface PlaceIconProps {
  transform: string;
  markerHighlight: string;
  numberOfRows: number;
}

export interface componentToIdentifier {
  [key: string]: (input: any) => string;
}
