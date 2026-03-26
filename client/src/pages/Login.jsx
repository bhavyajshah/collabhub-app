import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { TextField, Button, CircularProgress } from '@mui/material'

const API_URL = 'http://localhost:5000/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password })

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))

      navigate('/channels')
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Login failed')
    } finally {
      setLoading(false)
    }
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
            Sign in
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '6px 0 0' }}>
            Welcome back — let's get things done.
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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              fullWidth
              size="small"
              sx={inputSx}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              fullWidth
              size="small"
              sx={inputSx}
            />
            <Button
              variant="contained"
              onClick={handleLogin}
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
              {loading ? <CircularProgress size={18} sx={{ color: '#111827' }} /> : 'Sign in'}
            </Button>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 13, marginTop: 16 }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{ color: '#111827', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid #FFD600' }}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
