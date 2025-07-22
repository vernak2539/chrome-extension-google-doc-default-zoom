import {
  Checkbox as ReactAriaCheckbox,
  type CheckboxProps
} from "react-aria-components";
import * as styles from "./styles.module.css";

interface Props extends CheckboxProps {
  label: string;
}

export const Checkbox = ({ label, ...props }: Props) => {
  const checkboxStyles = styles.checkbox;

  return (
    <ReactAriaCheckbox {...props} className={checkboxStyles}>
      <div className={styles.checkboxIndicator} />
      {label}
    </ReactAriaCheckbox>
  );
};
