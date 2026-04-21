# CollabHub Architecture

## High-level shape

CollabHub uses a split client-server architecture:

- `client/`: React SPA rendered with Vite
- `server/`: Express API with TypeScript and Mongoose
- Socket.io: real-time room-based delivery for channel events
- MongoDB: persistence for users, channels, messages, and tasks

## Core modules

### Client

- `pages/ChannelDetail.jsx`
  - Main collaboration surface for chat and tasks
  - Handles message composer, filters, reply state, typing state, and read-sync triggers
- `hooks/useMessages.js`
  - Fetches paginated history
  - Sends optimistic messages
  - Merges incoming socket messages
  - Applies read-receipt updates
- `hooks/useSocket.js`
  - Reuses a singleton Socket.io client
  - Joins and leaves channel rooms as the route changes
- `components/MessageItem.jsx`
  - Renders grouped message bubbles
  - Shows reply preview, type badge, and member-level read state

### Server

- `controllers/messageController.ts`
  - Fetches channel-scoped messages
  - Creates messages with type, reply preview, and initial sender receipt
  - Marks unread messages as read for the current user
- `models/Message.ts`
  - Stores message content plus collaboration metadata
- `index.ts`
  - Hosts Socket.io room events for messages, tasks, typing, and read updates

## Message data model

Current message documents support more than plain text:

```ts
type MessageType = 'standard' | 'update' | 'decision' | 'blocker'

interface Message {
  channelId: ObjectId
  sender: ObjectId
  content: string
  type: MessageType
  replyPreview?: {
    messageId: ObjectId
    senderId: ObjectId
    senderName: string
    content: string
    type: MessageType
  }
  readBy: Array<{
    user: ObjectId
    readAt: Date
  }>
  timestamp: Date
  editedAt?: Date
}
```

This model enables:

- semantic bubble styling by message type
- reply context without loading a second query per item
- per-team-member read visibility

## Chat request and event flow

### Send message

1. Client adds an optimistic message to local state.
2. Client posts to `POST /api/messages/send`.
3. Server validates channel membership and stores the message.
4. Server returns the persisted message with populated sender and `readBy`.
5. Client swaps the optimistic item with the real item.
6. Client emits `sendMessage` to the channel room.
7. Other clients receive `newMessage`.

### Read receipt

1. User opens a channel or receives fresh messages while viewing it.
2. Client calls `POST /api/messages/read`.
3. Server finds unread channel messages not sent by the current user.
4. Server pushes a `readBy` receipt for that user.
5. Client emits `messageRead` with changed message ids.
6. Other clients merge the receipts into local state.

### Typing indicator

1. Composer input becomes non-empty.
2. Client emits `typingStart`.
3. Debounced inactivity emits `typingStop`.
4. Other room members render live typing labels.

## Authorization rules

- Channel history is only returned to channel members.
- Message send is limited to channel members.
- Read receipt updates are limited to channel members.
- Task operations remain channel-scoped and authenticated.

## Real-time event list

- `joinChannel`
- `leaveChannel`
- `sendMessage`
- `newMessage`
- `messageRead`
- `typingStart`
- `typingStop`
- `taskUpdated`
- `taskUpdate`

## Current tradeoffs

- Socket events are room-scoped but not yet authenticated at the transport layer.
- Client build produces a large bundle warning; route or vendor chunk splitting would help.
- Read receipts are channel-wide updates, not viewport-precise read markers.

## Recommended next improvements

- Authenticated socket handshake using JWT
- Attachment support
- Search and mention support
- Bundle splitting for the admin and dashboard surfaces
