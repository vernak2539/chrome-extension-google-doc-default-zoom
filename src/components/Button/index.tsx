import classnames from "classnames";
import { Button as BaseButton, type ButtonProps } from "react-aria-components";

interface Props extends ButtonProps {
  label?: string;
  variant?: "primary" | "danger" | "secondary";
  size?: "small" | "medium";
}

const Button = ({ label, variant, size = "medium", children, className, ...props }: Props) => {
  const buttonStyles = classnames({
    secondary: variant === "secondary",
    outline: variant === "danger", // Using outline for danger as a simple alternative for now
    small: size === "small"
  });

  return (
    <BaseButton
      {...props}
      className={(values) =>
        classnames(buttonStyles, typeof className === "function" ? className(values) : className)
      }
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
