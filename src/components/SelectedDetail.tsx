import React from "react";
import * as Config from "../utils/Config";
import * as Types from "../utils/Types";
import { getDefaultRowColor } from "../utils/Renderers";

const SelectedDetail = (props: Types.SelectedDetailProps): JSX.Element => {
  const defaultRowColor = getDefaultRowColor(props.orderedIndex);
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
