import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Search, RotateCcw, User, FileText, Calendar, CheckCircle, XCircle } from 'lucide-react';
import useAdmin from '../../hooks/useAdmin';
import Button from '../../components/common/Buttons/Button';
import Card from '../../components/common/Layout/Card';
import Badge from '../../components/common/Feedback/Badge';
import { toast } from 'react-toastify';
import RoleRequestTable from './components/RoleRequestTable';

const RoleRequestsPage = () => {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'All'

    // Pagination & Sorting State
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState([
        { id: 'created_at', desc: true } // Default sort by newest
    ]);

    // Derived filters for hook
    const hookFilters = useMemo(() => ({
        page: pagination.pageIndex + 1,
        status: statusFilter === 'All' ? undefined : statusFilter, // If All, send undefined to not filter by status
        search: debouncedSearch,
        ordering: sorting.length > 0 ? (sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id) : undefined,
    }), [pagination.pageIndex, statusFilter, debouncedSearch, sorting]);

    const { useGetRoleRequests, useApproveRoleRequest, useRejectRoleRequest } = useAdmin();
    const { data, isLoading, isError, refetch } = useGetRoleRequests(hookFilters);
    const approveMutation = useApproveRoleRequest();
    const rejectMutation = useRejectRoleRequest();

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');

    // Handle Search Debounce
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const handleReset = () => {
        setSearch('');
        setDebouncedSearch('');
        setStatusFilter('pending');
        setSorting([{ id: 'created_at', desc: true }]);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    const handleViewRequest = (request) => {
        setSelectedRequest(request);
        setAdminNotes(request.admin_notes || '');
        setIsReviewModalOpen(true);
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;
        try {
            await approveMutation.mutateAsync({
                id: selectedRequest.id,
                admin_notes: adminNotes || 'Approved by admin'
            });
            toast.success(`Approved request for ${selectedRequest.user_email}`);
            setIsReviewModalOpen(false);
            setAdminNotes('');
        } catch (error) {
            toast.error('Failed to approve request');
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;
        if (!adminNotes.trim()) {
            toast.error('Please provide a reason for rejection in Admin Notes');
            return;
        }
        try {
            await rejectMutation.mutateAsync({
                id: selectedRequest.id,
                admin_notes: adminNotes
            });
            toast.success(`Rejected request for ${selectedRequest.user_email}`);
            setIsReviewModalOpen(false);
            setAdminNotes('');
        } catch (error) {
            toast.error('Failed to reject request');
        }
    };

    // Calculate total pages
    const pageCount = data ? Math.ceil(data.count / pagination.pageSize) : 0;
    const requestsList = data?.results || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-sky-900 tracking-tight">Role Requests</h1>
                <p className="text-sky-900/60 font-medium">Review and manage prompts for user role upgrades.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[2rem] border border-sky-100">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-900/30" size={20} />
                        <input
                            type="text"
                            placeholder="Search by email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-full bg-sky-50 border-none text-sky-900 font-bold placeholder:text-sky-900/30 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {/* Status Tabs as Pills */}
                    <div className="flex bg-sky-50 p-1 rounded-full">
                        {['pending', 'approved', 'rejected', 'All'].map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    setStatusFilter(status);
                                    setPagination(prev => ({ ...prev, pageIndex: 0 }));
                                }}
                                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${statusFilter === status
                                        ? 'bg-white text-cyan-700 shadow-sm shadow-sky-900/5'
                                        : 'text-sky-900/40 hover:text-sky-900/60'
                                    }`}
                            >
                                {status === 'All' ? 'All Requests' : status}
                            </button>
                        ))}
                    </div>

                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        className="rounded-full w-10 h-10 p-0 flex items-center justify-center text-sky-900/40 hover:bg-sky-50 hover:text-cyan-700 transition-colors"
                        title="Reset Filters"
                    >
                        <RotateCcw size={18} />
                    </Button>
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="p-20 text-center text-sky-900/30 font-bold uppercase tracking-widest animate-pulse">
                    Loading requests...
                </div>
            ) : isError ? (
                <div className="p-20 text-center text-red-400 font-bold">
                    Failed to load requests. Please try again.
                </div>
            ) : (
                <RoleRequestTable
                    data={requestsList}
                    onApprove={(req) => { setSelectedRequest(req); setAdminNotes(req.admin_notes || ''); setIsReviewModalOpen(true); }}
                    onReject={(req) => { setSelectedRequest(req); setAdminNotes(req.admin_notes || ''); setIsReviewModalOpen(true); }}
                    onView={handleViewRequest}
                    isLoading={isLoading}
                    pagination={{ ...pagination, pageCount }}
                    onPaginationChange={setPagination}
                    sorting={sorting}
                    onSortingChange={setSorting}
                />
            )}

            {/* Review Modal */}
            {isReviewModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-sky-900/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 shadow-2xl rounded-[2.5rem] border border-white/50">
                        {/* Modal Header */}
                        <div className="p-8 pb-4 flex justify-between items-start border-b border-sky-100/50">
                            <div>
                                <h2 className="text-2xl font-black text-sky-900">Review Request</h2>
                                <p className="text-sky-900/60 font-medium text-sm mt-1">Reviewing application for role upgrade</p>
                            </div>
                            <button
                                onClick={() => setIsReviewModalOpen(false)}
                                className="p-2 hover:bg-red-50 text-sky-900/20 hover:text-red-500 rounded-full transition-colors"
                            >
                                <XCircle size={28} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 space-y-8">
                            {/* User & Request Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-sky-900/40 uppercase tracking-widest">Applicant</label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-cyan-700">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sky-900">{selectedRequest.user_email}</p>
                                            <p className="text-xs text-sky-900/60 font-medium">{selectedRequest.user_name}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-sky-900/40 uppercase tracking-widest">Requested Role</label>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200 text-sm py-1 px-3">
                                            {selectedRequest.requested_role.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Provider Details (Conditional) */}
                            {selectedRequest.provider_profile && (
                                <div className="bg-sky-50 rounded-2xl p-6 border border-sky-100">
                                    <h3 className="font-bold text-sky-900 mb-4 flex items-center gap-2">
                                        <FileText size={18} className="text-cyan-700" /> Provider Profile Details
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                                        <div>
                                            <span className="block text-sky-900/50 font-bold text-xs uppercase">Business Name</span>
                                            <span className="font-bold text-sky-900">{selectedRequest.provider_profile.business_name}</span>
                                        </div>
                                        <div>
                                            <span className="block text-sky-900/50 font-bold text-xs uppercase">Category</span>
                                            <span className="font-bold text-sky-900">{selectedRequest.provider_profile.category?.name || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-sky-900/50 font-bold text-xs uppercase">Contact</span>
                                            <span className="font-bold text-sky-900">{selectedRequest.provider_profile.phone}</span>
                                        </div>
                                        <div>
                                            <span className="block text-sky-900/50 font-bold text-xs uppercase">Location</span>
                                            <span className="font-bold text-sky-900">{selectedRequest.provider_profile.city}, {selectedRequest.provider_profile.state}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="block text-sky-900/50 font-bold text-xs uppercase mb-1">Description</span>
                                        <p className="bg-white p-3 rounded-xl border border-sky-100 text-sky-900/80 italic">
                                            "{selectedRequest.provider_profile.description}"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Reason */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-sky-900/40 uppercase tracking-widest">Request Reason</label>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sky-900 font-medium italic">
                                    "{selectedRequest.reason}"
                                </div>
                            </div>

                            {/* Admin Notes */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-sky-900/40 uppercase tracking-widest">
                                    Admin Notes {selectedRequest.status === 'pending' && <span className="text-cyan-600">(Required for Rejection)</span>}
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes about your decision..."
                                    rows={3}
                                    className="w-full p-4 rounded-2xl bg-white border border-sky-200 text-sky-900 font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        {selectedRequest.status === 'pending' ? (
                            <div className="p-6 bg-sky-50 border-t border-sky-100 flex gap-4">
                                <Button
                                    onClick={handleReject}
                                    disabled={rejectMutation.isPending}
                                    className="flex-1 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 font-bold py-3 rounded-xl shadow-none"
                                >
                                    Reject Request
                                </Button>
                                <Button
                                    onClick={handleApprove}
                                    disabled={approveMutation.isPending}
                                    className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl border-b-4 border-emerald-600 active:border-b-0 active:translate-y-1 shadow-lg shadow-emerald-500/20"
                                >
                                    Approve Request
                                </Button>
                            </div>
                        ) : (
                            <div className="p-6 bg-sky-50 border-t border-sky-100 text-center">
                                <p className="font-bold text-sky-900/60">
                                    This request was <span className={`uppercase ${selectedRequest.status === 'approved' ? 'text-emerald-600' : 'text-red-600'}`}>{selectedRequest.status}</span> on {format(new Date(selectedRequest.updated_at), 'PPP')}
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
};

export default RoleRequestsPage;
