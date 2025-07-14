# Portfolio Website with Blog Backend

A modern portfolio website with a Node.js backend, MongoDB database, and secure admin dashboard.

## Features

- **Static Portfolio Pages**: Beautiful, responsive portfolio website
- **Blog System**: Dynamic blog with MongoDB backend
- **Admin Dashboard**: Secure dashboard for managing blog posts
- **Authentication**: JWT-based authentication for admin access
- **Image Management**: Blog post images with proper display
- **Security**: Rate limiting, CORS, and helmet security headers

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Edit `config.env` file with your settings:
   ```
   PORT=3000
   MONGODB_URI=your_db
   JWT_SECRET=your-super-secret-jwt-key
   ADMIN_USERNAME=your_username
   ADMIN_PASSWORD=your_password
   NODE_ENV=development
   ```

4. **Start MongoDB**:
   - If using local MongoDB, make sure it's running
   - Or use MongoDB Atlas and update the connection string

5. **Setup the database**:
   ```bash
   node setup.js
   ```
   This will create the admin user and sample blog posts.

6. **Start the server**:
   ```bash
   npm start
   ```

## Usage

### Accessing the Website

- **Portfolio**: http://localhost:3000
- **Blog**: http://localhost:3000/blog
- **Dashboard**: http://localhost:3000/dashboard (requires login)
- **Login**: http://localhost:3000/login.html

### Default Admin Credentials

- **Username**: admin
- **Password**: admin123


### API Endpoints

#### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register admin (one-time setup)
- `GET /api/auth/me` - Get current user

#### Blog Posts
- `GET /api/blog` - Get all published posts
- `GET /api/blog/:slug` - Get specific post
- `POST /api/blog` - Create new post (admin only)
- `PUT /api/blog/:id` - Update post (admin only)
- `DELETE /api/blog/:id` - Delete post (admin only)

#### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/posts` - Get posts for management
- `GET /api/dashboard/categories` - Get categories

## Project Structure

```
portfolio/
├── models/              # MongoDB models
│   ├── User.js         # User authentication model
│   └── BlogPost.js     # Blog post model
├── routes/              # API routes
│   ├── auth.js         # Authentication routes
│   ├── blog.js         # Blog post routes
│   └── dashboard.js    # Dashboard routes
├── middleware/          # Middleware
│   └── auth.js         # Authentication middleware
├── images/             # Blog post images
├── server.js           # Main server file
├── setup.js            # Database setup script
├── config.env          # Environment variables
├── package.json        # Dependencies
└── README.md          # This file
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: Prevents abuse
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Server-side validation

## Blog Images

The blog images are now properly configured and should display correctly. The images are located in the `images/` directory and are referenced correctly in the HTML.

## Dashboard Access

The dashboard is protected and only accessible to authenticated admin users. Regular visitors cannot access the dashboard without proper authentication.

## Development

For development with auto-restart:
```bash
npm run dev
```

## Production Deployment

1. Change the JWT secret in `config.env`
2. Update admin credentials
3. Use a production MongoDB instance
4. Set `NODE_ENV=production`
5. Use a process manager like PM2

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check the connection string in `config.env`
- Verify network connectivity

### Authentication Issues
- Run `node setup.js` to create admin user
- Check JWT secret in `config.env`
- Clear browser localStorage if needed

### Image Display Issues
- Ensure images are in the `images/` directory
- Check file paths in HTML
- Verify image file permissions

## License

MIT License - feel free to use this project for your own portfolio! 