'use client';

import { Button } from '@/app/ui/button';
import { useActionState, useState, useEffect } from 'react';
import { createProduct, ProductFormState } from '@/app/lib/products';
import { Category } from '@/app/lib/definitions'; ''

const initialState: ProductFormState = {
  message: '',
  errors: {},
  values: {
    name: '',
    status: '1',
    category_id: '',
    subcategory_id: '',
    image: '',
    description: '',
    price: '',
  }
};

export default function CreateProductForm({ categories, subcategories }: { categories: Category[]; subcategories: Category[]; }) {
  const [state, formAction] = useActionState(createProduct, initialState);

    /*
  selectedCategory → Stores the category ID the user chooses from the category dropdown.
  Starts as an empty string '' (meaning “no category selected”).
  setSelectedCategory → Function to update that category ID when the dropdown changes.
  filteredSubcategories → Stores the array of subcategories that belong to the selected category.
  Starts as an empty array [] (meaning “no subcategories loaded yet”).
  Category[] → Tells TypeScript this array will hold objects that match your Category type definition.
    */

  // Track selected category
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filteredSubcategories, setFilteredSubcategories] = useState<Category[]>([]);

  useEffect(() => {
    if (selectedCategory) {
      fetch(`/api/subcategories/${selectedCategory}`)
        .then((res) => res.json())
        .then((data) => setFilteredSubcategories(data))
        .catch((err) => console.error(err));
    } else {
      setFilteredSubcategories([]);
    }
  }, [selectedCategory]);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Product Name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Product Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={state.values.name || ''}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Category Dropdown */}
        <div className="mb-4">
          <label htmlFor="category_id" className="mb-2 block text-sm font-medium">
            Parent Category
          </label>
          <select
            id="category_id"
            name="category_id"
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500"
            required
            defaultValue={state.values.category_id || ''}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory Dropdown */}
        <div className="mb-4">
          <label htmlFor="subcategory_id" className="mb-2 block text-sm font-medium">
            Subcategory
          </label>
          <select
            id="subcategory_id"
            name="subcategory_id"
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500"
            required

            defaultValue={state.values.subcategory_id || ''}
          >
            <option value="">Select Subcategory</option>
            {filteredSubcategories.map((subcat) => (
              <option key={subcat.id} value={subcat.id}>
                {subcat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Status */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            Category Status
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                id="status-active"
                name="status"
                value="1"
                defaultChecked={state.values.status === '1'}
                className="mr-2"
                required
              />
              Active
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                id="status-deactive"
                name="status"
                value="2"
                className="mr-2"
                defaultChecked={state.values.status === '2'}
              />
              Deactive
            </label>
          </div>
        </div>

        {/* Error or Success Message */}
        {state?.message && (
          <p className={`mb-4 text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>
            {state.message}
          </p>
        )}

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          Create Subcategory
        </Button>
      </div>
    </form>
  );
}