import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from '@tanstack/react-table';
import { Flag, Search, Filter, AlertCircle, Eye, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import useAPI from '../../hooks/useAPI';
import Card from '../../components/common/Layout/Card';
import Badge from '../../components/common/Feedback/Badge';
import Button from '../../components/common/Buttons/Button';
import { format } from 'date-fns';

const ReportManagementPage = () => {
    const api = useAPI();
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('');

    // Fetch Reports
    const { data, isLoading } = useQuery({
        queryKey: ['adminReports', statusFilter],
        queryFn: async () => {
            const params = statusFilter ? { status: statusFilter } : {};
            const response = await api.get('/admin-panel/reports/', { params });
            return response.data;
        }
    });

    const reports = data?.results || [];

    // Resolve Mutation
    const resolveMutation = useMutation({
        mutationFn: async ({ id, notes }) => {
            await api.post(`/admin-panel/reports/${id}/resolve/`, { admin_notes: notes });
        },
        onSuccess: () => {
            toast.success("Report resolved.");
            queryClient.invalidateQueries(['adminReports']);
        },
        onError: () => toast.error("Failed to resolve report.")
    });

    // Dismiss Mutation
    const dismissMutation = useMutation({
        mutationFn: async ({ id, notes }) => {
            await api.post(`/admin-panel/reports/${id}/dismiss/`, { admin_notes: notes });
        },
        onSuccess: () => {
            toast.success("Report dismissed.");
            queryClient.invalidateQueries(['adminReports']);
        },
        onError: () => toast.error("Failed to dismiss report.")
    });

    // Table Columns
    const columnHelper = createColumnHelper();
    const columns = [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: info => <span className="font-mono text-xs text-sky-900/60">#{info.getValue()}</span>,
        }),
        columnHelper.accessor('report_type', {
            header: 'Type',
            cell: info => (
                <span className="capitalize font-bold text-sky-900">{info.getValue().replace('_', ' ')}</span>
            ),
        }),
        columnHelper.accessor('severity', {
            header: 'Severity',
            cell: info => {
                const val = info.getValue();
                const colors = {
                    low: 'info',
                    medium: 'warning',
                    high: 'error',
                    critical: 'error'
                };
                return <Badge variant={colors[val] || 'default'}>{val}</Badge>;
            }
        }),
        columnHelper.accessor('reporter_name', {
            header: 'Reporter',
            cell: info => <span className="text-sm text-sky-900/80">{info.getValue()}</span>
        }),
        columnHelper.accessor('reported_user_name', {
            header: 'Reported User',
            cell: info => <span className="text-sm text-sky-900/80 font-medium">{info.getValue() || 'N/A'}</span>
        }),
        columnHelper.accessor('created_at', {
            header: 'Date',
            cell: info => <span className="text-xs text-sky-900/60">{format(new Date(info.getValue()), 'MMM dd, yyyy')}</span>
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => {
                const val = info.getValue();
                const colors = {
                    pending: 'warning',
                    under_review: 'info',
                    action_taken: 'success',
                    dismissed: 'neutral'
                };
                return <Badge variant={colors[val]}>{val.replace('_', ' ')}</Badge>;
            }
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: info => (
                <div className="flex gap-2">
                    {info.row.original.status === 'pending' ? (
                        <>
                            <button
                                onClick={() => {
                                    if (window.confirm('Resolve this report?')) {
                                        resolveMutation.mutate({ id: info.row.original.id, notes: 'Resolved via dashboard' });
                                    }
                                }}
                                className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                                title="Resolve"
                            >
                                <CheckCircle size={16} />
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm('Dismiss this report?')) {
                                        dismissMutation.mutate({ id: info.row.original.id, notes: 'Dismissed via dashboard' });
                                    }
                                }}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Dismiss"
                            >
                                <XCircle size={16} />
                            </button>
                        </>
                    ) : (
                        <span className="text-xs text-sky-900/40 italic">Closed</span>
                    )}
                </div>
            )
        })
    ];

    const table = useReactTable({
        data: reports,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    if (isLoading) return <div className="p-8 text-sky-900/60 font-medium">Loading reports...</div>;

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-sky-900 tracking-tight">Report <span className="text-cyan-700">Management</span></h1>
                    <p className="text-sky-900/60 font-medium mt-1">Review and manage user safety reports.</p>
                </div>
                <div className="flex gap-2">
                    {['', 'pending', 'resolved', 'dismissed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${statusFilter === status
                                    ? 'bg-cyan-700 text-white shadow-lg shadow-cyan-900/20'
                                    : 'bg-white text-sky-900/60 hover:bg-sky-50 border border-sky-100'
                                }`}
                        >
                            {status || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            <Card className="overflow-hidden border border-sky-100 shadow-sm rounded-[2rem]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-sky-50/50 border-b border-sky-100">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-4 text-left text-xs font-black text-sky-900/40 uppercase tracking-widest first:pl-8 last:pr-8">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-sky-50">
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="group hover:bg-sky-50/30 transition-colors">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-6 py-4 first:pl-8 last:pr-8">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center text-sky-900/40 font-bold">
                                        No reports found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-sky-100 flex items-center justify-between">
                    <div className="text-xs text-sky-900/40 font-bold">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-sky-100 text-sky-900/60 hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-sky-100 text-sky-900/60 hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ReportManagementPage;
