import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  subtitle: string;
  sourceBadge: string;
  isExternalForecast?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  sourceBadge,
  isExternalForecast
}) => (
  <div className="p-3.5 rounded-xl bg-[#F7F8F2] border border-[#E2E8E0]">
    <div className="flex items-center justify-between text-xs text-[#748077]">
      <span>{label}</span>
      <span
        className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
          isExternalForecast
            ? 'bg-amber-50 text-amber-900 border-amber-200'
            : 'bg-white text-[#245B3C] border-[#E2E8E0]'
        }`}
      >
        {sourceBadge}
      </span>
    </div>
    <div className="text-lg sm:text-xl font-bold mt-1 text-[#202B24]">{value}</div>
    <div className="text-xs text-[#748077] mt-0.5">{subtitle}</div>
  </div>
);
