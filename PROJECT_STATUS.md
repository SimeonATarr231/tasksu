# TasksU — Project Status

## Live URL
https://tasksu-production-a458.up.railway.app/

## GitHub Repo
https://github.com/SimeonATarr231/tasksu

## Tech Stack
- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js + Express
- Database: SQLite (better-sqlite3)
- Auth: bcrypt + express-session
- Deployment: Railway
- Session storage: connect-sqlite3

## What Is Built and Working
- User registration and login
- Session-based authentication
- Password hashing with bcrypt
- Create, read, update, delete tasks
- Task priorities (low, medium, high)
- Task completion toggle
- Filter tasks by status and priority
- Real-time stats (total, pending, completed)
- Dark/Light/System theme switcher
- Password visibility toggle
- Logout
- Deployed live on Railway

## Current Status
Project is stable and deployed. Ready for new features.

## Planned Features
- Home/landing page
- Due dates with deadline tracking
- Edit tasks inline
- Task categories or tags
- User profile page

## Known Issues
- SQLite database resets on Railway redeploy (not persistent)
  Solution: Add Railway volume or migrate to PostgreSQL later

## Environment Variables (Railway)
- SESSION_SECRET
- NODE_ENV

## Environment Variables (Local .env)
- PORT
- SESSION_SECRET

## Next Step
Build a landing/home page for the project