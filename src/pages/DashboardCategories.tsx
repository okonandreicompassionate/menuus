import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit2, FolderKanban, LoaderCircle, X, UtensilsCrossed } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Category } from '../types';
import { Menu360AdireBand, Menu360FoodIcon } from '../components/Menu360Brand';

const suggestedCategories = [
  { name: 'Rice & Pasta', description: 'Jollof, fried rice, pasta and sides' },
  { name: 'Soups & Swallows', description: 'Soups, stews and swallow dishes' },
  { name: 'Grills & Mains', description: 'Grilled meats, fish and main dishes' },
  { name: 'Small Chops', description: 'Starters, snacks and party bites' },
  { name: 'Drinks', description: 'Juices, soft drinks and cocktails' },
  { name: 'Desserts', description: 'Sweet treats and baked goods' },
];

export const DashboardCategories: React.FC = () => {
  const currentUser = StorageService.getCurrentUser();
  const restaurants = StorageService.getRestaurants();
  const currentRestaurant = restaurants.find(r => r.id === currentUser?.restaurantId) || restaurants[0];

  const [categories, setCategories] = useState<Category[]>(StorageService.getCategories(currentRestaurant.id));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [savingPreset, setSavingPreset] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const menuItems = StorageService.getMenuItems(currentRestaurant.id);
  const availableSuggestions = suggestedCategories.filter(suggestion =>
    !categories.some(category => category.name.trim().toLowerCase() === suggestion.name.toLowerCase()),
  );

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Enter a category name.');
      return;
    }
    setError('');
    setIsSavingCategory(true);

    const newCat: Category = {
      id: editingCategory?.id || '',
      restaurantId: currentRestaurant.id,
      name: name.trim(),
      sortOrder: editingCategory ? editingCategory.sortOrder : categories.length + 1,
    };

    try {
      await StorageService.saveCategory(newCat);
      setCategories(StorageService.getCategories(currentRestaurant.id));
      setIsModalOpen(false);
      setError('');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save this category.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleAddSuggestion = async (suggestionName: string) => {
    setError('');
    setSavingPreset(suggestionName);
    try {
      await StorageService.saveCategory({
        id: '',
        restaurantId: currentRestaurant.id,
        name: suggestionName,
        sortOrder: categories.length + 1,
      });
      setCategories(StorageService.getCategories(currentRestaurant.id));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not add this category.');
    } finally {
      setSavingPreset('');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setError('');
      try {
        await StorageService.deleteCategory(id);
        setCategories(StorageService.getCategories(currentRestaurant.id));
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'Could not delete this category.');
      }
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
      <Menu360AdireBand />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Menu categories</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-stone-400">
            Group dishes into sections so guests can quickly find what they’re looking for.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/25 transition-colors hover:bg-orange-700 sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Add category
        </button>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}

      {categories.length === 0 ? (
        <section className="rounded-3xl border border-stone-800 bg-stone-900 p-5 sm:p-8">
          <div className="mb-6 flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-600/10 text-orange-500">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Start with a menu section</h3>
              <p className="mt-1 text-sm leading-6 text-stone-400">
                Pick a suggestion below or create a category with your own name. You can rename it any time.
              </p>
            </div>
          </div>
          <CategorySuggestions
            suggestions={availableSuggestions}
            savingName={savingPreset}
            onAdd={handleAddSuggestion}
          />
        </section>
      ) : (
        <>
          <section aria-label="Your menu categories" className="grid gap-3 sm:grid-cols-2">
            {categories.map((cat, idx) => {
              const itemCount = menuItems.filter(item => item.categoryId === cat.id).length;
              return (
                <article key={cat.id} className="flex min-w-0 items-center gap-3 rounded-2xl border border-stone-800 bg-stone-900 p-4 sm:gap-4 sm:p-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F2A31B]">
                    <Menu360FoodIcon kind={categoryIcon(cat.name)} size={40} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-white">{cat.name}</h3>
                    <p className="mt-1 text-xs text-stone-400">
                      {itemCount} {itemCount === 1 ? 'dish' : 'dishes'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cat)}
                      aria-label={`Edit ${cat.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-800 text-stone-300 transition-colors hover:bg-stone-700 hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id)}
                      aria-label={`Delete ${cat.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          {availableSuggestions.length > 0 && (
            <section className="rounded-3xl border border-stone-800 bg-stone-900 p-5 sm:p-7">
              <div className="mb-5">
                <h3 className="font-semibold text-white">Quick-add suggestions</h3>
                <p className="mt-1 text-sm text-stone-400">Add common sections in one tap, then customize them to suit your menu.</p>
              </div>
              <CategorySuggestions
                suggestions={availableSuggestions}
                savingName={savingPreset}
                onAdd={handleAddSuggestion}
              />
            </section>
          )}

          <Link
            to="/dashboard/menu"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
          >
            <UtensilsCrossed className="h-4 w-4" /> Add dishes to your menu
          </Link>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-5 sm:p-7 space-y-5">
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
              {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
              <div>
                <label htmlFor="category-name" className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-400">Category Name</label>
                <input
                  id="category-name"
                  type="text"
                  required
                  value={name}
                  maxLength={80}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Swallow & Soup"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSavingCategory}
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-stone-800 text-stone-300 font-semibold text-sm hover:bg-stone-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="min-w-36 rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/25 hover:bg-orange-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {isSavingCategory ? 'Saving…' : editingCategory ? 'Save changes' : 'Add category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function CategorySuggestions({
  suggestions,
  savingName,
  onAdd,
}: {
  suggestions: { name: string; description: string }[];
  savingName: string;
  onAdd: (name: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {suggestions.map(suggestion => {
        const isSaving = savingName === suggestion.name;
        return (
          <button
            key={suggestion.name}
            type="button"
            onClick={() => onAdd(suggestion.name)}
            disabled={Boolean(savingName)}
            className="group flex min-h-20 items-center gap-3 rounded-2xl border border-stone-800 bg-stone-800/30 p-4 text-left transition hover:border-stone-700 hover:bg-stone-800/60 disabled:cursor-wait disabled:opacity-60"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-800 text-stone-300 transition group-hover:bg-orange-600/10 group-hover:text-orange-500">
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-white">{suggestion.name}</span>
              <span className="mt-1 block text-xs leading-5 text-stone-400">{suggestion.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function categoryIcon(name: string): 'jollof' | 'suya' | 'plantain' | 'puffpuff' | 'soup' | 'zobo' | 'pie' | 'menu' {
  const normalized = name.toLowerCase();
  if (/(drink|juice|cocktail|zobo)/.test(normalized)) return 'zobo';
  if (/(soup|swallow|stew)/.test(normalized)) return 'soup';
  if (/(grill|suya|meat|fish)/.test(normalized)) return 'suya';
  if (/(snack|chop|puff|starter)/.test(normalized)) return 'puffpuff';
  if (/(dessert|pie|bake)/.test(normalized)) return 'pie';
  if (/(rice|pasta|main)/.test(normalized)) return 'jollof';
  return 'menu';
}
