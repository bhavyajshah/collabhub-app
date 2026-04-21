export interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface IChannel {
  _id: string;
  name: string;
  description: string;
  members: string[];
  createdBy: string;
  createdAt: Date;
}

export interface IMessage {
  _id: string;
  channelId: string;
  sender: {
    _id: string;
    username: string;
    email?: string;
  };
  type: 'standard' | 'update' | 'decision' | 'blocker';
  replyPreview?: {
    messageId: string;
    senderId: string;
    senderName: string;
    content: string;
    type: 'standard' | 'update' | 'decision' | 'blocker';
  };
  readBy: Array<{
    user: {
      _id: string;
      username: string;
      email?: string;
    };
    readAt: Date;
  }>;
  content: string;
  timestamp: Date;
  editedAt?: Date;
}

export interface ITask {
  _id: string;
  title: string;
  description: string;
  channelId: string;
  assignedUser: {
    _id: string;
    username: string;
  } | null;
  status: 'todo' | 'in-progress' | 'done';
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface AuthPayload {
  id: string;
  email: string;
}

export interface SocketEvents {
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  sendMessage: (data: { channelId: string; content: string; sender: any; timestamp: Date }) => void;
  messageRead: (data: { channelId: string; messageIds: string[]; user: any }) => void;
  typingStart: (data: { channelId: string; userId: string; username: string }) => void;
  typingStop: (data: { channelId: string; userId: string }) => void;
  taskUpdated: (data: { channelId: string }) => void;
  newMessage: (message: IMessage) => void;
  typingUsers: () => void;
  taskUpdate: () => void;
}
