import { Button as MTCard } from "@material-tailwind/react";

const Button = ({
  children,
  ...props
}: {
  children?: any;
  className?: string;
  variant?: any;
  color?: any;
  disabled?: true;
  onClick?: () => void;
}) => {
  return (
    <MTCard placeholder="" {...props}>
      {children}
    </MTCard>
  );
};

export default Button;
