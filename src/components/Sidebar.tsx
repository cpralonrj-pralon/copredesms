import { LayoutGrid, Send, Clock, Users, Settings, LogOut, AlertOctagon, Layers, Map, BarChart2, Radio } from 'lucide-react';
import type { ViewType } from '../App';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar({ activeView, onViewChange }: { activeView: ViewType, onViewChange: (view: ViewType) => void }) {
    const { user, signOut } = useAuth();
    const initials = user?.email?.substring(0, 2).toUpperCase() || '??';
    const name = user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Usuário';

    return (
        <div className="w-64 bg-app-sidebar border-r border-app-border flex flex-col h-screen text-app-sidebar-text">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 bg-app-primary rounded flex items-center justify-center text-app-primary-foreground font-bold">
                        CL
                    </div>
                    <div>
                        <h1 className="text-app-sidebar-text font-bold text-sm leading-none">Operações Claro</h1>
                        <span className="text-xs text-app-sidebar-text-secondary opacity-70">COP REDE</span>
                    </div>
                </div>

                <nav className="space-y-1">
                    <NavItem
                        icon={<LayoutGrid size={20} />}
                        label="Visão Geral"
                        active={activeView === 'dashboard'}
                        onClick={() => onViewChange('dashboard')}
                    />
                    <NavItem
                        icon={<Map size={20} />}
                        label="Visão Regional"
                        active={activeView === 'regional'}
                        onClick={() => onViewChange('regional')}
                    />
                    <NavItem
                        icon={<BarChart2 size={20} />}
                        label="Análise Temporal"
                        active={activeView === 'temporal'}
                        onClick={() => onViewChange('temporal')}
                    />

                    <div className="pt-4 pb-2">
                        <p className="px-3 text-[10px] font-bold text-app-sidebar-text-secondary opacity-60 uppercase tracking-widest">Operação</p>
                    </div>

                    <NavItem
                        icon={<Send size={20} />}
                        label="Despacho de Alertas"
                        active={activeView === 'dispatcher'}
                        onClick={() => onViewChange('dispatcher')}
                    />
                    <NavItem
                        icon={<AlertOctagon size={20} />}
                        label="Incidentes com Impacto"
                        active={activeView === 'impact'}
                        onClick={() => onViewChange('impact')}
                    />
                    <NavItem
                        icon={<Layers size={20} />}
                        label="Envio Massivo"
                        active={activeView === 'massive'}
                        onClick={() => onViewChange('massive')}
                    />
                    <NavItem
                        icon={<Clock size={20} />}
                        label="Logs de Atividade"
                        active={activeView === 'logs'}
                        onClick={() => onViewChange('logs')}
                    />
                    <NavItem
                        icon={<Users size={20} />}
                        label="Audit. Operacional"
                        active={activeView === 'users'}
                        onClick={() => onViewChange('users')}
                    />

                    <div className="pt-4 pb-2">
                        <p className="px-3 text-[10px] font-bold text-app-sidebar-text-secondary opacity-60 uppercase tracking-widest">Monitoração</p>
                    </div>

                    <NavItem
                        icon={<Radio size={20} />}
                        label="Grupos WhatsApp"
                        active={activeView === 'whatsapp-monitor'}
                        onClick={() => onViewChange('whatsapp-monitor')}
                    />
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-app-border">
                <h3 className="text-xs font-semibold text-app-sidebar-text-secondary opacity-60 uppercase tracking-wider mb-4">Configuração</h3>
                <nav className="space-y-1">
                    {(user?.user_metadata?.role === 'Admin' || user?.user_metadata?.perfil === 'Admin') && (
                        <NavItem
                            icon={<Users size={20} />}
                            label="Cadastro de Usuários"
                            active={activeView === 'admin-register'}
                            onClick={() => onViewChange('admin-register')}
                        />
                    )}
                    {(user?.user_metadata?.role === 'Admin' || user?.user_metadata?.perfil === 'Admin') && (
                        <NavItem
                            icon={<Settings size={20} />}
                            label="Ajustes do Sistema"
                            active={activeView === 'settings'}
                            onClick={() => onViewChange('settings')}
                        />
                    )}
                </nav>

                <div className="mt-8 flex items-center gap-3 p-3 bg-app-card/30 rounded-lg border border-app-border/20">
                    <div className="w-8 h-8 rounded-full bg-app-primary/20 flex items-center justify-center text-app-primary text-xs font-bold ring-1 ring-app-primary/30">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-app-sidebar-text truncate">{name}</p>
                        <p className="text-[10px] text-app-sidebar-text-secondary truncate uppercase mt-0.5">
                            {user?.user_metadata?.role || user?.user_metadata?.perfil || 'Operador'}
                        </p>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="p-1 hover:bg-app-primary/10 rounded transition-colors text-app-text-secondary hover:text-red-400"
                        title="Sair do Sistema"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`
      flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200
      ${active
                    ? 'bg-app-primary/10 text-app-primary border-l-2 border-app-primary shadow-sm'
                    : 'hover:bg-app-card/50 hover:text-app-sidebar-text text-app-sidebar-text-secondary'}
    `}>
            {icon}
            <span className="text-sm font-medium">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-app-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />}
        </div>
    );
}
