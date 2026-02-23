'use client';

import Card from '@/lib/ui/card/Card';
import { PlaybookData } from './index';

type ReviewProps = {
  formData: PlaybookData;
};

const ReviewScreen: React.FC<ReviewProps> = ({ formData }) => {
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
          className="form-input mt-1"
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
          className="form-input mt-1"
        />
      </div>

      {/* Playbook Details */}
      <div className="mt-4">
        <h3 className="font-medium mb-2">Playbook Details:</h3>
        {formData.steps && formData.steps.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {formData.steps.map((step, index) => (
              <li key={index} className="bg-gray-800 p-3 rounded-md shadow-sm">
                <strong>Step {index + 1}:</strong> {step.type}
                {step.targets && step.targets.length > 0 && (
                    <ul className="list-disc pl-5 mt-1 text-sm text-gray-400">
                    {step.targets.map((target, idx) => (
                      <li key={idx}>{target.toString()}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No steps added.</p>
        )}
      </div>
    </Card>
  );
};

export default ReviewScreen;
