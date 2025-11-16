# StudyFlow

A full-stack web app for course and task management featuring real time group management and chat, with a React frontend, Node.js backend, and MongoDB Atlas database.

## Features

- **User Authentication**: Secure login and registration using JWT.
- **Course & Task Management**: Create, update, and track courses and associated tasks.
- **Real-Time Group Management**: Create study groups, add/remove members, and manage tasks in real-time.
- **Group Chat**: Send and receive messages in real-time within study groups.
- **Persistent Data**: Data is stored in MongoDB Atlas.
- **Dockerized Setup**: Run both frontend and backend using Docker containers.
- **RESTful API**: Fully structured API for future integrations or extensions.

## Technologies Used

- Frontend: React.js
- Backend: Node.js, Express.js, Socket.io
- Database: MongoDB Atlas
- Containerization: Docker

## Getting Started

### 1. Setup Environment Variables

Create a `.env` file inside the `/client` folder with the following content:

```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

Create a `.env` file inside the `/server` folder with the following content:

```env
PORT=5000

NODE_ENV=production

DB_URI=YOUR_MONGODB_URI

FRONT_END_URL="http://localhost:3000"

JWT_SECRET=YOUR_JWT_SECRET
JWT_EXPIRES_IN="7d"
```

---

### 2. Run the App (Option 1: With Docker)

```
docker-compose up --build -d
```

- This builds and both frontend and backend containers
- The frontend is accessible at `http://localhost:3000`.
- Backend API will be accessible at `http://localhost:5000`.
---

### 3. Run the App (Option 2: Without Docker)

Open a new terminal, navigate to the `client` directory, and run:

```
npm install
npm start
```

- The frontend runs on `http://localhost:3000`.

Navigate to the `server` directory and run:

```
npm install
npm start
```
- The backend runs on `http://localhost:5000`