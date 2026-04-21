import { useState, useCallback, useEffect } from 'react';
import api from '../api';

const mergeReceiptIntoMessage = (message, readPayload) => {
  if (!readPayload?.messageIds?.includes(message._id)) return message;

  const existingUsers = (message.readBy || []).map((receipt) => receipt.user?._id || receipt.user?.id);
  if (existingUsers.includes(readPayload.user._id)) {
    return {
      ...message,
      readBy: (message.readBy || []).map((receipt) =>
        (receipt.user?._id || receipt.user?.id) === readPayload.user._id
          ? { ...receipt, readAt: readPayload.user.readAt || receipt.readAt }
          : receipt
      )
    };
  }

  return {
    ...message,
    readBy: [
      ...(message.readBy || []),
      {
        user: {
          _id: readPayload.user._id,
          username: readPayload.user.username,
          email: readPayload.user.email
        },
        readAt: readPayload.user.readAt || new Date().toISOString()
      }
    ]
  };
};

export const useMessages = (channelId) => {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async (pageNum = 1) => {
    if (!channelId || (loading && pageNum > 1)) return;
    setLoading(true);
    try {
      const res = await api.get(`/messages/${channelId}?page=${pageNum}&limit=50`);
      const { messages: newMessages, currentPage, totalPages } = res.data.data;
      
      if (pageNum === 1) {
        setMessages(newMessages);
      } else {
        setMessages(prev => [...newMessages, ...prev]);
      }
      
      setHasMore(currentPage < totalPages);
      setPage(currentPage);
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [channelId, loading]);

  const sendMessage = useCallback(async (content, user, options = {}) => {
    if (!channelId || !content.trim() || sending) return null;
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      channelId,
      content: content.trim(),
      type: options.type || 'standard',
      replyPreview: options.replyTo
        ? {
            messageId: options.replyTo._id,
            senderId: options.replyTo.sender?._id || options.replyTo.sender?.id,
            senderName: options.replyTo.sender?.username || 'User',
            content: options.replyTo.content,
            type: options.replyTo.type || 'standard'
          }
        : undefined,
      sender: user,
      readBy: [
        {
          user,
          readAt: new Date().toISOString()
        }
      ],
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await api.post('/messages/send', { 
        channelId, 
        content: optimisticMsg.content,
        type: optimisticMsg.type,
        replyToId: options.replyTo?._id
      });
      const realMsg = res.data.data;
      setMessages(prev => prev.map(m => m._id === tempId ? realMsg : m));
      return realMsg;
    } catch (err) {
      setError('Failed to send message');
      setMessages(prev => prev.filter(m => m._id !== tempId));
      console.error(err);
      return null;
    } finally {
      setSending(false);
    }
  }, [channelId, sending]);

  const handleIncomingMessage = useCallback((msg) => {
    setMessages(prev => {
      if (msg._id && prev.some(m => m._id === msg._id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const markChannelRead = useCallback(async () => {
    if (!channelId) return null;
    try {
      const res = await api.post('/messages/read', { channelId });
      const readPayload = res.data.data;
      if (readPayload?.messageIds?.length) {
        setMessages(prev => prev.map(message => mergeReceiptIntoMessage(message, readPayload)));
      }
      return readPayload;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [channelId]);

  const handleReadReceipt = useCallback((readPayload) => {
    if (!readPayload?.messageIds?.length) return;
    setMessages(prev => prev.map(message => mergeReceiptIntoMessage(message, readPayload)));
  }, []);

  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
    fetchMessages(1);
  }, [channelId]);

  return { 
    messages, 
    loading, 
    sending, 
    hasMore, 
    page, 
    error, 
    fetchMessages, 
    sendMessage, 
    markChannelRead,
    handleIncomingMessage,
    handleReadReceipt
  };
};
