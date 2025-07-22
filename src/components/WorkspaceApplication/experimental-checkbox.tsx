import classnames from "classnames";
import localize from "src/utils/localize";

import * as styles from "./experimental-checkbox.module.css";

// Checkbox that is very much tied to experimental features
interface ExperimentalFeatureCheckboxProps {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  linkText: string;
  content: string;
  linkAnchor: string;
  newStyle?: boolean;
}

const ExperimentalFeatureCheckbox = ({
  isChecked,
  onChange,
  linkText,
  content,
  linkAnchor,
  newStyle
}: ExperimentalFeatureCheckboxProps) => {
  const onEduClick = () => {
    chrome.tabs.create({
      url: `./tabs/experimental-features.html#${linkAnchor}`
    });
  };

  return (
    <div
      className={classnames({
        [styles.checkbox]: !newStyle,
        [styles.newCheckbox]: newStyle
      })}>
      <label className={styles.innerLabel}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(event) => {
            onChange(event.target.checked);
          }}
        />
        <span>
          (
          <a href="#" onClick={onEduClick}>
            {localize(linkText)}
          </a>
          ) {localize(content)}
        </span>
      </label>
    </div>
  );
};

export default ExperimentalFeatureCheckbox;
