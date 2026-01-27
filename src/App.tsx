import { useState } from 'react';
import { Layout } from './components/Layout';
import { AlertDispatcher } from './pages/AlertDispatcher';
import { IncidentImpactGenerator } from './pages/IncidentImpactGenerator';
import { MassiveSmsGenerator } from './pages/MassiveSmsGenerator';
import { ActivityLogs } from './pages/ActivityLogs';
import { Login } from './pages/Login';
import { PasswordChange } from './pages/PasswordChange';
import { useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

import { AdminUserRegister } from './pages/AdminUserRegister';

import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { RegionalAnalysis } from './pages/dashboard/RegionalAnalysis';
import { TemporalAnalysis } from './pages/dashboard/TemporalAnalysis';
import { UserPerformance } from './pages/dashboard/UserPerformance';
import { WhatsAppMonitor } from './pages/WhatsAppMonitor';

export type ViewType = 'dashboard' | 'regional' | 'temporal' | 'users' | 'dispatcher' | 'impact' | 'massive' | 'logs' | 'admin-register' | 'whatsapp-monitor';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  if (profile?.requires_pw_change) {
    return <PasswordChange />;
  }

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      {activeView === 'dashboard' && <DashboardOverview />}
      {activeView === 'regional' && <RegionalAnalysis />}
      {activeView === 'temporal' && <TemporalAnalysis />}
      {activeView === 'users' && <UserPerformance />}
      {activeView === 'dispatcher' && <AlertDispatcher />}
      {activeView === 'impact' && <IncidentImpactGenerator />}
      {activeView === 'massive' && <MassiveSmsGenerator />}
      {activeView === 'logs' && <ActivityLogs />}
      {activeView === 'admin-register' && <AdminUserRegister />}
      {activeView === 'whatsapp-monitor' && <WhatsAppMonitor />}
    </Layout>
  );
}

export default App;
