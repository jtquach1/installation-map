import React, { useState } from "react";
import ReactDOM from "react-dom";
import ReactTooltip from "react-tooltip";
import "./index.css";
import MapChart from "./MapChart";
import { row, setters } from "./mapStyleConsts";

const App = (): JSX.Element => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [currentMarker, setCurrentMarker] = useState({
    institution: "",
    category: "",
    lab: "",
    address: "",
    coordinates: [0, 0],
  } as row);
  const { institution, category, lab, address, coordinates } = currentMarker;
  const [lng, lat] = coordinates;

  return (
    <div id="wrapper">
      <div className="left">
        <h1>Institution or Company Name</h1>
        <p>{institution}</p>
        <h1>Category</h1>
        <p>{category}</p>
        <h1>Lab / Group</h1>
        <p>{lab}</p>
        <h1>Address</h1>
        <p>{address}</p>
        <h1>Coordinates</h1>
        <p>{lng !== 0 && lat !== 0 && "(" + lng + "," + lat + ")"}</p>
      </div>
      <MapChart functions={[setTooltipContent, setCurrentMarker] as setters} />
      <ReactTooltip>{tooltipContent}</ReactTooltip>
    </div>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
