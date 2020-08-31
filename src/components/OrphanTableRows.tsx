import React from "react";
import * as Types from "./../utils/Types";
import { getTableRowColor } from "../utils/Renderers";
import { handleMarkerOnClick } from "../utils/EventHandlers";

const OrphanTableRows = (props: Types.OrphanTableRowsProps): JSX.Element => {
  const [state, dispatch] = props.stateManager;
  const rows = props.givenCombinedRow.rows;
  const combinedRowColor = getTableRowColor(
    props.givenCombinedRow,
    state.currentCombinedRow,
    props.givenIndex
  );

  /* React.Fragment allows for the return of orphan sibling elements without 
  adding an extra parent element to the DOM. The table rows need to be orphans 
  here, or else the encompassing tbody will have an illegal structure. */
  return (
    <React.Fragment>
      {rows.map((row) => (
        <tr
          key={row.index}
          onClick={handleMarkerOnClick(dispatch, props.givenCombinedRow)}
          style={{ background: combinedRowColor }}
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
