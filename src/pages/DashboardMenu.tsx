import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Check, X, Search, Image as ImageIcon } from 'lucide-react';
import { StorageService } from '../services/storage';
import { MenuItem, Category } from '../types';
import { ImageUploadField } from '../components/ImageUploadField';

export const DashboardMenu: React.FC = () => {
  const currentUser = StorageService.getCurrentUser();
  const restaurants = StorageService.getRestaurants();
  const currentRestaurant = restaurants.find(r => r.id === currentUser?.restaurantId) || restaurants[0];

  const [categories, setCategories] = useState<Category[]>(StorageService.getCategories(currentRestaurant.id));
  const [menuItems, setMenuItems] = useState<MenuItem[]>(StorageService.getMenuItems(currentRestaurant.id));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
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

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-stone-900 p-4 rounded-2xl border border-stone-800">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-800 border border-stone-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all' ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-20 bg-stone-900 rounded-3xl border border-stone-800 text-stone-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-base font-semibold">Create a category to start your menu</p>
          <p className="text-xs text-stone-500 mt-1">Categories help customers browse your dishes.</p>
          <Link
            to="/dashboard/categories"
            className="inline-flex mt-5 px-5 py-3 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700"
          >
            Create your first category
          </Link>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-stone-900 rounded-3xl border border-stone-800 text-stone-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-base font-semibold">No menu items found</p>
          <p className="text-xs text-stone-500 mt-1">Try adjusting your search or add a new item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const category = categories.find(c => c.id === item.categoryId);
            return (
              <div key={item.id} className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden flex flex-col justify-between group hover:border-stone-700 transition-all">
                <div>
                  <div className="relative h-48 overflow-hidden bg-stone-800">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        item.isAvailable ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
                      }`}>
                        {item.isAvailable ? 'Available' : 'Sold Out'}
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

                <div className="p-6 pt-0 flex items-center justify-end gap-2 border-t border-stone-800/60 mt-4">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2.5 rounded-xl bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
