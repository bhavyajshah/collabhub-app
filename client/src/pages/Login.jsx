import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { TextField, Button, CircularProgress, Snackbar, Alert } from '@mui/material'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async () => {
    setError('')
    
    // Basic Client-side Validation
    if (!email || !password) {
      setError('Email and password are required')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      // res.data is { success, message, data: { user, token } }
      const { user, token } = res.data.data
      setSuccess(true)
      setTimeout(() => {
        login(user, token)
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Login failed')
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
            Welcome back
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '6px 0 0' }}>
            Sign in to your CollabHub account.
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
              label="Email address"
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
              fullWidth
              size="small"
              sx={inputSx}
            />

            <Button
              variant="contained"
              onClick={handleLogin}
              disabled={loading}
              sx={{
                mt: 1,
                background: '#FFD600',
                color: '#111827',
                fontWeight: 700,
                textTransform: 'none',
                height: 40,
                borderRadius: 7,
                boxShadow: 'none',
                '&:hover': { background: '#e6c200', boxShadow: 'none' },
                '&.Mui-disabled': { background: '#f3f4f6', color: '#9ca3af' }
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign in'}
            </Button>
          </div>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#111827', fontWeight: 600, textDecoration: 'none' }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Snackbar 
        open={success} 
        autoHideDuration={1500} 
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%', fontWeight: 600 }}>
          Login successful! Welcome back.
        </Alert>
      </Snackbar>
    </div>
  )
}
