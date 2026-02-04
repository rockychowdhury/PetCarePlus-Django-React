import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadToImgBB } from '../../utils/imgbb';
import useServices from '../../hooks/useServices';
import Button from '../common/Buttons/Button';

const MediaUpload = ({ providerId, onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const { useUpdateProviderMedia } = useServices();
    const updateMedia = useUpdateProviderMedia();

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            // Step 1: Upload to ImgBB
            toast.loading('Uploading image...', { id: 'upload' });
            const imgbbUrl = await uploadToImgBB(selectedFile);

            // Step 2: Send URL to backend
            await updateMedia.mutateAsync({
                id: providerId,
                data: {
                    file_url: imgbbUrl,
                    thumbnail_url: imgbbUrl,
                    is_primary: false,
                    alt_text: selectedFile.name
                }
            });

            toast.success('Image uploaded successfully!', { id: 'upload' });

            // Reset
            setSelectedFile(null);
            setPreview(null);

            // Callback
            if (onUploadComplete) onUploadComplete();
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload image', { id: 'upload' });
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreview(null);
        if (preview) URL.revokeObjectURL(preview);
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            {!preview ? (
                <label className="block">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-colors">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={uploading}
                        />
                        <Upload className="mx-auto text-gray-400 mb-3" size={40} />
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                            Click to upload image
                        </p>
                        <p className="text-xs text-gray-500">
                            PNG, JPG up to 5MB
                        </p>
                    </div>
                </label>
            ) : (
                /* Preview */
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-xl border border-gray-200"
                    />
                    {!uploading && (
                        <button
                            onClick={handleCancel}
                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}

                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                            <div className="text-center text-white">
                                <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                                <p className="text-sm font-medium">Uploading...</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            {preview && !uploading && (
                <div className="flex gap-3">
                    <Button
                        onClick={handleUpload}
                        className="flex-1 bg-brand-primary text-white"
                        disabled={uploading}
                    >
                        <Check size={18} className="mr-2" />
                        Upload Image
                    </Button>
                    <Button
                        onClick={handleCancel}
                        variant="outline"
                        disabled={uploading}
                    >
                        Cancel
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MediaUpload;
