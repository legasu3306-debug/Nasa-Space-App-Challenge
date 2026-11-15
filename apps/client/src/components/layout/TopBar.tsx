import React from 'react';
import type { FarmProfileRecord } from '../../lib/offlineDb.js';
import type { SupportedLanguage } from '../../lib/i18n.js';
import { useVoiceI18n } from '../../hooks/useVoiceI18n.js';

type Role = 'farmer' | 'extension';

interface TopBarProps {
  farms: FarmProfileRecord[];
  selectedFarmId: string | null;
  onSelectFarm: (id: string) => void;
  language: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  onRefreshTelemetry: () => void;
  onSpeakSummary: () => void;
  role: Role;
  onSignOut: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  farms,
  selectedFarmId,
  onSelectFarm,
  language,
  onSelectLanguage,
  isOffline,
  onToggleOffline,
  onRefreshTelemetry,
  onSpeakSummary,
  role,
  onSignOut
}) => {
  const { t } = useVoiceI18n();
  const roleLabel = role === 'farmer' ? 'Farmer' : 'Extension Professional';
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8E0] shadow-sm">
    <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-[#245B3C] text-white font-bold flex items-center justify-center text-sm">
          FS
        </div>
        <div>
          <span className="font-bold text-base sm:text-lg text-[#245B3C]">FieldShift Ethiopia</span>
          <span className="ml-2 text-xs px-2 py-0.5 rounded bg-[#E8F0E9] text-[#245B3C] font-medium">
            NASA Space Apps 2026
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selectedFarmId || ''}
          onChange={(e) => onSelectFarm(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-[#E2E8E0] bg-[#F7F8F2] text-xs sm:text-sm font-medium"
        >
          {farms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.woreda})
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onRefreshTelemetry}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#245B3C] text-white"
        >
          Sync Live NASA API
        </button>

        <button
          type="button"
          onClick={onToggleOffline}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[#E2E8E0] bg-white"
        >
          {isOffline ? 'Offline Snapshot Mode' : 'Online Live Mode'}
        </button>

        <div className="flex border border-[#E2E8E0] rounded-lg overflow-hidden text-xs">
          {(['en', 'am', 'om'] as SupportedLanguage[]).map((lng) => (
            <button
              key={lng}
              type="button"
              onClick={() => onSelectLanguage(lng)}
              className={`px-2 py-1 ${language === lng ? 'bg-[#245B3C] text-white' : 'bg-[#F7F8F2]'}`}
            >
              {lng.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onSpeakSummary}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[#E2E8E0] bg-white"
        >
          Listen
        </button>

        <button
          type="button"
          onClick={onSignOut}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[#E2E8E0] bg-white"
        >
          {t('signOut')} — {roleLabel}
        </button>
      </div>
    </div>
  </header>
  );
};
