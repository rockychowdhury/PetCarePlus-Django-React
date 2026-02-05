import React, { useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreHorizontal, Check, X, Shield, ShieldCheck, ShieldAlert, BadgeCheck, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../../../components/common/Buttons/Button';
import Badge from '../../../components/common/Feedback/Badge';

const AdminProviderTable = ({
    data,
    onUpdateStatus,
    isLoading,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange
}) => {
    const [actionMenuOpen, setActionMenuOpen] = useState(null);

    const toggleActionMenu = (id) => {
        if (actionMenuOpen === id) {
            setActionMenuOpen(null);
        } else {
            setActionMenuOpen(id);
        }
    };

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionMenuOpen && !event.target.closest('.action-menu-container')) {
                setActionMenuOpen(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [actionMenuOpen]);

    const columns = [
        {
            header: 'Provider',
            accessorKey: 'business_name',
            cell: (info) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-cyan-700 font-bold text-xs shrink-0">
                        {info.getValue().charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-sky-900">
                            {info.getValue()}
                        </div>
                        <div className="text-xs text-sky-900/60 font-medium">
                            Category: <span className="text-cyan-600">{info.row.original.category.name}</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Owner',
            accessorKey: 'user.email',
            accessorFn: row => row.user?.email, // Now available via Admin serializer
            cell: (info) => (
                <div className="text-sm">
                    <span className="text-sky-900 font-medium block">
                        {info.row.original.user?.first_name} {info.row.original.user?.last_name}
                    </span>
                    <span className="text-sky-900/40 text-xs">
                        {info.getValue()}
                    </span>
                </div>
            ),
        },
        {
            header: 'Contact',
            accessorKey: 'phone',
            cell: (info) => (
                <div className="text-sm text-sky-900/80 font-medium">
                    {info.getValue()}
                </div>
            ),
        },
        {
            header: 'Location',
            accessorKey: 'city',
            accessorFn: row => row.address?.city, // Use address object
            cell: (info) => (
                <div className="text-sm text-sky-900/80 font-medium">
                    {info.getValue()}, {info.row.original.address?.state}
                </div>
            ),
        },
        {
            header: 'Status',
            accessorKey: 'verification_status',
            cell: (info) => {
                const status = info.getValue();
                let styles = "";
                let Icon = Shield;

                if (status === 'verified') {
                    styles = "bg-emerald-100 text-emerald-700 border-emerald-200";
                    Icon = ShieldCheck;
                } else if (status === 'rejected') {
                    styles = "bg-red-100 text-red-700 border-red-200";
                    Icon = ShieldAlert;
                } else {
                    styles = "bg-amber-100 text-amber-700 border-amber-200"; // Pending
                    Icon = Shield;
                }

                return (
                    <span className={`pl-2 pr-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${styles} flex items-center gap-1 w-fit`}>
                        <Icon size={12} /> {status}
                    </span>
                );
            },
        },
        {
            header: 'Joined',
            accessorKey: 'created_at',
            cell: (info) => (
                <div className="text-sky-900 font-medium text-xs">
                    {format(new Date(info.getValue()), 'MMM dd, yyyy')}
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: (info) => (
                <div className="relative action-menu-container">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleActionMenu(info.row.original.id);
                        }}
                        className="p-2 hover:bg-sky-50 rounded-full text-sky-900/40 hover:text-cyan-700 transition-all"
                    >
                        <MoreHorizontal size={20} />
                    </button>

                    {actionMenuOpen === info.row.original.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-sky-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            {/* View Details */}
                            <button
                                onClick={() => {
                                    // TODO: Navigate to provider details page when implemented
                                    console.log('View details', info.row.original.id);
                                    setActionMenuOpen(null);
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-bold text-sky-900 hover:bg-sky-50 flex items-center gap-2"
                            >
                                <Eye size={16} /> View Details
                            </button>

                            {info.row.original.verification_status !== 'verified' && (
                                <button
                                    onClick={() => {
                                        onUpdateStatus(info.row.original.id, 'verified');
                                        setActionMenuOpen(null);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                                >
                                    <Check size={16} /> Approve
                                </button>
                            )}

                            {info.row.original.verification_status !== 'rejected' && (
                                <button
                                    onClick={() => {
                                        onUpdateStatus(info.row.original.id, 'rejected');
                                        setActionMenuOpen(null);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                                >
                                    <X size={16} /> Reject
                                </button>
                            )}

                            {/* Delete Action (Optional, explicit delete) */}
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this provider?')) {
                                        // Call delete handler if available. For now just log or skip if not passed prop.
                                        console.log('Delete provider', info.row.original.id);
                                    }
                                    setActionMenuOpen(null);
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-sky-50"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    )}
                </div>
            ),
        }
    ];

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            pagination,
        },
        onSortingChange,
        onPaginationChange,
        manualPagination: true,
        manualSorting: true,
        pageCount: pagination.pageCount,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-[2.5rem] border border-sky-100 bg-white">
                <table className="w-full">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="border-b border-sky-100 bg-sky-50/50">
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="px-6 py-4 text-left text-[11px] font-black text-sky-900/40 uppercase tracking-widest cursor-pointer select-none group"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center gap-2">
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {header.column.getIsSorted() ? (
                                                header.column.getIsSorted() === 'desc' ? (
                                                    <ChevronDown size={14} className="text-cyan-600" />
                                                ) : (
                                                    <ChevronUp size={14} className="text-cyan-600" />
                                                )
                                            ) : (
                                                header.column.getCanSort() && (
                                                    <ChevronDown size={14} className="text-sky-900/20 group-hover:text-cyan-600/50 transition-colors" />
                                                )
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-sky-100">
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="hover:bg-sky-50/30 transition-colors group">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-6 py-4 text-sm">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-sky-900/40 font-bold">
                                    No providers found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm font-bold text-sky-900/40">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="rounded-full px-4 h-10 border-sky-100 text-sky-900 hover:bg-sky-50 hover:text-cyan-700 hover:border-cyan-200 disabled:opacity-50 disabled:hover:bg-white"
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="rounded-full px-4 h-10 border-sky-100 text-sky-900 hover:bg-sky-50 hover:text-cyan-700 hover:border-cyan-200 disabled:opacity-50 disabled:hover:bg-white"
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminProviderTable;
