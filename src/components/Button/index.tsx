import classnames from "classnames";
import { Button as BaseButton, type ButtonProps } from "react-aria-components";
import * as styles from "./styles.module.css";

interface Props extends ButtonProps {
  label?: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "default";
}

const Button = ({
  label,
  variant = "primary",
  size = "default",
  children,
  ...props
}: Props) => {
  const buttonStyles = classnames(styles.button, styles[variant], styles[size]);

  return (
    <BaseButton {...props} className={buttonStyles}>
      {children || label}
    </BaseButton>
  );
};

export default Button;
