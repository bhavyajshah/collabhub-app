import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  TextField, IconButton, Tab, Tabs, CircularProgress, Alert, Snackbar,
  Box, Typography, Button, Grid, Paper, Chip, Stack, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddTaskIcon from '@mui/icons-material/AddTask';
import TagIcon from '@mui/icons-material/Tag';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';

import { useAuth } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import { useChannelData } from '../hooks/useChannelData';
import { useMessages } from '../hooks/useMessages';
import { useTasks } from '../hooks/useTasks';
import api from '../api';

import { UserAvatar } from '../components/Avatar';
import { MessageItem } from '../components/MessageItem';
import { TaskItem } from '../components/TaskItem';
import { MESSAGE_TYPES, getMessageTypeMeta, shouldGroupMessages } from '../utils/chat';
import { getDayLabel } from '../utils/time';

const FILTER_OPTIONS = [{ value: 'all', label: 'All' }, ...MESSAGE_TYPES.map((type) => ({
  value: type.value,
  label: type.label
}))];

export default function ChannelDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingStateRef = useRef(false);
  const readSyncTimeoutRef = useRef(null);
  const socket = useSocket(id);

  const { channel, members, loading: loadingChannel, error: channelError } = useChannelData(id);
  const {
    messages,
    loading: loadingMessages,
    sending: sendingMessage,
    hasMore,
    page,
    error: messagesError,
    fetchMessages,
    sendMessage,
    markChannelRead,
    handleIncomingMessage,
    handleReadReceipt
  } = useMessages(id);
  const {
    tasks,
    loading: loadingTasks,
    creating: creatingTask,
    error: tasksError,
    createTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
    handleIncomingTaskUpdate
  } = useTasks(id);

  const [tab, setTab] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('standard');
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [typingUsers, setTypingUsers] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState(null);

  const stopTyping = useCallback(() => {
    if (!typingStateRef.current || !id || !user?._id) return;
    typingStateRef.current = false;
    socket.emit('typingStop', { channelId: id, userId: user._id });
  }, [id, socket, user?._id]);

  const syncReadReceipts = useCallback(async () => {
    const readPayload = await markChannelRead();
    if (readPayload?.messageIds?.length) {
      socket.emit('messageRead', readPayload);
    }
  }, [markChannelRead, socket]);

  useEffect(() => {
    if (channelError) setError(channelError);
    if (messagesError) setError(messagesError);
    if (tasksError) setError(tasksError);
  }, [channelError, messagesError, tasksError]);

  useEffect(() => {
    setTypingUsers([]);
    setReplyingTo(null);
    setNewMessage('');
    setMessageType('standard');
    setActiveFilter('all');
  }, [id]);

  useEffect(() => {
    const onNewMessage = (msg) => handleIncomingMessage(msg);
    const onTaskUpdate = (data) => handleIncomingTaskUpdate(data);
    const onMessageRead = (payload) => handleReadReceipt(payload);
    const onTypingStart = (payload) => {
      if (!payload?.userId || payload.userId === user?._id) return;
      setTypingUsers((prev) =>
        prev.some((typingUser) => typingUser.userId === payload.userId)
          ? prev
          : [...prev, payload]
      );
    };
    const onTypingStop = (payload) => {
      setTypingUsers((prev) => prev.filter((typingUser) => typingUser.userId !== payload?.userId));
    };

    socket.on('newMessage', onNewMessage);
    socket.on('taskUpdate', onTaskUpdate);
    socket.on('messageRead', onMessageRead);
    socket.on('typingStart', onTypingStart);
    socket.on('typingStop', onTypingStop);

    return () => {
      socket.off('newMessage', onNewMessage);
      socket.off('taskUpdate', onTaskUpdate);
      socket.off('messageRead', onMessageRead);
      socket.off('typingStart', onTypingStart);
      socket.off('typingStop', onTypingStop);
    };
  }, [socket, user?._id, handleIncomingMessage, handleIncomingTaskUpdate, handleReadReceipt]);

  useEffect(() => {
    if (page === 1 && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, page]);

  useEffect(() => {
    if (tab !== 0 || !id || messages.length === 0) return;

    window.clearTimeout(readSyncTimeoutRef.current);
    readSyncTimeoutRef.current = window.setTimeout(() => {
      syncReadReceipts();
    }, 350);

    return () => {
      window.clearTimeout(readSyncTimeoutRef.current);
    };
  }, [messages, tab, id, syncReadReceipts]);

  useEffect(() => () => {
    window.clearTimeout(typingTimeoutRef.current);
    window.clearTimeout(readSyncTimeoutRef.current);
    stopTyping();
  }, [stopTyping]);

  const teammateCount = Math.max(members.length - 1, 0);
  const latestOwnMessage = useMemo(
    () => [...messages].reverse().find((message) => (message.sender?._id || message.sender?.id) === user?._id),
    [messages, user?._id]
  );

  const latestOwnReadCount = useMemo(() => {
    if (!latestOwnMessage) return 0;
    return (latestOwnMessage.readBy || []).filter((receipt) => (receipt.user?._id || receipt.user?.id) !== user?._id).length;
  }, [latestOwnMessage, user?._id]);

  const filteredMessages = useMemo(
    () => activeFilter === 'all'
      ? messages
      : messages.filter((message) => message.type === activeFilter),
    [messages, activeFilter]
  );

  const timelineItems = useMemo(() => {
    const items = [];

    filteredMessages.forEach((message, index) => {
      const previousMessage = filteredMessages[index - 1];
      const nextMessage = filteredMessages[index + 1];

      const currentDay = new Date(message.timestamp).toDateString();
      const previousDay = previousMessage ? new Date(previousMessage.timestamp).toDateString() : null;

      if (!previousMessage || previousDay !== currentDay) {
        items.push({
          kind: 'divider',
          id: `divider-${currentDay}-${index}`,
          label: getDayLabel(message.timestamp)
        });
      }

      const isGroupedWithPrevious = shouldGroupMessages(previousMessage, message);
      const isGroupedWithNext = shouldGroupMessages(message, nextMessage);

      items.push({
        kind: 'message',
        id: message._id || `message-${index}`,
        message,
        isFirstInGroup: !isGroupedWithPrevious,
        isLastInGroup: !isGroupedWithNext
      });
    });

    return items;
  }, [filteredMessages]);

  const typingLabel = useMemo(() => {
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) return `${typingUsers[0].username} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`;
    return `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing...`;
  }, [typingUsers]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const sentMsg = await sendMessage(newMessage, user, {
      type: messageType,
      replyTo: replyingTo
    });

    if (sentMsg) {
      socket.emit('sendMessage', sentMsg);
      setNewMessage('');
      setMessageType('standard');
      setReplyingTo(null);
      stopTyping();
    }
  };

  const handleMessageInputChange = (value) => {
    setNewMessage(value);

    // Detect @mention at the end of the input
    const words = value.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      const query = lastWord.slice(1).toLowerCase();
      setMentionQuery(query);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }

    if (!id || !user?._id) return;

    if (value.trim()) {
      if (!typingStateRef.current) {
        typingStateRef.current = true;
        socket.emit('typingStart', {
          channelId: id,
          userId: user._id,
          username: user.username
        });
      }

      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = window.setTimeout(() => {
        stopTyping();
      }, 1200);
    } else {
      window.clearTimeout(typingTimeoutRef.current);
      stopTyping();
    }
  };

  const filteredMentions = useMemo(() => {
    if (mentionQuery === null) return [];
    return members.filter(m => m.username.toLowerCase().includes(mentionQuery)).slice(0, 5);
  }, [mentionQuery, members]);

  const insertMention = (username) => {
    const words = newMessage.split(/\s+/);
    words.pop(); // Remove the typed @query
    const textAfterPop = words.length > 0 ? words.join(' ') + ' ' : '';
    setNewMessage(textAfterPop + `@${username} `);
    setMentionQuery(null);
  };

  const handleMessageKeyDown = (event) => {
    if (mentionQuery !== null && filteredMentions.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setMentionIndex((prev) => (prev + 1) % filteredMentions.length);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setMentionIndex((prev) => (prev - 1 + filteredMentions.length) % filteredMentions.length);
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        insertMention(filteredMentions[mentionIndex].username);
        return;
      }
      if (event.key === 'Escape') {
        setMentionQuery(null);
        return;
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return;
    const newTask = await createTask(taskTitle, taskDesc, taskAssignee);
    if (newTask) {
      setTaskTitle('');
      setTaskDesc('');
      setTaskAssignee('');
      setShowTaskForm(false);
      socket.emit('taskUpdated', { channelId: id, task: newTask });
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    const updatedTask = await updateTaskStatus(taskId, newStatus);
    if (updatedTask) {
      socket.emit('taskUpdated', { channelId: id, task: updatedTask });
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    const updatedTask = await updateTask(taskId, updates);
    if (updatedTask) {
      socket.emit('taskUpdated', { channelId: id, task: updatedTask });
    }
  };

  const handleDeleteTask = async (taskId) => {
    const success = await deleteTask(taskId);
    if (success) {
      socket.emit('taskUpdated', { channelId: id, taskId, deleted: true });
    }
  };

  const handleInvite = async () => {
    if (!inviteUsername.trim()) return;
    try {
      setInviting(true);
      const res = await api.post(`/channels/${id}/invite`, { username: inviteUsername });
      if (res.data?.success) {
        setInviteOpen(false);
        setInviteUsername('');
        // Trigger generic socket event if needed, but page refresh or socket member state is enough
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to invite user');
    } finally {
      setInviting(false);
    }
  };

  const loadMoreMessages = () => {
    if (hasMore && !loadingMessages) {
      const container = chatContainerRef.current;
      const scrollHeight = container ? container.scrollHeight : 0;
      const scrollTop = container ? container.scrollTop : 0;

      fetchMessages(page + 1).then(() => {
        setTimeout(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - scrollHeight + scrollTop;
          }
        }, 0);
      });
    }
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #f8fbff 0%, #eef4ff 30%, #f8fafc 100%)'
      }}
    >
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <div
        style={{
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          padding: '12px 20px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #facc15 0%, #f97316 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <TagIcon sx={{ fontSize: 20, color: '#111827' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                  {loadingChannel ? 'Loading...' : (channel?.name || 'Channel')}
                </h1>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>•</span>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                  {members.length} member{members.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b', maxWidth: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {channel?.description || 'No description provided.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderRight: '1px solid #e2e8f0', paddingRight: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b' }}>
                <VisibilityRoundedIcon sx={{ fontSize: 14 }} />
                <span style={{ fontSize: 12, fontWeight: 500 }}>Read: {latestOwnReadCount}/{teammateCount || 0}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b' }}>
                <BoltRoundedIcon sx={{ fontSize: 14 }} />
                <span style={{ fontSize: 12, fontWeight: 500 }}>{messages.length} msgs</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              {members.slice(0, 5).map((member, index) => (
                <UserAvatar
                  key={member._id}
                  name={member.username}
                  size={28}
                  sx={{
                    border: '2px solid #fff',
                    marginLeft: index === 0 ? 0 : '-6px'
                  }}
                />
              ))}
              <Tooltip title="Add user to channel">
                <IconButton 
                  onClick={() => setInviteOpen(true)}
                  size="small"
                  sx={{ 
                    ml: 1, 
                    border: '1px dashed #cbd5e1', 
                    color: '#64748b',
                    '&:hover': { background: '#f1f5f9', color: '#0f172a', borderColor: '#94a3b8' }
                  }}
                >
                  <PersonAddAlt1RoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginTop: 4,
            flexWrap: 'wrap'
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            sx={{
              minHeight: 28,
              '& .MuiTabs-indicator': { backgroundColor: '#111827', height: 2 },
              '& .MuiTab-root': {
                minHeight: 28,
                minWidth: 'auto',
                padding: '4px 12px',
                color: '#64748b',
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'none',
              },
              '& .Mui-selected': { color: '#0f172a !important' }
            }}
          >
            <Tab label="Conversation" />
            <Tab label="Tasks" />
          </Tabs>

          {tab === 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {FILTER_OPTIONS.map((option) => {
                const meta = option.value === 'all' ? null : getMessageTypeMeta(option.value);
                const isActive = activeFilter === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setActiveFilter(option.value)}
                    style={{
                      borderRadius: 6,
                      border: 'none',
                      background: isActive ? '#0f172a' : 'transparent',
                      color: isActive ? '#f8fafc' : (meta?.color || '#64748b'),
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {tab === 0 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f8fafc' }}>


          <div
            ref={chatContainerRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px 24px 0',
            }}
            onScroll={(event) => {
              if (event.currentTarget.scrollTop === 0 && hasMore && !loadingMessages) {
                loadMoreMessages();
              }
            }}
          >
            {hasMore && (
              <div style={{ textAlign: 'center', padding: 12 }}>
                {loadingMessages ? (
                  <CircularProgress size={22} />
                ) : (
                  <button
                    type="button"
                    onClick={loadMoreMessages}
                    style={{
                      border: 'none',
                      background: '#e2e8f0',
                      color: '#334155',
                      fontSize: 12,
                      fontWeight: 800,
                      borderRadius: 999,
                      padding: '8px 12px',
                      cursor: 'pointer'
                    }}
                  >
                    Load earlier messages
                  </button>
                )}
              </div>
            )}

            {timelineItems.length === 0 && !loadingMessages && (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 62, height: 62, borderRadius: 20, background: '#dbeafe', marginBottom: 16 }}>
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 28, color: '#1d4ed8' }} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  No messages in this view
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>
                  Start with a quick update, decision, blocker, or regular chat message.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 10px 20px' }}>
              {timelineItems.map((item) => {
                if (item.kind === 'divider') {
                  return (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'center', margin: '18px 0 10px' }}>
                      <div style={{ padding: '6px 12px', borderRadius: 999, background: '#e2e8f0', color: '#334155', fontSize: 11, fontWeight: 800 }}>
                        {item.label}
                      </div>
                    </div>
                  );
                }

                return (
                  <MessageItem
                    key={item.id}
                    message={item.message}
                    currentUserId={user?._id}
                    members={members}
                    onReply={setReplyingTo}
                    showAvatar={item.isLastInGroup}
                    isFirstInGroup={item.isFirstInGroup}
                    isLastInGroup={item.isLastInGroup}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div
            style={{
              padding: '12px 16px',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0'
            }}
          >
            {replyingTo && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                  borderRadius: 16,
                  padding: '12px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  marginBottom: 12
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#1d4ed8' }}>
                    <ReplyRoundedIcon sx={{ fontSize: 15 }} />
                    Replying to {replyingTo.sender?.username || 'User'}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                    {replyingTo.content}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  style={{ border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', fontWeight: 700 }}
                >
                  Clear
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'nowrap', position: 'relative' }}>
              
              {/* Mentions Popover */}
              {mentionQuery !== null && filteredMentions.length > 0 && (
                <Paper 
                  elevation={4} 
                  sx={{ 
                    position: 'absolute', bottom: '100%', left: 160, mb: 1, 
                    minWidth: 200, borderRadius: 2, overflow: 'hidden', zIndex: 10
                  }}
                >
                  {filteredMentions.map((member, idx) => (
                    <Box 
                      key={member._id}
                      onClick={() => insertMention(member.username)}
                      sx={{
                        p: 1, px: 2, display: 'flex', alignItems: 'center', gap: 1.5,
                        cursor: 'pointer',
                        bgcolor: idx === mentionIndex ? '#f1f5f9' : 'transparent',
                        '&:hover': { bgcolor: '#f1f5f9' }
                      }}
                    >
                      <UserAvatar name={member.username} size={24} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{member.username}</Typography>
                    </Box>
                  ))}
                </Paper>
              )}

              <TextField
                select
                value={messageType}
                onChange={(event) => setMessageType(event.target.value)}
                size="small"
                sx={{
                  minWidth: 120,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 8,
                    bgcolor: '#f8fafc',
                    height: 40,
                    fontSize: 13
                  }
                }}
              >
                {MESSAGE_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value} sx={{ fontSize: 13 }}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder={`Message #${channel?.name || 'channel'}`}
                variant="outlined"
                value={newMessage}
                onChange={(event) => handleMessageInputChange(event.target.value)}
                onKeyDown={handleMessageKeyDown}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 8,
                    background: '#f8fafc',
                    padding: '8px 14px',
                    fontSize: 14,
                    lineHeight: 1.4
                  }
                }}
              />

              <IconButton
                disabled={!newMessage.trim() || sendingMessage}
                onClick={handleSendMessage}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: newMessage.trim()
                    ? 'linear-gradient(135deg, #0f172a 0%, #334155 100%)'
                    : '#e2e8f0',
                  color: newMessage.trim() ? '#fff' : '#94a3b8',
                  '&:hover': {
                    background: newMessage.trim()
                      ? 'linear-gradient(135deg, #111827 0%, #1e293b 100%)'
                      : '#e2e8f0'
                  }
                }}
              >
                {sendingMessage ? <CircularProgress size={18} color="inherit" /> : <SendIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8, flexWrap: 'wrap', paddingLeft: 4 }}>
              <div style={{ fontSize: 12, color: typingLabel ? '#1d4ed8' : '#64748b', fontWeight: typingLabel ? 600 : 400 }}>
                {typingLabel || 'Shift + Enter for a new line. Enter to send.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 1 && (
        <Box sx={{ flex: 1, p: 3, height: '100%', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Project Board
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: '#64748b' }}>
                Keep execution aligned with the same channel context and member roster.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddTaskIcon />}
              onClick={() => setShowTaskForm(!showTaskForm)}
              sx={{
                background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                color: '#f8fafc',
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 700,
                px: 2.5,
                '&:hover': { background: 'linear-gradient(135deg, #111827 0%, #1e293b 100%)' }
              }}
            >
              {showTaskForm ? 'Cancel' : 'New Task'}
            </Button>
          </Box>

          {showTaskForm && (
            <Box sx={{
              background: '#fff',
              borderRadius: 4,
              p: 3,
              border: '1px solid #e2e8f0',
              mb: 4,
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)'
            }}>
              <TextField
                fullWidth
                label="Task Title"
                size="small"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                size="small"
                multiline
                rows={2}
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  select
                  label="Assign To"
                  size="small"
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  SelectProps={{ native: true }}
                  sx={{ flex: 1, minWidth: 220 }}
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member._id} value={member._id}>{member.username}</option>
                  ))}
                </TextField>
                <Button
                  disabled={creatingTask}
                  onClick={handleCreateTask}
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #facc15 0%, #f97316 100%)',
                    color: '#111827',
                    fontWeight: 800,
                    borderRadius: 3,
                    px: 4
                  }}
                >
                  {creatingTask ? <CircularProgress size={20} color="inherit" /> : 'Create Task'}
                </Button>
              </Box>
            </Box>
          )}

          {loadingTasks ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress size={32} /></Box>
          ) : (
            <Grid container spacing={3}>
              {['todo', 'in-progress', 'done'].map((status) => (
                <Grid item xs={12} md={4} key={status}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: '#f8fafc',
                      borderRadius: 4,
                      minHeight: 500,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 20px 40px rgba(15, 23, 42, 0.06)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, px: 1 }}>
                      <Box sx={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        bgcolor: status === 'todo' ? '#64748b' : status === 'in-progress' ? '#f59e0b' : '#10b981'
                      }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#475569' }}>
                        {status.replace('-', ' ')}
                      </Typography>
                      <Chip
                        label={tasks.filter((task) => task.status === status).length}
                        size="small"
                        sx={{ ml: 'auto', fontWeight: 700, height: 22, fontSize: 10, bgcolor: '#fff', border: '1px solid #e2e8f0' }}
                      />
                    </Box>

                    <Stack spacing={2}>
                      {tasks.filter((task) => task.status === status).map((task) => (
                        <TaskItem
                          key={task._id}
                          task={task}
                          onStatusChange={(newStatus) => handleUpdateTaskStatus(task._id, newStatus)}
                          onDelete={handleDeleteTask}
                          onUpdateTask={handleUpdateTask}
                        />
                      ))}
                      {tasks.filter((task) => task.status === status).length === 0 && (
                        <Typography variant="body2" sx={{ textAlign: 'center', py: 4, color: '#94a3b8', fontStyle: 'italic' }}>
                          No tasks here yet
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Invite Member Dialog */}
      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>
          Add to Channel
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5 }}>
            Invite a teammate to this channel by their username or email. They will immediately gain access to the full conversation history.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Username or Email"
            size="small"
            value={inviteUsername}
            onChange={(e) => setInviteUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInvite();
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setInviteOpen(false)} sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button 
            onClick={handleInvite} 
            variant="contained" 
            disabled={inviting || !inviteUsername.trim()}
            sx={{ 
              background: '#FFD600', 
              color: '#111827', 
              textTransform: 'none', 
              fontWeight: 700,
              boxShadow: 'none',
              '&:hover': { background: '#facc15', boxShadow: 'none' } 
            }}
          >
            {inviting ? <CircularProgress size={20} color="inherit" /> : 'Invite'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
