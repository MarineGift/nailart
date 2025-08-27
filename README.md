# ConnieNail - Luxury Nail Salon Management System

## Overview
ConnieNail is a comprehensive web-based management platform for a premium nail salon located in Washington, DC. The application serves as a complete business solution handling appointment bookings, customer relationship management, staff scheduling, payment processing, and business analytics.

## Features
- 🏠 **Homepage** - Elegant carousel and service showcase
- 💅 **Services** - Service catalog with pricing
- 📅 **Booking** - Complete appointment booking system
- 🎨 **Gallery** - Nail art showcase
- 🤖 **AI Nail Art** - AI-powered custom designs
- 📞 **Contact** - Customer inquiry forms
- ⚙️ **Admin Dashboard** - Management panel

## Tech Stack
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS with gradient themes
- **Icons**: Lucide React
- **Deployment**: Vercel

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in your credentials:
```bash
cp .env.example .env.local
```

### 3. Database Setup
1. Create a Supabase account and project
2. Get your database URL from Supabase dashboard
3. Update `DATABASE_URL` in `.env.local`

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

## Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

## License
MIT License