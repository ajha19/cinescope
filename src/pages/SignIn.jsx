import { Container, Paper, Typography, Box, Fade } from '@mui/material';
import { Movie } from '@mui/icons-material';
import Auth from '../components/Auth';

function SignIn() {
  return (
    <Box sx={{ 
      width: '100%', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg") center/cover',
        opacity: 0.1,
        zIndex: 0
      }
    }}>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Fade in timeout={800}>
          <Paper elevation={10} sx={{ 
            p: 4, 
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            position: 'relative',
            zIndex: 1
          }}>
            <Box textAlign="center" mb={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Movie sx={{ fontSize: '3rem', color: 'primary.main', mr: 1 }} />
                <Typography variant="h3" component="h1" sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  CineHub
                </Typography>
              </Box>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Welcome Back!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to join the community and share your movie thoughts!
              </Typography>
            </Box>
            <Auth />
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}

export default SignIn;
