import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import {fetchFilteredCategories} from '@/app/lib/data';
import { DeleteCategory, UpdateCategory } from '@/app/ui/categories/buttons';


export default async function CategoriesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const categories = await fetchFilteredCategories(query, currentPage);

  return (
    <div className="w-full">
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              {/* Mobile Card View */}
              <div className="md:hidden">
                {categories?.map((category) => (
                  <div
                    key={category.id}
                    className="mb-2 w-full rounded-md bg-white p-4 shadow"
                  >
                    <div className="flex items-center justify-between border-b pb-2">
                      <p className="font-semibold">{category.name}</p>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/categories/${category.id}/edit`}>
                          <PencilIcon className="h-5 w-5 text-blue-500 hover:text-blue-700 cursor-pointer" />
                        </Link>
                        <button aria-label="Delete">
                          <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700 cursor-pointer" />
                        </button>
                      </div>
                    </div>
                    <div className="pt-2 text-sm">
                      <span className="font-medium text-gray-500">Status: </span>
                      <span>{category.status === "1" ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories?.map((category) => (
                      <tr key={category.id}>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">{category.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{category.status === "1" ? "Active" : "Inactive"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                             <UpdateCategory id={category.id} />
                             <DeleteCategory id={category.id} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}