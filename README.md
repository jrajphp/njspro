# NextJs Basic Dashboard for Ecommerce websites
NextJS basic dashboard with categories, subcategories, products, customers, invoices, orders etc

------------------------------------------------

After using Neon PostgreSQL i have changed the code to work in our local postgreSQL

# Recommended for most uses
DATABASE_URL=postgres://postgres:{password}@localhost:5432/yourdb?sslmode=disable

# For uses requiring a connection without pgbouncer
DATABASE_URL_UNPOOLED=postgres://postgres:{password}@localhost:5432/yourdb?sslmode=disable

# Parameters for constructing your own connection string
PGHOST=localhost

PGHOST_UNPOOLED=localhost

PGUSER=postgres

PGDATABASE=yourdb

PGPASSWORD=yourpassword

PGPORT=5432

# Parameters for Vercel Postgres Templates
POSTGRES_URL=postgres://postgres:yourpassword@localhost:5432/yourdb
POSTGRES_URL_NON_POOLING=postgres://postgres:yourpassword@localhost:5432/yourdb
POSTGRES_USER=postgres
POSTGRES_HOST=localhost
POSTGRES_PASSWORD=yourpassword
POSTGRES_DATABASE=yourdb
POSTGRES_URL_NO_SSL=postgres://postgres:yourpassword@localhost:5432/yourdb
POSTGRES_PRISMA_URL=postgres://postgres:yourpassword@localhost:5432/yourdb
