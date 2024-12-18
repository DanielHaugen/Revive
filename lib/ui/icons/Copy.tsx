import { ComponentProps, FC } from 'react';
import { FaRegCopy } from 'react-icons/fa6';
import { toast } from 'react-toastify';

export interface CopyProps extends ComponentProps<'i'> {
  value: string;
  title?: string;
}

const Copy: FC<CopyProps> = ({ value, title }) => {
  return (
    <span className="flex items-center">
      {value}
      <FaRegCopy
        className="ml-2 cursor-pointer hover:text-blue-500 duration-100"
        title={`Copy ${title || value}`}
        onClick={() => {
          navigator.clipboard.writeText(value as string);
          toast.success('Copied to clipboard!');
        }}
      />
    </span>
  );
};

export default Copy;
