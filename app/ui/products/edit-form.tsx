'use client';

import { SubCategorydef, Category } from '@/app/lib/definitions';
import { updateSubCategory, SubCategoryFormState } from '@/app/lib/subcategories';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { useActionState } from 'react';


export default function EditSubCategoryForm({
  subcategory,
  categories,
}: {
  subcategory: SubCategorydef;
  categories: Category[];
}) {

  const initialState: SubCategoryFormState = {
    message: "",
    errors: {},
    values: {
      name: subcategory.name ?? "",
      status: String(subcategory.status ?? ""),
      category_id: String(subcategory.category_id ?? ""),
    },
  };
  const updateSubCategoryWithId = updateSubCategory.bind(null, subcategory.id);
  const [state, formAction] = useActionState(updateSubCategoryWithId, initialState);


  return (
    <form action={formAction}
      key={state.values.category_id + state.values.name + state.values.status}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">

        {/* Category Name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Subcategory Name
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={state.values.name}
                placeholder="Enter Subcategory Name"
                className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                aria-describedby='category-error'
              />
            </div>
            <div id="category-error" aria-live="polite" aria-atomic="true">
              {state.errors?.name?.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
            </div>
          </div>
        </div>

        <input
          type="text"
          name="debug_state"
          value={JSON.stringify(state)}
          readOnly
        />
        <pre className="mb-4 bg-gray-100 p-2 text-xs rounded">{JSON.stringify(state, null, 2)}</pre>
        <div className="rounded-md bg-gray-50 p-4 md:p-6"></div>

        {/* Category Dropdown */}
        <div className="mb-4">
          <label htmlFor="category_id" className="mb-2 block text-sm font-medium">
            Parent Category
          </label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={state.values.category_id}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Category Status
          </legend>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center">
              <input
                type="radio"
                id="status-active"
                name="status"
                value="1"
                defaultChecked={String(state.values.status) === "1"}
                className="mr-2"
              />
              Active
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                id="status-deactive"
                name="status"
                value="2"
                defaultChecked={String(state.values.status) === "2"}
                className="mr-2"
              />
              Deactive
            </label>
          </div>
          <div id="status-error" aria-live="polite" aria-atomic="true">
            {state.errors?.status?.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
          </div>
        </fieldset>
        {/* Error or Success Message */}
        {state?.message && (
          <p className={`mb-4 text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>
            {state.message}
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/subcategories"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Edit Category</Button>
      </div>
    </form>
  );
}
