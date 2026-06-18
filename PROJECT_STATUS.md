# TaskFree — Project Status

## Live URL

https://tasksy-production.up.railway.app

## GitHub Repo

https://github.com/SimeonATarr231/tasksu

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js + Express
- Database: SQLite (better-sqlite3)
- Auth: bcrypt + express-session + connect-sqlite3
- Deployment: Railway (GitHub auto-deploy)
- Icons: Font Awesome 6.5
- Fonts: Space Mono + Syne (Google Fonts)

## Design System

- Primary background: #0a0a0a
- Primary text: #f5f0e8
- Accent color: #ff4d00 (orange-red)
- Surface: #1a1a1a
- Border: #2a2a2a
- Muted: #666
- Body font: Space Mono (monospace)
- Display font: Syne (headings, logo, buttons)
- Theme: Dark/Light/System toggle stored in localStorage key: taskfree-theme

## Project Structure

taskfree/

├── server/

│ ├── index.js ← Entry point

│ ├── db.js ← SQLite connection + schema

│ ├── email.js ← NOT IN USE (removed)

│ ├── routes/

│ │ ├── auth.js ← Register, login, logout, /me

│ │ ├── tasks.js ← CRUD tasks

│ │ └── user.js ← Profile, change username/password, delete account

│ └── middleware/

│ └── auth.js ← requireAuth middleware

├── public/

│ ├── index.html ← Login + Register page

│ ├── dashboard.html ← Main task manager

│ ├── profile.html ← User profile page

│ └── js/

│ ├── auth.js ← Login/register logic + theme

│ └── tasks.js ← Dashboard logic

└── .env ← PORT, SESSION_SECRET

## Database Schema

```sql
users:
  id, username, email, password (bcrypt), created_at

tasks:
  id, user_id, title, description, priority (low/medium/high),
  completed (0/1), due_date (TEXT), category (TEXT), created_at

sessions: (auto-managed by connect-sqlite3)
```

## Environment Variables

- PORT
- SESSION_SECRET

## Completed Features

- User registration and login
- Session-based authentication (bcrypt + express-session)
- Create, edit, delete tasks
- Task priorities (low/medium/high) with color tags
- Task categories (work/study/personal/health/finance/other) with color tags
- Due dates with overdue detection
- Real-time search bar
- Filter by: All, Pending, Completed, High Priority, Overdue, Category
- Stats bar: Total, Pending, Completed, Overdue
- Overdue badge on filter button
- Inline task editing
- Dark/Light/System theme toggle
- Password visibility toggle
- User profile page (change username, password, delete account)
- Responsive design (mobile + desktop)
- Deployed on Railway

## In Progress

- Landing/home page (NEXT TO BUILD)

## Remaining Features

- Landing page (marketing page before login)

## API Endpoints

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
POST /api/tasks
GET /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id
GET /api/user/profile
PUT /api/user/username
PUT /api/user/password
DELETE /api/user/account

## UI Patterns Used

- Gap-as-border technique for task list and stats bar
- CSS custom properties for theming
- Template literals for dynamic HTML generation
- escapeHtml() for XSS prevention
- allTasks local array for client-side state
- Disable button during requests to prevent double submission

## Known Issues

- None currently

## Next Step

Build public/landing.html — a marketing page at / that
showcases TaskFree before users register.

- I will ask you all of the features the Landing page need now and I will tell you which one I need, so you can add.
