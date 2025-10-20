# Raspberry - Local Testing Guide

This guide will walk you through testing the complete Raspberry application locally.

## Prerequisites

Before testing, ensure you have:
- [ ] PostgreSQL installed and running
- [ ] Node.js 18+ installed
- [ ] Completed the setup in QUICKSTART.md

## Step 1: Database Setup

```bash
# Create database
createdb raspberry

# Navigate to backend
cd backend

# Copy environment file
cp .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/raspberry
JWT_SECRET=your-super-secret-jwt-key-for-testing
STRIPE_SECRET_KEY=sk_test_51xxx  # Use Stripe test key
USE_LOCAL_STORAGE=true
LOCAL_STORAGE_PATH=./uploads
```

```bash
# Run migrations
npm run migrate
```

Expected output:
```
Executing: 001_initial_schema.sql
✅ 001_initial_schema.sql completed

Executing: 002_seed_data.sql
✅ 002_seed_data.sql completed

✅ All migrations completed successfully!
```

## Step 2: Configure Frontend

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51xxx  # Use Stripe test publishable key
```

## Step 3: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 4: Start Development Servers

Open TWO terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Raspberry API Server running on port 3001
📍 Environment: development
🔗 API URL: http://localhost:3001
✅ Database connected
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.0.11  ready in 1234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## Step 5: Test the Application

### Test 1: View Homepage
1. Open browser to http://localhost:3000
2. You should see the Raspberry homepage with hero section
3. Check that navigation works (Products, About links)

✅ **Expected**: Homepage loads with navigation

### Test 2: Browse Products
1. Click "Products" in navigation or "Start Designing" button
2. You should see "Classic Cotton T-Shirt" product card
3. Product should show "From $12.99" and "10 variants"

✅ **Expected**: Product listing shows seed data

### Test 3: Customize Product
1. Click "Customize Now" on the t-shirt
2. Select a **Color** (Black or White)
3. Select a **Size** (S, M, L, XL, or 2XL)
4. Select **Decoration Method** (Screen Print, Embroidery, or Direct to Garment)
5. Select **Placement Location** (Front Chest or Back Center)
6. Upload an image file (PNG, JPG, SVG, or PDF)
   - OR add text in the text box and click "Add"
7. Set **Quantity** (try 1, then 12, then 24 to see price breaks)
8. Watch the price update in real-time

✅ **Expected**:
- All options selectable
- File uploads successfully
- Price calculates automatically
- Quantity discounts apply at 12+ and 24+ items

**Example Pricing (Screen Print):**
- 1x Black T-Shirt (M): Base $12.99 + Decoration ~$8.00 = ~$21.00
- 12x: Base $12.99 + Decoration ~$6.80 (15% discount) = ~$238.00 total
- 24x: Base $12.99 + Decoration ~$5.60 (30% discount) = ~$445.00 total

### Test 4: Add to Cart
1. After customizing, click "Add to Cart"
2. Should redirect to cart page
3. Cart should show your customized item with correct pricing

✅ **Expected**: Item appears in cart with customization details

### Test 5: Cart Management
1. In cart, try changing quantity
2. Click "Remove" to test removal
3. Add multiple items with different customizations
4. Check total calculations

✅ **Expected**: Cart updates correctly

### Test 6: Checkout Flow (Requires Stripe Test Keys)

**Note**: You need Stripe test API keys for this test.

1. Click "Proceed to Checkout" from cart
2. Fill in customer information:
   - Email: test@example.com
   - Name: John Doe
   - Phone: (555) 123-4567
3. Fill in shipping address:
   - Address: 123 Main St
   - City: San Francisco
   - State: CA
   - ZIP: 94102
4. Enter Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
5. Click "Pay $XX.XX"

✅ **Expected**:
- Form validates all fields
- Payment processes successfully
- Redirects to order tracking page

### Test 7: Order Tracking
1. After successful checkout, you'll be on `/orders/RB-xxxxx-xxxxx`
2. Should see:
   - Order number
   - Status indicators (Payment, Production, Shipped)
   - Order items
   - Shipping address
   - Order summary

✅ **Expected**: Complete order details displayed

### Test 8: API Endpoints

Test backend API directly:

```bash
# Get products
curl http://localhost:3001/api/products

# Get specific product
curl http://localhost:3001/api/products/classic-tee

# Check health
curl http://localhost:3001/health
```

✅ **Expected**: JSON responses with product data

## Common Issues & Solutions

### Issue: "Failed to load products"
**Solution**:
- Check backend server is running (Terminal 1)
- Verify database connection in backend/.env
- Check database has seed data: `psql raspberry -c "SELECT * FROM products;"`

### Issue: "Database connection error"
**Solution**:
- Ensure PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in backend/.env
- Verify database exists: `psql -l | grep raspberry`

### Issue: "Stripe payment fails"
**Solution**:
- Use Stripe test keys (start with `pk_test_` and `sk_test_`)
- Use test card number: `4242 4242 4242 4242`
- For testing failures, use: `4000 0000 0000 0002`

### Issue: "File upload fails"
**Solution**:
- Check backend/uploads directory exists
- Verify file size under 10MB
- Check file type is PNG, JPG, SVG, or PDF

### Issue: "Price not calculating"
**Solution**:
- Ensure you've selected: color, size, method, placement, and added artwork/text
- Check browser console for errors (F12)
- Verify decoration methods exist in database

### Issue: "Port 3000 or 3001 in use"
**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

## Test Data Reference

### Seeded Products
- **Product**: Classic Cotton T-Shirt
- **Colors**: Black, White
- **Sizes**: S, M, L, XL, 2XL
- **Base Price**: $12.99 (S/M/L), $13.99 (XL), $14.99 (2XL)

### Decoration Methods
1. **Screen Print**
   - Base: $5.00
   - Per color: $1.50
   - Per location: $3.00
   - Quantity breaks at 12, 24, 50

2. **Embroidery**
   - Base: $8.00
   - Per 1000 stitches: $0.50
   - Per location: $5.00
   - Quantity breaks at 12, 24

3. **Direct to Garment (DTG)**
   - Base: $10.00
   - Per sq inch: $0.15
   - Per location: $6.00
   - Quantity breaks at 6, 12

### Admin Credentials
- Email: admin@raspberry.com
- Password: admin123
- (Currently no admin UI, but credentials work for API)

## Stripe Test Cards

For testing different scenarios:

| Card Number          | Scenario                |
|---------------------|-------------------------|
| 4242 4242 4242 4242 | Success                |
| 4000 0000 0000 0002 | Card declined          |
| 4000 0000 0000 9995 | Insufficient funds     |
| 4000 0000 0000 9987 | Lost card              |

## Test Checklist

- [ ] Homepage loads
- [ ] Products page shows seed data
- [ ] Product customizer loads
- [ ] Can select color, size, method
- [ ] Can upload file
- [ ] Can add text
- [ ] Price calculates correctly
- [ ] Quantity discounts apply
- [ ] Can add to cart
- [ ] Cart displays items
- [ ] Can update cart quantities
- [ ] Checkout form validates
- [ ] Stripe payment processes
- [ ] Order confirmation shows
- [ ] Order tracking works
- [ ] API endpoints respond

## Performance Benchmarks

Expected response times (local):
- Homepage: < 100ms
- Product listing: < 200ms
- Product detail: < 150ms
- Price calculation: < 200ms
- File upload (1MB): < 500ms
- Order creation: < 300ms
- Payment processing: 1-3 seconds (Stripe)

## Next Steps After Testing

Once local testing is complete:
1. Review code for production readiness
2. Set up production database
3. Configure production Stripe keys
4. Set up S3 for file storage
5. Deploy backend to hosting service
6. Deploy frontend to CDN/hosting
7. Set up monitoring and logging

## Getting Help

If you encounter issues:
1. Check terminal output for error messages
2. Check browser console (F12 → Console tab)
3. Review this testing guide
4. Check README.md for setup instructions
5. Verify all environment variables are set correctly

---

🎉 **Congratulations!** If all tests pass, your Raspberry application is working correctly and ready for further development or deployment.
