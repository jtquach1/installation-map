import React from "react";
import * as EventHandlers from "./../utils/EventHandlers";
import { ReactComponent as ZoomIn } from "./zoom-in.svg";
import { ReactComponent as ZoomOut } from "./zoom-out.svg";
import * as Types from "./../utils/Types";

const ZoomControls = (props: Types.ZoomControlProps): JSX.Element => {
  return (
    <div className="controls" style={{ width: props.width }}>
      <button onClick={EventHandlers.handleZoomIn(props.stateManager)}>
        <ZoomIn />
      </button>
      <button onClick={EventHandlers.handleZoomOut(props.stateManager)}>
        <ZoomOut />
      </button>
    </div>
  );
};

export default ZoomControls;
