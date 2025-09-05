# Class Management System

A modern, database-driven class management system built with Next.js, PostgreSQL, and Prisma. Teachers can manage classes, students, and track behavior points in a fun, engaging interface.

## Features

- 🎓 **Teacher Authentication**: Secure login/registration system
- 📚 **Class Management**: Create and manage multiple classes
- 👥 **Student Management**: Add, view, and track student progress
- 🎯 **Behavior Tracking**: Award points for positive behaviors
- 🦆 **Visual Progress**: Duck character progression based on points
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing

## Database Schema

The system uses the following entities:

- **Teachers**: User accounts for educators
- **Classes**: Groups of students managed by teachers
- **Students**: Individual learners with point tracking
- **Points**: Historical record of point awards with reasons

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd class_management_system
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up the database**

   ```bash
   # Make the setup script executable
   chmod +x setup-db.sh

   # Run the setup script
   ./setup-db.sh
   ```

4. **Configure environment variables**

   Update the `.env` file with your database credentials:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/class_management_system"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to `http://localhost:3000/auth` to create your teacher account.

## Usage

### For Teachers

1. **Register/Login**: Create an account or sign in
2. **Create Classes**: Set up classes for your students
3. **Add Students**: Add students to your classes
4. **Track Behavior**: Use the Individual Task feature to award points
5. **Monitor Progress**: View student progress and point history

### For Students

Students can see their progress through the visual duck character system:

- **Level 1**: 0-24 points (Duck 1)
- **Level 2**: 25-49 points (Duck 2)
- **Level 3**: 50-74 points (Duck 3)
- **Level 4**: 75-99 points (Duck 4)
- **Level 5**: 100+ points (Duck 5)

## API Endpoints

### Authentication

- `POST /api/teachers` - Register new teacher
- `PUT /api/teachers` - Login teacher
- `GET /api/teachers/profile` - Get teacher profile

### Classes

- `GET /api/classes?teacherId=xxx` - Get teacher's classes
- `POST /api/classes` - Create new class
- `PUT /api/classes?id=xxx` - Update class
- `DELETE /api/classes?id=xxx` - Delete class

### Students

- `GET /api/students?classId=xxx` - Get class students
- `POST /api/students` - Create new student
- `PUT /api/students` - Update student points
- `DELETE /api/students?id=xxx` - Delete student

## Development

### Database Management

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Code Structure

```
src/
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   ├── auth/           # Authentication page
│   ├── dashboard/      # Teacher dashboard
│   └── individual_task/ # Behavior tracking page
├── components/         # React components
├── hooks/             # Custom React hooks
└── lib/               # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.
