# Deployment Guide for Class Management System

## Vercel Deployment

### Prerequisites
1. Vercel account
2. Neon database (PostgreSQL)
3. Environment variables set up

### Steps

1. **Set up Neon Database**
   - Create a new PostgreSQL database on Neon
   - Copy the connection string

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Set environment variables in Vercel dashboard:
     ```
     DATABASE_URL=your_neon_database_url
     JWT_SECRET=your_jwt_secret_key
     ```

3. **Database Setup**
   - After deployment, run database migrations:
     ```bash
     npx prisma db push
     npx prisma generate
     ```
   - Seed the database with default behaviors:
     ```bash
     npm run db:seed
     ```

4. **Build Configuration**
   - The project is configured with:
     - Build command: `npm run build`
     - Install command: `npm install`
     - Postinstall script runs `prisma generate`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string from Neon | Yes |
| `JWT_SECRET` | Secret key for JWT token generation | Yes |

### Database Schema

The application uses Prisma with PostgreSQL and includes:
- Teachers and Classes
- Students and Points
- Behaviors (Individual and Group Work)
- Group Work Activities and Awards
- Reward badges and celebrations

### Features Included

- ✅ Teacher registration and authentication
- ✅ Class and student management
- ✅ Individual task behavior tracking
- ✅ Group work activities with badges and celebrations
- ✅ Point system with duck character progression
- ✅ Responsive design with animations
- ✅ Database persistence

### Post-Deployment

1. Create your first teacher account
2. Set up classes and add students
3. The system will automatically seed default behaviors for new teachers
4. Start tracking individual and group behaviors!

### Troubleshooting

- If images don't load, check that all icon files are in `/public/icons/`
- If database errors occur, ensure Prisma client is generated: `npx prisma generate`
- If behaviors don't appear, run the seed script: `npm run db:seed`
