import React, { useMemo, useState } from 'react';
import { Store, Save, CheckCircle2, LoaderCircle } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Restaurant } from '../types';
import { ImageUploadField } from '../components/ImageUploadField';

export const DashboardSettings: React.FC = () => {
  const currentUser = StorageService.getCurrentUser();
  const restaurants = StorageService.getRestaurants();
  const currentRestaurant = restaurants.find(r => r.id === currentUser?.restaurantId) || restaurants[0];

  const [name, setName] = useState(currentRestaurant.name);
  const [description, setDescription] = useState(currentRestaurant.description);
  const [logo, setLogo] = useState(currentRestaurant.logo);
  const [coverImage, setCoverImage] = useState(currentRestaurant.coverImage);
  const [whatsappNumber, setWhatsappNumber] = useState(currentRestaurant.whatsappNumber);
  const [address, setAddress] = useState(currentRestaurant.address);
  const [openingHours, setOpeningHours] = useState(currentRestaurant.openingHours);
  const [isOpen, setIsOpen] = useState(currentRestaurant.isOpen);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedValues, setSavedValues] = useState({
    name: currentRestaurant.name,
    description: currentRestaurant.description,
    logo: currentRestaurant.logo,
    coverImage: currentRestaurant.coverImage,
    whatsappNumber: currentRestaurant.whatsappNumber,
    address: currentRestaurant.address,
    openingHours: currentRestaurant.openingHours,
    isOpen: currentRestaurant.isOpen,
  });
  const hasChanges = useMemo(() => (
    name !== savedValues.name
    || description !== savedValues.description
    || logo !== savedValues.logo
    || coverImage !== savedValues.coverImage
    || whatsappNumber !== savedValues.whatsappNumber
    || address !== savedValues.address
    || openingHours !== savedValues.openingHours
    || isOpen !== savedValues.isOpen
  ), [address, coverImage, description, isOpen, logo, name, openingHours, savedValues, whatsappNumber]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSaving(true);
    const updated: Restaurant = {
      ...currentRestaurant,
      name,
      description,
      logo,
      coverImage,
      whatsappNumber,
      address,
      openingHours,
      isOpen,
    };

    try {
      await StorageService.saveRestaurant(updated);
      setSavedValues({ name, description, logo, coverImage, whatsappNumber, address, openingHours, isOpen });
      setSuccessMessage('Store settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save store settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Store Settings</h2>
        <p className="text-sm text-stone-400">Manage your restaurant branding, contact details, and public menu status.</p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}

      <form onSubmit={handleSave} className="space-y-5 rounded-3xl border border-stone-800 bg-stone-900 p-5 sm:p-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="restaurant-name" className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">Restaurant Name</label>
            <input
              id="restaurant-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>

          <div>
            <label htmlFor="restaurant-whatsapp" className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">WhatsApp Business Number</label>
            <input
              id="restaurant-whatsapp"
              type="tel"
              required
              autoComplete="tel"
              inputMode="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+2348012345678"
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>
        </div>

        <div>
          <label htmlFor="restaurant-description" className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">Restaurant Description</label>
          <textarea
            id="restaurant-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ImageUploadField label="Restaurant logo" value={logo} purpose="logo" onChange={setLogo} />
          <ImageUploadField label="Restaurant cover photo" value={coverImage} purpose="cover" onChange={setCoverImage} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="restaurant-address" className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">Physical Address</label>
            <input
              id="restaurant-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>

          <div>
            <label htmlFor="restaurant-hours" className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">Opening Hours</label>
            <input
              id="restaurant-hours"
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="isOpen"
            checked={isOpen}
            onChange={(e) => setIsOpen(e.target.checked)}
            className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500 bg-stone-800 border-stone-700"
          />
          <label htmlFor="isOpen" className="text-sm font-medium text-white">
            Accept new order requests
            <span className="mt-1 block text-xs font-normal text-stone-400">Turn this off when the restaurant cannot take orders. Guests can still browse your menu.</span>
          </label>
        </div>

        <div className="pt-4 border-t border-stone-800 flex justify-end">
          <button
            type="submit"
            disabled={!hasChanges || isSaving}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/25 transition-all hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? 'Saving…' : hasChanges ? 'Save changes' : 'All changes saved'}
          </button>
        </div>
      </form>
    </div>
  );
};
