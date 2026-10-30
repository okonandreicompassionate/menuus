import React, { useState } from 'react';
import { Plus, Trash2, Edit2, FolderKanban, Check, X } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Category } from '../types';

export const DashboardCategories: React.FC = () => {
  const currentUser = StorageService.getCurrentUser();
  const restaurants = StorageService.getRestaurants();
  const currentRestaurant = restaurants.find(r => r.id === currentUser?.restaurantId) || restaurants[0];

  const [categories, setCategories] = useState<Category[]>(StorageService.getCategories(currentRestaurant.id));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCat: Category = {
      id: editingCategory ? editingCategory.id : 'cat-' + Date.now(),
      restaurantId: currentRestaurant.id,
      name: name.trim(),
      sortOrder: editingCategory ? editingCategory.sortOrder : categories.length + 1,
    };

    StorageService.saveCategory(newCat);
    setCategories(StorageService.getCategories(currentRestaurant.id));
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      StorageService.deleteCategory(id);
      setCategories(StorageService.getCategories(currentRestaurant.id));
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Menu Categories</h2>
          <p className="text-sm text-stone-400">Organize your food items into clear navigation sections.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/25 text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No categories created yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-800">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="p-6 flex items-center justify-between hover:bg-stone-800/40 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-xl bg-stone-800 text-stone-400 flex items-center justify-center font-bold text-xs">
                    0{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-base">{cat.name}</h4>
                    <p className="text-xs text-stone-400">Category ID: {cat.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-2.5 rounded-xl bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Swallow & Soup"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
