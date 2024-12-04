'use client';

import Card from '@/lib/ui/card/Card';
import { ChangeEvent, useState } from 'react';
import { NewPlaybookData } from './page';
import SearchableDropdown, { Option } from '@/lib/ui/inputs/SearchableDropdown';
import Button from '@/lib/ui/buttons/Button';
import { FaPlus, FaTrash } from 'react-icons/fa6';

type DetailsProps = {
  formData: NewPlaybookData;
  setFormData: React.Dispatch<React.SetStateAction<NewPlaybookData>>;
};

type StepData = {
  type: string;
  targets: string[]; // This can be expanded to handle more complex target data
};

const Details: React.FC<DetailsProps> = ({ formData, setFormData }) => {
  const actionOptions: Option[] = [
    { label: 'Start Instances', value: 'start-instances' },
    { label: 'Stop Instances', value: 'stop-instances' },
    { label: 'Restore Instances', value: 'restore-instances' },
  ];

  // Initialize with existing formData steps or an empty step
  const [steps, setSteps] = useState<StepData[]>(formData.steps || []);

  // Function to handle adding a new step
  const addStep = () => {
    setSteps([...steps, { type: '', targets: [] }]);
  };

  // Function to handle removing a step
  const removeStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
    setFormData({ ...formData, steps: updatedSteps });
  };

  // Function to update a step's type
  const handleStepTypeChange = (index: number, value: string) => {
    const updatedSteps = [...steps];
    updatedSteps[index].type = value;
    setSteps(updatedSteps);
    setFormData({ ...formData, steps: updatedSteps });
  };

  return (
    <Card>
      <h1 className="text-xl font-semibold mb-4">Playbook Details</h1>

      {steps.map((step, index) => (
        <div key={index} className="mb-6 border-b pb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              Step {index + 1} -{' '}
              {actionOptions.find((option) => option.value === step.type)
                ?.label || 'Select Action'}
            </h2>
            {/* Remove Step Button */}
            <Button
              onClick={() => removeStep(index)}
              className="flex items-center text-red-500"
              variant="danger-outline"
            >
              <FaTrash className="mr-2" />
              Remove Step
            </Button>
          </div>

          {/* Action Type */}
          <label className="block text-sm font-medium mb-1">Action Type</label>
          <SearchableDropdown
            options={actionOptions}
            onChange={(option) => handleStepTypeChange(index, option.value)}
            value={actionOptions.find((option) => option.value === step.type)}
          />

          {/* Dynamic Target Content (placeholder) */}
          <label className="block text-sm font-medium mt-3">
            Instance Selection
          </label>
          {/* TODO: Add instance selection logic based on action type */}
          <input
            type="text"
            placeholder="Target instance IDs"
            className="border rounded p-2 w-full mt-1"
            onChange={(e) => {
              const updatedSteps = [...steps];
              updatedSteps[index].targets = e.target.value.split(','); // Simple target handling
              setSteps(updatedSteps);
              setFormData({ ...formData, steps: updatedSteps });
            }}
            value={step.targets.join(',')}
          />
        </div>
      ))}

      {/* Add New Step Button */}
      <Button onClick={addStep} className="flex items-center mt-4 mx-auto">
        <FaPlus className="mr-2" />
        Add New Step
      </Button>
    </Card>
  );
};

export default Details;
