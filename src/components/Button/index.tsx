import classnames from "classnames";
import { Button as BaseButton, type ButtonProps } from "react-aria-components";
import * as styles from "./styles.module.css";

interface Props extends ButtonProps {
  label: string;
  variant: "primary" | "danger";
}

const Button = ({ label, variant, ...props }: Props) => {
  const buttonStyles = classnames(styles.button, styles[variant]);

  // {
  //   [styles.primary]: variant === "primary",
  //   [styles.danger]: variant === "danger"
  // });

  return (
    <BaseButton {...props} className={buttonStyles}>
      {label}
    </BaseButton>
  );
};

export default Button;
