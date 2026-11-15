import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { TopBar } from './components/layout/TopBar.js';
import { SidebarNav } from './components/layout/SidebarNav.js';
import { useFarms } from './hooks/useFarms.js';
import { useNasaWeather } from './hooks/useNasaWeather.js';
import { useVoiceI18n } from './hooks/useVoiceI18n.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { FarmsPage } from './pages/FarmsPage.js';
import { WeatherPage } from './pages/WeatherPage.js';
import { SowingPage } from './pages/SowingPage.js';
import { HarvestingPage } from './pages/HarvestingPage.js';
import { ThreshingPage } from './pages/ThreshingPage.js';
import { CropMaturityPage } from './pages/CropMaturityPage.js';
import { RotationPage } from './pages/RotationPage.js';
import { DataSourcesPage } from './pages/DataSourcesPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { SignInPage } from './pages/SignInPage.js';
import { FarmerPage } from './pages/FarmerPage.js';

type Role = 'farmer' | 'extension';

export const App: React.FC = () => {
  const { farms, selectedFarm, selectedFarmId, setSelectedFarmId, loading } = useFarms();
  const { language, setLanguage, speakAdvisory } = useVoiceI18n();
  const [isOffline, setIsOffline] = useState(false);
  const [role, setRole] = useState<Role | null>(() => {
    try {
      return (localStorage.getItem('fs_role') as Role) ?? null;
    } catch {
      return null;
    }
  });

  const signIn = (r: Role) => {
    localStorage.setItem('fs_role', r);
    setRole(r);
  };

  const signOut = () => {
    localStorage.removeItem('fs_role');
    setRole(null);
  };

  const { data: telemetry, isLoading, refetch } = useNasaWeather(
    selectedFarm?.id ?? '',
    selectedFarm?.latitude ?? 0,
    selectedFarm?.longitude ?? 0,
    isOffline
  );

  if (loading) {
    return (
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#F7F8F2] text-[#202B24]">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg text-[#202B24]">Loading farms from server…</p>
          </div>
        </div>
      </BrowserRouter>
    );
  }

  const navigate = useNavigate();

  if (!role) {
    return (
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#F7F8F2] text-[#202B24]">
          <SignInPage onSignIn={signIn} />
        </div>
      </BrowserRouter>
    );
  }

  if (!selectedFarm) {
    return (
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#F7F8F2] text-[#202B24]">
          <TopBar
            farms={farms}
            selectedFarmId={selectedFarmId}
            onSelectFarm={setSelectedFarmId}
            language={language}
            onSelectLanguage={setLanguage}
            isOffline={isOffline}
            onToggleOffline={() => setIsOffline((v) => !v)}
            onRefreshTelemetry={() => refetch()}
            onSpeakSummary={() => speakAdvisory('FieldShift Ethiopia advisory')}
            role={role}
            onSignOut={signOut}
          />
          <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-4 px-4 py-4">
            <SidebarNav role={role} />
            <main className="flex-1 min-w-0">
              <div className="text-center mt-20">
                <p className="text-lg text-[#202B24] mb-4">No farm selected. Add a farm to get started.</p>
                <button
                  onClick={() => navigate('/farms')}
                  className="px-4 py-2 rounded-lg bg-[#245B3C] text-white text-sm font-semibold hover:bg-[#1E4A32]"
                >
                  Add Farm
                </button>
              </div>
            </main>
          </div>
        </div>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#F7F8F2] text-[#202B24]">
        <TopBar
          farms={farms}
          selectedFarmId={selectedFarmId}
          onSelectFarm={setSelectedFarmId}
          language={language}
          onSelectLanguage={setLanguage}
          isOffline={isOffline}
          onToggleOffline={() => setIsOffline((v) => !v)}
          onRefreshTelemetry={() => refetch()}
          onSpeakSummary={() =>
            speakAdvisory(`FieldShift Ethiopia advisory for ${selectedFarm.name} in ${selectedFarm.woreda}.`)
          }
          role={role}
          onSignOut={signOut}
        />
        <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-4 px-4 py-4">
          <SidebarNav role={role} />
          <main className="flex-1 min-w-0">
            <Routes>
              {role === 'farmer' ? (
                <>
                  <Route path="/" element={<FarmerPage farm={selectedFarm} telemetry={telemetry} isLoading={isLoading} />} />
                  <Route path="/farms" element={<FarmsPage farm={selectedFarm} telemetry={telemetry} isLoading={isLoading} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<DashboardPage farm={selectedFarm} telemetry={telemetry} isLoading={isLoading} />} />
              <Route path="/farms" element={<FarmsPage farm={selectedFarm} telemetry={telemetry} isLoading={isLoading} />} />
              <Route path="/weather" element={<WeatherPage farm={selectedFarm} telemetry={telemetry} isLoading={isLoading} />} />
              <Route path="/sowing" element={<SowingPage farm={selectedFarm} telemetry={telemetry} isLoading={isLoading} />} />
              <Route path="/harvesting" element={<HarvestingPage farm={selectedFarm} telemetry={telemetry} isLoading={isLoading} />} />
              <Route path="/threshing" element={<ThreshingPage farm={selectedFarm} telemetry={telemetry} isLoading={isLoading} />} />
              <Route path="/crop-maturity" element={<CropMaturityPage farm={selectedFarm} telemetry={telemetry} isLoading={isLoading} />} />
              <Route path="/rotation" element={<RotationPage farm={selectedFarm} telemetry={telemetry} isLoading={isLoading} />} />
              <Route path="/data-sources" element={<DataSourcesPage farm={selectedFarm} telemetry={telemetry} isLoading={isLoading} />} />
                  <Route path="/settings" element={<SettingsPage farm={selectedFarm} telemetry={telemetry} isLoading={isLoading} />} />
                </>
              )}
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
