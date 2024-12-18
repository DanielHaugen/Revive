import { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';

export interface InfoSectionFieldProps extends ComponentProps<'div'> {
  label: string;
}

export const InfoSectionField: FC<InfoSectionFieldProps> = ({
  label,
  children,
  className,
  ...props
}) => {
  console.log('key:', label);
  return (
    <div className={twMerge('flex flex-col', className)} {...props}>
      <span className="font-semibold">{label}</span>
      <span>{children}</span>
    </div>
  );
};
