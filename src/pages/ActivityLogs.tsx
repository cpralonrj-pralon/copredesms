import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { supabase } from '../lib/supabase';
import {
    RefreshCw, Smartphone, MessageSquare, AlertCircle, CheckCircle2,
    Search, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import type { SortingState } from '@tanstack/react-table';

interface ActivityLog {
    id: string;
    created_at: string;
    action: string;
    canal: 'SMS' | 'WHATSAPP';
    regional: string;
    mensagem: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    user_id: string;
    users?: {
        nome: string;
    };
}

export function ActivityLogs() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }]);

    // Filters State
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [channelFilter, setChannelFilter] = useState<string>('ALL');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/logs');
            setLogs(response.data || []);
        } catch (error) {
            console.error('Erro ao buscar logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const subscription = supabase
            .channel('activity_logs_realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
                setLogs((prev) => [payload.new as ActivityLog, ...prev]);
            })
            .subscribe();

        return () => { subscription.unsubscribe(); };
    }, []);

    // Filter Logic
    const filteredData = useMemo(() => {
        return logs.filter(log => {
            const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
            const matchesChannel = channelFilter === 'ALL' || log.canal === channelFilter;
            const matchesGlobal = log.mensagem?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                log.regional?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                (log.users?.nome || 'Sistema').toLowerCase().includes(globalFilter.toLowerCase());
            return matchesStatus && matchesChannel && matchesGlobal;
        });
    }, [logs, statusFilter, channelFilter, globalFilter]);

    // Table Config
    const columnHelper = createColumnHelper<ActivityLog>();
    const columns = useMemo(() => [
        columnHelper.accessor('created_at', {
            header: 'HORÁRIO',
            cell: info => <span className="font-mono text-xs">{new Date(info.getValue()).toLocaleString('pt-BR')}</span>,
        }),
        columnHelper.accessor(row => row.users?.nome || 'Sistema', {
            id: 'operador',
            header: 'OPERADOR',
            cell: info => <span className="font-medium text-white">{info.getValue()}</span>
        }),
        columnHelper.accessor('canal', {
            header: 'CANAL',
            cell: info => (
                <div className="flex items-center gap-2">
                    {info.getValue() === 'WHATSAPP' ? <Smartphone size={14} className="text-green-500" /> : <MessageSquare size={14} className="text-blue-500" />}
                    <span className="text-xs">{info.getValue()}</span>
                </div>
            )
        }),
        columnHelper.accessor('regional', {
            header: 'REGIONAL',
            cell: info => (
                <span className="px-2 py-1 rounded-full bg-slate-800 text-[10px] font-bold border border-slate-700 uppercase">
                    {info.getValue() || 'N/A'}
                </span>
            )
        }),
        columnHelper.accessor('mensagem', {
            header: 'MENSAGEM',
            cell: info => <div className="truncate max-w-[300px] text-xs font-mono text-slate-500" title={info.getValue()}>{info.getValue()}</div>
        }),
        columnHelper.accessor('status', {
            header: 'STATUS',
            cell: info => {
                const status = info.getValue();
                let colorClass = 'text-amber-400 bg-amber-400/10 border-amber-400/20';
                if (status === 'SUCCESS') colorClass = 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
                if (status === 'FAILED') colorClass = 'text-red-400 bg-red-400/10 border-red-400/20';

                return (
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${colorClass}`}>
                        {status === 'SUCCESS' && <CheckCircle2 size={10} />}
                        {status === 'FAILED' && <AlertCircle size={10} />}
                        {status}
                    </span>
                );
            }
        }),
    ], []);

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        initialState: {
            pagination: {
                pageSize: 10,
            }
        }
    });

    const exportCSV = () => {
        const headers = ['Data', 'Operador', 'Canal', 'Regional', 'Mensagem', 'Status'];
        const rows = filteredData.map(log => [
            new Date(log.created_at).toLocaleString('pt-BR'),
            log.users?.nome || 'Sistema',
            log.canal,
            log.regional,
            `"${log.mensagem?.replace(/"/g, '""')}"`, // Escape quotes
            log.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `logs_auditoria_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-8 h-full overflow-y-auto custom-scrollbar bg-slate-950">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <span>Monitoramento</span>
                        <span>›</span>
                        <span className="text-cyan-500">Auditoria</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">Logs de Atividade</h1>
                    <p className="text-slate-400 text-sm">Histórico operacional detalhado com filtros e exportação.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-900/20">
                        <Download size={16} /> EXPORTAR CSV
                    </button>
                    <button onClick={fetchLogs} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all">
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 items-center gap-2 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                    <Search size={16} className="text-slate-500" />
                    <input
                        className="bg-transparent border-none outline-none text-sm text-slate-200 w-full placeholder:text-slate-600"
                        placeholder="Buscar por mensagem, regional ou operador..."
                        value={globalFilter}
                        onChange={e => setGlobalFilter(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-cyan-500"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">Status: Todos</option>
                        <option value="SUCCESS">Sucesso</option>
                        <option value="FAILED">Falha</option>
                    </select>
                    <select
                        className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-cyan-500"
                        value={channelFilter}
                        onChange={e => setChannelFilter(e.target.value)}
                    >
                        <option value="ALL">Canal: Todos</option>
                        <option value="SMS">SMS</option>
                        <option value="WHATSAPP">WhatsApp</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-950 text-xs uppercase font-bold text-slate-500 border-b border-slate-800">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-6 py-4 cursor-pointer hover:text-cyan-400 transition-colors" onClick={header.column.getToggleSortingHandler()}>
                                        <div className="flex items-center gap-1">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getIsSorted() === 'asc' ? ' ▲' : header.column.getIsSorted() === 'desc' ? ' ▼' : ''}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-slate-800/50 transition-colors">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-6 py-4">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                                    Nenhum registro encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
                    <span className="text-xs text-slate-500">
                        Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} • Total: {filteredData.length} registros
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronsLeft size={16} />
                        </button>
                        <button
                            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronsRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
