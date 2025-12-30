# Blood Bank Management System - Deployment Guide

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd blood-bank-management-system
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**

   **Backend (.env)**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Update the `.env` file:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

   **Frontend (.env)**
   ```bash
   cd ../frontend
   cp .env.example .env
   ```
   
   Update the `.env` file:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Create Admin Account (First Time Only)**
   ```bash
   npm run seed-admin
   ```

5. **Build Frontend**
   ```bash
   npm run build
   ```

6. **Start Production Server**
   ```bash
   npm start
   ```

## Development Mode

```bash
npm run dev
```

This will start both frontend (port 5173) and backend (port 5000) concurrently.

## Production Deployment

### Option 1: Traditional Server Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up environment variables**
   - Configure production MongoDB URI
   - Set secure JWT secret
   - Update API URLs

3. **Start the server**
   ```bash
   npm start
   ```

### Option 2: Docker Deployment

Create `Dockerfile` in root:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm run install-all

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
```

### Option 3: Cloud Platform Deployment

#### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/dist`
4. Add environment variables in Vercel dashboard

#### Railway/Render (Backend)
1. Connect your GitHub repository
2. Set build command: `cd backend && npm install`
3. Set start command: `cd backend && npm start`
4. Add environment variables in platform dashboard

## Environment Variables

### Backend
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 5000)

### Frontend
- `VITE_API_URL`: Backend API URL

## Default Admin Credentials

After running the seed script, use these credentials to login:
- **Email**: admin@bloodbank.com
- **Password**: admin123

**⚠️ Important**: Change these credentials immediately after first login.

## Features

- ✅ Donor registration and management
- ✅ Hospital request creation and tracking
- ✅ Real-time blood inventory monitoring
- ✅ Secure JWT authentication
- ✅ Role-based access control
- ✅ Responsive design with Tailwind CSS
- ✅ Modern React components with shadcn/ui

## Tech Stack

**Frontend**: React.js, Vite, Tailwind CSS, shadcn/ui
**Backend**: Node.js, Express.js, MongoDB, Mongoose
**Authentication**: JWT with bcrypt

## Support

For issues and questions, please create an issue in the repository.