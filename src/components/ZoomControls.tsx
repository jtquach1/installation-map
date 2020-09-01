import React from "react";
import { displayDebuggingFeatures } from "./../utils/Renderers";
import { handleZoomIn, handleZoomOut } from "./../utils/EventHandlers";
import { ReactComponent as ZoomIn } from "./zoom-in.svg";
import { ReactComponent as ZoomOut } from "./zoom-out.svg";
import * as Config from "./../utils/Config";
import * as Types from "./../utils/Types";

const ZoomControls = (props: Types.ZoomControlProps) => {
  const [state] = props.stateManager;
  return (
    <div className="controls-wrapper">
      {displayDebuggingFeatures(true, state.mousePosition)}
      <div className="controls">
        <button
          onClick={handleZoomIn(props.stateManager)}
          style={{ background: Config.defaultMarkerColor }}
        >
          <ZoomIn />
        </button>
        <button
          onClick={handleZoomOut(props.stateManager)}
          style={{ background: Config.defaultMarkerColor }}
        >
          <ZoomOut />
        </button>
      </div>
    </div>
  );
};

export default ZoomControls;
