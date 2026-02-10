import { Card as MTCard } from "@material-tailwind/react";

const CustomCard = ({ children, ...props }: { children: any; className: string }) => {
  return (
    <MTCard placeholder="" {...props}>
      {children}
    </MTCard>
  );
};

export default CustomCard;
