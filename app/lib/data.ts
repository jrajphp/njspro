import postgres from 'postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
  Customer,
  Category,
} from './definitions';
import { formatCurrency } from './utils';
import pool from './db'; // Assuming you have a db.ts file that exports a configured pool

//const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)
    //console.log('Fetching revenue data...');
    //await new Promise((resolve) => setTimeout(resolve, 3000));
    const data = await pool.query<Revenue>('SELECT * FROM revenue');
    //console.log('Data fetch completed after 3 seconds.');
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await pool.query<LatestInvoiceRaw>(
      `SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
   FROM invoices
   JOIN customers ON invoices.customer_id = customers.id
   ORDER BY invoices.date DESC
   LIMIT 5`
    );
    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}



export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = pool.query('SELECT COUNT(*) FROM invoices');
    const customerCountPromise = pool.query('SELECT COUNT(*) FROM customers');
    const invoiceStatusPromise = pool.query(`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`);

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
    const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 10;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await pool.query<InvoicesTable>
      (`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE $1 OR
        customers.email ILIKE $1 OR
        invoices.amount::text ILIKE $1 OR
        invoices.date::text ILIKE $1 OR
        invoices.status ILIKE $1
      ORDER BY invoices.date DESC
      LIMIT $2 OFFSET $3
    `, [`%${query}%`, ITEMS_PER_PAGE, offset]);

    return invoices.rows;
    console.log('Filtered Invoices:', invoices);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await pool.query(`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE $1 OR
      customers.email ILIKE $1 OR
      invoices.amount::text ILIKE $1 OR
      invoices.date::text ILIKE $1 OR
      invoices.status ILIKE $1
  `,   [query]);

    const totalPages = Math.ceil(Number(data.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchCustomersPages() {
  try {
    const data = await pool.query(`SELECT COUNT(*) FROM customers`);

    const totalPages = Math.ceil(Number(data.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const result = await pool.query<InvoiceForm>(
      `SELECT
      invoices.id,
      invoices.customer_id,
      invoices.amount,
      invoices.status
    FROM invoices
    WHERE invoices.id = $1`,
      [id]  // safely pass id as a parameter
    );

    const invoice = result.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));


    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomerById(id: string) {
  try {
    const data = await pool.query<Customer[]>(`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url
      FROM customers
      WHERE customers.id = $1
    `, [id]); // safely pass id as a parameter  


    return data.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer.');
  }
}


export async function fetchCustomers() {
  try {
    const customers = await pool.query<CustomerField>(`
      SELECT
        id,
        name,
        email
      FROM customers
      ORDER BY id DESC
    `);

    return customers.rows;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}


export async function fetchCategories() {
  try {
    const customers = await pool.query<Category>(`
      SELECT
        id,
        name,
        status
      FROM categories
      where status = '1'
      ORDER BY id DESC
    `);

    return customers.rows;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Err9090: Failed to fetch categories.');
  }
}

export async function fetchFilteredCustomers(query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  try {
    const customers = await pool.query<CustomersTableType>(`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url
		FROM customers
		WHERE
		  customers.name ILIKE $1 OR
        customers.email ILIKE $1
		ORDER BY customers.id DESC
    LIMIT $2 OFFSET $3
	  `, [`%${query}%`, ITEMS_PER_PAGE, offset]);
    //console.log('Filtered Customers:', customers);
    return customers.rows;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer date.');
  }
}

// Categories count
export async function fetchCategoriesPages() {
  try {
    const data = await pool.query(`SELECT COUNT(*) FROM categories`);
    const totalItems = Number(data.rows[0].count) || 0;
    const totalPages = Math.ceil(Number(data.rows[0].count) / ITEMS_PER_PAGE);
    return {
      totalPages,
      totalItems
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of categories.');
  }
}

// Fetch filtered categories
export async function fetchFilteredCategories(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  try {
    // const categories = await pool.query<Category[]>(`
    //   SELECT
    //     id,
    //     name,
    //     status
    //   FROM categories
    //   WHERE name ILIKE ${`%${query}%`}
    //   ORDER BY name ASC
    //   LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    // `);
    const categories = await pool.query<Category>(
      `SELECT
     id,
     name,
     status
   FROM categories
   WHERE name ILIKE $1
   ORDER BY name ASC
   LIMIT $2 OFFSET $3`,
      [`%${query}%`, ITEMS_PER_PAGE, offset]
    );
    return categories.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch categories.');
  }
}

export async function fetchCategoryById(id: string) {
  try {
    const data = await pool.query<Category>(
      `SELECT
     categories.id,
     categories.name,
     categories.status
     FROM categories
     WHERE categories.id = $1`,
      [id] // safely pass id as a parameter
    );

    return data.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch Category.');
  }
}

