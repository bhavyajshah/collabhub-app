import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TextField, Button, CircularProgress, Snackbar, Alert } from '@mui/material'
import api from '../api'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async () => {
    setError('')

    // Client-side Validation
    if (!username || !email || !password) {
      setError('All fields are required')
      return
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', { username, email, password })
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSuccess = () => {
    setSuccess(false)
  }

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f9fafb',
      '& fieldset': { borderColor: '#e5e7eb' },
      '&:hover fieldset': { borderColor: '#d1d5db' },
      '&.Mui-focused fieldset': { borderColor: '#FFD600', borderWidth: 1.5 }
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#111827' }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f6f8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/webvoltz.svg"
            alt="Webvoltz"
            style={{ height: 22, marginBottom: 20, display: 'inline-block' }}
          />
          <h1 style={{ color: '#111827', fontSize: 22, fontWeight: 700, margin: 0 }}>
            Create your account
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '6px 0 0' }}>
            Join your team on Webvoltz CollabHub.
          </p>
        </div>

        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: '28px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
        }}>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 7,
              padding: '9px 12px',
              marginBottom: 16,
              color: '#dc2626',
              fontSize: 13
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              size="small"
              sx={inputSx}
            />
            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              size="small"
              sx={inputSx}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
              fullWidth
              size="small"
              sx={inputSx}
            />
            <Button
              variant="contained"
              onClick={handleRegister}
              disabled={loading}
              fullWidth
              sx={{
                background: '#FFD600',
                color: '#111827',
                fontWeight: 700,
                fontSize: 14,
                textTransform: 'none',
                borderRadius: 1.5,
                padding: '9px 0',
                mt: 0.5,
                boxShadow: 'none',
                '&:hover': { background: '#e6c200', boxShadow: 'none' },
                '&.Mui-disabled': { background: '#fef9c3', color: '#a16207' }
              }}
            >
              {loading ? <CircularProgress size={18} sx={{ color: '#111827' }} /> : 'Create account'}
            </Button>
          </div>
        </div>

        {/* Footer link */}
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 13, marginTop: 16 }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: '#111827', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid #FFD600' }}
          >
            Sign in
          </Link>
        </p>
      </div>

      <Snackbar
        open={success}
        autoHideDuration={2000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%', fontWeight: 600 }}>
          User registered successfully! Redirecting to login...
        </Alert>
      </Snackbar>
    </div>
  )
}
