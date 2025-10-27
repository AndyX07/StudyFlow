# StudyFlow

A full-stack web app for course and task management with a React frontend, Node.js backend, and MongoDB Atlas database.

## Features

- User authentication with JWT
- Persistent data storage in MongoDB Atlas
- Dockerized backend for easy local development

## Technologies Used

- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- Containerization: Docker

## Getting Started

### 1. Setup Environment Variables

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

### 2. Run Backend

```
docker-compose up --build -d
```

- This builds and starts the backend server.  
- The backend connects to MongoDB Atlas using the `DB_URI` in your `.env`.  
- Backend API will be accessible at `http://localhost:5000`.

OR

Navigate to the server directory and run the following commands:

```
npm install
npm start
```
To run the backend without docker

---

### 3. Run Frontend

Open a new terminal, navigate to the `client` directory, and run:

```
npm install
npm start
```

- The frontend runs on `http://localhost:3000`.
