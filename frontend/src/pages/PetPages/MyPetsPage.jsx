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
        <div className="w-full min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 2xl:p-16 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pt-20 sm:pt-24 md:pt-12 bg-[#FEF9ED]/30 overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6 w-full max-w-full">
                <div className="animate-in slide-in-from-left duration-700 w-full md:w-auto">
                    <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-2 sm:mb-4 block">Personal Registry</span>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#5A3C0B] tracking-tighter mb-2 sm:mb-4 font-logo break-words">
                        My Pets
                    </h1>
                    <p className="text-[#5A3C0B]/60 font-bold text-xs sm:text-sm">
                        Manage profiles and medical records
                    </p>
                </div>
                <Link to="/dashboard/pets/create" className="w-full md:w-auto">
                    <button className="w-full md:w-auto bg-[#C48B28] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-wider sm:tracking-widest hover:bg-[#A06D1B] hover:shadow-xl hover:shadow-[#C48B28]/20 transition-all active:scale-95 flex items-center justify-center gap-2 sm:gap-3 shadow-lg shadow-[#C48B28]/10">
                        <Plus size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={3} />
                        Add New Pet
                    </button>
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-5 md:p-6 shadow-sm border border-[#EBC176]/20 w-full max-w-full overflow-hidden">
                <div className="flex flex-col gap-4 w-full">
                    {/* Status Filter */}
                    <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
                        <div className="flex items-center gap-2 min-w-max sm:min-w-0 pb-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest transition-all whitespace-nowrap border-2 flex-shrink-0 ${activeTab === tab.id
                                        ? 'bg-[#402E11] text-white border-[#402E11] shadow-xl shadow-black/10'
                                        : 'bg-[#FEF9ED] text-[#5A3C0B]/40 border-transparent hover:border-[#EBC176]/30'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px w-full bg-[#EBC176]/20"></div>

                    {/* Species Filter */}
                    <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
                        <div className="flex items-center gap-2 min-w-max sm:min-w-0 pb-1">
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
                                    className={`px-3 sm:px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-wider sm:tracking-widest transition-all border-2 flex-shrink-0 ${selectedSpecies.includes(species)
                                        ? 'bg-[#EBC176]/20 text-[#C48B28] border-[#C48B28]'
                                        : 'bg-transparent text-[#5A3C0B]/40 border-transparent hover:bg-[#FEF9ED] hover:text-[#C48B28]'
                                        }`}
                                >
                                    {species}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px w-full bg-[#EBC176]/20"></div>

                    {/* Search & View Toggle */}
                    <div className="flex flex-col sm:flex-row w-full gap-3 sm:gap-4">
                        <div className="relative flex-1 group w-full">
                            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[#5A3C0B]/30 group-focus-within:text-[#C48B28] transition-colors" size={14} strokeWidth={3} />
                            <input
                                type="text"
                                placeholder="Search pets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#FEF9ED] border border-[#EBC176]/20 rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-4 sm:pr-6 outline-none text-xs font-bold text-[#5A3C0B] placeholder:text-[#5A3C0B]/20 focus:bg-white focus:border-[#C48B28]/40 focus:ring-4 focus:ring-[#C48B28]/5 transition-all"
                            />
                        </div>

                        <div className="bg-[#FEF9ED] p-1.5 rounded-xl sm:rounded-2xl flex items-center flex-shrink-0 w-fit self-end sm:self-auto">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-[#C48B28] shadow-md' : 'text-[#5A3C0B]/20 hover:text-[#C48B28]'}`}
                            >
                                <Grid size={18} className="sm:w-5 sm:h-5" strokeWidth={viewMode === 'grid' ? 3 : 2} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-[#C48B28] shadow-md' : 'text-[#5A3C0B]/20 hover:text-[#C48B28]'}`}
                            >
                                <List size={18} className="sm:w-5 sm:h-5" strokeWidth={viewMode === 'list' ? 3 : 2} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Display */}
            {isLoading && !pets ? (
                <div className="flex flex-col items-center justify-center py-20 sm:py-32 space-y-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#EBC176]/20 border-t-[#C48B28] rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-[#C48B28] uppercase tracking-widest">Loading Library...</p>
                </div>
            ) : (
                <div className={`grid gap-4 sm:gap-6 md:gap-8 w-full ${viewMode === 'grid' 
                    ? 'grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' 
                    : 'grid-cols-1'
                }`}>
                    {/* Create New Pet Card (Grid View Only) */}
                    {viewMode === 'grid' && activeTab === 'All' && !searchQuery && (
                        <Link
                            to="/dashboard/pets/create"
                            className="group bg-white/50 backdrop-blur-sm rounded-3xl sm:rounded-[2.5rem] border-2 border-dashed border-[#EBC176]/40 hover:border-[#C48B28] hover:bg-white transition-all duration-500 flex flex-col items-center justify-center py-10 sm:py-12 px-6 sm:px-8 cursor-pointer hover:shadow-2xl hover:shadow-[#C48B28]/10 w-full mx-auto min-h-[320px] sm:min-h-[380px]"
                        >
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#FEF9ED] rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-[#C48B28]/40 group-hover:text-[#C48B28] group-hover:bg-[#FAF3E0] mb-4 sm:mb-6 group-hover:rotate-12">
                                <Plus size={28} className="sm:w-8 sm:h-8" strokeWidth={3} />
                            </div>
                            <span className="text-sm font-black text-[#5A3C0B] group-hover:text-[#C48B28] transition-colors text-center uppercase tracking-tight">Create Profile</span>
                            <p className="text-[10px] font-bold text-[#5A3C0B]/30 mt-2 text-center uppercase tracking-[0.2em]">Identify a new companion</p>
                        </Link>
                    )}

                    {/* Pet List */}
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

                    {/* Empty State Illustration */}
                    {filteredPets?.length === 0 && !(!searchQuery && activeTab === 'All' && viewMode === 'grid') && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 sm:py-32 text-center animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#FEF9ED] rounded-2xl sm:rounded-[2rem] flex items-center justify-center mb-4 sm:mb-6 text-[#C48B28]/20 border-2 border-[#EBC176]/10 rotate-12">
                                <PackageOpen size={40} className="sm:w-12 sm:h-12" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-[#5A3C0B] mb-2 tracking-tighter px-4">No companions found</h3>
                            <p className="text-[#5A3C0B]/40 text-xs sm:text-sm font-bold uppercase tracking-wider sm:tracking-widest px-4">Refine your search parameters</p>
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