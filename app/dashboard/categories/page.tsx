import { fetchCategoriesPages } from "@/app/lib/data";
import { lusitana } from '@/app/ui/fonts';
import Pagination from "@/app/ui/customers/pagination";
import Search from '@/app/ui/search';
import { Suspense } from 'react';
import { CategoriesTableSkeleton } from "@/app/ui/skeletons";
import Table from '@/app/ui/categories/table';
import { CreateCategory } from '@/app/ui/categories/buttons';


export default async function Page(props: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || "";
    const currentPage = Number(searchParams?.page) || 1;
    const totalPages = await fetchCategoriesPages();

    return (

        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Categories</h1>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search categories..." />
                <CreateCategory />
            </div>
            <Suspense fallback={<CategoriesTableSkeleton />}>
                <Table query={query} currentPage={currentPage} />
            </Suspense>
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages.totalPages} />
            </div>

        </div>

    );
}
