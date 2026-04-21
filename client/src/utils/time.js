export const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatDateTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString([], { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const isToday = (ts) => {
  if (!ts) return false;
  const d = new Date(ts);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

export const isYesterday = (ts) => {
  if (!ts) return false;
  const d = new Date(ts);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
};

export const getDayLabel = (ts) => {
  if (!ts) return '';
  if (isToday(ts)) return 'Today';
  if (isYesterday(ts)) return 'Yesterday';
  return formatDate(ts);
};
