"use client";

import React, { useRef } from 'react';
import { Loader2, UploadCloud, X } from 'lucide-react';

export const ImageUploader = ({ images, onUpload, onRemove, uploading }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await onUpload(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input 
                        type="file" 
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden" 
                        id="file-upload-input"
                    />
                    <label 
                        onClick={() => fileInputRef.current.click()}
                        className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 cursor-pointer hover:bg-gray-50 hover:border-teal-500 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {uploading ? <Loader2 size={18} className="animate-spin"/> : <UploadCloud size={18}/>}
                        {uploading ? "업로드 중..." : "클릭하여 이미지 업로드 (JPG, PNG)"}
                    </label>
                </div>
            </div>
            
            {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                    {Array.isArray(images) && images.map((url, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <img src={url} alt={`Uploaded image ${idx + 1}`} className="w-full h-full object-cover" />
                            <button 
                                onClick={() => onRemove(idx)} 
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition shadow-sm"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
