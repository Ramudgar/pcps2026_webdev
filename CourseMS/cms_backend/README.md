# MS Backend API — Phase 1

A beginner-friendly Microservices Backend project to teach REST API fundamentals, proper folder structure, and CRUD operations using an in-memory data store.

## Tech Stack
* **Runtime**: Node.js
* **Framework**: Express.js
* **Storage**: In-memory (resets on restart)

## Quick Start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:3000`*

## API Endpoints

### Users Resource (`/api/users`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get a specific user by ID |
| POST | `/api/users` | Create a new user (Body: `{ "name": "...", "email": "..." }`) |
| PUT | `/api/users/:id` | Update a user (Body: `{ "name": "...", "email": "..." }`) |
| DELETE | `/api/users/:id` | Delete a specific user |

### Courses Resource (`/api/courses`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/:id` | Get a specific course by ID |
| POST | `/api/courses` | Create a new course (Body: `{ "title": "...", "description": "...", "instructorId": "...", "price": 0 }`) |
| PUT | `/api/courses/:id` | Update a course |
| DELETE | `/api/courses/:id` | Delete a specific course |
