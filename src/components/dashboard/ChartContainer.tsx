interface ChartContainerProps {
    title: string;
    children: React.ReactNode;
    subtitle?: string;
    action?: React.ReactNode;
}

export function ChartContainer({ title, children, subtitle, action }: ChartContainerProps) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                    <h3 className="text-slate-100 font-semibold text-lg">{title}</h3>
                    {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
                </div>
                {action && <div>{action}</div>}
            </div>
            <div className="flex-1 min-h-0 w-full relative">
                <div className="absolute inset-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
