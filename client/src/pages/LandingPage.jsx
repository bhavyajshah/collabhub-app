import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Grid, Paper, Stack,
  useTheme, useMediaQuery, AppBar, Toolbar, Avatar, AvatarGroup,
  Divider, Accordion, AccordionSummary, AccordionDetails, Chip
} from '@mui/material';
import {
  Chat as ChatIcon,
  Assignment as TaskIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Groups as GroupsIcon,
  AutoGraph as StatsIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  RocketLaunch as RocketIcon,
  ElectricBolt as BoltIcon,
  WorkspacePremium as PremiumIcon,
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  Layers as LayersIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const GlassCard = ({ children, sx = {} }) => (
  <Paper
    elevation={0}
    sx={{
      p: 4,
      borderRadius: 6,
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      ...sx
    }}
  >
    {children}
  </Paper>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{
      bgcolor: '#ffffff',
      minHeight: '100vh',
      overflowX: 'hidden',
      backgroundImage: 'radial-gradient(circle at 0% 0%, #FFD60010 0%, transparent 50%), radial-gradient(circle at 100% 100%, #FFD60015 0%, transparent 50%)'
    }}>
      {/* Navbar */}
      <AppBar position="fixed" elevation={0} sx={{
        bgcolor: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(229, 231, 235, 0.5)'
      }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', px: '0 !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
                <Box sx={{ width: 40, height: 40, bgcolor: '#FFD600', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255, 214, 0, 0.4)' }}>
                  <RocketIcon sx={{ color: '#111827' }} />
                </Box>
              </motion.div>
              <Typography variant="h5" sx={{ color: '#111827', fontWeight: 900, letterSpacing: -1.5, fontSize: '1.5rem' }}>
                CollabHub<span style={{ color: '#FFD600' }}>.</span>
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              {user ? (
                <>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    sx={{ color: '#111827', fontWeight: 700, px: 3, borderRadius: 2 }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="contained"
                    onClick={logout}
                    sx={{
                      bgcolor: '#fef2f2',
                      color: '#dc2626',
                      borderRadius: 3,
                      px: 3,
                      fontWeight: 800,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#fee2e2' }
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => navigate('/login')} sx={{ color: '#111827', fontWeight: 700, px: 3, borderRadius: 2 }}>Login</Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/register')}
                    sx={{
                      bgcolor: '#111827',
                      color: '#fff',
                      borderRadius: 3,
                      px: 4,
                      py: 1,
                      fontWeight: 800,
                      textTransform: 'none',
                      boxShadow: '0 10px 20px -5px rgba(17, 24, 39, 0.3)',
                      '&:hover': { bgcolor: '#000', transform: 'translateY(-2px)' },
                      transition: 'all 0.2s'
                    }}
                  >
                    Join Now
                  </Button>
                </>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: { xs: 15, md: 25 }, pb: { xs: 10, md: 15 } }}>
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={7}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={<LayersIcon sx={{ color: '#FFD600 !important', fontSize: '1.2rem' }} />}
                  label="The Ultimate Hybrid: Slack + Trello"
                  sx={{
                    bgcolor: '#111827',
                    color: '#fff',
                    fontWeight: 800,
                    px: 2,
                    py: 3,
                    fontSize: '1rem',
                    mb: 4,
                    border: '2px solid #FFD600'
                  }}
                />
              </Box>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '3.5rem', md: '5.5rem' },
                  fontWeight: 950,
                  lineHeight: 0.9,
                  color: '#111827',
                  mb: 4,
                  letterSpacing: -4
                }}
              >
                Communication <br />
                Meets <span style={{
                  background: 'linear-gradient(90deg, #FFD600, #FFAA00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Execution.</span>
              </Typography>
              <Typography variant="h6" sx={{ color: '#4b5563', mb: 6, fontWeight: 500, maxWidth: 650, fontSize: '1.3rem', lineHeight: 1.6 }}>
                Why settle for just chat or just tasks? CollabHub brings the <span style={{ color: '#111827', fontWeight: 800 }}>Real-time Speed of Slack</span> and the <span style={{ color: '#111827', fontWeight: 800 }}>Visual Organization of Trello</span> into one seamless engine.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                <Button
                  size="large"
                  variant="contained"
                  endIcon={<ArrowIcon />}
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: '#FFD600',
                    color: '#111827',
                    fontWeight: 900,
                    px: 6,
                    py: 2.5,
                    borderRadius: 4,
                    fontSize: '1.2rem',
                    boxShadow: '0 20px 40px -10px rgba(255, 214, 0, 0.5)',
                    '&:hover': { bgcolor: '#FFC400', transform: 'scale(1.02)' },
                    transition: 'all 0.3s'
                  }}
                >
                  Start Building Today
                </Button>
              </Stack>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={5}>
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Paper
                  elevation={24}
                  sx={{
                    borderRadius: 8,
                    overflow: 'hidden',
                    position: 'relative',
                    zIndex: 1,
                    border: '10px solid #111827',
                    boxShadow: '0 50px 100px -20px rgba(0,0,0,0.3)'
                  }}
                >
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
                    sx={{ width: '100%', display: 'block' }}
                  />
                  <Box sx={{ p: 4, bgcolor: '#111827', color: '#fff' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>Productivity Boost</Typography>
                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>Real-time execution dashboard</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFD600' }}>+40%</Typography>
                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>Efficiency</Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Paper>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* The Hybrid Explanation Section */}
      <Box sx={{ py: 15, bgcolor: '#f9fafb' }}>
        <Container maxWidth="lg">
          <Grid container spacing={10} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <GlassCard sx={{ p: 0, overflow: 'hidden', borderRadius: 8 }}>
                  <Box component="img" src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2070&auto=format&fit=crop" sx={{ width: '100%' }} />
                </GlassCard>
                <Paper sx={{ position: 'absolute', bottom: -30, right: -30, p: 3, bgcolor: '#FFD600', borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: '#111827' }}><BoltIcon sx={{ color: '#FFD600' }} /></Avatar>
                    <Typography fontWeight={900}>Instant Sync</Typography>
                  </Stack>
                </Paper>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="overline" sx={{ color: '#FFD600', fontWeight: 900, letterSpacing: 2 }}>THE ARCHITECTURE</Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 4, mt: 1, letterSpacing: -1.5 }}>Slack-Speed, Trello-Style.</Typography>
              <Typography variant="body1" sx={{ color: '#4b5563', fontSize: '1.2rem', lineHeight: 1.8, mb: 4 }}>
                We built CollabHub because teams shouldn't have to jump between a chat app and a project manager.
              </Typography>
              <Stack spacing={3}>
                {[
                  { title: 'The Slack Flow', desc: 'Instant messaging channels for lightning-fast team communication.', icon: <ChatIcon sx={{ color: '#FFD600' }} /> },
                  { title: 'The Trello Logic', desc: 'Integrated task boards within every channel to visualize progress.', icon: <TaskIcon sx={{ color: '#FFD600' }} /> },
                  { title: 'The CollabHub Edge', desc: 'One workspace. One context. Zero friction.', icon: <BoltIcon sx={{ color: '#FFD600' }} /> }
                ].map((item, i) => (
                  <Stack key={i} direction="row" spacing={3}>
                    <Box sx={{ mt: 0.5 }}>{item.icon}</Box>
                    <Box>
                      <Typography variant="h6" fontWeight={800}>{item.title}</Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>{item.desc}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box sx={{ py: 20 }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ fontWeight: 950, textAlign: 'center', mb: 10, letterSpacing: -2 }}>Loved by Teams.</Typography>
          <Grid container spacing={4}>
            {[
              { name: 'Sarah Chen', role: 'CTO @ TechFlow', quote: 'The hybrid approach changed our workflow. No more lost context between Slack and Jira.' },
              { name: 'James Wilson', role: 'Lead Dev @ Buildly', quote: 'Real-time task updates are actually real-time. The socket implementation is flawless.' },
              { name: 'Elena Rodriguez', role: 'Product Manager', quote: 'Clean, simple, and insanely fast. It just works exactly how a team needs it to.' }
            ].map((t, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Paper sx={{ p: 5, borderRadius: 6, border: '1px solid #e5e7eb', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Stack direction="row" sx={{ mb: 2 }}>{[1, 2, 3, 4, 5].map(s => <StarIcon key={s} sx={{ color: '#FFD600', fontSize: 20 }} />)}</Stack>
                    <Typography variant="h6" sx={{ fontStyle: 'italic', fontWeight: 500, color: '#4b5563', lineHeight: 1.6 }}>"{t.quote}"</Typography>
                  </Box>
                  <Stack direction="row" spacing={2} sx={{ mt: 4 }} alignItems="center">
                    <Avatar src={`https://i.pravatar.cc/150?u=${i + 10}`} />
                    <Box>
                      <Typography fontWeight={900}>{t.name}</Typography>
                      <Typography variant="caption" color="textSecondary">{t.role}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: 15, bgcolor: '#f9fafb' }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 900, textAlign: 'center', mb: 8, letterSpacing: -1.5 }}>Common Questions</Typography>
          {[
            { q: "Is it really as fast as Slack?", a: "Yes. Our Socket.io implementation ensures sub-50ms latency for all messages and task updates." },
            { q: "Can I manage multiple projects?", a: "Absolutely. Each channel acts as a dedicated workspace with its own chat and task board." },
            { q: "How secure is my data?", a: "We use AES-256 encryption and strict RBAC (Role-Based Access Control) to keep your team's data private." },
            { q: "Is there a mobile app?", a: "CollabHub is a fully responsive PWA (Progressive Web App) that works perfectly on any mobile browser." }
          ].map((faq, i) => (
            <Accordion key={i} sx={{ mb: 2, borderRadius: '16px !important', '&:before': { display: 'none' }, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={800} sx={{ py: 1 }}>{faq.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="textSecondary">{faq.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>

      {/* Pricing Section - FIXED COLORS */}
      <Box sx={{ bgcolor: '#111827', py: 20, color: '#fff', borderRadius: { md: '100px 100px 0 0' } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, letterSpacing: -2 }}>Ready to scale?</Typography>
            <Typography variant="h6" sx={{ color: '#9ca3af', fontWeight: 400 }}>Start for free, upgrade when you grow.</Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 6, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', mb: 1 }}>Free Plan</Typography>
                <Typography variant="h2" sx={{ fontWeight: 950, color: '#FFD600', mb: 4 }}>$0<span style={{ fontSize: '1rem', color: '#9ca3af' }}>/mo</span></Typography>
                <Stack spacing={2} sx={{ mb: 6 }}>
                  {['Unlimited Channels', 'Real-time Chat', 'Basic Task Management', '5GB Storage'].map(f => (
                    <Stack direction="row" spacing={2} key={f}>
                      <CheckIcon sx={{ color: '#FFD600' }} />
                      <Typography fontWeight={600} sx={{ color: '#fff' }}>{f}</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Button fullWidth variant="outlined" onClick={() => navigate('/register')} sx={{ borderColor: '#fff', color: '#fff', py: 2, borderRadius: 3, fontWeight: 800 }}>Get Started</Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper sx={{
                p: 6,
                bgcolor: '#FFD600',
                borderRadius: 8,
                boxShadow: '0 30px 60px -12px rgba(255, 214, 0, 0.3)',
                transform: { md: 'scale(1.05)' }
              }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#111827', mb: 1 }}>Pro Plan</Typography>
                  <PremiumIcon sx={{ color: '#111827' }} />
                </Stack>
                <Typography variant="h2" sx={{ fontWeight: 950, color: '#111827', mb: 4 }}>$12<span style={{ fontSize: '1rem', color: '#4b5563' }}>/mo</span></Typography>
                <Stack spacing={2} sx={{ mb: 6 }}>
                  {['Advanced Admin Tools', 'File Sharing', 'Priority Support', 'Custom Integrations'].map(f => (
                    <Stack direction="row" spacing={2} key={f}>
                      <CheckIcon sx={{ color: '#111827' }} />
                      <Typography fontWeight={600} color="#111827">{f}</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Button fullWidth variant="contained" onClick={() => navigate('/register')} sx={{ bgcolor: '#111827', color: '#fff', py: 2, borderRadius: 3, fontWeight: 800 }}>Go Pro</Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box sx={{ py: 15, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h2" sx={{ fontWeight: 950, mb: 4, letterSpacing: -2 }}>Stop jumping between apps.</Typography>
          <Typography variant="h6" sx={{ color: '#6b7280', mb: 6 }}>Join 2,000+ teams who have simplified their workflow with CollabHub.</Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{ bgcolor: '#111827', color: '#fff', px: 8, py: 2.5, borderRadius: 4, fontWeight: 900, fontSize: '1.2rem' }}
          >
            Get Started for Free
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#111827', pt: 10, pb: 5, color: '#fff' }}>
        <Container maxWidth="lg">
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 10 }} />
          <Grid container spacing={4} justifyContent="space-between">
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ width: 32, height: 32, bgcolor: '#FFD600', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RocketIcon sx={{ color: '#111827', fontSize: 20 }} />
                </Box>
                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, letterSpacing: -1 }}>CollabHub</Typography>
              </Box>
              <Typography sx={{ color: '#9ca3af', maxWidth: 300, lineHeight: 1.8 }}>
                The mission is simple: To provide the world's teams with the most intuitive collaboration engine ever built.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <Typography fontWeight={900} sx={{ mb: 3 }}>PRODUCT</Typography>
                  <Stack spacing={2} sx={{ color: '#9ca3af' }}>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#FFD600' } }}>Features</Typography>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#FFD600' } }}>Security</Typography>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#FFD600' } }}>Roadmap</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontWeight={900} sx={{ mb: 3 }}>LEGAL</Typography>
                  <Stack spacing={2} sx={{ color: '#9ca3af' }}>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#FFD600' } }}>Privacy</Typography>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#FFD600' } }}>Terms</Typography>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#FFD600' } }}>License</Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Typography variant="body2" sx={{ mt: 15, color: '#4b5563', textAlign: 'center', fontWeight: 700 }}>
            MADE WITH ❤️ BY WEBVOLTZ TEAM | © 2026 COLLABHUB. ALL RIGHTS RESERVED.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
