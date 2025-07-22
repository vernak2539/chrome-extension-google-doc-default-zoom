import classnames from "classnames";
import {
  Checkbox as ReactAriaCheckbox,
  type CheckboxProps
} from "react-aria-components";

import * as styles from "./styles.module.css";

interface Props extends CheckboxProps {
  label: React.ReactNode;
}

export const Checkbox = ({ label, ...props }: Props) => {
  return (
    <ReactAriaCheckbox
      {...props}
      className={classnames(styles.checkbox, props.className)}>
      <div className={styles.checkboxIndicator} />
      {label}
    </ReactAriaCheckbox>
  );
};
