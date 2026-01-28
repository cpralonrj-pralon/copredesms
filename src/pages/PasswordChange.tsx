import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Key, Loader2, CheckCircle2 } from 'lucide-react';

export function PasswordChange() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const { user, refreshProfile } = useAuth();

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (newPassword.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        setError(null);

        // 1. Atualizar senha no Supabase Auth
        const { error: authError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (authError) {
            setError('Erro ao atualizar senha. Tente novamente.');
            setLoading(false);
            return;
        }

        // 2. Atualizar flag no DB public.users
        const { error: dbError } = await supabase
            .from('users')
            .update({ requires_pw_change: false })
            .eq('id', user?.id);

        if (dbError) {
            setError('Erro ao atualizar perfil. Contate o suporte.');
            setLoading(false);
            return;
        }

        setSuccess(true);
        setTimeout(async () => {
            await refreshProfile();
        }, 2000);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-app-main flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-app-text-main">SENHA ATUALIZADA!</h1>
                    <p className="text-app-text-secondary text-sm">Sua nova senha foi registrada com sucesso. Você será redirecionado para o painel operacional...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-app-main flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
                        <Key className="w-8 h-8 text-amber-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-app-text-main uppercase tracking-tight">Primeiro Acesso</h1>
                    <p className="text-app-text-secondary mt-2 text-sm italic">Você está utilizando uma senha padrão. Para continuar, defina uma nova senha de segurança.</p>
                </div>

                {/* Card */}
                <div className="bg-app-card border border-app-border p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>

                    <form onSubmit={handlePasswordChange} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-app-text-secondary uppercase mb-2">Nova Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-app-text-secondary" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-app-sidebar border border-app-border rounded-lg py-3 pl-11 pr-4 text-app-text-main focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-mono"
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-app-text-secondary uppercase mb-2">Confirmar Nova Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-app-text-secondary" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-app-sidebar border border-app-border rounded-lg py-3 pl-11 pr-4 text-app-text-main focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-mono"
                                    placeholder="Repita a nova senha"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-app-sidebar disabled:text-app-text-secondary text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'DEFINIR SENHA E ACESSAR'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
