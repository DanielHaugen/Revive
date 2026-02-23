import { ComponentProps, FC } from 'react';
import { FaRegCopy } from 'react-icons/fa6';
import { toast } from 'react-toastify';

export interface CopyProps extends ComponentProps<'i'> {
  value: string;
  title?: string;
}

const Copy: FC<CopyProps> = ({ value, title }) => {
  return (
    <span className="flex items-center gap-2 text-gray-300">
      {value}
      <FaRegCopy
        className="cursor-pointer hover:text-blue-400 transition-colors duration-150 text-sm"
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