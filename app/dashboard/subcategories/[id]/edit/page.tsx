import Form from '@/app/ui/subcategories/edit-form';
import Breadcrumbs from '@/app/ui/customers/breadcrumbs';
import { fetchSubCategoryById } from '@/app/lib/subcategories';
import { fetchCategories } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const categories = await fetchCategories();

  const [subcategory] = await Promise.all([
    fetchSubCategoryById(id),
  ]);

  if (!subcategory) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Subcategories', href: '/dashboard/subcategories' },
          {
            label: 'Edit Category',
            href: `/dashboard/subcategories/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form subcategory={subcategory} categories={categories} />
    </main>
  );
}