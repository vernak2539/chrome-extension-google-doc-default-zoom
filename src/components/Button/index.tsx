import classnames from "classnames";
import { Button as BaseButton, type ButtonProps } from "react-aria-components";

interface Props extends ButtonProps {
  label?: string;
  variant?: "primary" | "danger" | "secondary";
}

const Button = ({ label, variant, children, ...props }: Props) => {
  const buttonStyles = classnames({
    secondary: variant === "secondary",
    outline: variant === "danger" // Using outline for danger as a simple alternative for now
  });

  return (
    <BaseButton
      {...props}
      className={buttonStyles}
      style={
        variant === "danger"
          ? { "--pico-color": "#de2300", "--pico-border-color": "#de2300" }
          : undefined
      }>
      {children || label}
    </BaseButton>
  );
};

export default Button;
