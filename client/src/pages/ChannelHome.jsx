import TagIcon from '@mui/icons-material/Tag'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'

export default function ChannelHome() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff',
      padding: 32
    }}>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        {/* Logo */}
        <img
          src="/webvoltz.svg"
          alt="Webvoltz"
          style={{ height: 24, marginBottom: 28, display: 'inline-block' }}
        />

        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px', color: '#111827' }}>
          Welcome to CollabHub
        </h2>
        <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 32px', lineHeight: 1.6 }}>
          Pick a channel from the sidebar to start collaborating, or create a new one.
        </p>

        {/* Feature chips */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { icon: <TagIcon sx={{ fontSize: 14 }} />, label: 'Channels' },
            { icon: <ChatBubbleOutlineIcon sx={{ fontSize: 14 }} />, label: 'Live Chat' },
            { icon: <CheckBoxOutlineBlankIcon sx={{ fontSize: 14 }} />, label: 'Tasks' },
          ].map(item => (
            <div
              key={item.label}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 20,
                padding: '6px 14px',
                color: '#6b7280',
                fontSize: 12
              }}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
