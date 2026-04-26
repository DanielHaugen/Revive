'use client';

import { PlaybookData } from './index';
import PlaybookCanvasEditor from '@/lib/ui/playbooks/PlaybookCanvasEditor';

type DetailsProps = {
  formData: PlaybookData;
  setFormData: React.Dispatch<React.SetStateAction<PlaybookData>>;
};

const DetailsScreen: React.FC<DetailsProps> = ({ formData, setFormData }) => {
  return (
    <PlaybookCanvasEditor
      steps={formData.steps}
      onChange={(steps) => setFormData((prev) => ({ ...prev, steps }))}
    />
  );
};

export default DetailsScreen;
