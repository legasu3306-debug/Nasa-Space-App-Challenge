import React from 'react';
import { useNavigate } from 'react-router-dom';

type Role = 'farmer' | 'extension';

interface Props {
  onSignIn: (role: Role) => void;
}

export const SignInPage: React.FC<Props> = ({ onSignIn }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F2] text-[#202B24]">
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8E0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
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
        </div>
      </header>

      <div className="flex-1 max-w-md w-full mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-[#E2E8E0] p-8 shadow-sm space-y-5">
          <h2 className="text-xl font-bold text-[#202B24]">Preview Sign-In</h2>
          <p className="text-sm text-[#748077]">
            Mock sign-in — no credentials. Choose who you are to see the right dashboard.
          </p>
          <button
            type="button"
            onClick={() => {
              onSignIn('farmer');
              navigate('/');
            }}
            className="w-full py-3 rounded-lg text-sm font-semibold bg-[#245B3C] text-white hover:bg-[#1E4A32]"
          >
            Continue as Farmer
          </button>
          <button
            type="button"
            onClick={() => {
              onSignIn('extension');
              navigate('/');
            }}
            className="w-full py-3 rounded-lg text-sm font-semibold border border-[#E2E8E0] bg-white text-[#202B24] hover:bg-[#F7F8F2]"
          >
            Continue as Extension Professional
          </button>
          <p className="text-xs text-[#748077] text-center">
            Role is saved in this browser for the preview. Sign out to switch.
          </p>
        </div>
      </div>
    </div>
  );
};
