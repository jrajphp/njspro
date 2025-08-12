'use server';

import { z } from 'zod';
import pool from './db';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { Product } from './definitions';
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

export type ProductFormState = {
  message: string;
  success?: boolean;
  errors: {
    name?: string[];
    status?: string[];
    category_id?: string[];
    subcategory_id?: string[];
    image?: string[];
    description?: string[];
    price?: string[];
  };
  values: {
    name: string;
    status: string;
    category_id: string;
    subcategory_id: string;
    image: string;
    description?: string;
    price: string;
  };
};


const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  status: z.enum(['1', '2'], {
    errorMap: () => ({ message: 'Status is required' }),
  }),
  category_id: z.string().min(1, 'Category ID is required'),
  subcategory_id: z.string().min(1, 'Subcategory ID is required'),
  image: z.string().url('Image must be a valid URL'),
  description: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid number'),
});

const CreateProductSchema = ProductSchema.omit({ id: true });
export async function createProduct(
  prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const rawData = Object.fromEntries(formData);
  const parsedData = CreateProductSchema.safeParse(rawData);

  if (!parsedData.success) {
    return {
      message: parsedData.error.errors[0]?.message || 'Invalid input',
      errors: parsedData.error.flatten().fieldErrors,
      values: {
        name: rawData.name?.toString() || '',
        status: rawData.status?.toString() || '',
        category_id: rawData.category_id?.toString() || '',
        subcategory_id: rawData.subcategory_id?.toString() || '',
        image: rawData.image?.toString() || '',
        description: rawData.description?.toString() || '',
        price: rawData.price?.toString() || '',
      },
    };
  }

  const { name, status, category_id, subcategory_id, image, description, price } = parsedData.data;

  try {
    const result = await pool.query(
      'INSERT INTO products (name, status, category_id, subcategory_id, image, description, price) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, status, category_id, subcategory_id, image, description, price]
    );

    if (result.rows.length > 0) {
      return {
        message: 'Product created successfully',
        success: true,
        errors: {},
        values: { name: '', status: '', category_id: '', subcategory_id: '', image: '', description: '', price: '' },
      };
    } else {
      return {
        message: 'Failed to create product',
        errors: {},
        values: { name, status, category_id, subcategory_id, image, description, price },
      };
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      message: 'An error occurred while creating the product',
      errors: {},
      values: { name, status, category_id, subcategory_id, image, description, price },
    };
  }
}



export async function deleteProduct(id: string) {
  await pool.query(`DELETE FROM products WHERE id = $1`, [id]);
  revalidatePath('/dashboard/products');
}


const ITEMS_PER_PAGE = 10;
// Subcategories count
export async function fetchProductsRows() {
  try {
    const data = await pool.query(`SELECT COUNT(*) FROM products`);
    const totalItems = Number(data.rows[0].count) || 0;
    const totalPages = Math.ceil(Number(data.rows[0].count) / ITEMS_PER_PAGE);
    return {
      totalPages,
      totalItems
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of products.');
  }
}

export async function fetchFilteredProducts(query: string, currentPage: number) {
  const limit = 10;
  const offset = (currentPage - 1) * limit;

  try {
    const result = await pool.query(
      `SELECT 
    products.*, 
    categories.name AS category_name,
    subcategories.name AS subcategory_name
  FROM 
    products
  JOIN 
    subcategories ON products.subcategory_id = subcategories.id
  JOIN 
    categories ON subcategories.category_id = categories.id
  WHERE 
    products.name ILIKE $1
  LIMIT $2 OFFSET $3
  `,
      [`%${query}%`, limit, offset]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function fetchProductById(id: string) {
  try {
    const data = await pool.query<Product>(
      `SELECT
      products.id,
      products.name,
      products.status,
      products.category_id,
      products.subcategory_id,
      products.image,
      products.description,
      products.price,
     FROM products
     WHERE products.id = $1`,
      [id] // safely pass id as a parameter
    );

    return data.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch SubCategory.');
  }
}


// Categories update schema
const UpdateProduct = ProductSchema.omit({ id: true });

export async function updateProduct(
  id: string,
  state: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const validatedFields = UpdateProduct.safeParse({
    name: formData.get('name'),
    category_id: formData.get('category_id'),
    status: formData.get('status'),
    subcategory_id: formData.get('subcategory_id'),
    image: formData.get('image'),
    description: formData.get('description'),
    price: formData.get('price'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Category.',
      values: {
        name: formData.get('name')?.toString() || '',
        status: formData.get('status')?.toString() || '',
        category_id: formData.get('category_id')?.toString() || '',
        subcategory_id: formData.get('subcategory_id')?.toString() || '',
        image: formData.get('image')?.toString() || '',
        description: formData.get('description')?.toString() || '',
        price: formData.get('price')?.toString() || '',
      },
    };
  }

  const { name, category_id, status, subcategory_id, image, description, price } = validatedFields.data;
  try {
    await pool.query(
      `UPDATE products SET name = $1, category_id = $2, status = $3, subcategory_id = $4, image = $5, description = $6, price = $7
      WHERE id = $8`,
      [name, category_id, status, subcategory_id, image, description, price, id]
    );
    return {
      errors: {},
      message: 'Product updated successfully',
      values: { name, status, category_id, subcategory_id, image, description, price },
      success: true,
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      errors: {},
      message: `Database Error: Failed to Update Product. ${error instanceof Error ? error.message : String(error)}`,
      values: {
        name: formData.get('name')?.toString() || '',
        category_id: formData.get('category_id')?.toString() || '',
        status: formData.get('status')?.toString() || '',
        subcategory_id: formData.get('subcategory_id')?.toString() || '',
        image: formData.get('image')?.toString() || '',
        description: formData.get('description')?.toString() || '',
        price: formData.get('price')?.toString() || '',
      },
    };
  }
  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}
