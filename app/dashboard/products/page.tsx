import {lusitana} from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import {CreateProduct} from '@/app/ui/products/buttons';
import {fetchProductsRows} from '@/app/lib/products';
import Table from '@/app/ui/products/table';
import Pagination from "@/app/ui/customers/pagination";


export default async function ProductPage(props: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || "";
    const currentPage = Number(searchParams?.page) || 1;
    const totalPages = await fetchProductsRows();
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Products</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search products..." />
                <CreateProduct />
            </div>
            <Table query={query} currentPage={currentPage} />
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages.totalPages} />
            </div>

        </div>

    );
}

