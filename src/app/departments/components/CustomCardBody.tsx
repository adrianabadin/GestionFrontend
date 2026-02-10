import { CardBody as MTCard } from "@material-tailwind/react";

const CardBody = ({
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

export default CardBody;
