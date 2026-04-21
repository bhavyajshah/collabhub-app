import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import { Tooltip } from '@mui/material';

import { UserAvatar } from './Avatar';
import { formatDateTime, formatTime } from '../utils/time';
import { getMessageTypeMeta } from '../utils/chat';

const getReadState = (message, members, currentUserId) => {
  const senderId = message.sender?._id || message.sender?.id;
  const teammates = (members || []).filter((member) => member._id !== senderId);
  const readReceipts = message.readBy || [];

  const readMembers = teammates.filter((member) =>
    readReceipts.some((receipt) => (receipt.user?._id || receipt.user?.id) === member._id)
  );

  const unreadMembers = teammates.filter((member) =>
    !readReceipts.some((receipt) => (receipt.user?._id || receipt.user?.id) === member._id)
  );

  const readCurrentUser = readReceipts.some(
    (receipt) => (receipt.user?._id || receipt.user?.id) === currentUserId
  );

  return { readMembers, unreadMembers, readCurrentUser };
};

export const MessageItem = ({
  message,
  currentUserId,
  members = [],
  showAvatar = true,
  isFirstInGroup = true,
  isLastInGroup = true,
  onReply
}) => {
  const isMe = message.sender?._id === currentUserId || message.sender?.id === currentUserId;
  const senderName = message.sender?.username || 'User';
  const messageType = getMessageTypeMeta(message.type);
  const { readMembers, unreadMembers, readCurrentUser } = getReadState(message, members, currentUserId);
  const teammateCount = Math.max((members || []).length - 1, 0);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
        marginTop: isFirstInGroup ? 18 : 6,
        paddingLeft: 4,
        paddingRight: 4
      }}
    >
      <div
        style={{
          maxWidth: '78%',
          display: 'flex',
          flexDirection: isMe ? 'row-reverse' : 'row',
          alignItems: 'flex-end',
          gap: 10
        }}
      >
        <div style={{ width: 34, flexShrink: 0 }}>
          {!isMe && showAvatar ? <UserAvatar name={senderName} size={34} /> : null}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
          {isFirstInGroup && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 6,
                flexWrap: 'wrap',
                justifyContent: isMe ? 'flex-end' : 'flex-start'
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                {isMe ? 'You' : senderName}
              </span>
              <span style={{ fontSize: 11, color: '#64748b' }}>
                {formatTime(message.timestamp)}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 999,
                  padding: '4px 8px',
                  color: messageType.color,
                  background: messageType.background,
                  border: `1px solid ${messageType.accent}`
                }}
              >
                {messageType.shortLabel}
              </span>
            </div>
          )}

          <div
            style={{
              borderRadius: isMe
                ? '20px 20px 8px 20px'
                : '20px 20px 20px 8px',
              background: isMe
                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                : '#ffffff',
              color: isMe ? '#f8fafc' : '#111827',
              padding: '12px 14px',
              border: isMe ? '1px solid rgba(15, 23, 42, 0.2)' : `1px solid ${messageType.accent}`,
              boxShadow: isMe
                ? '0 18px 32px rgba(15, 23, 42, 0.18)'
                : '0 12px 24px rgba(148, 163, 184, 0.14)'
            }}
          >
            {message.replyPreview && (
              <div
                style={{
                  borderRadius: 14,
                  padding: '10px 12px',
                  marginBottom: 10,
                  background: isMe ? 'rgba(255,255,255,0.12)' : '#f8fafc',
                  border: isMe ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0'
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, opacity: 0.9 }}>
                  Replying to {message.replyPreview.senderName}
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.45, opacity: 0.85 }}>
                  {message.replyPreview.content}
                </div>
              </div>
            )}

            <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {message.content}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 7,
              justifyContent: isMe ? 'flex-end' : 'flex-start',
              flexWrap: 'wrap'
            }}
          >
            <button
              type="button"
              onClick={() => onReply?.(message)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                border: 'none',
                background: 'transparent',
                color: '#64748b',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0
              }}
            >
              <ReplyRoundedIcon sx={{ fontSize: 14 }} />
              Reply
            </button>

            {isMe && isLastInGroup && (
              <Tooltip
                title={
                  readMembers.length
                    ? `Read by ${readMembers.map((member) => member.username).join(', ')}`
                    : 'No teammate has read this yet'
                }
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#475569' }}>
                  {readMembers.length > 0 ? (
                    <DoneAllRoundedIcon sx={{ fontSize: 15, color: '#0f766e' }} />
                  ) : (
                    <ScheduleRoundedIcon sx={{ fontSize: 15, color: '#94a3b8' }} />
                  )}
                  <span style={{ fontSize: 11, fontWeight: 700 }}>
                    {readMembers.length > 0
                      ? `Read by ${readMembers.length}/${teammateCount}`
                      : 'Unread by team'}
                  </span>
                </div>
              </Tooltip>
            )}

            {!isMe && readCurrentUser && isLastInGroup && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#0f766e' }}>
                <DoneAllRoundedIcon sx={{ fontSize: 15 }} />
                <span style={{ fontSize: 11, fontWeight: 700 }}>Seen by you</span>
              </div>
            )}
          </div>

          {isMe && isLastInGroup && members.length > 1 && (
            <div
              style={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                alignItems: isMe ? 'flex-end' : 'flex-start'
              }}
            >
              {readMembers.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {readMembers.map((member) => (
                    <Tooltip key={member._id} title={`${member.username} read this`}>
                      <div>
                        <UserAvatar name={member.username} size={20} />
                      </div>
                    </Tooltip>
                  ))}
                </div>
              )}

              {unreadMembers.length > 0 && (
                <div style={{ fontSize: 11, color: '#64748b', textAlign: isMe ? 'right' : 'left' }}>
                  Pending: {unreadMembers.map((member) => member.username).join(', ')}
                </div>
              )}
            </div>
          )}

          <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 6 }}>
            {formatDateTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
