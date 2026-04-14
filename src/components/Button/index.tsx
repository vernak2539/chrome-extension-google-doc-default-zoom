import classnames from "classnames";
import { Button as BaseButton, type ButtonProps } from "react-aria-components";

interface Props extends ButtonProps {
  label?: string;
  variant?: "primary" | "danger" | "secondary";
  size?: "small" | "medium";
}

const Button = ({ label, variant, size = "medium", children, ...props }: Props) => {
  const buttonStyles = classnames({
    secondary: variant === "secondary",
    outline: variant === "danger", // Using outline for danger as a simple alternative for now
    small: size === "small"
  });

  return (
    <BaseButton
      {...props}
      className={({ isHovered, isPressed, isFocused, isDisabled }) =>
        classnames(buttonStyles, {
          hovered: isHovered,
          pressed: isPressed,
          focused: isFocused,
          disabled: isDisabled
        })
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
