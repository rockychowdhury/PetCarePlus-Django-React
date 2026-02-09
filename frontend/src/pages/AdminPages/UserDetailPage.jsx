import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, MapPin, Calendar, Shield, AlertTriangle, User, List, FileText, CheckCircle, Save, Trash2, X } from 'lucide-react';
import useAdmin from '../../hooks/useAdmin';
import Card from '../../components/common/Layout/Card';
import Button from '../../components/common/Buttons/Button';
import Badge from '../../components/common/Feedback/Badge';
import { toast } from 'react-toastify';

const UserDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);

    // Hooks
    const { useGetUser, useUpdateUser, useDeleteUser, useToggleUserStatus } = useAdmin();
    const { data: user, isLoading } = useGetUser(id);
    const updateMutation = useUpdateUser();
    const deleteMutation = useDeleteUser();
    const toggleStatusMutation = useToggleUserStatus();

    // Form State
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                role: user.role || 'user',
                phone_number: user.phone_number || '',
                bio: user.bio || '',
                location_city: user.location_city || '',
                location_state: user.location_state || '',
                is_active: user.is_active,
                account_status: user.account_status || 'active',
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync({ id, data: formData });
            setIsEditing(false);
            toast.success('User details updated successfully');
        } catch (error) {
            toast.error('Failed to update user');
        }
    };

    // Helper to get status color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'success';
            case 'banned': return 'error';
            case 'suspended': return 'warning';
            default: return 'neutral';
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await deleteMutation.mutateAsync(id);
                toast.success('User deleted successfully');
                navigate('/admin/users');
            } catch (error) {
                toast.error('Failed to delete user');
            }
        }
    };

    const handleToggleStatus = async () => {
        try {
            await toggleStatusMutation.mutateAsync(id);
            // Invalidate/Refresh happens via hook
            toast.success(`User login access ${user.is_active ? 'disabled' : 'enabled'} successfully`);
        } catch (error) {
            toast.error('Failed to change user status');
        }
    };

    if (isLoading) return <div className="p-10 text-center text-sky-900/40 font-bold uppercase tracking-widest">Loading user profile...</div>;
    if (!user) return <div className="p-10 text-center text-red-500 font-bold">User not found</div>;

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'listings', label: 'Listings', icon: List },
        { id: 'applications', label: 'Applications', icon: FileText },
        { id: 'verification', label: 'Verification', icon: Shield },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <Button variant="ghost" onClick={() => navigate('/admin/users')} className="pl-0 mb-4 text-sky-900/40 hover:bg-transparent hover:text-cyan-700 font-bold">
                    <ChevronLeft size={20} className="mr-1" /> Back to Users
                </Button>
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-sky-50 overflow-hidden border-4 border-white shadow-lg shadow-sky-900/5">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl font-black text-cyan-700">
                                    {user.first_name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black text-sky-900">{user.full_name}</h1>
                                <Badge variant={getStatusColor(user.account_status)} className="border-none capitalize">
                                    {user.account_status}
                                </Badge>
                            </div>
                            <p className="text-sky-900/60 font-medium flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1"><Mail size={14} /> {user.email}</span>
                                {user.location_city && <span className="flex items-center gap-1"><MapPin size={14} /> {user.location_city}, {user.location_state}</span>}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {!isEditing ? (
                            <>
                                <Button variant="primary" onClick={() => setIsEditing(true)} className="bg-cyan-700 hover:bg-cyan-800 text-white rounded-full px-6 font-bold border border-cyan-700 shadow-sm shadow-cyan-700/20">
                                    Edit User
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-sky-900/60 hover:text-sky-900 rounded-full px-6 font-bold">
                                    <X size={16} className="mr-2" /> Cancel
                                </Button>
                                <Button variant="outline" onClick={handleDelete} className="border-red-100 text-red-600 hover:bg-red-50 rounded-full px-6 font-bold">
                                    <Trash2 size={16} className="mr-2" /> Delete
                                </Button>
                                <Button variant="primary" onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 font-bold border border-emerald-500 shadow-sm shadow-emerald-500/20">
                                    <Save size={16} className="mr-2" /> Save Changes
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-sky-100/50">
                <div className="flex gap-6 overflow-x-auto pb-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-2 py-3 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === tab.id ? 'border-cyan-700 text-cyan-700' : 'border-transparent text-sky-900/40 hover:text-sky-900'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Info */}
                <div className="lg:col-span-2">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <Card className="p-8 bg-white border border-sky-100 rounded-[2rem] shadow-none">
                                <h3 className="text-lg font-black text-sky-900 mb-6">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-sky-900/40 uppercase tracking-widest">First Name</label>
                                        <input
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full p-3 rounded-xl text-sm font-bold text-sky-900 outline-none transition-all ${isEditing ? 'bg-sky-50 border border-sky-100 focus:border-cyan-500' : 'bg-transparent border-none p-0'}`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-sky-900/40 uppercase tracking-widest">Last Name</label>
                                        <input
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full p-3 rounded-xl text-sm font-bold text-sky-900 outline-none transition-all ${isEditing ? 'bg-sky-50 border border-sky-100 focus:border-cyan-500' : 'bg-transparent border-none p-0'}`}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="block text-[10px] font-black text-sky-900/40 uppercase tracking-widest">Bio</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            rows={3}
                                            className={`w-full p-3 rounded-xl text-sm font-medium text-sky-900 outline-none transition-all resize-none ${isEditing ? 'bg-sky-50 border border-sky-100 focus:border-cyan-500' : 'bg-transparent border-none p-0'}`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-sky-900/40 uppercase tracking-widest">Email Address</label>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-sky-900 p-0">{user.email}</p>
                                            {user.email_verified && <CheckCircle size={14} className="text-emerald-500" />}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-sky-900/40 uppercase tracking-widest">Phone Number</label>
                                        <input
                                            name="phone_number"
                                            value={formData.phone_number}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full p-3 rounded-xl text-sm font-bold text-sky-900 outline-none transition-all ${isEditing ? 'bg-sky-50 border border-sky-100 focus:border-cyan-500' : 'bg-transparent border-none p-0'}`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-sky-900/40 uppercase tracking-widest">City</label>
                                        <input
                                            name="location_city"
                                            value={formData.location_city}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full p-3 rounded-xl text-sm font-bold text-sky-900 outline-none transition-all ${isEditing ? 'bg-sky-50 border border-sky-100 focus:border-cyan-500' : 'bg-transparent border-none p-0'}`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-sky-900/40 uppercase tracking-widest">State</label>
                                        <input
                                            name="location_state"
                                            value={formData.location_state}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full p-3 rounded-xl text-sm font-bold text-sky-900 outline-none transition-all ${isEditing ? 'bg-sky-50 border border-sky-100 focus:border-cyan-500' : 'bg-transparent border-none p-0'}`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-sky-900/40 uppercase tracking-widest">Role</label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full p-3 rounded-xl text-sm font-bold text-sky-900 outline-none transition-all appearance-none ${isEditing ? 'bg-sky-50 border border-sky-100 focus:border-cyan-500' : 'bg-transparent border-none p-0'}`}
                                        >
                                            <option value="user">Adopter</option>
                                            <option value="service_provider">Service Provider</option>
                                            <option value="admin">Admin</option>
                                            <option value="moderator">Moderator</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-sky-900/40 uppercase tracking-widest">Account Status</label>
                                        <select
                                            name="account_status"
                                            value={formData.account_status}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full p-3 rounded-xl text-sm font-bold text-sky-900 outline-none transition-all appearance-none ${isEditing ? 'bg-sky-50 border border-sky-100 focus:border-cyan-500' : 'bg-transparent border-none p-0'}`}
                                        >
                                            <option value="active">Active</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="banned">Banned</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-sky-900/40 uppercase tracking-widest">Joined Date</label>
                                        <p className="font-bold text-sky-900">{new Date(user.date_joined).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab !== 'profile' && (
                        <div className="p-12 text-center border-2 border-dashed border-sky-100 rounded-[2rem] bg-sky-50/30">
                            <p className="text-sky-900/40 font-bold uppercase tracking-widest">Content for {activeTab} is coming soon.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <Card className="p-6 bg-white border border-sky-100 rounded-[2rem] shadow-none">
                        <h3 className="text-[11px] font-black text-sky-900/40 uppercase tracking-widest mb-6">User Statistics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-sky-100/30">
                                <span className="text-sm font-bold text-sky-900/60">Applications</span>
                                <span className="font-black text-sky-900">0</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-sky-100/30">
                                <span className="text-sm font-bold text-sky-900/60">Pets Count</span>
                                <span className="font-black text-sky-900">{user.pets?.length || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-sky-100/30">
                                <span className="text-sm font-bold text-sky-900/60">Reports Against</span>
                                <span className="font-black text-sky-900">{user.reports_count || 0}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserDetailPage;
