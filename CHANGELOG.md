# Changelog

## 2026-04-21

## 2026-04-21 (UX & Security Upgrade)

### Security & Connectivity
- Fixed critical CORS issues by reordering Express middleware, allowing the frontend to connect smoothly to the backend API without preflight blockages.
- Secured the channel links: Enforced backend permission validation on direct route access. Users without permissions will now see a strict 403 access control instead of auto-joining through open APIs.

### Channel Features
- **Invite System**: Implemented an explicit "Add User" feature within Channels. Channel members can now directly invite other teammates via their username or email through a clean, built-in modal.

### UI/UX & Layout Optimizations
- **Native-App Aesthetics**: Completely streamlined the Chat and Layout spacing. Drastically reduced paddings and margins to reflect a sleek, professional native-app aesthetic (similar to Slack/Discord).
- Overhauled the Channel Header: Removed bloated, space-consuming conversation summary cards, reclaiming over 30% of the screen height for actual chat history.
- Redesigned message filters into compact, beautifully styled pill buttons with modern hover transitions.
- Adjusted sidebar channel navigation padding for a crisper density.
- Smoothly integrated the typing indicator into the input banner area, preventing it from consuming layout space.

### Chat UX upgrade

- Redesigned the channel conversation area with modern grouped message bubbles
- Added message types: `Chat`, `Update`, `Decision`, and `Blocker`
- Added inline reply flow with reply preview in sent messages
- Added filter chips to view only specific message types
- Added typing indicators for active teammates
- Added conversation summary cards for read coverage and live activity

### Read receipts

- Extended the message schema with a `readBy` array
- Added `POST /api/messages/read` to mark unread channel messages as read
- Broadcast read updates through Socket.io with `messageRead`
- Surfaced per-message teammate read and pending states in the UI

### Real-time improvements

- Added socket events for `typingStart`, `typingStop`, `messageRead`, and `leaveChannel`
- Updated the message hook to merge live read receipts into local state
- Added room leave handling when switching channels

### UI polish

- Improved the chat screen visual hierarchy, spacing, and global surface styling
- Upgraded composer styling and added a message-type selector
- Refined task board styling to match the new conversation surface

### Documentation

- Rewrote all root markdown files to reflect the current architecture and feature set

### Verification

- `cd server && npm run build`
- `cd client && npm run build`
- Client build succeeds with a Vite large-chunk warning only
