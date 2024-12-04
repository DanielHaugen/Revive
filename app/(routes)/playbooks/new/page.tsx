'use client';

import Button from '@/lib/ui/buttons/Button';
import Stepper from '@/lib/ui/stepper/Stepper';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import GeneralInformation from './general';
import Details from './details';
import Review from './review';
import { toast } from 'react-toastify';

export type NewPlaybookData = {
  name: string;
  description: string;
  steps: {
    type: string;
    targets: string[];
  }[];
};

const NewPlaybookPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<NewPlaybookData>({
    name: '',
    description: '',
    steps: [{ type: '', targets: [] }], // Track dynamic steps added in the Details component
  });

  const stepsComponents = [
    { title: 'General Information', page: GeneralInformation },
    { title: 'Playbook Details', page: Details },
    { title: 'Review', page: Review },
  ];

  // Dynamically select the current page component
  const CurrentPageComponent = useMemo(
    () => stepsComponents[step].page,
    [step]
  );

  // Handle the Cancel/Back button behavior
  const handleCancelClick = () => {
    if (step === 0) {
      router.back(); // Go back to the previous page if on the first step
    } else {
      setStep((prev) => prev - 1); // Go back to the previous step
    }
  };

  // Handle the Continue/Finish button behavior
  const handleContinueClick = () => {
    if (step === stepsComponents.length - 1) {
      // Final step: Validate and submit the data
      console.log('Submitting Playbook:', formData);
      toast.success(`Created Playbook: '${formData.name}'`);
      router.push('/playbooks');
    } else {
      setStep((prev) => prev + 1);
    }
  };

  return (
    <div className="container mx-auto py-4">
      {/* Title Section */}
      <section className="flex mb-4 gap-2">
        <h1 className="text-2xl font-semibold mr-auto">
          Create a New Playbook
        </h1>
        <Button
          onClick={handleCancelClick}
          className=""
          variant="secondary-outline"
        >
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button onClick={handleContinueClick} className="">
          {step === stepsComponents.length - 1 ? 'Finish' : 'Continue'}
        </Button>
      </section>

      {/* Stepper */}
      <Stepper
        steps={stepsComponents.map((item) => item.title)}
        currentStep={step}
      />

      {/* Render the current step component */}
      <div className="mt-4">
        <CurrentPageComponent formData={formData} setFormData={setFormData} />
      </div>
    </div>
  );
};

export default NewPlaybookPage;
