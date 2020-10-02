import React from "react";
import * as EventHandlers from "../utils/EventHandlers";
import * as Renderers from "../utils/Renderers";
import * as StateUpdaters from "../utils/StateUpdaters";
import * as Types from "./../utils/Types";

const OrphanTableRows = (props: Types.OrphanTableRowsProps): JSX.Element => {
  const [state, dispatch] = props.stateManager;
  const givenRow = props.givenCombinedRow;
  const searchQuery = state.searchBarContent;
  const rowIncludesQuery = Renderers.doesRowIncludeQuery(searchQuery);

  const renderRow = (row: Types.Row): JSX.Element => {
    const markerIdentifier = StateUpdaters.getMarkerIdentifier(givenRow.index);
    const currentRows = state.currentCombinedRows;
    const highlightValidRow = Renderers.getHighlightClass(
      givenRow,
      currentRows
    );
    const shouldHighlight = Renderers.handleHighlight(state.currentRow, row);
    const markerHighlight = highlightValidRow(shouldHighlight);
    return (
      <tr
        key={row.index}
        onClick={EventHandlers.handleMarkerOnClick(dispatch, givenRow, row)}
        className={`${markerIdentifier} ${markerHighlight}`}
      >
        {props.keys.map((key, index) => {
          const keyIsValid = key in row;
          return keyIsValid && <td key={index}>{row[key]}</td>;
        })}
      </tr>
    );
  };

  /* React.Fragment allows for the return of orphan sibling elements without 
  adding an extra parent element to the DOM. The table rows need to be orphans 
  here, or else the encompassing tbody will have an illegal structure. */
  return (
    <React.Fragment>
      {givenRow.rows.map((row) => {
        return rowIncludesQuery(row) ? renderRow(row) : null;
      })}
    </React.Fragment>
  );
};

export default OrphanTableRows;
