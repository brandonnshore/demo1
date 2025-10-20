# Raspberry - Custom Clothing Ecommerce Site Specification

Build a single brand ecommerce site with a live clothing customizer. Customers pick a base blank, apply art or text, choose placement, and see instant price updates. Orders flow to one printer or one 3PL with clear production tickets and print ready files. Keep the stack simple and the scope strict.

## Core Goals

1. Ship a working customizer with accurate previews and pricing
2. Accept payments and create clean production tickets with all specs
3. Let you manage products, pricing, assets, and orders from a simple admin
4. Keep first release small and fast so you can demo and sell

## Users and Permissions

1. **Customer buyer** - Can browse, customize, and purchase
2. **Admin owner** - Full control over products, orders, and settings
3. **Fulfillment user** - Read only access for assigned orders

## Customer Flow

1. Landing → Product List → Product Detail
2. Configure item in customizer
3. Add to cart → Checkout → Confirmation
4. Receive order tracking page and email/text updates

## Customizer Requirements

### Base Selection
- **Products**: Hoodie, Polo, Tee, Cap
- **Options**: Color and Size selection

### Decoration Options
- **Methods**: Screen print, Embroidery, Leather patch, Direct to garment
- **Placements**: Front chest, Back center, Sleeve left, Sleeve right, Cap front, Cap side
- **Artwork**: Upload PNG, SVG, PDF, AI (if vector)
- **Text Tool**: Font picker, Size control, Letter spacing, Curved text toggle, Color selection

### Price Logic
- Live price based on:
  - Method, colors, placements
  - Stitch count or print area breakpoints
  - Garment size
- Quantity-based price breaks in cart and product page

### Preview
- Live mockup with front/back views and zoom
- Alignment guides and safe zones
- Warnings for low resolution art and missing fonts

### Output
- Pretty mockup JPEG for customer
- Production pack for printer:
  - Vectors or high-res art
  - Spec sheet with all details

## Checkout and Payment

- Card and wallet through tokenized gateway (Stripe)
- Tax and shipping rate calculation
- Email and optional text notifications for:
  - Order placed
  - Order shipped
- Discount codes and gift cards (later phase)

## Fulfillment and Production

### Printer Integration
- Single printer using webhook or email bridge
- Generate production pack per line item

### Production Pack Contents
1. Files (original and print ready)
2. Method specification
3. Pantone or hex colors
4. Placement coordinates and size (inches/cm)
5. Stitch count estimate (embroidery) or color count (screen print)
6. Notes and special instructions

### Status Updates
- Pending → In Production → Shipped
- Tracking number capture

## Admin Essentials

### Products
- CRUD for products and variants
- Price tables for quantity breaks and method surcharges
- Decoration rules per product (e.g., cap only embroidery)

### Assets
- Logo library with versioning
- Auto background removal for mockups (optional)

### Orders
- Search and filter
- Resend production pack
- Manual status override

### Settings
- Payments, shipping, tax configuration
- Brand theme (colors, logos, typography)
- Legal pages and contact info

## Data Model

### Core Tables

```sql
Product
- id, title, slug, description, images, materials, weight, country_of_origin, status

Variant
- id, product_id, color, size, sku, base_cost, base_price, stock_level

DecorMethod
- id, name, allowed_products, pricing_rules (JSON), file_requirements (JSON)

PriceRule
- id, product_or_method, scope, min_qty, max_qty, formula (JSON)

Order
- id, number, customer_id, totals, tax, shipping, payment_status, production_status, tracking, metadata (JSON)

OrderItem
- id, order_id, variant_id, qty, unit_price, custom_spec (JSON), production_pack_url

Asset
- id, owner_type, owner_id, file_url, file_type, original_name, hash

Customer
- id, email, name, phone, addresses (JSON)
```

## Production Pack Specification

1. **Mockup images**: Front and back at 2000px or higher
2. **Artwork**: Vector or 300 DPI raster at print size
3. **Spec Sheet PDF**:
   - Order number and item line
   - Garment details (SKU, color, size, quantity)
   - Method and settings
   - Placement rectangle (origin top-left in inches: x, y, width, height)
   - Color callouts (Pantone or hex)
   - Notes
4. **JSON payload**: Mirror of spec for API partners

## Public Pages

1. **Home**: Hero, best sellers, how it works
2. **Catalog**: Filters for product family, color, price
3. **Product Detail**: Customizer and price preview
4. **Cart & Checkout**
5. **Order Tracking**
6. **About, FAQ, Policy pages**

## Technical Architecture

### Frontend
- React application with TypeScript
- Product detail page mounts Customizer component
- State machine for customizer steps, validations, price updates
- Canvas-based rendering (Fabric.js or Konva.js)
- Export to PNG for mockups

### Backend
- Node.js with Express
- REST or GraphQL API for:
  - Products, orders, pricing, uploads
- Background worker for production pack generation
- Webhook endpoint for printer status updates

### Storage
- Object storage (S3 or local) for assets, mockups, packs
- PostgreSQL for catalog and orders

### Security
- JWT or session auth for admin
- File scanning on upload with size limits
- Rate limiting and CORS configuration

## API Endpoints

```
POST /auth/login
GET /products
GET /products/:id
POST /uploads/signed-url
POST /price/quote
POST /orders/create
POST /orders/:id/capture-payment
GET /orders/:id
POST /webhooks/production-update
```

## Pricing Logic Example

1. Start with variant base_price
2. Add method surcharge
3. Add per color/square inch/stitch tier
4. Apply quantity break for line item qty
5. Recalculate on every config change

## MVP Scope - First Sprint

1. **Products**: One garment family, two colors, five sizes
2. **Method**: Screen print with color count pricing, front/back placements
3. **Design Tools**: Artwork upload (PNG/SVG) and text tool
4. **Pricing**: Live price with one quantity break
5. **Payment**: Stripe checkout
6. **Output**: Production pack as zipped files with spec PDF

## Next Sprint Features

- Embroidery with stitch count estimate
- Sleeve placements and cap product
- Saved designs and customer accounts
- Discount codes
- Admin bulk product import

## Acceptance Criteria

1. Customer can create design with 2+ placements, see correct live price within 200ms
2. Checkout completes and creates order + production pack within 30 seconds
3. Printer receives complete pack per line item passing 10-point checklist
4. Admin can edit price tables, customizer reflects changes without code deploy
5. Order tracking shows status and tracking number

## Quick Start Command for Claude Code

```bash
cd ~/Documents
claude-code "Build a single brand ecommerce site called 'raspberry' with a live clothing customizer. Customers pick a product, upload art or add text, choose a placement, and see live price updates. On checkout the app creates a production pack that includes mockups, print ready art, and a spec PDF with exact placement coordinates and color callouts. Provide a basic admin for products, price tables, orders, and theme. Use a tokenized payment gateway and a simple webhook to send status updates from a single printer partner. Generate database migrations, an OpenAPI spec, a React Customizer component that renders to canvas and exports mockups, and a background worker that assembles the production pack."
```

## Development Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install` in both frontend and backend
3. Set up PostgreSQL database
4. Run migrations: `npm run migrate`
5. Configure environment variables (.env file)
6. Start development servers: `npm run dev`
7. Access frontend at http://localhost:3000
8. Access API at http://localhost:3001

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/raspberry
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
S3_BUCKET=raspberry-assets
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=...
SMTP_PASS=...
```