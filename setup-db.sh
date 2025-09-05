#!/bin/bash

# Database Setup Script for Class Management System
# This script helps set up the PostgreSQL database and run migrations

echo "🚀 Setting up Class Management System Database..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "Visit: https://www.postgresql.org/download/"
    exit 1
fi

# Check if Prisma CLI is installed
if ! command -v npx prisma &> /dev/null; then
    echo "📦 Installing Prisma CLI..."
    npm install -g prisma
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please update the DATABASE_URL in .env with your PostgreSQL credentials"
    echo "   Example: postgresql://username:password@localhost:5432/class_management_system"
    echo ""
    echo "Press Enter when you've updated the .env file..."
    read
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma db push

# Seed the database with sample data (optional)
echo "🌱 Would you like to seed the database with sample data? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "🌱 Seeding database with sample data..."
    # You can add a seed script here if needed
    echo "✅ Database setup complete!"
    echo ""
    echo "🎉 Your Class Management System is ready!"
    echo "📚 Next steps:"
    echo "   1. Run: npm run dev"
    echo "   2. Visit: http://localhost:3000/auth"
    echo "   3. Create a teacher account"
    echo "   4. Start managing your classes!"
else
    echo "✅ Database setup complete!"
    echo ""
    echo "🎉 Your Class Management System is ready!"
    echo "📚 Next steps:"
    echo "   1. Run: npm run dev"
    echo "   2. Visit: http://localhost:3000/auth"
    echo "   3. Create a teacher account"
    echo "   4. Start managing your classes!"
fi
