import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/Layout'
import ChannelHome from './pages/ChannelHome'
import ChannelDetail from './pages/ChannelDetail'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/channels"
          element={<PrivateRoute><Layout /></PrivateRoute>}
        >
          <Route index element={<ChannelHome />} />
          <Route path=":id" element={<ChannelDetail />} />
        </Route>
        <Route path="/" element={<Navigate to="/channels" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
