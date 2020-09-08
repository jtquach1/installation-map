import React from "react";
import { handleZoomIn, handleZoomOut } from "./../utils/EventHandlers";
import { ReactComponent as ZoomIn } from "./zoom-in.svg";
import { ReactComponent as ZoomOut } from "./zoom-out.svg";
import * as Config from "./../utils/Config";
import * as Types from "./../utils/Types";

const ZoomControls = (props: Types.ZoomControlProps): JSX.Element => {
  return (
    <div className="controls-wrapper">
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
