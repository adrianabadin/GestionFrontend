import { Card as MTCard } from "@material-tailwind/react";

const Card = ({ children, ...props }: { children: any; className: string }) => {
  return (
    <MTCard placeholder="" {...props}>
      {children}
    </MTCard>
  );
};

export default Card;
