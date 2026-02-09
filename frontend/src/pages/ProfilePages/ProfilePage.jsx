import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import useAuth from '../../hooks/useAuth';
import usePets from '../../hooks/usePets';
import useAPI from '../../hooks/useAPI';
import { User, Mail, Phone, MapPin, Edit2, Save, X, Shield, Briefcase } from 'lucide-react';
import MyPetsTab from './MyPetsTab';

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const api = useAPI();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        bio: '',
        photoURL: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone_number: user.phone_number || '',
                bio: user.bio || '',
                photoURL: user.photoURL || ''
            });
            fetchRoleRequests();
        }
    }, [user]);

    const [roleRequest, setRoleRequest] = useState(null);
    const [requestLoading, setRequestLoading] = useState(false);

    const fetchRoleRequests = async () => {
        try {
            const response = await api.get('/users/role-requests/');
            // Find pending request for service provider
            const pending = response.data.find(r => r.status === 'pending' && r.requested_role === 'service_provider');
            setRoleRequest(pending);
        } catch (e) {
            console.error(e);
        }
    };

    const handleRoleRequest = async () => {
        if (roleRequest) return;
        setRequestLoading(true);
        try {
            await api.post('/users/role-requests/', {
                requested_role: 'service_provider',
                reason: 'User requested upgrade via profile.'
            });
            setMessage('Role upgrade request sent successfully!');
            fetchRoleRequests();
        } catch (e) {
            console.error(e);
            setMessage('Failed to send request.');
        } finally {
            setRequestLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const response = await api.patch('/user/update-profile/', formData);
            if (response.status === 200) {
                setUser(prev => ({ ...prev, ...response.data.data }));
                setIsEditing(false);
                setMessage('Profile updated successfully!');
            }
        } catch (error) {
            console.error(error);
            setMessage('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const [activeTab, setActiveTab] = useState('about');

    if (!user) return <div className="text-center py-20">Loading profile...</div>;

    const StatItem = ({ label, value }) => (
        <div className="text-center px-4">
            <div className="font-bold text-lg text-natural">{value}</div>
            <div className="text-xs text-text-secondary uppercase tracking-wider">{label}</div>
        </div>
    );

    const Badge = ({ type }) => {
        if (type === 'verified') return <span className="p-1.5 bg-status-info/10 text-status-info rounded-full" title="Verified Identity"><User size={12} /></span>;
        if (type === 'service_provider') return <span className="p-1.5 bg-brand-secondary/10 text-brand-secondary rounded-full" title="Service Provider"><Briefcase size={12} /></span>;
        if (type === 'admin') return <span className="p-1.5 bg-status-error/10 text-status-error rounded-full" title="Admin"><Shield size={12} /></span>;
        return null;
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="max-w-4xl mx-auto bg-bg-surface rounded-3xl shadow-xl overflow-hidden card">
                {/* Header Banner */}
                <div className="h-48 bg-gradient-to-r from-brand-secondary to-brand-accent relative">
                    <div className="absolute -bottom-16 left-8 sm:left-12">
                        <img
                            src={formData.photoURL || "https://i.ibb.co.com/hWK4ZpT/petDP.jpg"}
                            alt="Profile"
                            className="w-32 h-32 rounded-full border-4 border-bg-surface shadow-lg object-cover bg-bg-surface"
                        />
                    </div>
                </div>

                {/* Profile Controls & Stats */}
                <div className="pt-20 px-8 sm:px-12 pb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold text-natural font-logo">
                                    {user.first_name} {user.last_name}
                                </h1>
                                {user.verified_identity && <Badge type="verified" />}
                                {user.role === 'service_provider' && <Badge type="service_provider" />}
                                {user.role === 'admin' && <Badge type="admin" />}
                            </div>
                            <p className="text-text-secondary font-medium">{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Pet Lover'}</p>
                            {user.location && (
                                <div className="flex items-center text-sm text-text-secondary mt-1">
                                    <MapPin size={14} className="mr-1" />
                                    {user.location}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-6 bg-bg-secondary px-6 py-3 rounded-2xl">
                            <StatItem label="Followers" value={user.followers_count || 0} />
                            <div className="w-px h-8 bg-border"></div>
                            <StatItem label="Following" value={user.following_count || 0} />
                            <div className="w-px h-8 bg-border"></div>
                            <StatItem label="Posts" value={0} /> {/* Placeholder for now */}
                        </div>

                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`flex items-center px-4 py-2 rounded-xl transition ${isEditing ? 'bg-bg-secondary text-text-secondary' : 'bg-brand-secondary text-text-inverted hover:opacity-90'}`}
                        >
                            {isEditing ? <><X size={18} className="mr-2" /> Cancel</> : <><Edit2 size={18} className="mr-2" /> Edit Profile</>}
                        </button>
                    </div>

                    {message && (
                        <div className={`mt-6 p-4 rounded-xl ${message.includes('success') ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'}`}>
                            {message}
                        </div>
                    )}
                </div>

                {/* Tabs Config */}
                {!isEditing && (
                    <div className="border-t border-border">
                        <div className="flex px-8 sm:px-12 gap-8">
                            {['About', 'My Pets', 'Posts'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase())}
                                    className={`py-4 font-bold text-sm border-b-2 transition ${activeTab === tab.toLowerCase()
                                        ? 'border-brand-secondary text-brand-secondary'
                                        : 'border-transparent text-text-tertiary hover:text-text-primary'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="px-8 sm:px-12 py-8 bg-bg-primary min-h-[300px]">
                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Photo URL</label>
                                    <input
                                        type="text"
                                        name="photoURL"
                                        value={formData.photoURL}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Bio</label>
                                <textarea
                                    name="bio"
                                    rows="4"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="input-field"
                                ></textarea>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary"
                                >
                                    <Save size={20} className="mr-2" />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            {activeTab === 'about' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-natural mb-3">About Me</h3>
                                            <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                                                {user.bio || 'No bio added yet. Tell the community about yourself!'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-wider">Contact Info</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center text-text-secondary">
                                                    <Mail size={18} className="mr-3 text-brand-secondary" />
                                                    <span className="text-sm">{user.email}</span>
                                                </div>
                                                <div className="flex items-center text-text-secondary">
                                                    <Phone size={18} className="mr-3 text-brand-secondary" />
                                                    <span className="text-sm">{user.phone_number || 'Not provided'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Role Management Section */}
                                        <div className="space-y-4 pt-4 border-t border-border">
                                            <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-wider">Account Status</h3>
                                            <div className="bg-bg-surface rounded-xl border border-border p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-natural">Current Role</span>
                                                    <span className="text-brand-primary capitalize">{user.role?.replace('_', ' ') || 'User'}</span>
                                                </div>

                                                {user.role === 'user' && (
                                                    <div className="mt-4">
                                                        {roleRequest ? (
                                                            <div className="flex items-center text-sm text-status-warning bg-status-warning/10 p-2 rounded-lg">
                                                                <div className="w-2 h-2 rounded-full bg-status-warning mr-2 animate-pulse"></div>
                                                                Request for Service Provider status is Pending
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={handleRoleRequest}
                                                                disabled={requestLoading}
                                                                className="w-full py-2 text-sm font-medium text-brand-secondary border border-brand-secondary rounded-lg hover:bg-brand-secondary hover:text-white transition flex items-center justify-center gap-2"
                                                            >
                                                                {requestLoading ? 'Sending...' : 'Request Service Provider Status'}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'my pets' && (
                                <MyPetsTab />
                            )}

                            {activeTab === 'posts' && (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-3">📝</div>
                                    <h3 className="text-lg font-bold text-text-tertiary">No posts yet</h3>
                                    <p className="text-text-tertiary text-sm mt-1">Share your first update with the community!</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div >
    );
};

export default ProfilePage;