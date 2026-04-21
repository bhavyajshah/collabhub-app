import TagIcon from '@mui/icons-material/Tag'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import { motion } from 'framer-motion' // Adding some animation for production feel

export default function ChannelHome() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff',
      padding: 32,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'rgba(255, 214, 0, 0.05)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: -50,
        left: -50,
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'rgba(255, 214, 0, 0.03)',
        zIndex: 0
      }} />

      <div style={{ textAlign: 'center', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <img
            src="/webvoltz.svg"
            alt="Webvoltz"
            style={{ height: 32, display: 'inline-block' }}
          />
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 16px', color: '#111827', letterSpacing: '-0.02em' }}>
          Welcome to CollabHub
        </h2>
        <p style={{ color: '#6b7280', fontSize: 16, margin: '0 0 40px', lineHeight: 1.6 }}>
          Your central space for team communication and project management. 
          Select a channel to get started.
        </p>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[
            { icon: <TagIcon sx={{ fontSize: 20, color: '#FFD600' }} />, label: 'Channels', desc: 'Thematic rooms' },
            { icon: <ChatBubbleOutlineIcon sx={{ fontSize: 20, color: '#FFD600' }} />, label: 'Chat', desc: 'Real-time talk' },
            { icon: <CheckBoxOutlineBlankIcon sx={{ fontSize: 20, color: '#FFD600' }} />, label: 'Tasks', desc: 'Get things done' },
          ].map(item => (
            <div
              key={item.label}
              style={{
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                gap: 12,
                background: '#ffffff',
                border: '1px solid #f3f4f6',
                borderRadius: 16,
                padding: '20px 12px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease',
                cursor: 'default'
              }}
            >
              <div style={{ 
                width: 44, height: 44, borderRadius: 12, background: '#f9fafb',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: 13 }}>{item.label}</div>
                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
