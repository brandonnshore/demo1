# Raspberry - Quick Start Guide

Get up and running with Raspberry in 5 minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL 14+ installed and running
- [ ] npm installed (`npm --version`)

## Quick Setup

### 1. Install Dependencies

```bash
# From project root
cd backend
npm install

cd ../frontend
npm install
```

### 2. Set Up Database

```bash
# Create database
createdb raspberry

# Copy environment file
cd backend
cp .env.example .env
```

Edit `backend/.env` and set your database URL:
```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/raspberry
```

### 3. Run Migrations

```bash
# From backend directory
npm run migrate
```

This creates all tables and adds seed data including:
- Admin user (admin@raspberry.com / admin123)
- Decoration methods (screen print, embroidery, DTG)
- Sample product (Classic T-Shirt with 10 variants)

### 4. Configure Frontend

```bash
cd ../frontend
cp .env.example .env
```

The defaults should work for local development.

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Open Application

- Frontend: http://localhost:3000
- API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Verify Installation

1. Open http://localhost:3000
2. You should see the Raspberry homepage
3. Navigate to "Products" to see the sample t-shirt
4. Check http://localhost:3001/health for API status

## What's Next?

The project is now initialized with:
- ✅ Database schema and migrations
- ✅ REST API with Express
- ✅ React frontend with routing
- ✅ Sample product data
- ✅ Authentication middleware

### To Continue Development:

1. **Implement the Customizer**
   - Create canvas-based design tool using Fabric.js
   - Add artwork upload functionality
   - Build text editor with font selection

2. **Complete API Controllers**
   - Product CRUD operations
   - Order creation and management
   - Price calculation logic
   - Stripe payment integration

3. **Build Admin Dashboard**
   - Product management interface
   - Order fulfillment tools
   - Price rule editor

4. **Add Production Pack Generator**
   - Mockup image generation
   - Print-ready file export
   - PDF spec sheet creation

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Verify database exists
psql -l | grep raspberry
```

### Port Already in Use
```bash
# Backend (port 3001)
lsof -ti:3001 | xargs kill -9

# Frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

### Migration Errors
```bash
# Drop and recreate database
dropdb raspberry
createdb raspberry
cd backend && npm run migrate
```

## Project Structure Overview

```
raspberry/
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── controllers/  # Route handlers (TODO: Implement logic)
│   │   ├── routes/       # API routes (✅ Complete)
│   │   ├── middleware/   # Auth & error handling (✅ Complete)
│   │   ├── models/       # TypeScript types (✅ Complete)
│   │   └── config/       # Database config (✅ Complete)
│   └── migrations/       # Database setup (✅ Complete)
│
└── frontend/          # React + TypeScript
    ├── src/
    │   ├── pages/        # Page components (✅ Basic structure)
    │   ├── components/   # Reusable components (TODO: Build customizer)
    │   └── stores/       # State management (✅ Cart store ready)
    └── public/
```

## Need Help?

- Review full specification: `specs/raspberry-spec.md`
- Read complete documentation: `README.md`
- Check API endpoints in backend route files

Happy coding! 🚀
