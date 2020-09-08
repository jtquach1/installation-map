import React from "react";
import * as Types from "./../utils/Types";
import * as Renderers from "../utils/Renderers";
import * as EventHandlers from "../utils/EventHandlers";
import * as StateUpdaters from "../utils/StateUpdaters";

const OrphanTableRows = (props: Types.OrphanTableRowsProps): JSX.Element => {
  const [state, dispatch] = props.stateManager;
  const rows = props.givenCombinedRow.rows;
  const combinedRowColor = Renderers.getTableRowColor(
    props.givenCombinedRow,
    state.currentCombinedRow,
    props.givenIndex
  );
  const markerIdentifier = StateUpdaters.getMarkerIdentifier(
    props.givenCombinedRow.index
  );

  /* React.Fragment allows for the return of orphan sibling elements without 
  adding an extra parent element to the DOM. The table rows need to be orphans 
  here, or else the encompassing tbody will have an illegal structure. */
  return (
    <React.Fragment>
      {rows.map((row) => (
        <tr
          key={row.index}
          onClick={EventHandlers.handleMarkerOnClick(
            dispatch,
            props.givenCombinedRow
          )}
          style={{ background: combinedRowColor }}
          className={markerIdentifier}
        >
          {props.keys.map((key, index) => {
            const keyIsValid = key in row;
            return keyIsValid && <td key={index}>{row[key]}</td>;
          })}
        </tr>
      ))}
    </React.Fragment>
  );
};

export default OrphanTableRows;
