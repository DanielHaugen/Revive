'use client';

import Card from '@/lib/ui/card/Card';
import { FaCircleInfo } from 'react-icons/fa6';

const AWSSettingsPage = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white">AWS Configuration</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your AWS connection settings.</p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3 bg-blue-950/30 border border-blue-800/40 rounded-lg p-4">
          <FaCircleInfo className="text-blue-400 mt-0.5 shrink-0" />
          <div className="text-sm text-gray-300">
            <p>
              AWS credentials are currently configured through environment variables.
              Update the following variables in your <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs">.env</code> file
              or Docker environment:
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="form-label">Region</label>
            <p className="text-gray-200 font-mono text-sm">
              {process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'} <span className="text-gray-500">(AWS_REGION)</span>
            </p>
          </div>

          <div>
            <label className="form-label">Access Key ID</label>
            <p className="text-gray-200 font-mono text-sm">
              ••••••••••••••••
              <span className="text-gray-500 ml-2">(AWS_ACCESS_KEY_ID)</span>
            </p>
          </div>

          <div>
            <label className="form-label">Secret Access Key</label>
            <p className="text-gray-200 font-mono text-sm">
              ••••••••••••••••
              <span className="text-gray-500 ml-2">(AWS_SECRET_ACCESS_KEY)</span>
            </p>
          </div>
        </div>

        <hr className="border-gray-700" />

        <div className="text-sm text-gray-400">
          <p>
            To change these values, update your environment configuration and restart the application.
            A future release will support editing credentials directly from this page.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AWSSettingsPage;
