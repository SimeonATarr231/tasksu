# tasku

A fullstack task manager web application built with Node.js, Express, SQLite, and vanilla JavaScript.

## Live Demo

[tasku-production.up.railway.app](https://tasku-production.up.railway.app)

## Features

- User registration and login with secure password hashing
- Session-based authentication
- Create, complete, and delete tasks
- Filter tasks by status and priority
- Real-time stats dashboard
- Fully responsive design

## Tech Stack

**Frontend**
- HTML, CSS, Vanilla JavaScript
- Fetch API for backend communication

**Backend**
- Node.js + Express
- SQLite via better-sqlite3
- bcrypt for password hashing
- express-session for auth

**Deployment**
- GitHub + Railway

## Running Locally

**1. Clone the repository**
```bash
git clone https://github.com/SimeonATarr231/tasku.git
cd tasku
```

**2. Install dependencies**
```bash
npm install
```

**3. Create a .env file**

**4. Start the development server**
```bash
npm run dev
```

**5. Open your browser**

## Project Structure
tasku/
├── server/
│   ├── index.js          # Entry point
│   ├── db.js             # Database connection
│   ├── routes/
│   │   ├── auth.js       # Auth endpoints
│   │   └── tasks.js      # Task endpoints
│   └── middleware/
│       └── auth.js       # Auth guard
├── public/
│   ├── index.html        # Login/Register page
│   ├── dashboard.html    # Main app
│   ├── css/
│   └── js/
└── .env                  # Environment variables (not committed)

## Author

Built by Simeon A. Tarr — fullstack developer in training.