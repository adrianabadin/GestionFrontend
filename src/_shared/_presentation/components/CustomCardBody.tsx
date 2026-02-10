import { CardBody as MTCard } from "@material-tailwind/react";

const CustomCardBody = ({
  children,
  ...props
}: {
  children: any;
  className?: string;
}) => {
  return (
    <MTCard placeholder="" {...props}>
      {children}
    </MTCard>
  );
};

export default CustomCardBody;
