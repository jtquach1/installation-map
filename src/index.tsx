import React, { useState } from "react";
import ReactDOM from "react-dom";
import ReactTooltip from "react-tooltip";
import "./index.css";

import MapChart from "./MapChart";

const App = (): JSX.Element => {
  // Default tooltip
  const [content, setContent] = useState("");
  // Default column data, based on waypoint object
  const [column, setColumn] = useState({
    institution: "",
    category: "",
    lab: "",
    address: "",
    coordinates: [0, 0], // in lng, lat
  });
  const { institution, category, lab, address, coordinates } = column;
  const [x, y] = coordinates;

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
        <p>{x !== 0 && y !== 0 && "(" + x + "," + y + ")"}</p>
      </div>
      <MapChart functions={[setContent, setColumn]} />
      <ReactTooltip>{content}</ReactTooltip>
    </div>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
