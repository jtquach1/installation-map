import React from "react";
import { Point } from "react-simple-maps";

export type rowProp = string | Point | number;

export interface row {
  [key: string]: rowProp;
  institution: string;
  category: string;
  lab: string;
  address: string;
  coordinates: Point;
  index: number;
}

export interface position {
  coordinates: Point;
  zoom: number;
}

export interface SideBarProps {
  stateManager: stateManager;
}

export interface MapChartProps {
  stateManager: stateManager;
}

export interface RowMarkerProps {
  row: row;
  zoom: number;
  // have to figure out how to consolidate the zoom to stateManager's mousePosition
  stateManager: stateManager;
}

export interface PlaceIconProps {
  transform: string;
  markerColor: string;
}

export interface state {
  markers: row[];
  tooltipContent: string;
  currentMarker: row;
  mousePosition: position;
}

export interface action {
  type: string;
  value: row[] | string | row;
}

export interface stateManager extends Array<state | React.Dispatch<action>> {
  0: state;
  1: React.Dispatch<action>;
}

export interface markerDetail {
  key: string;
  title: string;
  predicate: (value: any) => string | boolean;
  element: (value: any) => string;
}

// World map
export const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";
export const minZoom = 1;
export const maxZoom = 8;
export const baseStrokeThickness = 1;
export const baseZoomThreshold = 1.5;
export const baseFontSize = 12;
export const baseMarkerSize = 1;
export const baseTranslateOffset = 12;
export const primaryColor = "#CB123D";
export const secondaryColor = "#0C783F";
export const tertiaryColor = "#3786C2";

export const defaultState: state = {
  markers: [] as row[],
  tooltipContent: "",
  currentMarker: {
    institution: "",
    category: "",
    lab: "",
    address: "",
    coordinates: [0, 0],
  } as row,
  mousePosition: {
    coordinates: [0, 0],
    zoom: minZoom,
  } as position,
};

export const markerDetailMap: markerDetail[] = [
  {
    key: "institution",
    title: "Institution or Company Name",
    predicate: (rowProp: string) => rowProp,
    element: (rowProp: string) => rowProp,
  },
  {
    key: "category",
    title: "Category",
    predicate: (rowProp: string) => rowProp,
    element: (rowProp: string) => rowProp,
  },
  {
    key: "lab",
    title: "Lab / Group",
    predicate: (rowProp: string) => rowProp,
    element: (rowProp: string) => rowProp,
  },
  {
    key: "address",
    title: "Address",
    predicate: (rowProp: string) => rowProp,
    element: (rowProp: string) => rowProp,
  },
  {
    key: "coordinates",
    title: "Coordinates",
    predicate: (rowProp: Point) => {
      const [lng, lat] = rowProp;
      return lng !== 0 && lat !== 0;
    },
    element: (rowProp: Point) => {
      const [lng, lat] = rowProp;
      return `(${lng}, ${lat})`;
    },
  },
];

export const reducer = (state: state, action: action): state => {
  switch (action.type) {
    case "setMarkers":
      return { ...state, markers: action.value as row[] };
    case "tooltipContent":
      return { ...state, tooltipContent: action.value as string };
    case "currentMarker":
      return { ...state, currentMarker: action.value as row };
    default:
      return state;
  }
};

export const createTableHeader = (keys: string[]): JSX.Element => {
  return (
    <thead>
      <tr>
        {keys.map((key: string, index: number) => (
          <th key={index}>{key}</th>
        ))}
      </tr>
    </thead>
  );
};

export const createTableRows = (
  stateManager: stateManager,
  keys: string[]
): JSX.Element => {
  const [state, dispatch] = stateManager;
  const rows = state.markers;
  return (
    <tbody>
      {rows.map((row: row, rowIndex: number) => {
        const getRowColor =
          row === state.currentMarker
            ? primaryColor
            : rowIndex % 2 === 0
            ? "#f9f9f9"
            : "#fff";
        return (
          <tr
            key={rowIndex}
            onClick={() => {
              dispatch({ type: "currentMarker", value: row });
              const id = `marker-${row.index}`;
              const element = document.getElementById(id) as HTMLElement;
              console.log(element);
              console.log(element.onclick);
              element.onclick = () => {
                console.log("element onclick set!");
              };
              console.log(element);
              console.log(element.onclick);
              element.click();
            }}
            style={{ background: getRowColor }}
          >
            {keys.map(
              (key: string, colIndex: number) =>
                key in row && <td key={colIndex}>{row[key]}</td>
            )}
          </tr>
        );
      })}
    </tbody>
  );
};

export const createWaypointDetails = (
  stateManager: stateManager,
  markerDetailMap: markerDetail[]
): JSX.Element => {
  const [state] = stateManager;
  const marker = state.currentMarker;
  return (
    <thead>
      {markerDetailMap.map(
        ({ key, title, predicate, element }: markerDetail, index: number) => (
          <tr key={index}>
            <th>{title}</th>
            {renderTableDataIfNotDefault(marker[key], predicate, element)}
          </tr>
        )
      )}
    </thead>
  );
};

export const renderTableDataIfNotDefault = (
  rowProp: rowProp,
  predicate: (value: any) => string | boolean,
  element: (value: any) => string
): JSX.Element | null => {
  return predicate(rowProp) ? <td>{element(rowProp)}</td> : null;
};

export const displayDebuggingFeatures = (
  allow: boolean,
  pos: position
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

// not in dispatch
export const handleStrokeWidth = (zoom: number): number => {
  return baseStrokeThickness / zoom;
};
export const handleMarkerFontSize = (zoom: number): number => {
  return baseFontSize / zoom;
};
export const handleMarkerScale = (zoom: number): string => {
  return "scale(" + baseMarkerSize / zoom + ")";
};
export const handleMarkerTranslate = (zoom: number): string => {
  const x = -baseTranslateOffset / zoom;
  const y = (-2 * baseTranslateOffset) / zoom;
  return "translate(" + x + ", " + y + ")";
};
export const handleMarkerOffset = (zoom: number): number => {
  return baseTranslateOffset / zoom - zoom / baseTranslateOffset;
};
export const displayOnLargeZoom = (zoom: number): boolean => {
  return zoom >= baseZoomThreshold;
};
