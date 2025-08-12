'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

//const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

import pool from './db';


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

const CustomerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, {
    message: 'Please enter a customer name.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  image_url: z.string().default(''), // <-- e
});

const CreateCustomer = CustomerSchema.omit({ id: true });
export type CustomerState = {
  errors: {
    name?: string[];
    email?: string[];
    image_url?: string[];
  };
  message: string;
  values: {
    name: string;
    email: string;
    image_url: string;
  };
};

export async function createCustomer(
  prevState: CustomerState,
  formData: FormData,
) {
  // Validate form using Zod
  const validatedFields = CreateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    image_url: formData.get('image_url')?.toString() || '',
  });

  // If form validation fails, return errors early. Otherwise, continue.
  console.log('Validated Fields:', validatedFields);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Customer.',
      values: {
        name: formData.get('name')?.toString() || '',
        email: formData.get('email')?.toString() || '',
        image_url: formData.get('image_url')?.toString() || '',
      },
    };
  }

  // Prepare data for insertion into the database
  const { name, email, image_url } = validatedFields.data;

  // Insert data into the database
  try {
    await pool.query(`
      INSERT INTO customers (name, email, image_url)
      VALUES ($1, $2, $3)
    `, [name, email, image_url]);
  } catch (error) {

    console.error('Database Error:', error);
    // If a database error occurs, return a more specific error.
    return {
      errors: {},
      values: { name: '', email: '', image_url: '' },
      message: 'Database Error: Failed to Create Customer.',
    };
  }

  // Revalidate the cache for the customers page and redirect the user.
  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
export type State = {
  errors: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message: string;
  values: {
    customerId: string;
    amount: string;
    status: string;
  };
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  console.log('Validated Fields:', validatedFields);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
      values: {
        customerId: formData.get('customerId')?.toString() || '',
        amount: formData.get('amount')?.toString() || '',
        status: formData.get('status')?.toString() || '',
      },
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Insert data into the database
  try {
    await pool.query(`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES ($1, $2, $3, $4)
    `, [customerId, amountInCents, status, date]);
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      errors: {},
      message: `Database Error: Failed to Create Invoice . ${error instanceof Error ? error.message : String(error)}`,
      values: {
        customerId: formData.get('customerId')?.toString() || '',
        amount: formData.get('amount')?.toString() || '',
        status: formData.get('status')?.toString() || '',
      },
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}


const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
      values: {
        customerId: formData.get('customerId')?.toString() || '',
        amount: formData.get('amount')?.toString() || '',
        status: formData.get('status')?.toString() || '',
      },
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await pool.query(`
      UPDATE invoices
      SET customer_id = $1, amount = $2, status = $3
      WHERE id = $4
    `, [customerId, amountInCents, status, id]);
  } catch (error) {
    return {
      errors: {},
      message: `Database Error: Failed to Update Invoice. ${error instanceof Error ? error.message : String(error)}`,
      values: {
        customerId: formData.get('customerId')?.toString() || '',
        amount: formData.get('amount')?.toString() || '',
        status: formData.get('status')?.toString() || '',
      },
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  //throw new Error('Failed to Delete Invoice');

  await pool.query(`DELETE FROM invoices WHERE id = $1`, [id]);
  revalidatePath('/dashboard/invoices');
}

// Customer update schema
const UpdateCustomer = CustomerSchema.omit({ id: true });

export async function updateCustomer(
  id: string,
  prevState: CustomerState,
  formData: FormData,
) {
  const validatedFields = UpdateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    image_url: formData.get('image_url'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Customer.',
      values: {
        name: formData.get('name')?.toString() || '',
        email: formData.get('email')?.toString() || '',
        image_url: formData.get('image_url')?.toString() || '',
      },
    };
  }

  const { name, email, image_url } = validatedFields.data;

  try {
    await pool.query(
      `
    UPDATE customers
    SET name = $1, email = $2, image_url = $3
    WHERE id = $4
  `,
      [name, email, image_url, id] // ✅ clean and safe
    );
  } catch (error) {
    console.error('Database Error:', error);
    return {
      errors: {},
      message: `Database Error: Failed to Update Customer. ${error instanceof Error ? error.message : String(error)}`,
      values: {
        name: formData.get('name')?.toString() || '',
        email: formData.get('email')?.toString() || '',
        image_url: formData.get('image_url')?.toString() || '',
      },
    };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

// Delete customer function
export async function deleteCustomer(id: string) {
  //throw new Error('Failed to Delete Invoice');

  await pool.query(`DELETE FROM customers WHERE id = $1`, [id]);
  revalidatePath('/dashboard/customers');
}


// ------------------------------- >>>>>>>>>>>>>>>>>> Category schema

const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, {
    message: 'Please enter a category name.',
  }),
  status: z.enum(['1', '2'], {
    invalid_type_error: 'Please select a category status.',
  }),
});

export type CategoryState = {
  errors: {
    name?: string[];
    status?: string[];
  };
  message: string;
  values: {
    name: string;
    status: string;
  };
};

const CreateCategory = CategorySchema.omit({ id: true });

export async function createCategory(
  prevState: CategoryState,
  formData: FormData,
) {
  // Validate form using Zod
  const validatedFields = CreateCategory.safeParse({
    name: formData.get('name'),
    status: formData.get('status'),
  });

  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  // If form validation fails, return errors early. Otherwise, continue.
  console.log('Validated Fields:', formData);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Category.',
      values: {
        name: formData.get('name')?.toString() || '',
        status: formData.get('status')?.toString() || '',
      },
    };
  }

  // Prepare data for insertion into the database
  const { name, status } = validatedFields.data;

  // Insert data into the database
  try {
    await pool.query(
      `INSERT INTO categories (name, status) VALUES ($1, $2)`,
      [name, status]
    );
  } catch (error) {

    console.error('Database Error:', error);
    // If a database error occurs, return a more specific error.
    return {
      errors: {},
      values: { name: '', status: '' },
      message: 'Database Error: Failed to Create Category.',
    };
  }

  // Revalidate the cache for the customers page and redirect the user.
  revalidatePath('/dashboard/categories');
  redirect('/dashboard/categories');
}

// Categories update schema
const UpdateCategory = CategorySchema.omit({ id: true });

export async function updateCategory(
  id: string,
  prevState: CategoryState,
  formData: FormData,
) {
  const validatedFields = UpdateCategory.safeParse({
    name: formData.get('name'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Category.',
      values: {
        name: formData.get('name')?.toString() || '',
        status: formData.get('status')?.toString() || '',
      },
    };
  }

  const { name, status } = validatedFields.data;
  try {
    await pool.query(
      `UPDATE categories
      SET name = $1, status = $2
      WHERE id = $3`,
      [name, status, id]
    );
  } catch (error) {
    console.error('Database Error:', error);
    return {
      errors: {},
      message: `Database Error: Failed to Update Category. ${error instanceof Error ? error.message : String(error)}`,
      values: {
        name: formData.get('name')?.toString() || '',
        status: formData.get('status')?.toString() || '',
      },
    };
  }

  revalidatePath('/dashboard/categories');
  redirect('/dashboard/categories');
}

// Delete customer function
export async function deleteCategory(id: string) {
  //throw new Error('Failed to Delete Invoice');

  await pool.query(`DELETE FROM categories WHERE id = $1`, [id]);
  revalidatePath('/dashboard/categories');
}