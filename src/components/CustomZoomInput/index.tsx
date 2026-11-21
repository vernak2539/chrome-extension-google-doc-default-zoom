import React, { useCallback, useEffect, useState } from "react";

import localize from "../../utils/localize";
import { toCustomZoomValue } from "../../utils/to-custom-zoom-value";
import type { ZoomInputProps } from "../shared-props";

import style from "../../style.module.css";

const CustomZoomInput = ({ zoomValue, zoomValues, isCustomValue, updateValue }: ZoomInputProps) => {
  const [localZoom, setLocalZoom] = useState(zoomValue || "");

  useEffect(() => {
    if (!isCustomValue) {
      setLocalZoom("");
    }
  }, [isCustomValue]);

  const updateZoom = useCallback(
    (value: string) => {
      const newValue = toCustomZoomValue(value);

      // don't update the values if we've remove the value and we're using the select box values
      if (newValue === "" && !isCustomValue) {
        return;
      }

      setLocalZoom((zoomValues as readonly string[]).includes(newValue) ? "" : newValue);

      updateValue(newValue);
    },
    [isCustomValue, setLocalZoom, updateValue, zoomValues]
  );

  return (
    <input
      placeholder={localize("popupApplicationCustomZoomInputPlaceholder")}
      value={localZoom}
      maxLength={3}
      minLength={2}
      className={style.applicationZoomCustomInput}
      onFocus={(event) => {
        const value = event.target.value;
        if (value.includes("%")) {
          setLocalZoom(value.replace(/%/g, ""));
        }
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
        const allowedUpdateTriggers = ["Enter", "Tab"];
        const allowedInputKeys = [
          "Clear",
          "Backspace",
          "Delete",
          "EraseEof",
          "Undo",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp"
        ];

        if (allowedUpdateTriggers.includes(event.key)) {
          updateZoom(event.currentTarget.value);
          event.currentTarget.blur();
          return;
        }

        if (/[0-9]/.test(event.key) || allowedInputKeys.includes(event.key)) {
          return;
        }
        event.preventDefault();
      }}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalZoom(event.target.value);
      }}
      onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
        updateZoom(event.target.value);
      }}
    />
  );
};

export default CustomZoomInput;
