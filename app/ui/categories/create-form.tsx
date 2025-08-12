'use client';

import { Button } from '@/app/ui/button';
import { createCategory, CategoryState } from '@/app/lib/actions';
import { useActionState } from 'react';

export default function CreateCategoryForm() {
const initialState: CategoryState = {
  message: "",
  errors: {},
  values: { name: "", status: "" }
};
    const [state, formAction] = useActionState(createCategory, initialState);

    const prevValues = state.values || {};

    return (
        <form action={formAction}>
            {state.message && (
                <div className="mb-4 rounded bg-red-100 px-4 py-2 text-red-700">
                    {state.message}
                </div>
            )}
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                {/* Category Name */}
                <div className="mb-4">
                    <label htmlFor="name" className="mb-2 block text-sm font-medium">
                        Category Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        defaultValue={prevValues.name || ''}
                        required
                        className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
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
                        defaultChecked
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
                      />
                      Deactive
                    </label>
                  </div>
                </div>


                {/* Submit Button */}
                <Button type="submit" className="w-full">
                    Create Category
                </Button>
            </div>
        </form>
    );
}