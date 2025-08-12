'use client';

import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteProduct } from '@/app/lib/products';
import toast from 'react-hot-toast';
import { useTransition } from 'react';

export function CreateProduct() {
  return (
    <Link
      href="/dashboard/products/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Product</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateProduct({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/products/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteProduct({ id }: { id: string }) {
  const deleteSubCategoryWithId = deleteProduct.bind(null, id);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    toast((t) => (
      <div className="p-3">
        <p>Are you sure you want to delete this product?</p>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => {
              startTransition(() => {
                deleteSubCategoryWithId();
              });
              toast.dismiss(t.id);
            }}
            className="px-2 py-1 bg-red-600 text-white rounded"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-2 py-1 border rounded"
          >
            No
          </button>
        </div>
      </div>
    ));
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <span className="sr-only">Delete</span>
      <TrashIcon className="w-5" />
    </button>
  );

};

