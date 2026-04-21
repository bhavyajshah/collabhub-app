export const MESSAGE_TYPES = [
  {
    value: 'standard',
    label: 'Chat',
    shortLabel: 'Chat',
    color: '#1d4ed8',
    background: 'rgba(219, 234, 254, 0.9)',
    accent: '#bfdbfe'
  },
  {
    value: 'update',
    label: 'Update',
    shortLabel: 'Update',
    color: '#0f766e',
    background: 'rgba(204, 251, 241, 0.9)',
    accent: '#99f6e4'
  },
  {
    value: 'decision',
    label: 'Decision',
    shortLabel: 'Decision',
    color: '#7c3aed',
    background: 'rgba(237, 233, 254, 0.92)',
    accent: '#ddd6fe'
  },
  {
    value: 'blocker',
    label: 'Blocker',
    shortLabel: 'Blocker',
    color: '#b91c1c',
    background: 'rgba(254, 226, 226, 0.92)',
    accent: '#fecaca'
  }
];

export const MESSAGE_TYPE_MAP = MESSAGE_TYPES.reduce((acc, type) => {
  acc[type.value] = type;
  return acc;
}, {});

export const getMessageTypeMeta = (value = 'standard') =>
  MESSAGE_TYPE_MAP[value] || MESSAGE_TYPE_MAP.standard;

export const shouldGroupMessages = (previousMessage, currentMessage) => {
  if (!previousMessage || !currentMessage) return false;

  const previousSenderId = previousMessage.sender?._id || previousMessage.sender?.id;
  const currentSenderId = currentMessage.sender?._id || currentMessage.sender?.id;

  if (!previousSenderId || !currentSenderId || previousSenderId !== currentSenderId) {
    return false;
  }

  const previousTime = new Date(previousMessage.timestamp).getTime();
  const currentTime = new Date(currentMessage.timestamp).getTime();
  return Math.abs(currentTime - previousTime) <= 5 * 60 * 1000;
};
