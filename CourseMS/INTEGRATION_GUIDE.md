# Client-Backend Integration Guide

This guide explains how the React frontend (client) connects to the Node.js/Express backend (cms_backend).

## Architecture Overview

```
┌─────────────────┐         HTTP Requests          ┌──────────────────┐
│   React Client  │  ───────────────────────────▶  │  Express Backend │
│   (Port 5173)   │  ◀───────────────────────────  │   (Port 8080)    │
└─────────────────┘         JSON Response          └──────────────────┘
```

## Project Structure

```
CourseMS/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── config/
│   │   │   └── api.config.js     # API URL configuration
│   │   ├── services/
│   │   │   └── courseApi.js      # API service functions
│   │   ├── Components/
│   │   │   ├── CourseComponent.jsx   # Course list display
│   │   │   └── NavbarComponent.jsx   # Navigation bar
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env                      # Environment variables
│
└── cms_backend/            # Node.js/Express Backend
    ├── src/
    │   ├── app.js                # Express app setup
    │   ├── config/
    │   │   └── config.js         # Backend configuration
    │   ├── controllers/          # Request handlers
    │   ├── services/             # Business logic
    │   ├── models/               # Database models
    │   └── routes/               # API route definitions
    └── .env                      # Backend environment variables
```

## How the Integration Works

### 1. Configuration Layer

**Client Config** (`client/src/config/api.config.js`):
- Stores the backend API base URL
- Defines all API endpoints in one place
- Uses environment variables for flexibility

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
```

**Backend Config** (`cms_backend/src/config/config.js`):
- Sets the allowed client URL for CORS
- Default client URL: `http://localhost:5173`

### 2. API Service Layer

**Course API** (`client/src/services/courseApi.js`):
- Contains functions for all course-related API calls
- Handles HTTP requests using native `fetch()`
- Returns parsed JSON data
- Throws errors for failed requests

Example usage:
```javascript
import { fetchCourses } from "./services/courseApi";

const data = await fetchCourses();
// Returns: { success: true, data: { courses: [...], pagination: {...} } }
```

### 3. Component Layer

**CourseComponent** (`client/src/Components/CourseComponent.jsx`):
- Uses React's `useState` to manage:
  - `courses`: Array of course data
  - `loading`: Boolean for loading state
  - `error`: Error message if fetch fails
- Uses `useEffect` to fetch data when component mounts
- Renders different UI states:
  - Loading spinner while fetching
  - Error message with retry button
  - "No courses" message if empty
  - Grid of course cards on success

### 4. Backend Layer

**API Endpoints**:
- `GET /api/courses` - List all published courses
- `GET /api/courses/:id` - Get single course details
- `POST /api/courses` - Create new course (auth required)
- `PUT /api/courses/:id` - Update course (auth required)
- `DELETE /api/courses/:id` - Delete course (auth required)

**CORS Configuration**:
The backend allows requests from the client URL:
```javascript
app.use(cors({
  origin: CLIENT_URL,  // http://localhost:5173
  credentials: true,
}));
```

## Data Flow

1. **Component Mounts** → `useEffect` triggers
2. **API Call** → `fetchCourses()` makes HTTP request
3. **Backend Response** → Returns JSON with courses array
4. **State Update** → `setCourses()` updates React state
5. **Re-render** → Component displays course cards

## Environment Setup

### Backend (.env)
```env
PORT=8080
DB_URL=mongodb://localhost:27017/cmsbackend
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

### Client (.env)
```env
VITE_API_URL=http://localhost:8080
```

## Running the Application

### 1. Start the Backend
```bash
cd cms_backend
npm install
npm run dev
# Server runs on http://localhost:8080
```

### 2. Start the Client
```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

### 3. Verify Integration
1. Open browser to `http://localhost:5173`
2. Open DevTools → Network tab
3. You should see a request to `http://localhost:8080/api/courses`
4. Courses should display in a grid layout

## Key Integration Points

| Feature | Client | Backend |
|---------|--------|---------|
| CORS Origin | N/A | `http://localhost:5173` |
| API URL | `http://localhost:8080` | N/A |
| Data Format | Expects JSON | Returns JSON |
| Auth Header | `Bearer <token>` | Validates JWT |

## Error Handling

The integration includes multiple error handling layers:

1. **Network Errors**: Fetch fails (server down, CORS issues)
2. **HTTP Errors**: Non-2xx status codes
3. **Parse Errors**: Invalid JSON responses
4. **UI Errors**: User-friendly error messages with retry option

## Course Data Mapping

Backend Model → Frontend Display:

| Backend Field | Frontend Display |
|---------------|------------------|
| `title` | Course title (h3) |
| `description` | Course description (p) |
| `shortDescription` | Truncated description |
| `thumbnail` | Course image |
| `category` | Category badge |
| `level` | Level badge (beginner/intermediate/advanced) |
| `price` | Price display ($X or "Free") |
| `totalDuration` | Duration in hours/mins |
| `totalLessons` | Lesson count |
| `instructor.name` | Instructor name |

## Adding Authentication (Future)

To add login functionality:

1. Create auth service in `client/src/services/authApi.js`
2. Store JWT token in localStorage or context
3. Include token in API requests:
   ```javascript
   headers: {
     "Authorization": `Bearer ${token}`
   }
   ```
4. Backend already has `protect` middleware ready

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Check `CLIENT_URL` in backend .env |
| 404 errors | Verify backend is running on port 8080 |
| Empty course list | Add courses via backend API or database |
| Network errors | Check both servers are running |
