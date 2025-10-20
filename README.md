# Raspberry - Custom Clothing Ecommerce Platform

A full-stack ecommerce platform for custom clothing with a live design customizer. Customers can select products, upload artwork or add text, choose decoration methods and placements, and see real-time price updates. The platform generates production-ready files and spec sheets for fulfillment partners.

## Features

- **Live Customizer**: Canvas-based design tool with real-time preview
- **Dynamic Pricing**: Live price calculation based on customization options
- **Multiple Decoration Methods**: Screen print, embroidery, DTG, leather patch
- **Production Packs**: Auto-generated print-ready files and spec PDFs
- **Admin Dashboard**: Product, order, and pricing management
- **Stripe Integration**: Secure payment processing
- **Order Tracking**: Real-time production status updates

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL database
- Stripe for payments
- JWT authentication
- Bull queue for background jobs

### Frontend
- React 18 + TypeScript
- Vite for fast development
- TailwindCSS for styling
- Zustand for state management
- Fabric.js for canvas customizer
- React Router for navigation

## Project Structure

```
raspberry/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, error handling
│   │   ├── models/         # TypeScript type definitions
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   ├── workers/        # Background job processors
│   │   └── index.ts        # App entry point
│   ├── migrations/         # Database migrations
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # Zustand stores
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Helper functions
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── specs/
│   └── raspberry-spec.md   # Full project specification
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis (for background jobs)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   cd ~/Documents/demo1
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Database Setup

1. **Create PostgreSQL database**
   ```bash
   createdb raspberry
   ```

2. **Configure environment variables**
   ```bash
   cd backend
   cp .env.example .env
   ```

   Edit `.env` and update:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - Other configuration as needed

3. **Run migrations**
   ```bash
   npm run migrate
   ```

   This will:
   - Create all database tables
   - Set up indexes and triggers
   - Insert seed data (admin user, decoration methods, sample products)

### Frontend Configuration

```bash
cd frontend
cp .env.example .env
```

Edit `.env` and update:
- `VITE_API_URL`: Backend API URL (default: http://localhost:3001)
- `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on http://localhost:3001

2. **Start the frontend development server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on http://localhost:3000

3. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - Health check: http://localhost:3001/health

## Default Credentials

After running migrations, you can log in to the admin panel with:
- **Email**: admin@raspberry.com
- **Password**: admin123

**⚠️ IMPORTANT**: Change this password in production!

## API Endpoints

### Public Endpoints
```
GET  /api/products          - List all products
GET  /api/products/:id      - Get product details
POST /api/price/quote       - Calculate price quote
POST /api/orders/create     - Create new order
GET  /api/orders/:id        - Get order details
POST /api/uploads/signed-url - Get S3 signed URL
```

### Protected Endpoints (Admin)
```
POST   /api/admin/products           - Create product
PUT    /api/admin/products/:id       - Update product
DELETE /api/admin/products/:id       - Delete product
GET    /api/admin/orders             - List all orders
PATCH  /api/admin/orders/:id/status  - Update order status
```

### Webhooks
```
POST /api/webhooks/production-update - Printer webhook
POST /api/webhooks/stripe            - Stripe webhook
```

## Database Schema

### Core Tables
- `users` - Admin and fulfillment users
- `customers` - Customer accounts
- `products` - Product catalog
- `variants` - Product variants (color/size combinations)
- `decoration_methods` - Decoration options and pricing
- `price_rules` - Quantity-based pricing rules
- `orders` - Customer orders
- `order_items` - Line items with customization specs
- `assets` - Uploaded files and artwork
- `order_status_history` - Audit trail

See `backend/migrations/001_initial_schema.sql` for complete schema.

## MVP Scope - First Sprint

The initial implementation focuses on:

1. **Product**: Classic t-shirt in 2 colors, 5 sizes
2. **Decoration**: Screen print with color-count pricing
3. **Placements**: Front chest and back center
4. **Design Tools**: Artwork upload (PNG/SVG) and text tool
5. **Pricing**: Live price with quantity breaks
6. **Payment**: Stripe checkout
7. **Output**: Production pack (ZIP with mockup, artwork, spec PDF)

## Next Steps for Development

### Phase 1: Complete MVP
- [ ] Implement customizer component with Fabric.js
- [ ] Build price calculation service
- [ ] Create production pack generator
- [ ] Integrate Stripe checkout
- [ ] Implement order tracking

### Phase 2: Enhanced Features
- [ ] Add embroidery with stitch count estimation
- [ ] Support sleeve placements
- [ ] Add more product types (hoodie, polo, cap)
- [ ] Customer accounts and saved designs
- [ ] Discount codes

### Phase 3: Admin & Operations
- [ ] Admin dashboard UI
- [ ] Product management interface
- [ ] Order management tools
- [ ] Bulk product import
- [ ] Analytics and reporting

## Development Commands

### Backend
```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Run compiled production build
npm run migrate      # Run database migrations
npm run lint         # Lint TypeScript files
npm test             # Run tests
```

### Frontend
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
npm run type-check   # TypeScript type checking
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/raspberry
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
USE_LOCAL_STORAGE=true
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use a production PostgreSQL database
3. Set secure `JWT_SECRET`
4. Configure production Stripe keys
5. Set up Redis for Bull queues
6. Configure S3 for file storage
7. Enable SSL/HTTPS

### Frontend
1. Build with `npm run build`
2. Serve `dist` folder with a web server
3. Set production API URL
4. Use production Stripe publishable key

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and tests
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on the repository.

---

Built with ❤️ using React, Node.js, and PostgreSQL
