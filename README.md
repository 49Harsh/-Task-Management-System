# Task Management System

A comprehensive task management system for small teams that allows users to create, assign, track, and manage tasks efficiently.

## Features

- **User Authentication**: Secure registration and login with JWT authentication
- **Task Management**: Full CRUD operations for tasks
- **Team Collaboration**: Assign tasks to other team members
- **Notifications**: Get notified when tasks are assigned to you
- **Dashboard**: View tasks assigned to you, created by you, and overdue tasks
- **Search and Filter**: Search by title/description and filter by status, priority, and due date

## Technology Stack

- **Frontend**: Next.js (v15) with TypeScript and TailwindCSS
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)

### Setup and Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd taskmanagement
   ```

2. Backend Setup:
   ```
   cd servers
   npm install
   ```

3. Create a `.env` file in the `servers` directory with these variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/taskmanager
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. Frontend Setup:
   ```
   cd ../client
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd servers
   npm run dev
   ```

2. Start the frontend development server:
   ```
   cd ../client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user` - Get logged in user details

### Tasks
- `GET /api/tasks` - Get all tasks for the logged in user
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/tasks/filter/search` - Search and filter tasks

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile

### Notifications
- `GET /api/notifications` - Get all notifications for the logged in user
- `PUT /api/notifications/:id` - Mark a notification as read
- `PUT /api/notifications/read/all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete a notification
- `DELETE /api/notifications` - Delete all read notifications

## License

This project is licensed under the MIT License. 