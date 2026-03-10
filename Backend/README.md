# 🧑‍💼 Employee Helpdesk & Asset Management System

A full-stack web application designed to streamline **employee support, ticket handling, and asset allocation** .  
The system provides a centralized helpdesk for issue tracking and a secure, token-based mechanism for managing and allocating company assets.

---

## 🚀 Tech Stack

### Frontend
- ⚛️ **React.js**
- HTML5, CSS3, JavaScript (ES6+)
- Axios for API communication

### Backend
- 🐦 **NestJS**
- TypeScript
- RESTful APIs
- JWT-based Authentication

### Database
- 🐘 **PostgreSQL**
- TypeORM for ORM and database interactions

---

## 🔐 Authentication & Security

- Token-based authentication using **JWT**
- Secure login and role-based access control
- Tokens are used to **authorize asset allocation and tracking**
- Environment variable–based configuration for sensitive credentials

---

## 🧩 Core Features

### 🛠️ Employee Helpdesk
- Employee issue/ticket creation
- Ticket categorization and prioritization
- Status tracking (Open, In Progress, Resolved)
- Communication between employees and support/admin teams

### 📦 Asset Management
- Centralized asset inventory (laptops, peripherals, etc.)
- Asset assignment to employees
- **Token generation system** for secure asset allocation
- Asset status tracking (Available, Allocated, Returned)

### 👥 User Management
- Employee and admin roles
- Secure authentication and authorization
- Role-based access to features

---

## 🧱 System Architecture
React (Frontend)
|
| REST APIs (JWT Auth)
|
NestJS (Backend)
|
| TypeORM
|
PostgreSQL (Database)


---

## ⚙️ Environment Setup

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL
- npm / yarn

---

### 🔧 Backend Setup (NestJS)

```bash
cd backend
npm install

---

### Create a .env file

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=helpdesk_db

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

---

### Run the server:

npm run start:dev


