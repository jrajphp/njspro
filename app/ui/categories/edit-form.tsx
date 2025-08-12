'use client';

import { Category } from '@/app/lib/definitions';
import { updateCategory, CategoryState } from '@/app/lib/actions';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { useActionState } from 'react';


export default function EditCustomerForm({
  category,
}: {
  category: Category;
}) {

  const initialState: CategoryState = {
    message: "",
    errors: {},
    values: { name: "", status: "", }
  };
  const updateCategoryWithId = updateCategory.bind(null, category.id);
  const [state, formAction] = useActionState(updateCategoryWithId, initialState);
  // const selectedStatus = state.values.status || String(category.status) || "1";


  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">

        {/* Category Name */}
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Category Name
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={category.name}
                placeholder="Enter Customer Name"
                className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                aria-describedby='category-error'
              />
            </div>
            <div id="category-error" aria-live="polite" aria-atomic="true">
              {state.errors?.name &&
                state.errors.name.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
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
                 defaultChecked={String(category.status) === "1"}

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
                 defaultChecked={String(category.status) === "2"}

                className="mr-2"
              />
              Deactive
            </label>
          </div>
          <div id="status-error" aria-live="polite" aria-atomic="true">
            {state.errors?.status &&
              state.errors.status.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </fieldset>

      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/categories"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Edit Category</Button>
      </div>
    </form>
  );
}
