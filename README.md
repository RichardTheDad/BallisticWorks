# BallisticWorks Market

A premium DarkRP marketplace with Steam integration, featuring a dark theme inspired by VaultCorp. Built with React, TypeScript, Node.js, and Express.

## Features

- **Steam OAuth Authentication** - Secure login through Steam
- **User Profile Management** - Complete in-game details (roleplay name, phone, bank account)
- **Shopping Cart System** - Add multiple items, manage quantities
- **Order Management** - Complete order processing with email notifications
- **Admin Panel** - Easy product management with image uploads
- **Dark Theme UI** - Professional VaultCorp-inspired design
- **Real-time Updates** - Recent purchases, cart updates
- **Email Notifications** - Order confirmations sent to admin

## Tech Stack

### Frontend
- React 18 with TypeScript
- TailwindCSS for styling
- React Router for navigation
- Axios for API calls
- Lucide React for icons

### Backend
- Node.js with Express
- Passport.js for Steam OAuth
- SQLite database
- Multer for file uploads
- Nodemailer for email notifications

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Steam API Key

### 1. Clone and Install

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000

# Steam API Configuration
STEAM_API_KEY=your_steam_api_key_here

# Session Configuration
SESSION_SECRET=your_very_secure_session_secret_here

# Email Configuration (for order notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password_here
EMAIL_FROM=your_email@gmail.com

# Database Configuration
DB_PATH=./database.sqlite

# Admin Configuration
ADMIN_EMAIL=admin@ballisticworks.com
ADMIN_STEAM_ID=your_steam_id_here
```

### 3. Get Steam API Key

1. Go to [Steam API Key Page](https://steamcommunity.com/dev/apikey)
2. Sign in with your Steam account
3. Enter your domain (use `localhost` for development)
4. Copy the API key to your `.env` file

### 4. Configure Admin Access

To make yourself an admin:

1. Start the application
2. Login with Steam
3. Stop the application
4. Open `database.sqlite` with a SQLite browser
5. Update the `users` table, set `is_admin = 1` for your Steam ID

### 5. Run the Application

```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
npm run server  # Backend only
npm run client  # Frontend only (in another terminal)
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
BallisticWorks/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth, Cart)
│   │   ├── pages/          # Page components
│   │   └── App.tsx         # Main app component
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Express backend
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   ├── middleware/        # Custom middleware
│   └── index.js           # Server entry point
├── uploads/               # Uploaded product images
├── .env                   # Environment variables
├── package.json          # Root package.json
└── README.md
```

## Usage

### For Users

1. **Login**: Click "Login with Steam" to authenticate
2. **Profile**: Complete your profile with roleplay name, phone, and bank account
3. **Shopping**: Browse products, add to cart, adjust quantities
4. **Checkout**: Place orders with optional customer notes
5. **Orders**: Automatic email notifications sent to admin

### For Admins

1. **Product Management**: Add new products with images via the admin panel
2. **Order Management**: View and update order statuses
3. **Customer Info**: Access customer details for in-game delivery

## Steam OAuth Setup

The application uses Steam's OpenID for authentication. Make sure to:

1. Register your domain with Steam
2. Use the correct return URL in your Steam API settings
3. For production, update the `SERVER_URL` in your `.env` file

## Email Configuration

For Gmail (recommended):
1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in `EMAIL_PASS`

## Database

The application uses SQLite for simplicity. The database file (`database.sqlite`) is created automatically on first run.

### Tables:
- `users` - User profiles and Steam data
- `products` - Product catalog
- `orders` - Order information
- `order_items` - Order line items
- `cart_items` - Shopping cart contents
- `recent_purchases` - For recent purchases display

## Security Notes

- Session secrets should be changed in production
- Use HTTPS in production
- Store sensitive configuration in environment variables
- Consider using a more robust database for production

## Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Update URLs in `.env` to production domains
3. Use a process manager like PM2
4. Set up reverse proxy (nginx)
5. Use PostgreSQL or MySQL for better performance

## Support

For issues or questions:
- Check the console for error messages
- Verify your Steam API key is valid
- Ensure all environment variables are set correctly
- Check that your Steam profile is public

## License

MIT License - Feel free to modify and use for your DarkRP server!
