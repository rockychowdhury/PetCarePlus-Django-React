import React, { useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Buttons/Button';
import Badge from '../../../components/common/Feedback/Badge';
import Card from '../../../components/common/Layout/Card';

const AdminListingTable = ({
    data,
    isLoading,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange
}) => {
    const navigate = useNavigate();
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
            header: 'Pet',
            accessorKey: 'name',
            cell: (info) => (
                <div className="flex items-center gap-3">
                    {info.row.original.media && info.row.original.media.length > 0 ? (
                        <img
                            src={info.row.original.media.find(m => m.is_primary)?.url || info.row.original.media[0].url}
                            alt={info.getValue()}
                            className="w-10 h-10 rounded-full object-cover border border-sky-100"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-cyan-700 font-bold text-xs">
                            {info.getValue().charAt(0)}
                        </div>
                    )}
                    <div>
                        <div className="font-bold text-sky-900 cursor-pointer hover:text-cyan-700 transition-colors" onClick={() => navigate(`/admin/listings/${info.row.original.id}`)}>
                            {info.getValue()}
                        </div>
                        <div className="text-xs text-sky-900/60 font-medium capitalize">
                            {info.row.original.species} • {info.row.original.breed || 'Unknown Breed'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Owner',
            accessorKey: 'owner',
            cell: (info) => (
                <div className="text-sm">
                    {/* Assuming owner is an ID or object, backend usually returns ID unless depth set. 
                        Let's check serializer... standard serializer might return ID. 
                        If so, we might need a custom serializer or just show ID for now.
                        Actually standard serializer usually just gives ID unless depth=1. 
                        I'll use a safe check. */}
                    <span className="text-sky-900 font-medium">
                        {typeof info.getValue() === 'object' ? (info.getValue().email || info.getValue().username) : `User #${info.getValue()}`}
                    </span>
                </div>
            ),
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (info) => {
                const status = info.getValue();
                let styles = "";

                if (status === 'active') styles = "bg-emerald-100 text-emerald-700 border-emerald-200";
                else if (status === 'rehomed') styles = "bg-blue-100 text-blue-700 border-blue-200";
                else if (status === 'deceased') styles = "bg-gray-100 text-gray-700 border-gray-200";
                else styles = "bg-amber-100 text-amber-700 border-amber-200";

                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${styles}`}>
                        {status}
                    </span>
                );
            },
        },
        {
            header: 'Created',
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
                            <button
                                onClick={() => {
                                    // navigate(`/admin/listings/${info.row.original.id}`);
                                    setActionMenuOpen(null);
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-bold text-sky-900 hover:bg-sky-50 flex items-center gap-2"
                            >
                                <Eye size={16} /> View Details
                            </button>
                            <button
                                onClick={() => {
                                    // Edit logic
                                    setActionMenuOpen(null);
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-bold text-sky-900 hover:bg-sky-50 flex items-center gap-2"
                            >
                                <Edit size={16} /> Edit Listing
                            </button>
                            <button
                                onClick={() => {
                                    // Delete logic
                                    setActionMenuOpen(null);
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
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
                                    No listings found matching your filters.
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

export default AdminListingTable;
