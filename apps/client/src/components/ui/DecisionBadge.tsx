import React from 'react';
import type { DecisionState } from '@fieldshift/shared';

export const DecisionBadge: React.FC<{ state: DecisionState; label?: string }> = ({ state, label }) => {
  const style =
    state === 'Suitable'
      ? 'bg-[#E3F2E6] text-[#1B4D2E] border-[#B7DEC0]'
      : state === 'Risky'
      ? 'bg-[#FDF3E1] text-[#8A5B0D] border-[#F3D59B]'
      : 'bg-[#EEF1EE] text-[#4A554D] border-[#D0D7D1]';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {label || state}
    </span>
  );
};
