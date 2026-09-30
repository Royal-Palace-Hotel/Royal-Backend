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

## Local development setup

Prerequisites: Node.js 18+ and Docker with its engine running. `db:init` starts the Compose MySQL service automatically when no local MySQL server is reachable. It also works with a running MySQL server configured through `DATABASE_URL`. No `.env` copy or manual database setup is needed for the defaults.

Run these commands from the repository root:

```bash
cd Royal-Backend
npm install
npm run db:init
npm run seed
npm run dev
```

The API is available at `http://localhost:4000`. The local seed provides this shared development account:

```text
Email:    admin@royalpalace.test
Password: DevAdmin123!
```

The seed is idempotent and creates the same room, restaurant, spa, event-room, and admin records on every fresh database. Bookings, contact messages, and newsletter subscriptions stay empty because they are transactional/user-submitted data, not default configuration. Do not run the local seed in production.

`npm run db:reset` is an optional destructive reset of the local schema and data; it recreates the schema and runs the seed. `npm run create-admin` remains an optional interactive utility for provisioning a separate admin on a database that has no admin users; it is not part of local setup.

For databases created before editable room and event-room content was added, run `npm run db:migrate:admin-content` once. Fresh databases already include those columns in `db/schema.sql`; this migration is not part of local setup.

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
    "email": "admin@royalpalace.test",
    "password": "DevAdmin123!"
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
│   ├── seed.ts              # Content and local admin seed
│   ├── init.ts              # Starts/initializes local MySQL
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

Emails are sent via Resend when `RESEND_API_KEY` is configured. The local default leaves it blank, so email notifications are skipped; ask the team lead for a key if email delivery is needed.

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
