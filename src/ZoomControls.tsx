import React from "react";
import { ReactComponent as ZoomIn } from "./zoom-in.svg";
import { ReactComponent as ZoomOut } from "./zoom-out.svg";
import * as Config from "./Config";
import * as Functions from "./Functions";
import * as Types from "./Types";

const ZoomControls = (props: Types.ZoomControlProps) => {
  const [state] = props.stateManager;
  return (
    <div className="controls-wrapper">
      {Functions.displayDebuggingFeatures(true, state.mousePosition)}
      <div className="controls">
        <button
          onClick={() => Functions.handleZoomIn(props.stateManager)}
          style={{ background: Config.defaultMarkerColor }}
        >
          <ZoomIn />
        </button>
        <button
          onClick={() => Functions.handleZoomOut(props.stateManager)}
          style={{ background: Config.defaultMarkerColor }}
        >
          <ZoomOut />
        </button>
      </div>
    </div>
  );
};

export default ZoomControls;
