import localize from "src/utils/localize";
import { Checkbox } from "../base/Checkbox";

import * as styles from "./styles.module.css";

interface Props {
  label: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  onExperimentalClick: () => void;
}

const ExperimentalCheckbox = ({
  label,
  isChecked,
  onChange,
  onExperimentalClick
}: Props) => {
  const internalLabel = (
    <span>
      (
      <a href="#" onClick={onExperimentalClick}>
        {localize("popupViewOnlyDocsExperimentalLabel")}
      </a>
      ) {label}
    </span>
  );

  return (
    <div className={styles.checkboxContainer}>
      <Checkbox
        label={internalLabel}
        isSelected={isChecked}
        onChange={onChange}
        className={styles.checkboxLabel}
      />
    </div>
  );
};

export default ExperimentalCheckbox;
