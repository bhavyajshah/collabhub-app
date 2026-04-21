import { useState, useEffect } from 'react'
import { useNavigate, useParams, Outlet } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import useSocket from '../hooks/useSocket'
import {
  Avatar, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, TextField, Snackbar, Alert
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import LogoutIcon from '@mui/icons-material/Logout'
import TagIcon from '@mui/icons-material/Tag'
import AdminIcon from '@mui/icons-material/AdminPanelSettings'

export default function Layout() {
  const navigate = useNavigate()
  const { id: activeId } = useParams()
  const { user, logout } = useAuth()

  const [channels, setChannels] = useState([])
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newInvitees, setNewInvitees] = useState('')

  const [notification, setNotification] = useState(null)
  const { emit, on, off } = useSocket()

  useEffect(() => {
    fetchChannels()
  }, [])

  useEffect(() => {
    if (user && user._id) {
      emit('registerUser', user._id);
    }
  }, [user, emit]);

  useEffect(() => {
    const handleGlobalNotif = (data) => {
      // Don't toast if the user is already actively looking at that same channel
      if (data.channelId && data.channelId !== activeId) {
        setNotification(data);
      }
    };
    on('globalNotification', handleGlobalNotif);
    return () => off('globalNotification', handleGlobalNotif);
  }, [activeId, on, off]);

  const fetchChannels = async () => {
    try {
      const res = await api.get('/channels')
      // The backend returns { success: true, data: { channels: [], totalChannels: ... } }
      const channelsData = res.data.data?.channels || []
      setChannels(Array.isArray(channelsData) ? channelsData : [])
    } catch (err) {
      console.log(err)
      setChannels([])
    }
  }

  const createChannel = async () => {
    try {
      await api.post('/channels/create', { name: newName, description: newDesc, invitees: newInvitees })
      setCreateOpen(false)
      setNewName('')
      setNewDesc('')
      setNewInvitees('')
      fetchChannels()
    } catch (err) {
      console.log(err)
    }
  }

  const handleChannelClick = (channelId) => {
    navigate(`/dashboard/channels/${channelId}`);
  };

  const initials = (name) => (name ? name.charAt(0).toUpperCase() : '?')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f6f8' }}>
      <header style={{
        height: 54,
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        flexShrink: 0,
        zIndex: 100,
        gap: 16
      }}>
        <div
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          <img src="/webvoltz.svg" alt="Webvoltz" style={{ height: 18 }} />
        </div>

        {activeId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
            <span style={{ color: '#d1d5db', fontSize: 18, fontWeight: 300 }}>/</span>
            <TagIcon sx={{ fontSize: 14, color: '#FFD600' }} />
            <span style={{ color: '#374151', fontSize: 14, fontWeight: 500 }}>
              {Array.isArray(channels) ? (channels.find(c => c._id === activeId)?.name || '...') : '...'}
            </span>
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar sx={{
              width: 28, height: 28, bgcolor: '#FFD600',
              color: '#111827', fontSize: 12, fontWeight: 800
            }}>
              {initials(user?.username)}
            </Avatar>
            <span style={{ color: '#374151', fontSize: 13 }}>{user?.username || 'User'}</span>
          </div>

          {user?.role === 'admin' && (
            <Tooltip title="Admin Dashboard">
              <IconButton onClick={() => navigate('/admin')} size="small">
                <AdminIcon sx={{ fontSize: 20, color: '#6b7280' }} />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Logout">
            <IconButton
              onClick={logout}
              size="small"
              sx={{ color: '#9ca3af', '&:hover': { color: '#111827', background: '#f3f4f6' } }}
            >
              <LogoutIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </div>
      </header>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        <aside style={{
          width: 232,
          background: '#f3f4f6',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflowY: 'auto'
        }}>
          <div style={{
            padding: '12px 12px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{
              color: '#9ca3af',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              Channels
            </span>
            <Tooltip title="Create channel">
              <IconButton
                size="small"
                onClick={() => setCreateOpen(true)}
                sx={{
                  color: '#9ca3af',
                  width: 22, height: 22,
                  '&:hover': { color: '#111827', background: '#e5e7eb' }
                }}
              >
                <AddIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </div>

          <div style={{ flex: 1, padding: '4px 8px 8px' }}>
            {Array.isArray(channels) && channels.map(channel => {
              const isActive = channel._id === activeId
              return (
                <div
                  key={channel._id}
                  onClick={() => handleChannelClick(channel._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 8px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    marginBottom: 2,
                    background: isActive ? '#FFD600' : 'transparent',
                    transition: 'all 0.12s ease',
                    userSelect: 'none'
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#e5e7eb' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <TagIcon sx={{
                    fontSize: 14,
                    color: isActive ? '#111827' : '#9ca3af',
                    flexShrink: 0
                  }} />
                  <span style={{
                    fontSize: 13.5,
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? '#111827' : '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}>
                    {channel.name}
                  </span>
                </div>
              )
            })}

            {channels.length === 0 && (
              <p style={{ color: '#9ca3af', fontSize: 12, padding: '6px 10px', margin: 0 }}>
                No channels yet
              </p>
            )}
          </div>

          <div style={{
            padding: '10px 14px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: 9
          }}>
            <Avatar sx={{
              width: 26, height: 26, bgcolor: '#FFD600',
              color: '#111827', fontSize: 11, fontWeight: 800
            }}>
              {initials(user?.username)}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                margin: 0, fontSize: 12, fontWeight: 600,
                color: '#374151',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {user?.username || 'User'}
              </p>
              <p style={{
                margin: 0, fontSize: 10.5, color: '#9ca3af',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {user?.email || ''}
              </p>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
          </div>
        </aside>

        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
          <Outlet />
        </main>
      </div>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: { background: '#ffffff', borderRadius: 2, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }
        }}
      >
        <DialogTitle sx={{ color: '#111827', fontWeight: 700, fontSize: 16, pb: 1 }}>
          Create a Channel
        </DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 6 }}>
            <TextField
              placeholder="channel-name"
              label="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#e5e7eb' },
                  '&:hover fieldset': { borderColor: '#d1d5db' },
                  '&.Mui-focused fieldset': { borderColor: '#FFD600' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#111827' }
              }}
            />
            <TextField
              placeholder="What's this channel about?"
              label="Description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#e5e7eb' },
                  '&:hover fieldset': { borderColor: '#d1d5db' },
                  '&.Mui-focused fieldset': { borderColor: '#FFD600' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#111827' }
              }}
            />
            <TextField
              placeholder="user1, team@app.com"
              label="Invite Teammates"
              value={newInvitees}
              onChange={(e) => setNewInvitees(e.target.value)}
              fullWidth
              size="small"
              helperText="Comma separated exact usernames or emails"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#e5e7eb' },
                  '&:hover fieldset': { borderColor: '#d1d5db' },
                  '&.Mui-focused fieldset': { borderColor: '#FFD600' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#111827' }
              }}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setCreateOpen(false)}
            sx={{ color: '#6b7280', textTransform: 'none', '&:hover': { background: '#f3f4f6' } }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={createChannel}
            sx={{
              background: '#FFD600', color: '#111827',
              fontWeight: 700, textTransform: 'none',
              borderRadius: 1.5, boxShadow: 'none',
              '&:hover': { background: '#e6c200', boxShadow: 'none' }
            }}
          >
            Create Channel
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ mb: 2, mr: 2, zIndex: 9999 }}
      >
        <Alert
          onClose={() => setNotification(null)}
          severity="info"
          sx={{ 
            width: '100%', 
            borderRadius: 2,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            '& .MuiAlert-icon': { color: '#FFD600' }
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>Notification</div>
          <div style={{ fontSize: 13, color: '#475569' }}>{notification?.message}</div>
        </Alert>
      </Snackbar>
    </div>
  )
}
