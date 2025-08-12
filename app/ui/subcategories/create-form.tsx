'use client';

import { Button } from '@/app/ui/button';
import { useActionState } from 'react';
import { createSubCategory, SubCategoryFormState } from '@/app/lib/subcategories';
import { Category } from '@/app/lib/definitions';

const initialState: SubCategoryFormState = {
  message: '',
  errors: {},
  values: {
    name: '',
    status: '1',
    category_id: '',
  }
};

export default function CreateCategoryForm({ categories }: { categories: Category[] }) {
  const [state, formAction] = useActionState(createSubCategory, initialState);
  // console.log('Form State:', state);
  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Sub Category Name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Subcategory Name
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
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
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