import { useEffect, useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  Button, 
  TextField, 
  Box, 
  Typography, 
  Divider, 
  Alert, 
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Google, Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import firebaseApp from '../firebase';

const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

export default function Auth() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
    }
    setLoading(false);
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.code === 'auth/user-not-found' ? 'No account found with this email' : 
               err.code === 'auth/wrong-password' ? 'Incorrect password' : 
               err.code === 'auth/email-already-in-use' ? 'Email already in use' :
               'Authentication failed. Please try again.');
    }
    setLoading(false);
  };

  const handleLogout = () => signOut(auth);

  if (user) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
          Welcome, {user.displayName || user.email?.split('@')[0]}! 🎉
        </Typography>
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={handleLogout}
          sx={{ 
            borderRadius: '25px',
            textTransform: 'none',
            fontWeight: 'bold',
            px: 4
          }}
        >
          Logout
        </Button>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      {error && (
        <Alert severity="error" sx={{ width: '100%', borderRadius: '12px' }}>
          {error}
        </Alert>
      )}
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleGoogleSignIn}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <Google />}
        sx={{ 
          width: '100%',
          py: 1.5,
          borderRadius: '25px',
          textTransform: 'none',
          fontWeight: 'bold',
          fontSize: '1rem',
          background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #3367d6 0%, #2d8f47 100%)',
          }
        }}
      >
        {loading ? 'Signing in...' : 'Continue with Google'}
      </Button>
      
      <Divider sx={{ width: '100%', my: 2 }}>
        <Typography variant="body2" color="text.secondary">
          OR
        </Typography>
      </Divider>
      
      <Box component="form" onSubmit={handleEmailAuth} sx={{ width: '100%' }}>
        <TextField
          label="Email Address"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            }
          }}
        />
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            }
          }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{ 
            mt: 3,
            py: 1.5,
            borderRadius: '25px',
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </Button>
      </Box>
      
      <Button 
        color="secondary" 
        onClick={() => setIsSignUp(s => !s)}
        disabled={loading}
        sx={{ 
          textTransform: 'none',
          fontWeight: 'bold',
          borderRadius: '20px'
        }}
      >
        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
      </Button>
    </Box>
  );
}
