import Form from "@/app/ui/subcategories/create-form";
import Breadcrumbs from "@/app/ui/customers/breadcrumbs";
import { fetchCategories } from '@/app/lib/data';

export default async function Page() {
   const categories = await fetchCategories();
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Subcategories', href: '/dashboard/subcategories' },
          {
            label: 'Create Subcategory',
            href: '/dashboard/subcategories/create',
            active: true,
          },
        ]}
      />
      <Form categories = {categories}  />
    </main>
  );
}