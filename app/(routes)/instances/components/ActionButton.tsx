import Button from '@/lib/ui/buttons/Button';
import { Instance } from '@aws-sdk/client-ec2';
import { useState } from 'react';
import { FaPowerOff, FaArrowsRotate } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { startInstance, stopInstance, rebootInstance } from '@/lib/api/instances';

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

  const handleAction = async (action: 'start' | 'stop' | 'reboot') => {
    setIsTransitioning(true);
    try {
      const id = instance.InstanceId as string;
      if (action === 'start') {
        await startInstance(id);
        toast.success('Starting Instance!');
      } else if (action === 'stop') {
        await stopInstance(id);
        toast.success('Stopping Instance!');
      } else {
        await rebootInstance(id);
        toast.success('Rebooting Instance!');
      }
    } catch (error) {
      console.error(`Error ${action}ing instance`, error);
      toast.error(`Error ${action}ing Instance!`);
    } finally {
      if (onClick) onClick();
      setIsTransitioning(false);
    }
  };

  const isRunning = instance.State?.Name === 'running';
  const showStartButton = !isRunning;
  const isInstanceInTransition =
    instance.State?.Name === 'pending' || instance.State?.Name === 'stopping';

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => handleAction(showStartButton ? 'start' : 'stop')}
        ariaLabel={`${showStartButton ? 'Start' : 'Stop'} Instance`}
        variant={showStartButton ? 'success' : 'danger'}
        className={`flex items-center justify-center ${className}`}
        disabled={isTransitioning || isInstanceInTransition}
      >
        <FaPowerOff className="mr-2" />
        {showStartButton ? 'Start' : 'Stop'}
      </Button>
      {isRunning && (
        <Button
          onClick={() => handleAction('reboot')}
          ariaLabel="Reboot Instance"
          variant="warning"
          className={`flex items-center justify-center ${className}`}
          disabled={isTransitioning}
        >
          <FaArrowsRotate className="mr-2" />
          Reboot
        </Button>
      )}
    </div>
  );
};

export default ActionButton;