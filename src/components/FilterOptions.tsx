import React from "react";
import * as Types from "../utils/Types";
import {
  handleInputClear,
  handleInputText,
  handleVisibilityToggle,
} from "../utils/EventHandlers";

const FilterOptions = (props: Types.FilterOptionsProps) => {
  const [state] = props.stateManager;
  return (
    <div className="filter-options">
      <form className="search">
        <input
          type="text"
          placeholder="Enter institution, lab, or address"
          onChange={handleInputText(props.stateManager)}
          value={state.searchBarContent}
        />
        <input
          type="button"
          onClick={handleInputClear(props.stateManager)}
          value="Clear"
        />
      </form>
      <form className="visibility">
        <input
          type="checkbox"
          onClick={handleVisibilityToggle(props.stateManager)}
          checked={state.useMarkerVisibility}
        />
        <label>Filter table by visibility</label>
      </form>
    </div>
  );
};

export default FilterOptions;
