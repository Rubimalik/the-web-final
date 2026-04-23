# BuySupply

BuySupply is a UK-based e-commerce platform specializing in photocopiers, printers, and consumables. The platform allows customers to buy, sell, and recycle office equipment with nationwide collection and fast delivery.

## Features

- **Product Management**: Full CRUD operations for products with image uploads
- **Natural Image Sorting**: Images are sorted by filename in natural numerical order (IMG_1, IMG_2, IMG_3, IMG_10, IMG_11)
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
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Iron-session for session management
- **File Upload**: Uploadthing for image handling
- **Fonts**: Custom Myriad Pro and Roboto fonts
- **Deployment**: Ready for Vercel, Netlify, or other platforms

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Rubimalik/buysupply.git
cd buysupply
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Configure your database URL and other environment variables
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Seed the database (optional):
```bash
npx prisma db seed
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

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
  prisma/                 # Database schema and migrations
  public/                 # Static assets
```

## Key Features

### Natural Image Sorting

The application includes a custom natural sorting algorithm that ensures images are displayed in the correct numerical sequence:

- **Before**: `IMG_1.jpg, IMG_10.jpg, IMG_2.jpg, IMG_3.jpg` (lexicographic)
- **After**: `IMG_1.jpg, IMG_2.jpg, IMG_3.jpg, IMG_10.jpg` (natural numerical)

This sorting is applied in both the admin panel and public product pages.

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

## Deployment

The application is ready for deployment on any platform that supports Next.js:

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Other Platforms

1. Build the application: `npm run build`
2. Upload the `.next` folder and `public` folder
3. Configure environment variables

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
"# the-web-final" 
"# the-web-final" 
"# the-web-final" 
