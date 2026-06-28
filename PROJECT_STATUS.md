# TasksU — Project Status

## Live URL
https://tasksu-production-a458.up.railway.app

## GitHub Repo
https://github.com/SimeonATarr231/tasksu

## Local Project Path
C:\Users\simeo\Documents\TaskSu

## Tech Stack
- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js + Express
- Database: SQLite (better-sqlite3)
- Auth: bcrypt + express-session + connect-sqlite3
- Email: Brevo (@getbrevo/brevo)
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
│   ├── index.js          ← Entry point
│   ├── db.js             ← SQLite connection + schema
│   ├── email.js          ← Brevo email functions
│   ├── routes/
│   │   ├── auth.js       ← Register, login, logout, /me, email + password routes
│   │   ├── tasks.js      ← CRUD tasks
│   │   └── user.js       ← Profile, change username/password, delete account
│   └── middleware/
│       └── auth.js       ← requireAuth middleware
├── public/
│   ├── index.html        ← Landing/home page
│   ├── login.html        ← Login + Register page
│   ├── dashboard.html    ← Main task manager
│   ├── profile.html      ← User profile page
│   ├── forgot-password.html ← Forgot password page
│   ├── reset-password.html  ← Reset password page
│   ├── images/           ← Screenshots used on landing page
│   └── js/
│       ├── auth.js       ← Login/register logic + theme
│       └── tasks.js      ← Dashboard logic
└── .env                  ← PORT, SESSION_SECRET, BREVO_API_KEY, FROM_EMAIL, BASE_URL

## Database Schema
```sql
users:
  id, username, email, password (bcrypt), verified (0/1), created_at

tasks:
  id, user_id, title, description, priority (low/medium/high),
  completed (0/1), due_date (TEXT), category (TEXT), created_at

tokens:
  id, user_id, token, type (verification/reset), expires_at, created_at

sessions: (auto-managed by connect-sqlite3)
```

## Environment Variables
Local .env:
- PORT=5000
- SESSION_SECRET=your_secret
- BREVO_API_KEY=your_brevo_api_key
- FROM_EMAIL=your_verified_brevo_email
- BASE_URL=http://localhost:5000

Railway Variables:
- SESSION_SECRET
- NODE_ENV=production
- BREVO_API_KEY
- FROM_EMAIL
- BASE_URL=https://tasksu-production-a458.up.railway.app

## API Endpoints
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/verify-email
POST   /api/auth/resend-verification
GET    /api/auth/validate-reset-token
POST   /api/tasks
GET    /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
GET    /api/user/profile
PUT    /api/user/username
PUT    /api/user/password
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
- Email verification on register (Brevo)
  - Account blocked from login until email is verified
  - Verify link expires in 24 hours
  - Resend verification endpoint available
- Forgot password flow (Brevo)
  - Reset link sent to email
  - Token validated before showing reset form
  - Reset link expires in 1 hour
  - Token deleted after use
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

## Known Issues
- None currently

## Packages Installed
bcrypt, better-sqlite3, connect-sqlite3, dotenv,
express, express-session, @getbrevo/brevo