import type { ChangeEvent } from "react";

import localize from "../../utils/localize";
import type { ZoomInputProps } from "../shared-props";

const SelectOptions = ({ zoomValues }) => {
  return (
    <>
      {zoomValues.map((value) => (
        <option key={value}>{value}</option>
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
