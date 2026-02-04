import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PlusCircle, CalendarOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAPI from '../../../../hooks/useAPI';
import useAuth from '../../../../hooks/useAuth';
import Card from '../../../../components/common/Layout/Card';
import Button from '../../../../components/common/Buttons/Button';
import BlockTimeModal from '../Components/BlockTimeModal';
import BlockedTimesList from '../Components/BlockedTimesList';

const AvailabilityManager = () => {
    const { provider } = useOutletContext();
    const api = useAPI();
    const { user } = useAuth();
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    // Fetch blocks
    useEffect(() => {
        if (!provider?.id) return;
        fetchBlocks();
    }, [provider?.id]);

    const fetchBlocks = async () => {
        try {
            const response = await api.get(`/services/providers/${provider.id}/availability_blocks/`);
            setBlocks(response.data);
        } catch (error) {
            console.error('Failed to fetch blocks:', error);
            toast.error('Failed to load availability blocks');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBlock = async (blockData) => {
        try {
            const response = await api.post(
                `/services/providers/${provider.id}/availability_blocks/`,
                blockData
            );
            setBlocks(prev => [...prev, response.data]);
            setModalOpen(false);
            return response.data;
        } catch (error) {
            console.error('Failed to create block:', error);
            throw error;
        }
    };

    const handleDeleteBlock = async (blockId) => {
        if (!confirm('Are you sure you want to remove this block? This time will become available for bookings.')) {
            return;
        }

        try {
            await api.delete(`/services/providers/${provider.id}/availability_blocks/${blockId}/`);
            setBlocks(prev => prev.filter(b => b.id !== blockId));
            toast.success('Block removed successfully');
        } catch (error) {
            console.error('Failed to delete block:', error);
            toast.error('Failed to remove block');
        }
    };

    // Quick action: Block today
    const handleBlockToday = async () => {
        const today = new Date();
        const blockData = {
            is_recurring: false,
            is_all_day: true,
            block_date: today.toISOString().split('T')[0],
            reason: 'Unavailable'
        };

        try {
            await handleCreateBlock(blockData);
            toast.success('Today blocked successfully');
        } catch (error) {
            toast.error('Failed to block today');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <CalendarOff className="text-brand-primary" />
                        Availability Management
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Control when clients can book your services
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleBlockToday}
                        variant="outline"
                        className="border-gray-300"
                    >
                        Block Today
                    </Button>
                    <Button
                        onClick={() => setModalOpen(true)}
                        variant="primary"
                        className="bg-brand-primary hover:bg-brand-primary/90 flex items-center gap-2"
                    >
                        <PlusCircle size={18} />
                        Block Time
                    </Button>
                </div>
            </div>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-100">
                <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                        <p className="text-sm text-blue-900 font-medium">
                            How it works
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                            Blocked times will be unavailable for client bookings. You can block specific dates,
                            entire days, or create recurring blocks (e.g., weekly lunch breaks). Existing bookings
                            are not affected.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Blocked Times List */}
            <Card>
                <BlockedTimesList
                    blocks={blocks}
                    onDelete={handleDeleteBlock}
                    loading={loading}
                />
            </Card>

            {/* Block Time Modal */}
            <BlockTimeModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleCreateBlock}
            />
        </div>
    );
};

export default AvailabilityManager;
