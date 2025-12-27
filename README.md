`# Nexus Social Graph 🚀

> A production-ready social feed platform engineered with ****GraphQL****, ****Node.js****, and ****React****. Designed for scalability, real-time interaction, and modern data fetching patterns.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌟 Technical Overview (The "Why")

This project demonstrates a migration from traditional REST architecture to a flexible ****GraphQL API****. It solves common over-fetching/under-fetching issues and provides a highly interactive user experience using ****WebSockets**** for real-time data propagation.

### Key Architectural Highlights:
* ****Hybrid Upload Architecture:**** Utilizes a dedicated REST endpoint for binary image uploads to optimize performance, while leveraging GraphQL for efficient data metadata handling.
* ****Event-Driven Updates:**** Integrates `Socket.io` to push live updates (Create/Update/Delete) to all connected clients instantly, ensuring a reactive UI without manual refreshes.
* ****Granular Authorization:**** Implements custom middleware that passes authentication context to GraphQL resolvers, allowing for field-level security and fine-grained permission control.

---

## 🛠️ Tech Stack

### Backend (API Gateway)
* ****Runtime:**** Node.js & Express.js
* ****API Standard:**** GraphQL (Schema-First Design)
* ****Database:**** MongoDB & Mongoose ODM (Relational Data Integrity)
* ****Real-time Engine:**** Socket.io
* ****Authentication:**** JWT (Stateless) with BcryptJS encryption
* ****Validation:**** `validator` & Custom Logic

### Frontend (Client)
* ****Framework:**** React 18 (Vite Build Tool)
* ****Data Layer:**** Apollo Client (InMemory Cache & Optimistic UI)
* ****Styling:**** Tailwind CSS (Utility-first)
* ****Routing:**** React Router v6 with Protected Routes strategy

---

## 🔥 Key Features

### 🔐 Authentication & Security
* Secure Login/Signup flow using JWT.
* Auto-logout and Session Persistence via LocalStorage.
* Password Hashing with Salt Rounds.

### 📝 Content Management (CRUD)
* ****Create:**** Post creation with image preview and upload.
* ****Read:**** Feed display with server-side Pagination.
* ****Update:**** Edit post content and images (Authorized users only).
* ****Delete:**** Secure post deletion with cascading cleanup (removes image from disk & reference from user).

### ⚡ Real-Time Capabilities
* Instant feed updates when other users post.
* Live status updates.

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
* ****Node.js**** (v16+)
* ****MongoDB**** (Running locally or Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/social-graph-system.git
cd social-graph-system`

### 2. Backend Setup

Bash

# 

`cd api
npm install

# Create the images directory for uploads
mkdir images

# Start the Server
npm start`

*The Backend will run on `http://localhost:8080`*

### 3. Frontend Setup

Bash

# 

`cd web
npm install

# Start the Client
npm run dev`

*The Frontend will run on `http://localhost:5173`*

---

## 📂 Project Structure

Plaintext

# 

`social-graph-system/
├── api/                 # Backend (Node.js + GraphQL)
│   ├── graphql/         # Schema & Resolvers (The Core Logic)
│   ├── models/          # Mongoose Schemas (User, Post)
│   ├── middleware/      # Auth & Error Handling
│   └── util/            # File System Helpers
│
└── web/                 # Frontend (React + Vite)
    ├── src/
    │   ├── lib/         # Apollo Client Config
    │   ├── context/     # Auth State Management
    │   ├── pages/       # Feed, Login, Signup
    │   └── components/  # Modals, Protected Routes`

---

## 🔮 Future Improvements

- [ ]  Implement cursor-based pagination for infinite scroll.
- [ ]  Add "Like" and "Comment" mutations.
- [ ]  Dockerize the application for containerized deployment.

---

## 👨‍💻 Author

**Osama Ibrahim**

- Backend Engineer (Node.js, React, AI Integration)
- [LinkedIn Profile](https://www.linkedin.com/in/osama-rezk)

---

*Built with ❤️ and Code.*
