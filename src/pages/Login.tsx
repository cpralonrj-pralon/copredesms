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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
                        <Shield className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">PAINEL COP REDE</h1>
                    <p className="text-slate-400 mt-2 text-sm">Controle Operacional de SMS e WhatsApp</p>
                </div>

                {/* Card */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">E-mail Corporativo</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                                    placeholder="usuario@claro.com.br"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
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
                            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ACESSAR SISTEMA'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-xs mt-8 uppercase tracking-widest">
                    Acesso Restrito - Equipe de Monitoramento
                </p>
            </div>
        </div>
    );
}
