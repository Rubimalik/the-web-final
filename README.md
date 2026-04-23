# BuySupply

BuySupply is a UK-based e-commerce platform specializing in photocopiers, printers, and consumables. The platform allows customers to buy, sell, and recycle office equipment with nationwide collection and fast delivery.

## Features

- **Product Management**: Full CRUD operations for products with image uploads
- **Primary Image + Drag-and-Drop Ordering**: Admin users can reorder images and choose the primary product image
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Admin Dashboard**: Complete product management interface
- **Product Categories**: Organized product catalog with category support
- **Image Gallery**: Advanced image viewing with lightbox functionality
- **SEO Optimized**: Dynamic metadata and sitemap generation
- **Contact Forms**: Integrated enquiry and selling forms

## Tech Stack

- **Framework**: Next.js 16.1.6 with React 19.2.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase Postgres via direct `pg` access
- **Authentication**: Supabase Auth with iron-session admin sessions
- **File Upload**: Supabase Storage for product images
- **Fonts**: Custom Myriad Pro and Roboto fonts
- **Deployment**: Netlify via manual CLI flow with a documented runtime shim

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
```bash
git clone <your-github-repository-url>
cd buysupply
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Or use the separate local handoff env file if it was shared outside Git
```

4. Seed the database (optional):
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
my-app/
  app/                    # Next.js app router
    api/                  # API routes
    dashboard/            # Admin dashboard
    products/             # Product pages
  components/             # Reusable React components
    dashboard/            # Admin components
  lib/                    # Utility libraries
  scripts/                # Deploy, seed, and migration utilities
  public/                 # Static assets
```

## Key Features

### Product Image Management

Product images are driven by the admin ordering and primary-image selection:

- Drag-and-drop order is preserved on save
- The primary image is used as the product cover
- Public product pages and admin lists use the stored primary/order state

### Admin Dashboard

Access the admin dashboard at `/dashboard` to:
- Manage products (create, edit, delete)
- Upload and organize product images
- Manage categories
- View sales and enquiries

### Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop (1200px+)
- Tablet (768px-1199px)
- Mobile (<768px)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run netlify:manual:build` - Run `netlify build` and patch the generated server handler
- `npm run netlify:manual:deploy` - Upload the prepared Netlify build artifacts
- `npm run netlify:manual:release` - Build, deploy, and smoke-check production in one command
- `npm run netlify:smoke` - Verify the current production routes and auth guard responses
- `npm run seed` - Seed the default product categories

## Deployment

The current production path is Netlify, not Vercel.

Use these files as the source of truth before deploying:

- [NETLIFY_SETUP.md](./NETLIFY_SETUP.md)
- [NETLIFY_HANDOFF.md](./NETLIFY_HANDOFF.md)
- [PROJECT_TRANSFER.md](./PROJECT_TRANSFER.md)

### Netlify Manual Release

1. Export `NETLIFY_AUTH_TOKEN` in your shell.
2. Run `npm run netlify:manual:release`.
3. If you need the steps separately, use:
   `npm run netlify:manual:build`
   `npm run netlify:manual:deploy`
   `npm run netlify:smoke`

### Important Caveat

This repository uses a documented Netlify runtime workaround for Next.js 16. The post-build shim makes SSR and route handlers work on the current site, but ISR/data-cache behavior should still be treated as non-ideal until the app is moved to a cleaner hosting flow or the native runtime path is fixed.

### Current Backend Notes

- Product images are stored in `Supabase Storage`, bucket `product-images`
- Admin login is backed by `Supabase Auth`
- The app data layer runs directly against Supabase Postgres
- `UploadThing` is no longer part of the active runtime path

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit and push to your branch
5. Create a pull request

## License

This project is proprietary and owned by BuySupply UK.

## Contact

- **Website**: [https://buysupply.me](https://buysupply.me)
- **Email**: sales@buysupply.me
- **Phone**: 01753971125

---

Built with Next.js, React, and Tailwind CSS
