import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Check, X, Search, CircleSlash } from 'lucide-react';
import { StorageService } from '../services/storage';
import { MenuItem, Category } from '../types';
import { ImageUploadField } from '../components/ImageUploadField';
import { Menu360AdireBand, Menu360FoodIcon } from '../components/Menu360Brand';

export const DashboardMenu: React.FC = () => {
  const currentUser = StorageService.getCurrentUser();
  const restaurants = StorageService.getRestaurants();
  const currentRestaurant = restaurants.find(r => r.id === currentUser?.restaurantId) || restaurants[0];

  const [categories, setCategories] = useState<Category[]>(StorageService.getCategories(currentRestaurant.id));
  const [menuItems, setMenuItems] = useState<MenuItem[]>(StorageService.getMenuItems(currentRestaurant.id));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'sold-out'>('all');
  const [updatingItemId, setUpdatingItemId] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState('');

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setPrice('');
    setImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');
    setIsAvailable(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategoryId(item.categoryId);
    setDescription(item.description);
    setPrice(item.price.toString());
    setImage(item.image);
    setIsAvailable(item.isAvailable);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) return;
    setError('');

    const newItem: MenuItem = {
      id: editingItem?.id || '',
      restaurantId: currentRestaurant.id,
      categoryId,
      name,
      description,
      price: parseFloat(price) || 0,
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      isAvailable,
    };

    try {
      await StorageService.saveMenuItem(newItem);
      setMenuItems(StorageService.getMenuItems(currentRestaurant.id));
      setIsModalOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save this menu item.');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      setError('');
      try {
        await StorageService.deleteMenuItem(id);
        setMenuItems(StorageService.getMenuItems(currentRestaurant.id));
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'Could not delete this menu item.');
      }
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    setUpdatingItemId(item.id);
    setError('');
    setStatusMessage('');
    try {
      await StorageService.saveMenuItem({ ...item, isAvailable: !item.isAvailable });
      setMenuItems(StorageService.getMenuItems(currentRestaurant.id));
      setStatusMessage(`${item.name} is now ${item.isAvailable ? 'marked sold out' : 'available'} on your public menu.`);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : `Could not update ${item.name}.`);
    } finally {
      setUpdatingItemId('');
    }
  };

  const filteredItems = menuItems.filter(item => {
    const categoryName = categories.find(category => category.id === item.categoryId)?.name || '';
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch = !normalizedQuery
      || item.name.toLowerCase().includes(normalizedQuery)
      || item.description.toLowerCase().includes(normalizedQuery)
      || categoryName.toLowerCase().includes(normalizedQuery);
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesAvailability = availabilityFilter === 'all'
      || (availabilityFilter === 'available' && item.isAvailable)
      || (availabilityFilter === 'sold-out' && !item.isAvailable);
    return matchesSearch && matchesCategory && matchesAvailability;
  });
  const availableCount = menuItems.filter(item => item.isAvailable).length;
  const soldOutCount = menuItems.length - availableCount;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <Menu360AdireBand />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Menu Management</h2>
          <p className="text-sm text-stone-400">Add, edit and organize food items for your digital storefront.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          disabled={categories.length === 0}
          title={categories.length === 0 ? 'Create a category before adding menu items' : undefined}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-lg shadow-orange-600/25 text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add Food Item
        </button>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}
      {statusMessage && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700">{statusMessage}</p>}

      {/* Filters */}
      <div className="menu360-filter-panel space-y-4 rounded-2xl border border-stone-800 bg-stone-900 p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
            <input
              type="text"
              aria-label="Search dishes"
              placeholder="Search dishes, descriptions or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-stone-700 bg-stone-800 py-3 pl-10 pr-4 text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>
          <p className="shrink-0 text-xs font-semibold text-stone-500">{filteredItems.length} of {menuItems.length} dishes</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[{ id: 'all', label: `All dishes · ${menuItems.length}` }, ...categories.map(category => ({
              id: category.id,
              label: category.name,
            }))].map(category => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                aria-pressed={selectedCategory === category.id}
                className={`menu360-chip shrink-0 ${selectedCategory === category.id ? 'menu360-chip-active' : ''}`}
              >
                {category.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {([
              { id: 'all', label: `All · ${menuItems.length}` },
              { id: 'available', label: `Available · ${availableCount}` },
              { id: 'sold-out', label: `Sold out · ${soldOutCount}` },
            ] as const).map(filter => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setAvailabilityFilter(filter.id)}
                aria-pressed={availabilityFilter === filter.id}
                className={`menu360-chip menu360-status-chip ${availabilityFilter === filter.id ? 'menu360-chip-active' : ''}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-20 bg-stone-900 rounded-3xl border border-stone-800 text-stone-400">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#F2A31B]"><Menu360FoodIcon kind="menu" size={40} /></div>
          <p className="text-base font-semibold">Start with a menu section</p>
          <p className="mt-1 text-sm text-stone-500">Create a category, then add your dishes and prices.</p>
          <Link
            to="/dashboard/categories"
            className="inline-flex mt-5 px-5 py-3 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700"
          >
            Create your first category
          </Link>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-stone-900 rounded-3xl border border-stone-800 text-stone-400">
          <Menu360FoodIcon kind="plantain" size={48} />
          <p className="mt-3 text-base font-semibold">{menuItems.length === 0 ? 'Your menu starts here' : 'No dishes match those filters'}</p>
          <p className="mt-1 text-sm text-stone-500">{menuItems.length === 0 ? 'Add your first dish with a name, photo and price.' : 'Try another search or clear the selected filters.'}</p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setAvailabilityFilter('all'); }}
            className="mt-5 rounded-full border border-stone-800 px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const category = categories.find(c => c.id === item.categoryId);
            return (
              <div key={item.id} className={`menu360-item-card flex flex-col justify-between overflow-hidden rounded-3xl border bg-stone-900 transition-all ${item.isAvailable ? 'border-stone-800' : 'menu360-item-sold-out border-stone-800'}`}>
                <div>
                  <div className="relative h-48 overflow-hidden bg-stone-800">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#FBF6EA]">
                        <Menu360FoodIcon kind={category?.name.toLowerCase().includes('drink') ? 'zobo' : 'jollof'} size={64} />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        item.isAvailable ? 'menu360-available-badge' : 'menu360-soldout-badge'
                      }`}>
                        {item.isAvailable ? 'Available' : 'Sold out'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider">
                        {category?.name || 'General'}
                      </span>
                      <span className="text-lg font-extrabold text-white">
                        ₦{item.price.toLocaleString()}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white">{item.name}</h4>
                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                <div className="menu360-item-actions mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-800/60 p-5 pt-4">
                  <button
                    type="button"
                    disabled={updatingItemId === item.id}
                    onClick={() => void handleToggleAvailability(item)}
                    aria-label={item.isAvailable ? `Mark ${item.name} sold out` : `Mark ${item.name} available`}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition disabled:cursor-wait disabled:opacity-60 ${
                      item.isAvailable ? 'menu360-soldout-action' : 'menu360-available-action'
                    }`}
                  >
                    {item.isAvailable ? <CircleSlash className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    {updatingItemId === item.id ? 'Saving…' : item.isAvailable ? 'Mark sold out' : 'Mark available'}
                  </button>
                  <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    aria-label={`Edit ${item.name}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-800 text-stone-700 transition-colors hover:bg-stone-700 hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    aria-label={`Delete ${item.name}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-600 transition-colors hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Smoky Jollof Rice"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Price (₦)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="4500"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe ingredients, sides, or preparation..."
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>

              <ImageUploadField label="Dish photo" value={image} purpose="menu" onChange={setImage} />

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 bg-stone-800 border-stone-700"
                />
                <label htmlFor="isAvailable" className="text-sm font-medium text-white">
                  Item is currently available on the public menu
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-stone-800 text-stone-300 font-semibold text-sm hover:bg-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 shadow-lg shadow-orange-600/25"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
