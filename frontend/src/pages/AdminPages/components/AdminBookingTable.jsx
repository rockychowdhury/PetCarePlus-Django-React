import React, { useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreHorizontal, Eye, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../../../components/common/Buttons/Button';
import Badge from '../../../components/common/Feedback/Badge';

const AdminBookingTable = ({
    data,
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const columns = [
        {
            header: 'Service',
            accessorKey: 'service_option.name',
            cell: (info) => (
                <div>
                    <div className="font-bold text-sky-900">
                        {info.getValue() || info.row.original.booking_type}
                    </div>
                    <div className="text-xs text-sky-900/60 font-medium">
                        ID: #{info.row.original.id}
                    </div>
                </div>
            ),
        },
        {
            header: 'Date',
            accessorKey: 'booking_date',
            cell: (info) => (
                <div className="flex flex-col">
                    <span className="text-sm text-sky-900 font-bold">
                        {format(new Date(info.getValue()), 'MMM dd, yyyy')}
                    </span>
                    <span className="text-xs text-sky-900/60">
                        {info.row.original.booking_time ? info.row.original.booking_time.slice(0, 5) : 'All Day'}
                    </span>
                </div>
            ),
        },
        {
            header: 'Client',
            accessorKey: 'client',
            cell: (info) => (
                <div className="text-sm">
                    <span className="text-sky-900 font-medium block">
                        {info.row.original.client?.first_name} {info.row.original.client?.last_name}
                    </span>
                    <span className="text-sky-900/40 text-xs">
                        {info.row.original.client?.email}
                    </span>
                </div>
            ),
        },
        {
            header: 'Provider',
            accessorKey: 'provider.business_name',
            cell: (info) => (
                <div className="text-sm font-medium text-cyan-700">
                    {info.getValue()}
                </div>
            ),
        },
        {
            header: 'Price',
            accessorKey: 'total_price',
            cell: (info) => (
                <div className="text-sm font-bold text-sky-900">
                    {formatCurrency(info.getValue())}
                </div>
            ),
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (info) => {
                const status = info.getValue();
                let styles = "";

                if (status === 'completed') styles = "bg-emerald-100 text-emerald-700 border-emerald-200";
                else if (status === 'confirmed') styles = "bg-blue-100 text-blue-700 border-blue-200";
                else if (status === 'cancelled') styles = "bg-red-100 text-red-700 border-red-200";
                else styles = "bg-amber-100 text-amber-700 border-amber-200"; // Pending

                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${styles}`}>
                        {status}
                    </span>
                );
            },
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
                            <button
                                onClick={() => {
                                    // navigate to details if implemented
                                    setActionMenuOpen(null);
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-bold text-sky-900 hover:bg-sky-50 flex items-center gap-2"
                            >
                                <Eye size={16} /> View Details
                            </button>
                            {/* Future actions: Refund, Cancel, etc. */}
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
                                    No bookings found matching your filters.
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

export default AdminBookingTable;
