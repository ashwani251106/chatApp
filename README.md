<div align="center">
  <h1>🌌 NexusChat — Next-Gen Communication</h1>
  <p>A high-end cyberpunk-inspired group chat application built with the MERN stack and Socket.io for seamless real-time messaging.</p>
</div>

<br />

## 🚀 Features

- **Real-Time Messaging**: Built on top of `Socket.io` to deliver lightning-fast, bi-directional communication.
- **Group Management**: Easily create, join, or leave messaging groups.
- **Secure Authentication**: Uses `jsonwebtoken` (JWT) and `bcrypt` for secure user login, registration, and session management.
- **Cyberpunk Aesthetic**: High-end UI with immersive font families (`Plus Jakarta Sans`, `Space Grotesk`, `JetBrains Mono`) and dynamic styling.
- **Responsive Layout**: Designed to look stunning on both desktop and mobile devices.
- **RESTful API Architecture**: Organized and structured backend utilizing Express controllers and routing.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Real-time Engine**: Socket.io-client
- **Styling**: Vanilla CSS (Cyberpunk-inspired Theme)

### Backend
- **Framework**: Node.js & Express.js 5
- **Database**: MongoDB with Mongoose ORM
- **Real-time Engine**: Socket.io
- **Authentication**: JWT & Cookie-Parser
- **Security**: Bcrypt for password hashing

---

## 📂 Project Structure

```
chatApp/
├── backend/                  # Server-side logic & API
│   ├── controllers/          # Request handlers
│   ├── middlewares/          # Express middlewares (e.g., Auth)
│   ├── models/               # MongoDB Database Schemas (User, Group, Chat)
│   ├── routes/               # Express API routes
│   ├── socket.js             # Socket.io connection and event setup
│   ├── server.js             # Entry point for backend
│   └── .env                  # Backend Environment variables
│
└── frontend/                 # Client-side application
    ├── src/                  # React source files (Components, Pages, App.jsx, etc.)
    ├── public/               # Static assets
    ├── index.html            # Entry HTML file
    └── vite.config.js        # Vite bundler configuration
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed the following on your machine:
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas Cluster)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/NexusChat.git
cd NexusChat
```

### 2. Backend Setup

Open a terminal and navigate to the `backend` folder:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and add the following variables:

```env
PORT=5000
SECRET_KEY=your_super_secret_jwt_key
URI=your_mongodb_connection_string
```

Start the backend server:

```bash
# Starts Node server on http://localhost:5000
node server.js
```

### 3. Frontend Setup

Open a new terminal and navigate to the `frontend` folder:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
# Starts React app on http://localhost:5173
npm run dev
```

---

## 🌐 Usage

1. Open your browser and go to `http://localhost:5173`.
2. Register a new account or log in if you already have one.
3. Explore the dashboard, create a new group, or join an existing one.
4. Enjoy real-time, cyberpunk-aesthetic messaging!

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](#) if you want to contribute.

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📝 License

This project is licensed under the **ISC License**.

<br />
<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/ashwani251106">Ashwani Singh</a></p>
</div>
