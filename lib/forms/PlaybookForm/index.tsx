'use client';

import Button from '@/lib/ui/buttons/Button';
import Stepper from '@/lib/ui/stepper/Stepper';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import InfoScreen from './InfoScreen';
import ReviewScreen from './ReviewScreen';
import { toast } from 'react-toastify';
import DetailsScreen from './DetailsScreen';

export type PlaybookData = {
  name: string;
  description: string;
  steps: {
    type: string;
    targets: string[];
  }[];
};

export type PlaybookFormProps = {
  title: string;
  formData: PlaybookData;
  setFormData: React.Dispatch<React.SetStateAction<PlaybookData>>;
  onSubmit: () => Promise<void>;
};

const PlaybookForm: React.FC<PlaybookFormProps> = ({
  title,
  formData,
  setFormData,
  onSubmit,
}) => {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const screens = [
    { title: 'General Information', page: InfoScreen },
    { title: 'Playbook Details', page: DetailsScreen },
    { title: 'Review', page: ReviewScreen },
  ];

  // Dynamically select the current page component
  const CurrentPageComponent = useMemo(() => screens[step].page, [step]);

  // Handle the Cancel/Back button behavior
  const handleCancelClick = () => {
    if (step === 0) {
      router.back(); // Go back to the previous page if on the first step
    } else {
      setStep((prev) => prev - 1); // Go back to the previous step
    }
  };

  const handleContinueClick = async () => {
    if (step === screens.length - 1) {
      await onSubmit();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  return (
    <div className="container mx-auto py-4">
      {/* Title Section */}
      <section className="flex mb-4 gap-2">
        <h1 className="text-2xl font-semibold mr-auto">{title}</h1>
        <Button
          onClick={handleCancelClick}
          className=""
          variant="secondary-outline"
        >
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button onClick={handleContinueClick} className="">
          {step === screens.length - 1 ? 'Finish' : 'Continue'}
        </Button>
      </section>

      {/* Stepper */}
      <Stepper steps={screens.map((item) => item.title)} currentStep={step} />

      {/* Render the current step component */}
      <div className="mt-4">
        <CurrentPageComponent formData={formData} setFormData={setFormData} />
      </div>
    </div>
  );
};

export default PlaybookForm;
