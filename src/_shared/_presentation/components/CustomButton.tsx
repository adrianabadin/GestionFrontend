import { Button as MTCard } from "@material-tailwind/react";

const CustomButton = ({
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

export default CustomButton;
