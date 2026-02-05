import React, { useState, useEffect } from 'react';
import useAdmin from '../../hooks/useAdmin';
import { Search, Filter, UserPlus, Download, ChevronDown } from 'lucide-react';
import Card from '../../components/common/Layout/Card';
import Button from '../../components/common/Buttons/Button';
import Badge from '../../components/common/Feedback/Badge';
import { toast } from 'react-toastify';
import AdminUserTable from './components/AdminUserTable';

const UserManagementPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const {
        useGetUsers,
        useToggleUserStatus,
    } = useAdmin();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPagination(prev => ({ ...prev, pageIndex: 0 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Users Query
    const { data: usersData, isLoading: isLoadingUsers, refetch: refetchUsers } = useGetUsers({
        search: debouncedSearch,
        role: filterRole,
        status: filterStatus,
        page: pagination.pageIndex + 1,
    });

    // Mutations
    const toggleStatusMutation = useToggleUserStatus();

    const users = usersData?.results || [];
    const totalCount = usersData?.count || 0;
    const pageCount = Math.ceil(totalCount / pagination.pageSize);

    const handleToggleStatus = async (user) => {
        try {
            await toggleStatusMutation.mutateAsync(user.id);
            toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
            refetchUsers();
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleViewUser = (user) => {
        // Navigate to detail page
        window.location.href = `/admin/users/${user.id}`;
    };

    const handleEditUser = (user) => {
        toast.info(`Edit mode for ${user.full_name} coming soon!`);
    };

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-sky-900 tracking-tight">User <span className="text-cyan-700">Management</span></h1>
                    <p className="text-sky-900/60 font-medium mt-1">Oversee platform participants and enforce community standards.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" className="bg-white border border-sky-100 hover:bg-sky-50 text-sky-900 rounded-full px-6 font-bold hover:border-sky-200 transition-all">
                        <Download size={18} className="mr-2" />
                        Export
                    </Button>
                    <Button variant="primary" className="bg-cyan-700 hover:bg-cyan-800 text-white rounded-full px-6 border border-cyan-700 font-bold hover:shadow-md transition-all">
                        <UserPlus size={18} className="mr-2" />
                        Add User
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Filters Bar */}
                <Card className="p-6 bg-white border border-sky-100/50 rounded-[2rem]">
                    <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
                        <div className="relative w-full lg:max-w-md group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-900/30 group-focus-within:text-cyan-700 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search accounts..."
                                className="w-full pl-12 pr-4 py-3.5 rounded-full border border-sky-100 focus:ring-0 focus:border-cyan-700 outline-none bg-sky-50/30 text-sky-900 font-bold placeholder:text-sky-900/30 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-sky-900/40">
                                    <Filter size={14} />
                                </div>
                                <select
                                    className="appearance-none pl-10 pr-10 py-3 bg-sky-50/30 border border-sky-100 rounded-full text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-cyan-700 text-sky-900/70 min-w-[160px] cursor-pointer hover:bg-sky-50 hover:border-cyan-200 transition-all"
                                    value={filterRole}
                                    onChange={(e) => {
                                        setFilterRole(e.target.value);
                                        setPagination(prev => ({ ...prev, pageIndex: 0 }));
                                    }}
                                >
                                    <option value="All">All Roles</option>
                                    <option value="user">Adopters</option>
                                    <option value="service_provider">Providers</option>
                                    <option value="admin">Admins</option>
                                    <option value="moderator">Moderators</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-sky-900/30">
                                    <ChevronDown size={14} strokeWidth={3} />
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                    <Badge size="sm" variant="neutral" className="bg-transparent p-0 border-none"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" /></Badge>
                                </div>
                                <select
                                    className="appearance-none pl-8 pr-10 py-3 bg-sky-50/30 border border-sky-100 rounded-full text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-cyan-700 text-sky-900/70 min-w-[160px] cursor-pointer hover:bg-sky-50 hover:border-cyan-200 transition-all"
                                    value={filterStatus}
                                    onChange={(e) => {
                                        setFilterStatus(e.target.value);
                                        setPagination(prev => ({ ...prev, pageIndex: 0 }));
                                    }}
                                >
                                    <option value="All">All Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Banned">Banned</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-sky-900/30">
                                    <ChevronDown size={14} strokeWidth={3} />
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full h-[42px] px-8 bg-transparent border border-sky-100 text-sky-900/40 text-[11px] font-bold uppercase tracking-widest hover:text-cyan-700 hover:border-cyan-200 transition-all hover:bg-cyan-50 focus:outline-none focus:ring-0"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterRole('All');
                                    setFilterStatus('All');
                                    setPagination({ pageIndex: 0, pageSize: 10 });
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Table Section */}
                <div className="bg-white rounded-[2.5rem] border border-sky-100/50 overflow-hidden">
                    <AdminUserTable
                        data={users}
                        isLoading={isLoadingUsers}
                        onView={handleViewUser}
                        onEdit={handleEditUser}
                        onToggleStatus={handleToggleStatus}
                        pagination={pagination}
                        setPagination={setPagination}
                        pageCount={pageCount}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserManagementPage;
