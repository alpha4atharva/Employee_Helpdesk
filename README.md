# Ticketing-System

## Overview

The **Ticketing System** is a backend application designed to manage customer support or internal issue tickets within an organization. It allows users to create tickets, communicate through messages, track ticket status, and monitor SLA (Service Level Agreement) compliance. The system is built using a modular backend architecture so that different functionalities such as users, tickets, messages, and SLA management can be maintained independently while working together as a complete system.

This project is useful for helpdesk platforms, IT support systems, and customer service teams where issues must be tracked, assigned, and resolved efficiently.

---

## Key Features

* **Ticket Creation and Management** – Users can create support tickets describing issues or requests.
* **User Management** – Different users can access the system with defined roles and permissions.
* **Messaging System** – Users and support agents can communicate within tickets through messages.
* **SLA Monitoring** – Tracks response and resolution time based on Service Level Agreements.
* **Role-Based Access Control** – Implemented using decorators to control which roles can access specific features.
* **Modular Architecture** – Code is divided into modules such as tickets, users, messages, and SLA to maintain scalability.

---

## Technology Stack

The system is developed using modern backend technologies:

* **Node.js** – Runtime environment for executing JavaScript on the server.
* **TypeScript** – Adds static typing to improve code quality and maintainability.
* **NestJS / Express Architecture** – Structured backend framework for building scalable APIs.
* **REST API** – Used for communication between frontend and backend.
* **Git** – Version control system used to manage the codebase.

---

## Project Structure

The project follows a modular folder structure to separate different functionalities.

Ticketing-System
│
├── backend
│   ├── node_modules – Project dependencies
│   ├── src
│   │   ├── auth – Authentication and authorization logic
│   │   ├── common – Shared utilities and decorators
│   │   │   └── decorators – Custom decorators for role access
│   │   ├── messages – Ticket communication module
│   │   │   ├── dto – Data transfer objects
│   │   │   ├── entities – Database entities
│   │   │   ├── messages.controller.ts – Handles message APIs
│   │   │   ├── messages.service.ts – Business logic for messages
│   │   │   └── messages.module.ts – Module configuration
│   │   ├── tickets – Ticket management module
│   │   ├── users – User management module
│   │   ├── sla – SLA tracking module
│   │   ├── app.controller.ts – Root API controller
│   │   ├── app.service.ts – Root service logic
│   │   └── main.ts – Application entry point
│   │
│   ├── package.json – Project dependencies and scripts
│   ├── tsconfig.json – TypeScript configuration
│   └── .env – Environment variables
│
└── README.md – Project documentation

---

## Installation Steps

To run the project locally, follow these steps:

1. Clone the repository from GitHub

   git clone <repository-url>

2. Navigate to the project directory

   cd Ticketing-System

3. Install all required dependencies

   npm install

---

## Running the Application

Start the backend server using:

npm run start:dev

After starting the server, the application will run on:

http://localhost:3000

---

## API Modules

The backend is divided into multiple modules to maintain clean architecture:

**Auth Module** – Handles login and authentication logic.
**Users Module** – Manages user accounts and roles.
**Tickets Module** – Responsible for ticket creation, assignment, and status updates.
**Messages Module** – Enables conversation within tickets.
**SLA Module** – Tracks service level agreements for response and resolution time.

---

## Future Enhancements

Some improvements that can be added to the system include:

* Frontend dashboard for ticket visualization
* Email or notification alerts for ticket updates
* Ticket priority levels (Low, Medium, High, Critical)
* Analytics dashboard for ticket resolution metrics
* Integration with monitoring tools

---


