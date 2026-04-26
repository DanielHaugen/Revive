// /lib/ui/modals/ConfirmationModal.tsx
import React from 'react';
import Button from '@/lib/ui/buttons/Button';
import Modal from '@/lib/ui/modals/Modal';

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <h2 className="text-xl font-bold mb-4">Are you sure?</h2>
    <p>{message}</p>
    <div className="flex justify-end space-x-4 mt-4">
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="danger" onClick={onConfirm}>
        Yes
      </Button>
    </div>
  </Modal>
);

export default ConfirmationModal;
