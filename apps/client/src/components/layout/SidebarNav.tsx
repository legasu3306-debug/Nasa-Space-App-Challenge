import React from 'react';
import { NavLink } from 'react-router-dom';
import { useVoiceI18n } from '../../hooks/useVoiceI18n.js';

type Role = 'farmer' | 'extension';

const EXTENSION_ITEMS = [
  { to: '/', label: 'Dashboard' },
  { to: '/farms', label: 'Farms & Fields' },
  { to: '/weather', label: 'Weather Intelligence' },
  { to: '/sowing', label: '1. Sowing & Onset' },
  { to: '/harvesting', label: '2. Harvest Windows' },
  { to: '/threshing', label: '3. Threshing & Wind' },
  { to: '/crop-maturity', label: '4. Maturity vs. Risk' },
  { to: '/rotation', label: '5. Crop Rotation' },
  { to: '/data-sources', label: 'Data Sources (NASA)' },
  { to: '/settings', label: 'Offline & Settings' }
];

interface Props {
  role: Role;
}

export const SidebarNav: React.FC<Props> = ({ role }) => {
  const { t } = useVoiceI18n();
  const items =
    role === 'farmer'
      ? [{ to: '/', label: t('navFarmAdvice') }]
      : EXTENSION_ITEMS;

  return (
  <aside className="w-full lg:w-64 shrink-0">
    <nav className="bg-white rounded-xl border border-[#E2E8E0] p-2.5 space-y-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg text-xs sm:text-sm transition ${
              isActive
                ? 'bg-[#245B3C] text-white font-semibold'
                : 'text-[#202B24] hover:bg-[#E8F0E9]'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  </aside>
  );
};
