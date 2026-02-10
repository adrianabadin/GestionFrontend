import {
  Dialog as MTCard,
  DialogHeader as DH,
  DialogBody as DB,
  DialogFooter as DF,
} from "@material-tailwind/react";

const CustomDialog = ({
  children,
  open = false,
  handler = () => {},
  ...props
}: {
  children: any;
  title?: string;
  className?: string;
  open?: boolean;
  size?: any;
  handler?: () => void;
}) => {
  return (
    <MTCard placeholder="" open={open} handler={handler} {...props}>
      {children}
    </MTCard>
  );
};

export function DialogHeader({
  children,
  ...props
}: {
  children: any;
  title?: string;
  className?: string;
}) {
  return (
    <DH placeholder={""} {...props}>
      {children}
    </DH>
  );
}

export function DialogBody({
  children,
  ...props
}: {
  children: any;
  title?: string;
  className?: string;
}) {
  return (
    <DB placeholder={""} {...props}>
      {children}
    </DB>
  );
}

export function DialogFooter({
  children,
  ...props
}: {
  children: any;
  title?: string;
  className?: string;
}) {
  return (
    <DF placeholder={""} {...props}>
      {children}
    </DF>
  );
}

export default CustomDialog;
