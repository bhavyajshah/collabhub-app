# CollabHub

A real-time team collaboration tool — chat in channels and manage tasks together.

## Requirements

- Node.js v18+
- MongoDB running locally (default port 27017)

## Setup

```bash
# Install all dependencies
npm run install:all
```

Or manually:

```bash
cd server && npm install
cd ../client && npm install
```

## Environment

Copy `.env` into the `/server` folder (already included):

```
MONGO_URI=mongodb://localhost:27017/collabhub
PORT=5000
```

## Run

Open two terminals:

```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
cd client
npm run dev
```

Frontend: http://localhost:3000
API: http://localhost:5000
