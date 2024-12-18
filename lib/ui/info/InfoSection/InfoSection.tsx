import { attachSubComponents } from '@/lib/utils/SubComponents';
import { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { InfoSectionField } from './InfoSectionField';

export interface InfoSectionProps extends ComponentProps<'div'> {
  title?: string;
}

const InfoSectionComponent: FC<InfoSectionProps> = ({
  title,
  children,
  className,
  ...props
}) => {
  return (
    <div className={twMerge('', className)} {...props}>
      {title && <h1 className="text-xl font-bold mb-4">{title}</h1>}
      <div className="flex flex-wrap gap-x-8 gap-y-4">{children}</div>
    </div>
  );
};

export const InfoSection = attachSubComponents(
  'InfoSection',
  InfoSectionComponent,
  { Field: InfoSectionField }
);
