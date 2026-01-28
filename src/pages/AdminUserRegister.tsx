import { useState } from 'react';
import { UserPlus, AlertCircle } from 'lucide-react';
import api from '../services/api';

const REGIONS = [
    'RIO DE JANEIRO / ESPIRITO SANTO',
    'MINAS GERAIS',
    'NORDESTE',
    'BAHIA / SERGIPE',
    'NORTE',
    'CENTRO OESTE',
    'Nacional (BR)'
];

const ROLES = ['Admin', 'Operador'];

export function AdminUserRegister() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nome: '',
        regional: REGIONS[0],
        role: 'Operador'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await api.post('/users/register', formData);
            setMessage({ type: 'success', text: 'Usuário cadastrado com sucesso!' });
            setFormData({ ...formData, email: '', password: '', nome: '' });
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Erro ao cadastrar usuário. Verifique as permissões.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 h-full overflow-y-auto custom-scrollbar bg-app-main">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-app-text-secondary mb-1">
                    <span>Administração</span>
                    <span>›</span>
                    <span className="text-app-primary">Cadastro de Usuários</span>
                </div>
                <h1 className="text-3xl font-bold text-app-text-main mb-2 uppercase tracking-tight">Novo Usuário</h1>
                <p className="text-app-text-secondary text-sm">Adicione novos membros à equipe com controle de acesso e regional.</p>
            </div>

            <div className="max-w-2xl bg-app-card border border-app-border rounded-lg p-8">
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        <AlertCircle size={20} />
                        <span>{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-app-text-secondary uppercase tracking-wider">Nome Completo</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-app-sidebar border border-app-border rounded-lg p-3 text-app-text-main focus:outline-none focus:border-app-primary"
                                value={formData.nome}
                                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-app-text-secondary uppercase tracking-wider">Email Corporativo</label>
                            <input
                                required
                                type="email"
                                className="w-full bg-app-sidebar border border-app-border rounded-lg p-3 text-app-text-main focus:outline-none focus:border-app-primary"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-app-text-secondary uppercase tracking-wider">Senha Provisória</label>
                            <input
                                required
                                type="password"
                                className="w-full bg-app-sidebar border border-app-border rounded-lg p-3 text-app-text-main focus:outline-none focus:border-app-primary"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-app-text-secondary uppercase tracking-wider">Perfil de Acesso</label>
                            <select
                                className="w-full bg-app-sidebar border border-app-border rounded-lg p-3 text-app-text-main focus:outline-none focus:border-app-primary"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            >
                                {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-app-text-secondary uppercase tracking-wider">Regional Principal</label>
                        <select
                            className="w-full bg-app-sidebar border border-app-border rounded-lg p-3 text-app-text-main focus:outline-none focus:border-app-primary"
                            value={formData.regional}
                            onChange={e => setFormData({ ...formData, regional: e.target.value })}
                        >
                            {REGIONS.map(region => <option key={region} value={region}>{region}</option>)}
                        </select>
                        <p className="text-[10px] text-app-text-secondary pt-1">
                            * A regra do banco vincula o usuário a esta regional e sua Entidade (ID da Empresa).
                        </p>
                    </div>

                    <div className="pt-4 border-t border-app-border">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-app-primary hover:bg-app-primary/80 text-app-primary-foreground px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-app-primary/20 transition-all disabled:opacity-50"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-app-primary-foreground/30 border-t-app-primary-foreground rounded-full animate-spin" /> : <UserPlus size={18} />}
                            CADASTRAR USUÁRIO
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
