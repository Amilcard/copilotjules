import React from 'react';

interface MultiStepProgressBarProps {
  currentStep: number; // Current active step (1-indexed)
  totalSteps: number;
}

const 
MultiStepProgressBar: React.FC<MultiStepProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '4px', // Spec: Height 4px
    display: 'flex',
    backgroundColor: 'var(--color-progressbar-bg, #CCCCCC)', // Spec: Remaining part color #CCCCCC
    borderRadius: '2px', // Slight rounding for the container
    overflow: 'hidden', // Ensures segments stay within bounds
    gap: '2px', // Small gap between segments
  };

  const segmentBaseStyle: React.CSSProperties = {
    flexGrow: 1,
    height: '100%',
  };

  const segments = [];
  for (let i = 1; i <= totalSteps; i++) {
    const isActiveOrCompleted = i <= currentStep;
    const segmentStyle: React.CSSProperties = {
      ...segmentBaseStyle,
      backgroundColor: isActiveOrCompleted 
        ? 'var(--color-blue-primary, #0055A4)' // Spec: Completed part color #0055A4
        : 'var(--color-progressbar-bg, #CCCCCC)', // Or transparent if container has the bg color and segments overlay
    };
    segments.push(<div key={i} style={segmentStyle} aria-label={`Step ${i} ${isActiveOrCompleted ? 'completed' : 'pending'}`}></div>);
  }

  return (
    <div style={containerStyle} role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
      {segments}
    </div>
  );
};

export default MultiStepProgressBar;
