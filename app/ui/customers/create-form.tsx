'use client';

import { Button } from '@/app/ui/button';
import { createCustomer, CustomerState } from '@/app/lib/actions';
import { useActionState } from 'react';

export default function CreateCustomerForm() {
    const initialState: CustomerState = { message: null, errors: {} , values: {} };

    const [state, formAction] = useActionState(createCustomer, initialState);

    const prevValues = state.values || {};

    return (
        <form action={formAction}>
            {state.message && (
                <div className="mb-4 rounded bg-red-100 px-4 py-2 text-red-700">
                    {state.message}
                </div>
            )}
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                {/* Customer Name */}
                <div className="mb-4">
                    <label htmlFor="name" className="mb-2 block text-sm font-medium">
                        Customer Name
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

                {/* Customer Email */}
                <div className="mb-4">
                    <label htmlFor="email" className="mb-2 block text-sm font-medium">
                        Customer Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        defaultValue={prevValues.email || ''}
                        required
                        className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                {/* Customer Image URL */}
                <div className="mb-4">
                    <label htmlFor="image_url" className="mb-2 block text-sm font-medium">
                        Customer Image URL
                    </label>
                    <input
                        type="url"
                        id="image_url"
                        name="image_url"
                        defaultValue={prevValues.image_url || ''}
                        className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full">
                    Create Customer
                </Button>
            </div>
        </form>
    );
}