import type { ChangeEvent } from "react";

import { DOCS_ZOOM_VALUE_FIT } from "../../constants";
import localize from "../../utils/localize";
import type { ZoomInputProps } from "../shared-props";

const SelectOptions = ({ zoomValues }) => {
  return (
    <>
      {zoomValues.map((value) => (
        <option key={value} value={value}>
          {value === DOCS_ZOOM_VALUE_FIT ? localize("popupDocsDropdownFitSelection") : value}
        </option>
      ))}
    </>
  );
};
const SelectOptionsWithNa = ({ zoomValues }) => {
  return (
    <>
      <option key="na">N/A</option>
      <SelectOptions zoomValues={zoomValues} />
    </>
  );
};

const SelectZoomInput = ({ zoomValue, isCustomValue, updateValue, zoomValues }: ZoomInputProps) => {
  return (
    <select
      aria-label={localize("popupApplicationZoomSelectAriaLabel")}
      onChange={(event: ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;
        updateValue(newValue);
      }}
      value={zoomValue}>
      {!isCustomValue && <SelectOptions zoomValues={zoomValues} />}
      {isCustomValue && <SelectOptionsWithNa zoomValues={zoomValues} />}
    </select>
  );
};

export default SelectZoomInput;
