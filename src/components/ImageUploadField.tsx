import React, { useState } from 'react';
import { ImageUp } from 'lucide-react';
import { StorageService } from '../services/storage';

type ImageUploadFieldProps = {
  label: string;
  value: string;
  purpose: 'menu' | 'logo' | 'cover';
  onChange: (url: string) => void;
};

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ label, value, purpose, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    setIsUploading(true);
    try {
      onChange(await StorageService.uploadImage(file, purpose));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload this image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider text-stone-400">{label}</label>
      {value && (
        <img src={value} alt={`${label} preview`} className="h-36 w-full rounded-xl border border-stone-700 object-cover" />
      )}
      <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-sm font-medium text-stone-200 transition hover:bg-stone-700 ${isUploading ? 'pointer-events-none opacity-60' : ''}`}>
        <ImageUp className="h-4 w-4" />
        {isUploading ? 'Uploading image…' : value ? 'Choose a different image' : 'Upload an image'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={isUploading}
          onChange={handleUpload}
          className="sr-only"
        />
      </label>
      <p className="text-xs text-stone-500">JPG, PNG or WebP · up to 5 MB</p>
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
};
