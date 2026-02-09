import React from 'react';
import { useNavigate } from 'react-router-dom';
import usePets from '../../hooks/usePets';

const MyPetsTab = () => {
    const { useGetMyPets } = usePets();
    const { data: pets, isLoading } = useGetMyPets();
    const navigate = useNavigate();

    if (isLoading) return <div className="text-center py-10">Loading pets...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-natural">My Pets</h3>
                {/* Future: Add "Add Pet" button */}
            </div>

            {pets && pets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pets.map(pet => (
                        <div
                            key={pet.id}
                            onClick={() => navigate(`/user/pets/${pet.id}`)}
                            className="bg-bg-surface rounded-2xl p-4 shadow-sm border border-border hover:shadow-md transition cursor-pointer card-hover"
                        >
                            <div className="h-40 rounded-xl bg-bg-secondary mb-4 overflow-hidden">
                                {pet.profile_photo ? (
                                    <img src={pet.profile_photo} alt={pet.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                                        <span className="text-4xl">🐾</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-natural">{pet.name}</h4>
                                <p className="text-sm text-text-secondary">{pet.breed} • {pet.age} yrs</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-bg-surface rounded-2xl border-2 border-dashed border-border">
                    <div className="text-4xl mb-3">🐾</div>
                    <h3 className="text-lg font-bold text-text-tertiary">No pets added yet</h3>
                    <p className="text-text-tertiary text-sm mt-1">Show off your furry friends to the community!</p>
                </div>
            )}
        </div>
    );
};

export default MyPetsTab;
