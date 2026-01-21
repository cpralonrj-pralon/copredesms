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

export type ViewType = 'dispatcher' | 'impact' | 'massive' | 'logs' | 'admin-register';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('dispatcher');
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
      {activeView === 'dispatcher' && <AlertDispatcher />}
      {activeView === 'impact' && <IncidentImpactGenerator />}
      {activeView === 'massive' && <MassiveSmsGenerator />}
      {activeView === 'logs' && <ActivityLogs />}
      {activeView === 'admin-register' && <AdminUserRegister />}
    </Layout>
  );
}

export default App;
