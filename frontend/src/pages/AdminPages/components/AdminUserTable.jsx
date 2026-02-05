import React, { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
} from '@tanstack/react-table';
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Edit,
    Ban,
    UserCheck,
    ArrowUpDown,
    Shield,
    Mail,
    Check
} from 'lucide-react';
import Badge from '../../../components/common/Feedback/Badge';
import { useNavigate } from 'react-router-dom';

const AdminUserTable = ({
    data,
    onView,
    onEdit,
    onToggleStatus,
    isLoading,
    pagination,
    setPagination,
    pageCount
}) => {
    const navigate = useNavigate();
    const [sorting, setSorting] = useState([]);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'full_name',
                header: ({ column }) => (
                    <button
                        className="flex items-center gap-1 hover:text-cyan-700 transition-colors font-bold"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        User
                        <ArrowUpDown size={14} className="text-cyan-700/50" />
                    </button>
                ),
                cell: (info) => {
                    const user = info.row.original;
                    return (
                        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => onView(user)}>
                            <div className="w-10 h-10 rounded-full bg-sky-50 overflow-hidden flex-shrink-0 border border-sky-100 group-hover:border-cyan-200 transition-colors">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-cyan-700 font-black bg-cyan-50">
                                        {user.first_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-sky-900 text-sm whitespace-nowrap group-hover:text-cyan-700 transition-colors">{user.full_name}</span>
                                <span className="text-xs text-sky-900/60 truncate max-w-[150px] group-hover:text-cyan-600/70 transition-colors font-medium">{user.email}</span>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'role',
                header: 'Role',
                cell: (info) => (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-sky-50 text-cyan-700 border border-sky-100">
                        {info.getValue()?.replace('_', ' ')}
                    </span>
                ),
            },
            {
                accessorKey: 'account_status',
                header: 'Status',
                cell: (info) => {
                    const status = info.getValue();
                    const isActive = info.row.original.is_active;

                    if (!isActive) return <Badge variant="error" className="bg-red-50 text-red-600 border border-red-100 font-bold">Banned</Badge>;

                    switch (status) {
                        case 'Active': return <Badge variant="success" className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">Active</Badge>;
                        case 'Suspended': return <Badge variant="warning" className="bg-amber-50 text-amber-600 border border-amber-100 font-bold">Suspended</Badge>;
                        default: return <Badge variant="neutral" className="bg-sky-50 text-sky-600 border border-sky-100 font-bold">{status}</Badge>;
                    }
                },
            },
            {
                header: 'Verified',
                id: 'verified',
                cell: (info) => {
                    const user = info.row.original;
                    return (
                        <div className="flex gap-1.5">
                            <div className={`p-1 rounded-md border text-[10px] ${user.email_verified ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-sky-50 border-sky-100 text-sky-300'}`} title="Email Verified">
                                <Mail size={12} />
                            </div>
                            <div className={`p-1 rounded-md border text-[10px] ${user.phone_verified ? 'bg-cyan-50 border-cyan-100 text-cyan-600' : 'bg-sky-50 border-sky-100 text-sky-300'}`} title="Phone Verified">
                                <Shield size={12} />
                            </div>
                            <div className={`p-1 rounded-md border text-[10px] ${user.verified_identity ? 'bg-cyan-50 border-cyan-100 text-cyan-600' : 'bg-sky-50 border-sky-100 text-sky-300'}`} title="ID Verified">
                                <Check size={12} />
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'date_joined',
                header: ({ column }) => (
                    <button
                        className="flex items-center gap-1 hover:text-cyan-700 transition-colors font-bold"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Joined
                        <ArrowUpDown size={14} className="text-cyan-700/50" />
                    </button>
                ),
                cell: (info) => {
                    const val = info.getValue();
                    if (!val) return <span className="text-xs text-sky-900/30 font-medium">N/A</span>;
                    return (
                        <span className="text-xs text-sky-900/60 font-medium">
                            {new Date(val).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    );
                },
            },
            {
                id: 'actions',
                header: () => <div className="text-right">Actions</div>,
                cell: (info) => (
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => onView(info.row.original)}
                            className="p-1.5 text-sky-900/40 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-all border border-transparent hover:border-cyan-100"
                            title="View Details"
                        >
                            <Eye size={16} />
                        </button>
                        <button
                            onClick={() => onEdit(info.row.original)}
                            className="p-1.5 text-sky-900/40 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all border border-transparent hover:border-sky-100"
                            title="Edit User"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={() => onToggleStatus(info.row.original)}
                            className={`p-1.5 rounded-lg transition-all border border-transparent ${info.row.original.is_active
                                ? 'text-sky-900/40 hover:text-red-600 hover:bg-red-50 hover:border-red-100'
                                : 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100'
                                }`}
                            title={info.row.original.is_active ? "Ban User" : "Activate User"}
                        >
                            {info.row.original.is_active ? <Ban size={16} /> : <UserCheck size={16} />}
                        </button>
                    </div>
                ),
            },
        ],
        [onView, onEdit, onToggleStatus]
    );

    const table = useReactTable({
        data,
        columns,
        pageCount: pageCount ?? -1,
        state: {
            pagination,
            sorting,
        },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
    });

    if (isLoading) {
        return (
            <div className="w-full bg-white rounded-3xl border border-sky-100 p-12 text-center overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-600/30 via-sky-400/30 to-cyan-600/30 animate-pulse" />
                <div className="flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-sky-100 border-t-cyan-700 rounded-full animate-spin mb-4"></div>
                    <p className="text-sky-900/40 font-black uppercase tracking-widest text-[10px] animate-pulse">Loading Users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-[1.5rem] border border-sky-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="bg-sky-50/30 border-b border-sky-100">
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="px-6 py-4 text-[11px] font-black text-sky-900/40 uppercase tracking-[0.2em]">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-sky-100/40">
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="hover:bg-sky-50/40 transition-colors group">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-900/20">
                                            <Shield size={24} />
                                        </div>
                                        <p className="text-xs font-bold text-sky-900/40 uppercase tracking-widest">No users found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-sky-100/40 flex items-center justify-between bg-sky-50/10">
                <div className="text-[10px] font-black text-sky-900/40 uppercase tracking-widest">
                    Page <span className="text-cyan-700">{table.getState().pagination.pageIndex + 1}</span> of{' '}
                    <span>{table.getPageCount() || 1}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="p-2 rounded-xl border border-sky-100 bg-white text-sky-900/40 hover:text-cyan-700 hover:border-cyan-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="p-2 rounded-xl border border-sky-100 bg-white text-sky-900/40 hover:text-cyan-700 hover:border-cyan-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminUserTable;
