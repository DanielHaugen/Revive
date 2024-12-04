'use client';

import Card from '@/lib/ui/card/Card';
import { ChangeEvent } from 'react';
import { NewPlaybookData } from './page';

type GeneralInformationProps = {
  formData: NewPlaybookData;
  setFormData: React.Dispatch<React.SetStateAction<NewPlaybookData>>;
};

const GeneralInformation: React.FC<GeneralInformationProps> = ({
  formData,
  setFormData,
}) => {
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  return (
    <Card>
      <h1 className="text-xl font-semibold mb-4">General Information</h1>
      <div className="mb-3">
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Playbook Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleInputChange}
          required={true}
          className="mt-1 px-4 py-2 border border-gray-300 rounded-lg w-full"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={5}
          className="mt-1 px-4 py-2 border border-gray-300 rounded-lg w-full"
        />
      </div>
    </Card>
  );
};

export default GeneralInformation;
