import Button from '@/lib/ui/buttons/Button';
import { Instance } from '@aws-sdk/client-ec2';
import { useState } from 'react';
import { FaPowerOff } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { startInstance, stopInstance } from '../api';

export type ActionButtonProps = {
  instance: Instance;
  onClick?: () => void;
  className?: string;
};

const ActionButton: React.FC<ActionButtonProps> = ({
  instance,
  onClick,
  className,
}) => {
  // Track loading states
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleStart = async () => {
    setIsTransitioning(true);
    try {
      // Call your API to start the instance
      await startInstance(instance.InstanceId as string);
      toast.success('Starting Instance!');
    } catch (error) {
      console.error('Error starting instance', error);
      toast.error('Error starting Instance!');
    } finally {
      if (onClick) onClick();
      setIsTransitioning(false);
    }
  };

  const handleStop = async () => {
    setIsTransitioning(true);
    try {
      // Call your API to stop the instance
      await stopInstance(instance.InstanceId as string);
      toast.success('Stopping Instance!');
    } catch (error) {
      console.error('Error stopping instance', error);
      toast.error('Error stopping Instance!');
    } finally {
      if (onClick) onClick();
      setIsTransitioning(false);
    }
  };

  const showStartButton = instance.State?.Name !== 'running';
  const isInstanceInTransition =
    instance.State?.Name === 'pending' || instance.State?.Name === 'stopping';

  return (
    <Button
      onClick={showStartButton ? handleStart : handleStop}
      ariaLabel={`${showStartButton ? 'Start' : 'Stop'} Instance`}
      variant={showStartButton ? 'success' : 'danger'}
      className={`flex items-center justify-center ${className}`}
      disabled={isTransitioning || isInstanceInTransition}
    >
      <FaPowerOff className="mr-2" />
      {showStartButton ? 'Start' : 'Stop'}
    </Button>
  );
};

export default ActionButton;