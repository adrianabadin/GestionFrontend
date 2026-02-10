import { Typography as MTCard } from "@material-tailwind/react";

const CustomTypography = ({
  children,
  variant,
  className,
  ...props
}: {
  children: any;
  color?: any;
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "lead"
    | "paragraph"
    | "small";
  className?: string;
}) => {
  return (
    <MTCard placeholder="" variant={variant} className={className} {...props}>
      {children}
    </MTCard>
  );
};

export default CustomTypography;
