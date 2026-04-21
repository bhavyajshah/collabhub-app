import { Avatar as MuiAvatar } from '@mui/material';

export const avatarColor = (name = '') => {
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899'];
  return colors[name.charCodeAt(0) % colors.length];
};

export const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : '?');

export const UserAvatar = ({ name, size = 36, sx = {} }) => {
  return (
    <MuiAvatar
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        fontWeight: 700,
        bgcolor: avatarColor(name),
        ...sx
      }}
    >
      {getInitials(name)}
    </MuiAvatar>
  );
};

export default UserAvatar;
