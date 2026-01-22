import { LayoutGrid, Send, Clock, Users, Settings, LogOut, AlertOctagon, Layers, Map, BarChart2 } from 'lucide-react';
import type { ViewType } from '../App';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar({ activeView, onViewChange }: { activeView: ViewType, onViewChange: (view: ViewType) => void }) {
    const { user, signOut } = useAuth();
    const initials = user?.email?.substring(0, 2).toUpperCase() || '??';
    const name = user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Usuário';

    return (
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen text-slate-300">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 bg-cyan-600 rounded flex items-center justify-center text-white font-bold">
                        CL
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-sm leading-none">Operações Claro</h1>
                        <span className="text-xs text-slate-500">COP REDE</span>
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
                        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operação</p>
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
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-slate-800">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Configuração</h3>
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
                        <NavItem icon={<Settings size={20} />} label="Ajustes do Sistema" />
                    )}
                </nav>

                <div className="mt-8 flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-200 text-xs font-bold">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{name}</p>
                        <p className="text-[10px] text-slate-500 truncate uppercase mt-0.5">
                            {user?.user_metadata?.role || user?.user_metadata?.perfil || 'Operador'}
                        </p>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-500 hover:text-red-400"
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
      flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors
      ${active ? 'bg-cyan-900/30 text-cyan-400 border-l-2 border-cyan-400' : 'hover:bg-slate-800 hover:text-white'}
    `}>
            {icon}
            <span className="text-sm font-medium">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />}
        </div>
    );
}
