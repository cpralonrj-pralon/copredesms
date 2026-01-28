import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Lock, Mail, Loader2 } from 'lucide-react';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message === 'Invalid login credentials'
                ? 'E-mail ou senha incorretos. Verifique se o usuário foi criado no Supabase Auth.'
                : error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-app-main flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-app-primary/10 border border-app-primary/20 mb-4">
                        <Shield className="w-8 h-8 text-app-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-app-text-main">PAINEL COP REDE</h1>
                    <p className="text-app-text-secondary mt-2 text-sm">Controle Operacional de SMS e WhatsApp</p>
                </div>

                {/* Card */}
                <div className="bg-app-card border border-app-border p-8 rounded-2xl shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-app-text-secondary mb-2">E-mail Corporativo</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-app-text-secondary" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-app-sidebar border border-app-border rounded-lg py-3 pl-11 pr-4 text-app-text-main focus:outline-none focus:ring-2 focus:ring-app-primary/50 transition-all"
                                    placeholder="usuario@claro.com.br"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-app-text-secondary mb-2">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-app-text-secondary" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-app-sidebar border border-app-border rounded-lg py-3 pl-11 pr-4 text-app-text-main focus:outline-none focus:ring-2 focus:ring-app-primary/50 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-app-primary hover:bg-app-primary/80 disabled:bg-app-sidebar disabled:text-app-text-secondary text-app-primary-foreground font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ACESSAR SISTEMA'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-app-text-secondary text-xs mt-8 uppercase tracking-widest opacity-60">
                    Acesso Restrito - Equipe de Monitoramento
                </p>
            </div>
        </div>
    );
}
