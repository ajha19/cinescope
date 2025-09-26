import { Container, Paper, Typography, Box } from '@mui/material';
import Auth from '../components/Auth';

function SignIn() {
  return (
    <Box sx={{ width: '100%', backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              🎬 Welcome to Cinehub
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to join the community and share your movie thoughts!
            </Typography>
          </Box>
          <Auth />
        </Paper>
      </Container>
    </Box>
  );
}

export default SignIn;
