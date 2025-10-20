# 🚀 START HERE - Raspberry Local Setup

Welcome! This guide will get you from zero to a running Raspberry application in **10 minutes**.

## ✅ What's Been Built

A complete custom clothing ecommerce platform with:
- ✅ Backend API (Node.js + Express + PostgreSQL)
- ✅ Frontend (React + TypeScript + Tailwind CSS)
- ✅ Live product customizer
- ✅ Real-time price calculation
- ✅ Stripe payment processing
- ✅ Order management & tracking
- ✅ File upload system
- ✅ Database with seed data

## 🎯 Quick Start (3 Steps)

### 1. Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Setup Database

```bash
# Create database
createdb raspberry

# Configure environment
cd backend
cp .env.example .env
```

Edit `backend/.env` - **Update this line**:
```env
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/raspberry
```

```bash
# Run migrations (creates tables + adds seed data)
npm run migrate
```

### 3. Start Servers

**Terminal 1:**
```bash
cd backend
npm run dev
```

**Terminal 2:**
```bash
cd frontend
npm run dev
```

### 4. Test It!

Open browser → http://localhost:3000

You should see:
- ✅ Raspberry homepage
- ✅ Click "Products" → See "Classic Cotton T-Shirt"
- ✅ Click "Customize Now" → Full customizer interface

## 🧪 Quick Test Flow

1. **Browse Products**: http://localhost:3000/products
2. **Customize**: Select color, size, decoration method
3. **Upload**: Add artwork or text
4. **Price**: Watch real-time price updates
5. **Cart**: Add to cart
6. **Checkout**: Fill form, use test card `4242 4242 4242 4242`
7. **Track**: View order status

## 📋 What Each Part Does

### Backend (`/backend`)
- **Port**: 3001
- **API**: http://localhost:3001/api
- **Handles**: Products, orders, pricing, uploads, payments

### Frontend (`/frontend`)
- **Port**: 3000
- **UI**: http://localhost:3000
- **Pages**: Home, Products, Customizer, Cart, Checkout, Tracking

### Database (`raspberry`)
**Seed data includes**:
- 1 product (Classic T-Shirt)
- 10 variants (2 colors × 5 sizes)
- 3 decoration methods (Screen Print, Embroidery, DTG)
- Admin user (admin@raspberry.com / admin123)

## 🎨 Key Features to Test

### 1. Live Customizer
- Select color/size
- Choose decoration method (Screen Print, Embroidery, DTG)
- Upload artwork (PNG, JPG, SVG, PDF)
- Add text with color picker
- Real-time price calculation

### 2. Dynamic Pricing
- **Base price**: $12.99-$14.99 (varies by size)
- **Decoration**: $5-$10 (varies by method)
- **Quantity discounts**:
  - 12-23 items: 10-15% off
  - 24-49 items: 15-30% off
  - 50+ items: 20-40% off

### 3. Shopping Cart
- Add multiple customized items
- Update quantities
- Remove items
- Persistent (saved to localStorage)

### 4. Checkout
- Customer information form
- Shipping address
- Stripe card payment
- Order confirmation

### 5. Order Tracking
- Payment status
- Production status
- Shipping status
- Order details

## 🔧 If Something Goes Wrong

### "Failed to load products"
- Backend not running? Check Terminal 1
- Database not migrated? Run `npm run migrate`

### "Database connection error"
- PostgreSQL running? Try `pg_isready`
- Check `DATABASE_URL` in backend/.env

### "Port already in use"
```bash
# Kill port 3001
lsof -ti:3001 | xargs kill -9

# Kill port 3000
lsof -ti:3000 | xargs kill -9
```

### "Stripe payment fails"
- Using test keys? Should start with `pk_test_` and `sk_test_`
- Using test card? `4242 4242 4242 4242`

## 📚 Full Documentation

- **QUICKSTART.md** - Detailed setup instructions
- **README.md** - Complete project documentation
- **TESTING.md** - Comprehensive testing guide
- **specs/raspberry-spec.md** - Original project specification

## 🛠️ Project Structure

```
raspberry/
├── backend/              # Node.js API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   └── models/       # TypeScript types
│   ├── migrations/       # Database schema
│   └── uploads/          # Uploaded files
│
├── frontend/             # React app
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── services/     # API client
│   │   └── stores/       # State management
│   └── public/
│
└── specs/                # Documentation
```

## 🎯 What's Working

✅ **Backend**:
- Product API (GET /api/products)
- Price calculation (POST /api/price/quote)
- Order creation (POST /api/orders/create)
- File uploads (POST /api/uploads/file)
- Stripe integration
- PostgreSQL database

✅ **Frontend**:
- Product listing page
- Product customizer
- Cart with persistence
- Checkout flow
- Order tracking
- Responsive design

✅ **Features**:
- Real-time pricing
- Quantity discounts
- File uploads
- Multiple decoration methods
- Multiple placement locations
- Text and artwork support

## 🚧 What's Not Implemented (Future)

- Canvas-based visual preview (currently placeholder)
- Production pack PDF generation
- Email notifications
- SMS notifications
- Admin dashboard UI
- Customer accounts
- Saved designs
- Discount codes
- Embroidery stitch count estimation
- Background removal for mockups

## 🎓 Tech Stack

**Backend**:
- Node.js + Express
- TypeScript
- PostgreSQL
- Stripe
- Multer (file uploads)
- bcrypt (passwords)
- JWT (auth)

**Frontend**:
- React 18
- TypeScript
- Vite
- TailwindCSS
- Zustand (state)
- Axios (HTTP)
- Stripe Elements
- Lucide Icons

## 🔐 Security Notes

⚠️ **For Development Only**:
- Admin password is `admin123` - CHANGE IN PRODUCTION
- JWT secret is placeholder - SET SECURE VALUE
- Using test Stripe keys - SWITCH TO LIVE KEYS
- Local file storage - USE S3 IN PRODUCTION
- No rate limiting on uploads
- CORS allows all origins

## 🎉 You're Ready!

Your Raspberry application is fully functional and ready to test locally.

**Next Steps**:
1. Start both servers (backend + frontend)
2. Open http://localhost:3000
3. Click through the test flow
4. Review TESTING.md for detailed test cases
5. Customize and extend as needed

**Questions?**
- Check README.md for detailed docs
- Review TESTING.md for troubleshooting
- Check browser console for errors (F12)
- Check terminal output for backend logs

Happy coding! 🚀
