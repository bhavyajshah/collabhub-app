import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, CircularProgress, Select, MenuItem,
  Alert, Snackbar
} from '@mui/material';
import {
  People as PeopleIcon,
  Chat as ChatIcon,
  Assignment as TaskIcon,
  Tag as ChannelIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, channels: 0, messages: 0, tasks: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (err) {
      setError('Failed to fetch admin data. Are you an admin?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put('/admin/users/role', { userId, role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      setSuccessMsg('User role updated successfully');
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      setSuccessMsg('User deleted successfully');
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#111827' }}>
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Users', value: stats.users, icon: <PeopleIcon color="primary" />, color: '#E3F2FD' },
          { label: 'Channels', value: stats.channels, icon: <ChannelIcon color="secondary" />, color: '#F3E5F5' },
          { label: 'Messages', value: stats.messages, icon: <ChatIcon color="success" />, color: '#E8F5E9' },
          { label: 'Tasks', value: stats.tasks, icon: <TaskIcon color="warning" />, color: '#FFF3E0' }
        ].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', background: item.color, borderRadius: 3 }}>
              {item.icon}
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>{item.value}</Typography>
              <Typography color="textSecondary" variant="body2">{item.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Users Table */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mt: 4 }}>
        Manage Users
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ background: '#f9fafb' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Joined Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    size="small"
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    sx={{ minWidth: 100 }}
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDeleteUser(user._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error">{error}</Alert>
      </Snackbar>
      <Snackbar open={!!successMsg} autoHideDuration={6000} onClose={() => setSuccessMsg('')}>
        <Alert onClose={() => setSuccessMsg('')} severity="success">{successMsg}</Alert>
      </Snackbar>
    </Container>
  );
}
