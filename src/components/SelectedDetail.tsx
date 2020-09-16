import React from "react";
import * as Config from "../utils/Config";
import * as Types from "../utils/Types";

const SelectedDetail = (props: Types.SelectedDetailProps): JSX.Element => {
  return (
    <React.Fragment>
      {Config.markerDetailMap.map((markerDetail, index) => {
        const { key, header, getRowPropContent } = markerDetail;
        const rowProp = props.row[key];
        return (
          <tr key={index}>
            <th>{header}</th>
            <td>{getRowPropContent(rowProp)}</td>
          </tr>
        );
      })}
    </React.Fragment>
  );
};

export default SelectedDetail;
