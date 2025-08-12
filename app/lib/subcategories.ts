'use server';

import { z } from 'zod';
import pool from './db';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { SubCategorydef } from './definitions';
import { redirect } from 'next/navigation';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export type SubCategoryFormState = {
  message: string;
  success?: boolean;
  errors: {
    name?: string[];
    status?: string[];
    category_id?: string[];
  };
  values: {
    name: string;
    status: string;
    category_id: string;
  };
};

const SubCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  status: z.enum(['1', '2'], {
    errorMap: () => ({ message: 'Status is required' }),
  }),
  category_id: z.string().min(1, 'Category ID is required'),
});

const CreateSubCategorySchema = SubCategorySchema.omit({ id: true });
export async function createSubCategory(
  prevState: SubCategoryFormState,
  formData: FormData
): Promise<SubCategoryFormState> {
  const rawData = Object.fromEntries(formData);
  const parsedData = CreateSubCategorySchema.safeParse(rawData);

  console.log('errors', parsedData.error);

  if (!parsedData.success) {
    return {
      message: parsedData.error.errors[0]?.message || 'Invalid input',
      errors: parsedData.error.flatten().fieldErrors,
      values: {
        name: rawData.name?.toString() || '',
        status: rawData.status?.toString() || '',
        category_id: rawData.category_id?.toString() || '',
      },
    };
  }

  const { name, status, category_id } = parsedData.data;
  //console.log('parsedData.data', parsedData.data);

  try {
    const result = await pool.query(
      'INSERT INTO subcategories (name, status, category_id) VALUES ($1, $2, $3) RETURNING *',
      [name, status, category_id]
    );

    if (result.rows.length > 0) {
      return {
        message: 'Subcategory created successfully',
        success: true,
        errors: {},
        values: { name: '', status: '', category_id: '' },
      };
    } else {
      return {
        message: 'Failed to create subcategory',
        errors: {},
        values: { name, status, category_id },
      };
    }
  } catch (error) {
    console.error('Error creating subcategory:', error);
    return {
      message: 'An error occurred while creating the subcategory',
      errors: {},
      values: { name, status, category_id },
    };
  }
}



export async function deleteSubCategory(id: string) {
  await pool.query(`DELETE FROM subcategories WHERE id = $1`, [id]);
  revalidatePath('/dashboard/subcategories');
}


const ITEMS_PER_PAGE = 10;
// Subcategories count
export async function fetchSubCategoriesRows() {
  try {
    const data = await pool.query(`SELECT COUNT(*) FROM subcategories`);
    const totalItems = Number(data.rows[0].count) || 0;
    const totalPages = Math.ceil(Number(data.rows[0].count) / ITEMS_PER_PAGE);
    return {
      totalPages,
      totalItems
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of subcategories.');
  }
}

export async function fetchFilteredSubCategories(query: string, currentPage: number) {
  const limit = 10;
  const offset = (currentPage - 1) * limit;

  try {
    const result = await pool.query(
      `SELECT 
    subcategories.*, 
    categories.name AS category_name
  FROM 
    subcategories
  JOIN 
    categories ON subcategories.category_id = categories.id
  WHERE 
    subcategories.name ILIKE $1
  LIMIT $2 OFFSET $3
  `,
      [`%${query}%`, limit, offset]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return [];
  }
}

export async function fetchSubCategoryById(id: string) {
  try {
    const data = await pool.query<SubCategorydef>(
      `SELECT
     subcategories.id,
     subcategories.name,
     subcategories.category_id,
     subcategories.status
     FROM subcategories
     WHERE subcategories.id = $1`,
      [id] // safely pass id as a parameter
    );

    return data.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch SubCategory.');
  }
}


// Categories update schema
const UpdateSubCategory = SubCategorySchema.omit({ id: true });

export async function updateSubCategory(
  id: string,
  state: SubCategoryFormState,
  formData: FormData,
): Promise<SubCategoryFormState> {
  const validatedFields = UpdateSubCategory.safeParse({
    name: formData.get('name'),
    category_id: formData.get('category_id'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Category.',
      values: {
        name: formData.get('name')?.toString() || '',
        status: formData.get('status')?.toString() || '',
        category_id: formData.get('category_id')?.toString() || '',
      },
    };
  }

  const { name, category_id, status } = validatedFields.data;
  try {
    await pool.query(
      `UPDATE subcategories
      SET name = $1, category_id = $2, status = $3
      WHERE id = $4`,
      [name, category_id, status, id]
    );
    return {
      errors: {},
      message: 'Subcategory updated successfully',
      values: { name, status, category_id },
      success: true,
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      errors: {},
      message: `Database Error: Failed to Update SubCategory. ${error instanceof Error ? error.message : String(error)}`,
      values: {
        name: formData.get('name')?.toString() || '',
        category_id: formData.get('category_id')?.toString() || '',
        status: formData.get('status')?.toString() || '',
      },
    };
  }
  revalidatePath('/dashboard/subcategories');
  redirect('/dashboard/subcategories');
}


export async function fetchSubcategories() {
  try {
    const customers = await pool.query<SubCategorydef>(`
      SELECT
        id,
        name,
        status
      FROM subcategories
      where status = '1'
      ORDER BY id DESC
    `);

    return customers.rows;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Err9090: Failed to fetch subcategories.');
  }
}

