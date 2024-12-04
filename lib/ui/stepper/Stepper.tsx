import React from 'react';
import { FaCheck } from 'react-icons/fa6';

type StepperProps = {
  steps: string[];
  currentStep: number;
};

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between w-full mt-5 pb-10 relative">
      {steps.map((step, index) => (
        <div
          key={index}
          className="relative flex-1 flex items-center justify-center"
        >
          {/* Line between steps (added after each circle except the last) */}
          {index < steps.length - 1 && (
            <div
              className={`absolute top-1/2 left-1/2 w-full h-1 transform -translate-y-1/2 ${
                currentStep > index ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              style={{ width: '100%' }}
            ></div>
          )}

          {/* Step circle */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white z-10 ${
              currentStep > index
                ? 'bg-blue-600'
                : currentStep === index
                ? 'bg-blue-400'
                : 'bg-gray-300'
            }`}
          >
            {currentStep > index ? <FaCheck /> : <span>{index + 1}</span>}
          </div>

          {/* Step label */}
          <div className="absolute top-14 text-center text-sm text-gray-700 w-full">
            {step}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stepper;
