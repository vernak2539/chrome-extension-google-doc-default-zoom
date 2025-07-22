import localize from "src/utils/localize";

import * as styles from "./experimental-checkbox.module.css";

// Checkbox that is very much tied to experimental features
interface ExperimentalFeatureCheckboxProps {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  linkText: string;
  content: string;
  linkAnchor: string;
}

const ExperimentalFeatureCheckbox = ({
  isChecked,
  onChange,
  linkText,
  content,
  linkAnchor
}: ExperimentalFeatureCheckboxProps) => {
  const onEduClick = () => {
    chrome.tabs.create({
      url: `./tabs/experimental-features.html#${linkAnchor}`
    });
  };

  return (
    <label className={styles.checkbox}>
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
  );
};

export default ExperimentalFeatureCheckbox;
