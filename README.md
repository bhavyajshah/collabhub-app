# CollabHub ⚡

CollabHub is a state-of-the-art team collaboration platform featuring channel-based chat, shared task tracking, and lightning-fast real-time updates over WebSockets. Designed with a **Native-App Aesthetic** (inspired by Discord and Slack), CollabHub offers a rich, dynamic, and space-optimized user interface.

## 🚀 Key Features

### 💬 Real-Time Workspace
- **Instant Messaging**: Real-time channel chat powered by Socket.io with optimistic rendering.
- **Dynamic Channels**: Create or join dedicated channels. 
- **Channel Invites**: Admins and members can natively invite users to a channel by their exact *username* or *email*.
- **Role-Based Access Control**: Fully secured channel routing. Unauthorized users attempting to view private links receive immediate 403 blocks instead of auto-joins.

### 🎨 Premium User Experience & Aesthetics
- **Native-App Layout**: Exceptionally optimized density with reduced padding, slim headers, and hidden scrollbars to maximize the chat visualization area.
- **Message Types (Intents)**: Visually distinguish standard `Chat`, vital `Updates`, team `Decisions`, and pressing `Blockers`.
- **Typing Indicators**: Clean, unobtrusive UI displaying live typing events without disruptive layout shifts.
- **Bubble Context & Grouping**: Smartly groups consecutive messages by the same user and intelligently renders "Reply" context blocks previewing the exact message referenced.

### ✔️ Accountability & Tracking
- **Granular Read Receipts**: Every single message accurately tracks a `readBy` list. See exactly *who* has seen your message and *who* is still pending. 
- **Integrated Project Board (Tasks)**: Seamless built-in task assignment within the channel context. Syncs in real-time alongside chat.

---

## 🛠️ Tech Stack

- **Frontend Environment**: React 18, Vite, Material-UI (MUI), Framer Motion, Socket.io-client.
- **Backend Architecture**: Node.js, Express, TypeScript, Mongoose, Socket.io.
- **Database**: MongoDB.
- **Security Protocols**: Helmet, Express-Rate-Limit, HPP, Mongo-Sanitize, securely positioned CORS.

---

## 🚦 Quick Start

### 1. Install Dependencies
```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Configure Environment variables
Create a `server/.env` file with the following variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/collabhub
JWT_SECRET=your_secret_here
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

*(Note: The `CLIENT_URL` explicitly coordinates securely with early-pipeline CORS checks to prevent preflight blockage).*

### 3. Run Locally 
From the `server` directory:
```bash
npm run dev
```

From the `client` directory:
```bash
npm run dev
```

---

## 🔒 Security Summary
CollabHub protects user data with multiple layers of defense:
1. **API Rate Limiting** to prevent brute-force or spam attacks.
2. **CORS Explicit Whitelisting** to ensure only authorized web clients can communicate with the backend.
3. **Link Verification**: Channel endpoints proactively reject unconfirmed link accesses.

## 📚 Documentation Tracking
- [ARCHITECTURE.md](./ARCHITECTURE.md): System design, socket flow, and message models.
- [CHANGELOG.md](./CHANGELOG.md): History of feature branches, UX refactors, and hotfixes.
- [ANALYSIS.md](./ANALYSIS.md): Initial repository evaluation.
