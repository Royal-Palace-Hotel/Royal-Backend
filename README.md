# Royal Palace Antsirabe - Backend API

Complete backend API for the Royal Palace Antsirabe hotel website, built with Node.js, TypeScript, Express, Prisma, and PostgreSQL (Neon).

## 🚀 Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **ORM**: Prisma v5
- **Database**: PostgreSQL (hosted on Neon)
- **Validation**: Zod
- **Authentication**: JWT (bcryptjs)
- **Email**: Resend
- **Dev Tools**: nodemon, tsx

## 📋 Prerequisites

- Node.js 18+ and npm
- A Neon PostgreSQL account (free tier available)
- A Resend account for email notifications (free tier available)

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxx"
FROM_EMAIL="noreply@royalpalaceantsirabe.com"

# Server
PORT=3001
NODE_ENV=development
```

#### Getting Your Neon Database URL

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project or select existing one
3. Copy the connection string from the dashboard
4. It should look like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

#### Getting Your Resend API Key

1. Go to [Resend Console](https://resend.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `re_`)

### 3. Initialize Database

Generate Prisma client and push schema to database:

```bash
npm run prisma:generate
npx prisma db push
```

### 4. Seed Initial Data

Populate the database with rooms, menu items, spa treatments, event rooms, and admin user:

```bash
npm run prisma:seed
```

**Default Admin Credentials:**
- Email: `admin@royalpalaceantsirabe.com`
- Password: `admin123`

⚠️ **Important**: Change the default admin password after first login!

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### Content API
- `GET /api/content/rooms` - Get all rooms
- `GET /api/content/menu` - Get restaurant menu (with sections and items)
- `GET /api/content/spa` - Get spa treatments
- `GET /api/content/events` - Get event rooms
- `GET /api/content/gallery` - Get gallery images (placeholder)
- `GET /api/content/discover` - Get discover content (placeholder)

### Booking API
- `POST /api/bookings/availability` - Check room availability
  ```json
  {
    "checkIn": "2024-12-01",
    "checkOut": "2024-12-05",
    "rooms": 1
  }
  ```
- `POST /api/bookings` - Create a booking
  ```json
  {
    "guestName": "John Doe",
    "guestEmail": "john@example.com",
    "guestPhone": "+261 34 49 040 40",
    "checkIn": "2024-12-01",
    "checkOut": "2024-12-05",
    "rooms": 1,
    "adults": 2,
    "children": 0,
    "roomId": "superior"
  }
  ```

### Contact API
- `POST /api/contact` - Send contact message
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+261 34 49 040 40",
    "subject": "Room Inquiry",
    "message": "I would like to book a room..."
  }
  ```
- `POST /api/contact/event-inquiry` - Send event inquiry
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+261 34 49 040 40",
    "subject": "Wedding",
    "message": "Planning a wedding...",
    "eventDate": "2024-12-15",
    "guestCount": "100"
  }
  ```

### Newsletter API
- `POST /api/newsletter` - Subscribe to newsletter
  ```json
  {
    "email": "john@example.com"
  }
  ```

### Auth API (Admin)
- `POST /api/auth/login` - Admin login
  ```json
  {
    "email": "admin@royalpalaceantsirabe.com",
    "password": "admin123"
  }
  ```
- `POST /api/auth/register` - Register new admin user
- `GET /api/auth/me` - Get current user (requires JWT token)

## 🏗️ Project Structure

```
Royal-Backend/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── middleware/           # Express middleware
│   │   ├── errorHandler.ts   # Global error handling
│   │   └── validate.ts       # Zod validation middleware
│   ├── modules/              # Feature modules
│   │   ├── bookings/         # Booking system
│   │   ├── content/          # Content API (rooms, menu, etc.)
│   │   ├── contact/          # Contact & event inquiries
│   │   ├── newsletter/       # Newsletter subscriptions
│   │   └── auth/             # Authentication & authorization
│   └── utils/
│       ├── db.ts             # Prisma client
│       └── email.ts          # Email service (Resend)
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data script
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🗄️ Database Schema

The database includes the following models:

- **Room** - Hotel rooms with pricing, amenities, and images
- **Booking** - Booking requests with guest info and date ranges
- **MenuSection** & **MenuItem** - Restaurant menu (bilingual)
- **SpaTreatment** - Spa treatments with pricing
- **EventRoom** - Event/conference rooms
- **ContactMessage** - Contact form submissions
- **EventInquiry** - Event inquiry forms
- **NewsletterSubscriber** - Newsletter subscriptions
- **AdminUser** - Admin/staff users for backend access

## 📧 Email Notifications

The backend automatically sends email notifications to hotel staff (`royalpalace.resa@moov.mg`) when:

- A new booking is created
- A contact message is submitted
- An event inquiry is received

Emails are sent via Resend. Make sure your `RESEND_API_KEY` and `FROM_EMAIL` are configured in `.env`.

## 🔒 Authentication

Admin endpoints use JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Run Production Server

```bash
npm start
```

### Environment Variables for Production

Make sure to set these in your production environment:

- `DATABASE_URL` - Your Neon connection string
- `JWT_SECRET` - A secure random string (use a different value than dev)
- `RESEND_API_KEY` - Your Resend API key
- `FROM_EMAIL` - Verified sender email in Resend
- `NODE_ENV=production`
- `PORT` - Port number (default: 3001)

## 🐛 Troubleshooting

### Database Connection Issues

- Ensure your `DATABASE_URL` is correct and includes `?sslmode=require`
- Check that your Neon project is active
- Verify your Neon connection limits (free tier has connection limits)

### Email Not Sending

- Verify your `RESEND_API_KEY` is valid
- Ensure `FROM_EMAIL` is verified in your Resend account
- Check Resend dashboard for email logs

### CORS Errors

- Update the CORS origin in `src/index.ts` to include your frontend domain
- For local development, ensure Vite dev server is on port 5173 or 3000

## 📝 Development Notes

- The API uses Zod for request validation
- All endpoints return JSON responses
- Errors include detailed messages in development mode
- Database queries are logged in development mode

## 🤝 Connecting to Frontend

The frontend should be configured with:

```env
VITE_API_URL=http://localhost:3001/api
```

For production, update this to your backend API URL.

## 📄 License

ISC
