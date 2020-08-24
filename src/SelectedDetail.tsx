import React from "react";
import * as Config from "./Config";
import * as Types from "./Types";
import * as Functions from "./Functions";

const SelectedDetail = (props: Types.SelectedDetailProps): JSX.Element => {
  const defaultRowColor = Functions.getDefaultRowColor(props.orderedIndex);
  return (
    <thead>
      {Config.markerDetailMap.map((markerDetail, index) => {
        const { key, header, getRowPropContent } = markerDetail;
        const rowProp = props.row[key];
        return (
          <tr key={index} style={{ background: defaultRowColor }}>
            <th style={{ background: Config.tableHeaderColor }}>{header}</th>
            <td>{getRowPropContent(rowProp)}</td>
          </tr>
        );
      })}
    </thead>
  );
};

export default SelectedDetail;
