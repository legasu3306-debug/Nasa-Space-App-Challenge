import React from 'react';
import type { DecisionState } from '@fieldshift/shared';
import type { LiveTelemetryBundle } from '../lib/api.js';
import type { FarmProfileRecord } from '../lib/offlineDb.js';
import { useDecisions } from '../hooks/useDecisions.js';
import { useVoiceI18n } from '../hooks/useVoiceI18n.js';

interface PageProps {
  farm: FarmProfileRecord;
  telemetry?: LiveTelemetryBundle;
  isLoading: boolean;
}

type Verdict = 'do' | 'dont' | 'wait';

const VERDICT_STYLE: Record<Verdict, string> = {
  do: 'bg-[#E3F2E6] text-[#1B4D2E] border-[#B7DEC0]',
  dont: 'bg-[#FDECEA] text-[#9B2226] border-[#FCA5A5]',
  wait: 'bg-[#FFF7E0] text-[#8A5B0D] border-[#F3D59B]'
};

function pickVerdict(
  state: DecisionState | undefined,
  doKey: string,
  dontKey: string,
  waitKey: string,
  t: (key: string) => string
) {
  if (state === 'Suitable') return { verdict: 'do' as Verdict, body: t(doKey) };
  if (state === 'Risky') return { verdict: 'dont' as Verdict, body: t(dontKey) };
  return { verdict: 'wait' as Verdict, body: t(waitKey) };
}

export const FarmerPage: React.FC<PageProps> = ({ farm, telemetry, isLoading }) => {
  const { t, language, speakAdvisory } = useVoiceI18n();
  const decisions = useDecisions(telemetry);

  const cards = [
    {
      title: t('farmerSowingTitle'),
      ...pickVerdict(decisions.sowingState, 'farmerSowingDo', 'farmerSowingDont', 'farmerSowingWait', t)
    },
    {
      title: t('farmerHarvestTitle'),
      ...pickVerdict(decisions.harvestingState, 'farmerHarvestDo', 'farmerHarvestDont', 'farmerHarvestWait', t)
    },
    {
      title: t('farmerThreshTitle'),
      ...pickVerdict(decisions.threshingState, 'farmerThreshDo', 'farmerThreshDont', 'farmerThreshWait', t)
    }
  ];

  const speakText = cards.map((c) => `${c.title}. ${c.body}`).join(' ');

  return (
    <div className="space-y-5">
      <div className="bg-[#245B3C] rounded-xl p-5 text-white shadow-sm">
        <span className="text-xs font-semibold opacity-90 uppercase tracking-wider">{t('navFarmAdvice')}</span>
        <h1 className="text-xl font-bold mt-0.5">{t('farmerTitle')}</h1>
        <p className="text-xs opacity-90 mt-1">{farm.name} • {farm.woreda}, {farm.region}</p>
      </div>

      {isLoading ? (
        <div className="p-6 text-center text-sm text-[#748077]">
          Reading your farm data and NASA weather…
        </div>
      ) : (
        <div className="grid gap-4">
          {cards.map((card) => (
            <div key={card.title} className="bg-white rounded-xl border border-[#E2E8E0] p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-[#202B24]">{card.title}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${VERDICT_STYLE[card.verdict]}`}>
                  {t(card.verdict === 'do' ? 'verdictDo' : card.verdict === 'dont' ? 'verdictDont' : 'verdictWait')}
                </span>
              </div>
              <p className="text-sm text-[#202B24]">{card.body}</p>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => speakAdvisory(speakText || t('farmerTitle'))}
        className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[#E2E8E0] bg-white"
      >
        {t('listenAdvice')}
      </button>
    </div>
  );
};
