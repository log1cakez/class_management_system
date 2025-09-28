# Database Deployment Guide

## For Vercel Deployment

### 1. Update Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Update `DATABASE_URL` with your new database connection string
5. Redeploy your application

### 2. Database Migration Commands

#### For Production Database:
```bash
# Push schema changes to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed the database (if needed)
npx prisma db seed
```

#### For Development:
```bash
# Reset and seed database
npx prisma migrate reset

# Or just push changes
npx prisma db push
```

### 3. Environment Variables Needed

#### Required for Vercel:
- `DATABASE_URL` - Your database connection string
- `JWT_SECRET` - Your JWT secret key

#### Example DATABASE_URL formats:
```bash
# PostgreSQL (Neon, Supabase, etc.)
DATABASE_URL="postgresql://username:password@hostname:port/database"

# MySQL
DATABASE_URL="mysql://username:password@hostname:port/database"

# SQLite (local only)
DATABASE_URL="file:./dev.db"
```

### 4. Vercel Build Commands

Add these to your `package.json` scripts:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

### 5. Database Providers

#### Neon (Recommended for PostgreSQL):
1. Create account at [neon.tech](https://neon.tech)
2. Create new database
3. Copy connection string
4. Update `DATABASE_URL` in Vercel

#### Supabase:
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Update `DATABASE_URL` in Vercel

#### PlanetScale (MySQL):
1. Create account at [planetscale.com](https://planetscale.com)
2. Create new database
3. Get connection string
4. Update `DATABASE_URL` in Vercel

### 6. Troubleshooting

#### If deployment fails:
1. Check environment variables are set correctly
2. Ensure database is accessible from Vercel
3. Verify Prisma schema matches your database
4. Check build logs for specific errors

#### Common issues:
- **Connection timeout**: Database might not allow external connections
- **Authentication failed**: Check username/password in connection string
- **Schema mismatch**: Run `npx prisma db push` to sync schema
