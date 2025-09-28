# Database Update Guide

## 1. Schema Updates (Database Structure Changes)

### Quick Schema Sync (Development):
```bash
npx prisma db push
```
- Pushes schema changes directly to database
- Good for development and prototyping
- **Use with caution in production**

### Migration-based Updates (Production Recommended):
```bash
# Create a new migration
npx prisma migrate dev --name "description-of-changes"

# Apply migrations to production
npx prisma migrate deploy
```

### Reset Database (Development Only):
```bash
npx prisma migrate reset
```
- ⚠️ **WARNING**: This deletes all data and recreates the database

## 2. Data Updates

### Seed Database with Initial Data:
```bash
npx prisma db seed
```

### Update Existing Data:
```bash
# Connect to your database and run SQL commands
npx prisma studio
```
- Opens a web interface to view/edit data

## 3. Environment Updates

### For Local Development:
1. Update `.env` file:
```bash
DATABASE_URL="your-new-database-url"
```

2. Regenerate Prisma client:
```bash
npx prisma generate
```

### For Production (Vercel):
1. Update environment variables in Vercel dashboard
2. Redeploy application

## 4. Common Update Scenarios

### Adding New Tables/Models:
1. Update `prisma/schema.prisma`
2. Run: `npx prisma db push` (dev) or `npx prisma migrate dev` (production)
3. Update your application code

### Adding New Fields:
1. Update `prisma/schema.prisma`
2. Run: `npx prisma db push`
3. Update application code to use new fields

### Changing Field Types:
1. Update `prisma/schema.prisma`
2. Run: `npx prisma migrate dev --name "change-field-type"`
3. Update application code

### Adding Indexes:
1. Update `prisma/schema.prisma` with `@@index` or `@@unique`
2. Run: `npx prisma db push`

## 5. Production Database Updates

### Safe Production Update Process:
```bash
# 1. Create migration
npx prisma migrate dev --name "production-update"

# 2. Test migration on staging
npx prisma migrate deploy

# 3. Deploy to production
npx prisma migrate deploy
```

### Emergency Rollback:
```bash
# Check migration history
npx prisma migrate status

# Rollback to previous migration
npx prisma migrate resolve --rolled-back "migration-name"
```

## 6. Database Provider Specific

### Neon (PostgreSQL):
```bash
# Push schema changes
npx prisma db push

# Generate client
npx prisma generate
```

### Supabase:
```bash
# Same as Neon - PostgreSQL compatible
npx prisma db push
npx prisma generate
```

### SQLite (Local):
```bash
# Reset and recreate
npx prisma migrate reset
```

## 7. Troubleshooting

### Common Issues:

#### "Database is not up to date":
```bash
npx prisma db push --accept-data-loss
```

#### "Migration conflicts":
```bash
npx prisma migrate resolve --applied "migration-name"
```

#### "Schema drift":
```bash
npx prisma db pull
npx prisma generate
```

### Check Database Status:
```bash
# Check migration status
npx prisma migrate status

# Check database connection
npx prisma db pull
```

## 8. Best Practices

1. **Always backup** production data before major updates
2. **Test migrations** on staging environment first
3. **Use migrations** for production, `db push` for development
4. **Document changes** in migration names
5. **Review generated SQL** before applying migrations
