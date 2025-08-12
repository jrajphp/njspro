import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { fetchFilteredProducts } from '@/app/lib/products';
import { DeleteProduct, UpdateProduct } from '@/app/ui/products/buttons';


export default async function ProductsTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const products = await fetchFilteredProducts(query, currentPage);

  return (
    <div className="w-full">
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              {/* Mobile Card View */}
              <div className="md:hidden">
                {products?.map((products) => (
                  <div
                    key={products.id}
                    className="mb-2 w-full rounded-md bg-white p-4 shadow"
                  >
                    <div className="flex items-center justify-between border-b pb-2">
                      <p className="font-semibold">{products.name}</p>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/categories/${products.id}/edit`}>
                          <PencilIcon className="h-5 w-5 text-blue-500 hover:text-blue-700 cursor-pointer" />
                        </Link>
                        <button aria-label="Delete">
                          <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700 cursor-pointer" />
                        </button>
                      </div>
                    </div>
                    <div className="pt-2 text-sm">
                      <span className="font-medium text-gray-500">Status: </span>
                      <span>{products.status === 1 ? "Active" : "Inactive"}</span>
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategory</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products?.map((products) => (
                      <tr key={products.id}>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">{products.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{products.category_name}</td>
                         <td className="px-6 py-4 whitespace-nowrap">{products.subcategory_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{products.status === 1 ? "Active" : "Inactive"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <UpdateProduct id={products.id} />
                            <DeleteProduct id={products.id} />
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