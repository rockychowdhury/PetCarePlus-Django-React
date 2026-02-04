import React from 'react';
import FosterForm from './FosterForm';
import VetForm from './VetForm';
import TrainerForm from './TrainerForm';
import GroomerForm from './GroomerForm';
import PetSitterForm from './PetSitterForm';

const ServiceSpecificForm = ({ provider, onSave, isLoading }) => {
    // Determine category slug or name
    const categorySlug = provider.category?.slug?.toLowerCase();

    if (!categorySlug) return <div className="text-red-500">Error: No category assigned to provider.</div>;

    if (categorySlug === 'foster') {
        return <FosterForm initialData={provider.foster_details} onSave={(data) => onSave({ foster_details: data })} isLoading={isLoading} />;
    } else if (categorySlug === 'veterinary') {
        return <VetForm initialData={provider.vet_details} onSave={(data) => onSave({ vet_details: data })} isLoading={isLoading} />;
    } else if (categorySlug === 'training' || categorySlug === 'trainer') {
        return <TrainerForm initialData={provider.trainer_details} onSave={(data) => onSave({ trainer_details: data })} isLoading={isLoading} />;
    } else if (categorySlug === 'grooming' || categorySlug === 'groomer') {
        return <GroomerForm initialData={provider.groomer_details} onSave={(data) => onSave({ groomer_details: data })} isLoading={isLoading} />;
    } else if (categorySlug === 'pet-sitting' || categorySlug === 'pet_sitting' || categorySlug === 'sitter') {
        return <PetSitterForm initialData={provider.sitter_details} onSave={(data) => onSave({ sitter_details: data })} isLoading={isLoading} />;
    }

    return (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
            Service form not available for category: {provider.category.name}
        </div>
    );
};

export default ServiceSpecificForm;
