import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Grid, List, PackageOpen } from 'lucide-react';
import usePets from '../../hooks/usePets';
import PetCard from '../../components/Pet/PetCard';
import ConfirmationModal from '../../components/common/Modal/ConfirmationModal';
import PetDetailModal from '../../components/Pet/PetDetailModal';
import { toast } from 'react-toastify';

const MyPetsPage = () => {
    const { useGetUserPets, useDeletePet, useUpdatePet } = usePets();
    const { data: pets, isLoading } = useGetUserPets();
    const deletePetMutation = useDeletePet();
    const updatePetMutation = useUpdatePet();

    // State for UI controls
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedSpecies, setSelectedSpecies] = useState([]);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [petToDelete, setPetToDelete] = useState(null);

    // Detail Modal State
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);

    const tabs = [
        { id: 'All', label: 'All Profiles' },
        { id: 'Active', label: 'Active' },
        { id: 'Inactive', label: 'Archived' }
    ];

    // Filtering Logic
    const filteredPets = useMemo(() => {
        const petsList = Array.isArray(pets) ? pets : (pets?.results || []);
        return petsList.filter(pet => {
            // Tab Filter based on status
            if (activeTab === 'Active' && pet.status !== 'active') return false;
            if (activeTab === 'Inactive' && pet.status === 'active') return false;

            // Search Filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const name = pet.name || '';
                const breed = pet.breed || '';

                if (!name.toLowerCase().includes(query) &&
                    !breed.toLowerCase().includes(query)) return false;
            }

            // Species Filter
            if (selectedSpecies.length > 0) {
                if (!selectedSpecies.includes(pet.species)) return false;
            }

            return true;
        });
    }, [pets, activeTab, searchQuery, selectedSpecies]);

    // Delete Handlers
    const handleDeleteRequest = (pet) => {
        setPetToDelete(pet);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!petToDelete) return;
        try {
            await deletePetMutation.mutateAsync(petToDelete.id);
            toast.success(`${petToDelete.name} has been removed.`);
            setDeleteModalOpen(false);
            setPetToDelete(null);
        } catch (error) {
            toast.error("Failed to delete pet. Please try again.");
            console.error(error);
        }
    };

    // Toggle Active Status
    const handleToggleActive = async (pet) => {
        try {
            const newStatus = pet.status === 'active' ? 'rehomed' : 'active';
            await updatePetMutation.mutateAsync({
                id: pet.id,
                data: { status: newStatus }
            });
            toast.success(`${pet.name} is now ${newStatus === 'active' ? 'Active' : 'Archived'}`);
        } catch (error) {
            toast.error("Failed to update status.");
        }
    };

    // Detail Handlers
    const handleViewDetail = (pet) => {
        setSelectedPet(pet);
        setDetailModalOpen(true);
    };

    return (
        <div className="w-full min-h-screen p-6 md:p-12 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#5A3C0B] tracking-tight font-logo mb-1">
                        My Pets
                    </h1>
                    <p className="text-[#5A3C0B]/60 font-bold text-sm">
                        Manage profiles and medical records
                    </p>
                </div>
                <Link to="/dashboard/pets/create">
                    <button className="bg-[#C48B28] text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#A06D1B] hover:shadow-lg hover:shadow-[#C48B28]/20 transition-all active:scale-95 flex items-center gap-2">
                        <Plus size={16} strokeWidth={3} />
                        Add New Pet
                    </button>
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-[#EBC176]/20">
                <div className="flex flex-col xl:flex-row gap-6 items-center justify-between">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
                        {/* Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-[#FEF9ED] p-1.5 rounded-full">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-[#C48B28] text-white shadow-md'
                                        : 'text-[#5A3C0B]/50 hover:text-[#C48B28] hover:bg-white/50'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="h-8 w-px bg-[#EBC176]/20 hidden md:block"></div>

                        {/* Species Filter */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            {['dog', 'cat', 'rabbit', 'bird', 'other'].map(species => (
                                <button
                                    key={species}
                                    onClick={() => {
                                        setSelectedSpecies(prev =>
                                            prev.includes(species)
                                                ? prev.filter(s => s !== species)
                                                : [...prev, species]
                                        );
                                    }}
                                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${selectedSpecies.includes(species)
                                        ? 'bg-[#EBC176]/20 text-[#C48B28] border-[#C48B28]'
                                        : 'bg-transparent text-[#5A3C0B]/40 border-transparent hover:bg-[#FEF9ED] hover:text-[#C48B28]'
                                        }`}
                                >
                                    {species}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search & View */}
                    <div className="flex w-full xl:w-auto gap-3">
                        <div className="relative flex-1 xl:w-64 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A3C0B]/30 group-focus-within:text-[#C48B28] transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search pets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#FEF9ED] border border-[#EBC176]/20 rounded-2xl py-3 pl-10 pr-4 outline-none focus:ring-0 focus-visible:ring-0 text-sm font-bold text-[#5A3C0B] placeholder:text-[#5A3C0B]/30 focus:border-[#C48B28]/40 focus:bg-white focus:shadow-inner transition-all placeholder:font-bold"
                            />
                        </div>

                        <div className="bg-[#FEF9ED] p-1 rounded-2xl flex shrink-0">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-[#C48B28] shadow-sm' : 'text-[#5A3C0B]/40 hover:text-[#C48B28]'}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-[#C48B28] shadow-sm' : 'text-[#5A3C0B]/40 hover:text-[#C48B28]'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            {isLoading && !pets ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#C48B28] border-t-transparent" />
                </div>
            ) : (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'grid-cols-1'}`}>
                    {/* Add New Card (Vertical - Compact) */}
                    {viewMode === 'grid' && activeTab === 'All' && !searchQuery && (
                        <Link
                            to="/dashboard/pets/create"
                            className="group bg-white rounded-[2rem] border-2 border-dashed border-[#EBC176] hover:border-[#C48B28] hover:bg-[#FEF9ED]/50 transition-all duration-300 flex flex-col items-center justify-center py-10 px-6 cursor-pointer hover:shadow-xl hover:shadow-[#C48B28]/5 min-h-[320px]"
                        >
                            <div className="w-16 h-16 bg-[#FEF9ED] rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-[#C48B28]/60 group-hover:text-[#C48B28] group-hover:bg-white mb-4">
                                <Plus size={32} strokeWidth={2.5} />
                            </div>
                            <span className="text-sm font-black text-[#5A3C0B]/70 group-hover:text-[#C48B28] transition-colors text-center">Create Profile</span>
                            <p className="text-[10px] font-bold text-[#5A3C0B]/30 mt-1 text-center uppercase tracking-wider">Add a new pet</p>
                        </Link>
                    )}

                    {/* Pet Cards */}
                    {filteredPets?.map(pet => (
                        <PetCard
                            key={pet.id}
                            pet={pet}
                            viewMode={viewMode}
                            variant="profile"
                            onDelete={() => handleDeleteRequest(pet)}
                            onToggleActive={() => handleToggleActive(pet)}
                            onView={handleViewDetail}
                        />
                    ))}

                    {/* Empty State */}
                    {filteredPets?.length === 0 && !(!searchQuery && activeTab === 'All' && viewMode === 'grid') && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-[#FEF9ED] rounded-full flex items-center justify-center mb-4 text-[#C48B28]/40 border border-[#EBC176]/20">
                                <PackageOpen size={32} />
                            </div>
                            <h3 className="text-xl font-black text-[#5A3C0B] mb-2">No pets found</h3>
                            <p className="text-[#5A3C0B]/60 text-sm font-medium">Try adjusting your filters.</p>
                        </div>
                    )}
                </div>
            )}

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Pet Profile?"
                message={`Are you sure you want to remove ${petToDelete?.name}? This action cannot be undone and all data will be lost.`}
                confirmText="Yes, Delete"
                cancelText="Keep"
                isLoading={deletePetMutation.isPending}
            />

            <PetDetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                pet={selectedPet}
            />
        </div>
    );
};

export default MyPetsPage;
