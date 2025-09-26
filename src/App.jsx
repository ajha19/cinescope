import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import Home from './pages/Home.jsx';
import MovieDetail from './pages/MovieDetail.jsx';
import SignIn from './pages/SignIn.jsx';
import Auth from './components/Auth';

function NavBar({ onSearch }) {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1a1a1a' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            mr: 4
          }}
        >
          🎬 Cinehub
        </Typography>
        
        <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1, maxWidth: 600, mx: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'white' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255,255,255,0.7)',
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                Welcome, {user.displayName || user.email?.split('@')[0]}!
              </Typography>
              <Button
                color="inherit"
                onClick={() => getAuth().signOut()}
                variant="outlined"
                size="small"
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Button color="inherit" variant="outlined" component={Link} to="/signin">
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function Footer() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        backgroundColor: '#1a1a1a', 
        color: 'white', 
        py: 3, 
        textAlign: 'center',
        mt: 'auto'
      }}
    >
      <Typography variant="body2">
        Made with ❤️ by <a href="https://hub.com/ajha19" target="_blank" rel="noopener noreferrer" style={{ color: '#ff6b6b', textDecoration: 'none' }}>AJ</a>
      </Typography>
    </Box>
  );
}

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <Router>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <NavBar onSearch={handleSearch} />
        <Box component="main" sx={{ 
          flexGrow: 1, 
          backgroundColor: '#f5f5f5',
          width: '100%'
        }}>
          <Routes>
            <Route path="/" element={<Home searchQuery={searchQuery} />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/signin" element={<SignIn />} />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Router>
  );
}

export default App