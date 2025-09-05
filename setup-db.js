#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Setting up Class Management System Database...\n");

// Check if .env.local exists
const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.log("📝 Creating .env.local file...");

  const envContent = `# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/class_management_db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
`;

  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env.local created successfully!");
  console.log(
    "⚠️  Please update the DATABASE_URL with your actual database credentials\n"
  );
} else {
  console.log("✅ .env.local already exists\n");
}

// Install dependencies
console.log("📦 Installing dependencies...");
try {
  execSync("npm install", { stdio: "inherit" });
  console.log("✅ Dependencies installed successfully\n");
} catch (error) {
  console.error("❌ Error installing dependencies:", error.message);
  process.exit(1);
}

// Generate Prisma client
console.log("🔧 Generating Prisma client...");
try {
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("✅ Prisma client generated successfully\n");
} catch (error) {
  console.error("❌ Error generating Prisma client:", error.message);
  process.exit(1);
}

console.log("🎉 Setup complete!");
console.log("\n📋 Next steps:");
console.log("1. Set up your PostgreSQL database");
console.log(
  "2. Update DATABASE_URL in .env.local with your database credentials"
);
console.log("3. Run: npx prisma db push (to create tables)");
console.log("4. Run: npm run db:seed (to seed default behaviors)");
console.log("5. Run: npm run dev (to start the development server)");
console.log("\n💡 Database options:");
console.log(
  "- Docker: docker run --name postgres-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=class_management_db -p 5432:5432 -d postgres:15"
);
console.log("- Local PostgreSQL installation");
console.log('- SQLite (change provider in prisma/schema.prisma to "sqlite")');
