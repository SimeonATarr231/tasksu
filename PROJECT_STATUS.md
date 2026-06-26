# TaskSU — Project Status

## Live URL

https://[tasksy-production.up.railway.app](http://tasksu-production-a458.up.railway.app/)

## GitHub Repo

https://github.com/SimeonATarr231/tasksu

## Local Project Path

C:\Users\simeo\Documents\TaskSu

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

tasksu/

├── server/

│ ├── index.js ← Entry point

│ ├── db.js ← SQLite connection + schema

│ ├── routes/

│ │ ├── auth.js ← Register, login, logout, /me

│ │ ├── tasks.js ← CRUD tasks

│ │ └── user.js ← Profile, change username/password, delete account

│ └── middleware/

│ └── auth.js ← requireAuth middleware

├── public/

│ ├── index.html ← Landing/home page

│ ├── login.html ← Login + Register page

│ ├── dashboard.html ← Main task manager

│ ├── profile.html ← User profile page

│ ├── images/ ← Screenshots used on landing page

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

Local .env:

- PORT=5000
- SESSION_SECRET=your_secret

Railway Variables:

- SESSION_SECRET
- NODE_ENV=production

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

## Completed Features

- Landing page (index.html) with:
  - Animated hamburger menu
  - Dark/Light/System theme toggle
  - Scroll reveal animations
  - Hero section with dashboard screenshot
  - Why TaskSU section
  - Features section (9 features)
  - Screenshot sections with real images
  - How it works (3 steps)
  - Stats section
  - Testimonials section (3 real testimonials)
  - About section (built in Liberia story)
  - FAQ accordion
  - CTA section
  - Full footer with links
- User registration and login
- Session-based authentication (bcrypt + express-session)
- Create, edit inline, delete tasks
- Task priorities (low/medium/high) with color tags
- Task categories (work/study/personal/health/finance/other) with color tags
- Due dates with overdue detection and red flag
- Overdue badge on filter button
- Real-time search bar
- Filter by: All, To-Do, Completed, High Priority, Overdue, Category
- Category filter buttons with task counts
- Mark All Complete button
- N key shortcut to focus new task input
- Stats bar: Total, To-Do, Completed, Overdue
- Dark/Light/System theme toggle (all pages)
- Password visibility toggle
- User profile page (change username, password, delete account)
- Responsive design (mobile + desktop)
- Deployed live on Railway

## In Progress

- Forgot password / Reset password / Email verification
- Using Brevo email service (API key already obtained)
- @getbrevo/brevo package already installed

## Next Step — Exact Task

Build forgot password, reset password, and email verification using Brevo.

The database already has:

- tokens table (id, user_id, token, type, expires_at, created_at)
- verified column on users table

The auth routes file already has the route logic written for:

- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- GET /api/auth/verify-email
- POST /api/auth/resend-verification

What needs to be done:

1. Create server/email.js using Brevo instead of nodemailer/resend
2. The frontend pages public/forgot-password.html and
   public/reset-password.html were built before but may need
   to be recreated — check if they exist
3. Add forgot password link to login.html
4. Test full flow end to end
5. Add environment variables to Railway:
   - BREVO_API_KEY=your_key
   - FROM_EMAIL=your_brevo_verified_email
   - BASE_URL=https://tasksu-production-a458.up.railway.app

## Known Issues

- None currently

## Packages Installed

bcrypt, better-sqlite3, connect-sqlite3, dotenv,
express, express-session, @getbrevo/brevo
