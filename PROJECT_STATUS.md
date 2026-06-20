# TaskSU — Project Status

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

## Pages
- /                → landing.html (home/marketing page)
- /login.html      → login and register
- /dashboard.html  → main task manager
- /profile.html    → user profile settings

## Completed Features
- Landing page with animated hamburger, theme toggle, FAQ accordion, scroll reveal
- About section
- User registration and login
- Session-based authentication (bcrypt + express-session)
- Create, edit inline, delete tasks
- Task priorities (low/medium/high) with color tags
- Task categories (work/study/personal/health/finance/other) with color tags
- Due dates with overdue detection and red flag
- Overdue badge on filter button
- Real-time search bar
- Filter by: All, Pending, Completed, High Priority, Overdue, Category
- Stats bar: Total, Pending, Completed, Overdue
- Dark/Light/System theme toggle (all pages)
- Password visibility toggle
- User profile page (change username, password, delete account)
- Responsive design (mobile + desktop)
- Deployed live on Railway

## Next Features to Build
- Rename dashboard labels: To-do, Pending, Completed
- Testimonials section on landing page (after collecting feedback)
- Email verification (future)
- Forgot/reset password (future)

## Environment Variables Required
- PORT
- SESSION_SECRET

## Known Issues
- None currently