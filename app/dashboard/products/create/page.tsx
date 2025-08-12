import Form from "@/app/ui/products/create-form";
import Breadcrumbs from "@/app/ui/customers/breadcrumbs";
import { fetchCategories } from '@/app/lib/data';
import { fetchSubcategories } from '@/app/lib/subcategories';

export default async function Page() {
   const categories = await fetchCategories();
   const subcategories = await fetchSubcategories();
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Products', href: '/dashboard/products' },
          {
            label: 'Create Product',
            href: '/dashboard/products/create',
            active: true,
          },
        ]}
      />
      <Form categories = {categories} subcategories = {subcategories} />
    </main>
  );
}