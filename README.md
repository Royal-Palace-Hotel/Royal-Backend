# Royal Palace Antsirabe - Backend API

Complete backend API for the Royal Palace Antsirabe hotel website, built with Node.js, TypeScript, Express, mysql2, and MySQL 8.

## 🚀 Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database driver**: mysql2/promise
- **Database**: MySQL 8
- **Validation**: Zod
- **Authentication**: JWT (bcryptjs)
- **Email**: Resend
- **Dev Tools**: nodemon, tsx

## 📋 Prerequisites

- Node.js 18+ and npm
- MySQL 8, or Docker Compose
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

Edit `.env` with your local MySQL connection and service credentials:

```env
# Database (MySQL 8)
DATABASE_URL="mysql://royal:royal@127.0.0.1:3306/royal_palace"
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=royal_palace
MYSQL_USER=royal
MYSQL_PASSWORD=royal

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxx"
FROM_EMAIL="noreply@royalpalaceantsirabe.com"

# Server
PORT=4000
NODE_ENV=development
```

### 3. Start MySQL and initialize the database

```bash
docker compose up -d
```

The Compose service initializes an empty database from `db/schema.sql`. For a MySQL server initialized without Docker, run:

```bash
npm run db:init
```

### 4. Seed Initial Content

```bash
npm run db:seed
```

Create the first admin account interactively with `npm run create-admin`.

### Existing database migration

For a database created before editable room and event-room content was added, run these statements once before starting the updated API. Fresh databases receive the same columns from `db/schema.sql`.

```sql
ALTER TABLE rooms
  ADD COLUMN name VARCHAR(191) NULL,
  ADD COLUMN name_en VARCHAR(191) NULL,
  ADD COLUMN description TEXT NULL,
  ADD COLUMN description_en TEXT NULL;

ALTER TABLE event_rooms
  ADD COLUMN name VARCHAR(191) NULL,
  ADD COLUMN name_en VARCHAR(191) NULL,
  ADD COLUMN description TEXT NULL,
  ADD COLUMN description_en TEXT NULL,
  ADD COLUMN capacity INT NULL,
  ADD COLUMN schedule VARCHAR(191) NULL,
  ADD COLUMN price DECIMAL(10,2) NULL,
  ADD COLUMN currency VARCHAR(8) NULL;
```

The new columns are nullable so existing seeded rows continue to use their frontend translation keys. Create the initial administrator with `npm run create-admin`; then sign in at `/admin/login` in the frontend.

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:4000`

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

### Admin API (requires `Authorization: Bearer <token>`)
- Rooms: `GET/POST /api/admin/rooms`, `GET/PUT/DELETE /api/admin/rooms/:id`
- Menu sections/items: CRUD at `/api/admin/menu/sections` and `/api/admin/menu/items`
- Event rooms: CRUD at `/api/admin/event-rooms`
- Bookings: `GET /api/admin/bookings` (optional `status`, `from`, and `to` filters), `PATCH /api/admin/bookings/:id`
- Contact messages: `GET /api/admin/contact-messages` (optional `type` and `status` filters), `PATCH /api/admin/contact-messages/:id`

## 🏗️ Project Structure

```
Royal-Backend/
├── db/
│   ├── schema.sql           # MySQL schema
│   ├── seed.sql             # Idempotent content seed
│   └── run-sql.ts           # Windows-friendly SQL runner
├── src/
│   ├── server.ts             # Main server entry point
│   ├── config/db.ts          # mysql2 connection pool
│   ├── middleware/           # Express middleware
│   │   ├── errorHandler.ts   # Global error handling
│   │   └── validate.ts       # Zod validation middleware
│   ├── modules/              # Feature modules
│   │   ├── bookings/         # Booking system
│   │   ├── content/          # Content API (rooms, menu, etc.)
│   │   ├── contact/          # Contact & event inquiries
│   │   ├── newsletter/       # Newsletter subscriptions
│   │   └── auth/             # Authentication & authorization
│   ├── types/database.ts     # SQL row interfaces
│   └── utils/email.ts        # Email service (Resend)
├── docker-compose.yml
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🗄️ Database Schema

The MySQL schema creates these tables:

- `rooms`, `room_images`, and `room_amenities`
- `bookings`
- `menu_sections` and `menu_items`
- `spa_treatments` and `event_rooms`
- `contact_messages` (contact and event inquiry types)
- `newsletter_subscribers` and `admin_users`

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

- `DATABASE_URL` - MySQL connection string (`mysql://user:password@host:3306/royal_palace`)
- `JWT_SECRET` - A secure random string (use a different value than dev)
- `RESEND_API_KEY` - Your Resend API key
- `FROM_EMAIL` - Verified sender email in Resend
- `NODE_ENV=production`
- `PORT` - Port number (default: 4000)

## 🐛 Troubleshooting

### Database Connection Issues

- Ensure your `DATABASE_URL` uses the `mysql://` protocol and points to an active MySQL 8 server
- Confirm the database and user in the connection URL exist and have access to the schema
- For Docker, check the service with `docker compose ps` and review logs with `docker compose logs mysql`

### Email Not Sending

- Verify your `RESEND_API_KEY` is valid
- Ensure `FROM_EMAIL` is verified in your Resend account
- Check Resend dashboard for email logs

### CORS Errors

- Update the CORS origin in `src/server.ts` to include your frontend domain
- For local development, ensure Vite dev server is on port 5173 or 3000

## 📝 Development Notes

- The API uses Zod for request validation
- All endpoints return JSON responses
- Errors include detailed messages in development mode
- SQL statements use parameterized values

## 🤝 Connecting to Frontend

The frontend should be configured with:

```env
VITE_API_URL=http://localhost:4000/api
```

For production, update this to your backend API URL.

## 📄 License

ISC
