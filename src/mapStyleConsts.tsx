import React from "react";
import { Point } from "react-simple-maps";

export interface row {
  institution: string;
  category: string;
  lab: string;
  address: string;
  coordinates: Point;
  index: number;
}

export interface setters
  extends Array<
    | React.Dispatch<React.SetStateAction<string>>
    | React.Dispatch<React.SetStateAction<row>>
  > {
  0: React.Dispatch<React.SetStateAction<string>>;
  1: React.Dispatch<React.SetStateAction<row>>;
}

export interface position {
  coordinates: Point;
  zoom: number;
}

export interface RowMarkerProps {
  row: row;
  setters: setters;
  zoom: number;
}

// World map
export const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";
export const minZoom = 1;
export const maxZoom = 16;
const baseStrokeThickness = 1;
const baseZoomThreshold = 1.5;
const baseFontSize = 12;
const baseMarkerSize = 1;
const baseTranslateOffset = 12;

export const handleZoomStroke = (zoom: number): number => {
  return baseStrokeThickness / zoom;
};

export const handleZoomFont = (zoom: number): number => {
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

export const handleZoomY = (zoom: number): number => {
  return baseTranslateOffset / zoom - zoom / baseTranslateOffset;
};

export const displayOnLargeZoom = (zoom: number): boolean => {
  return zoom >= baseZoomThreshold;
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
