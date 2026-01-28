import { useTheme } from '../contexts/ThemeContext';
import type { ThemeType } from '../contexts/ThemeContext';
import { Palette, Monitor, Check } from 'lucide-react';

export function SystemSettings() {
    const { theme, setTheme } = useTheme();

    const themes: { id: ThemeType; name: string; description: string; colors: string[] }[] = [
        {
            id: 'default',
            name: 'Padrão (Azul Marinho)',
            description: 'Tema original do sistema com tons de azul e ciano.',
            colors: ['bg-slate-950', 'bg-cyan-500']
        },
        {
            id: 'dark',
            name: 'Escuro Profundo',
            description: 'Tema focado em contraste máximo com pretos puros.',
            colors: ['bg-[#0a0a0a]', 'bg-blue-500']
        },
        {
            id: 'claro',
            name: 'Estilo Claro',
            description: 'Cores institucionais da Claro com alto brilho.',
            colors: ['bg-[#ef0000]', 'bg-slate-100']
        }
    ];

    return (
        <div className="p-6 space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-app-text-main flex items-center gap-3">
                    <Monitor className="text-app-primary" size={28} />
                    Ajustes do Sistema
                </h1>
                <p className="text-app-text-secondary mt-1">
                    Personalize a aparência e comportamento do seu painel.
                </p>
            </div>

            <div className="bg-app-card border border-app-border rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <Palette className="text-app-primary" size={20} />
                    <h2 className="text-lg font-semibold text-app-text-main">Aparência</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`
                                relative p-4 rounded-lg border-2 text-left transition-all
                                ${theme === t.id
                                    ? 'border-app-primary bg-app-primary/5'
                                    : 'border-app-border hover:border-app-text-secondary/30 bg-app-main/50'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-1">
                                    {t.colors.map((c, i) => (
                                        <div key={i} className={`w-4 h-4 rounded-full ${c} border border-white/10`} />
                                    ))}
                                </div>
                                {theme === t.id && (
                                    <div className="bg-app-primary text-white p-0.5 rounded-full">
                                        <Check size={12} />
                                    </div>
                                )}
                            </div>
                            <h3 className="font-medium text-app-text-main text-sm">{t.name}</h3>
                            <p className="text-[11px] text-app-text-secondary mt-1 leading-tight">
                                {t.description}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-app-card/50 border border-app-border/50 rounded-xl p-8 text-center">
                <p className="text-app-text-secondary text-sm italic">
                    Mais configurações de sistema (filtros globais, notificações) estarão disponíveis em breve.
                </p>
            </div>
        </div>
    );
}
