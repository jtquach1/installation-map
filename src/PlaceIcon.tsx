import React from "react";
import * as Types from "./Types";

// "Place" From Material Design, Apache license version 2.0
const PlaceIcon = (props: Types.PlaceIconProps): JSX.Element => {
  return (
    <g
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      transform={props.transform}
    >
      <circle cx="12" cy="9" r="3" fillOpacity="0" />
      <path
        fill={props.markerColor}
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      />
    </g>
  );
};

export default PlaceIcon;
