'use client';

import Card from '@/lib/ui/card/Card';
import { NewPlaybookData } from './page';

type ReviewProps = {
  formData: NewPlaybookData;
};

const Review: React.FC<ReviewProps> = ({ formData }) => {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-3">Review</h2>

      {/* Playbook Name */}
      <div className="mb-3">
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Playbook Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          disabled={true}
          className="mt-1 px-4 py-2 border border-gray-300 rounded-lg w-full disabled:cursor-not-allowed disabled:bg-gray-100"
        />
      </div>

      {/* Description */}
      <div className="mb-3">
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          rows={5}
          disabled={true}
          className="mt-1 px-4 py-2 border border-gray-300 rounded-lg w-full disabled:cursor-not-allowed disabled:bg-gray-100"
        />
      </div>

      {/* Playbook Details */}
      <div className="mt-4">
        <h3 className="font-medium mb-2">Playbook Details:</h3>
        {formData.steps && formData.steps.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {formData.steps.map((step, index) => (
              <li key={index} className="bg-gray-50 p-3 rounded-md shadow-sm">
                <strong>Step {index + 1}:</strong> {step.type}
                {step.targets && step.targets.length > 0 && (
                  <ul className="list-disc pl-5 mt-1 text-sm text-gray-700">
                    {step.targets.map((target, idx) => (
                      <li key={idx}>{target}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No steps added.</p>
        )}
      </div>
    </Card>
  );
};

export default Review;
