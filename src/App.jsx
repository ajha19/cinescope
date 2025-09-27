import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container, TextField, InputAdornment, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { Search, AccountCircle, Movie, Home as HomeIcon } from '@mui/icons-material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import Home from './pages/Home.jsx';
import MovieDetail from './pages/MovieDetail.jsx';
import SignIn from './pages/SignIn.jsx';
import Auth from './components/Auth';

function NavBar({ onSearch }) {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
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

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    getAuth().signOut();
    handleMenuClose();
  };

  return (
    <AppBar position="static" sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
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
            mr: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Movie sx={{ fontSize: '2rem' }} />
          CineHub
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
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                borderRadius: '25px',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(255,255,255,0.8)',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255,255,255,0.7)',
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton color="inherit" component={Link} to="/" sx={{ mr: 1 }}>
            <HomeIcon />
          </IconButton>
          <Button 
            color="inherit" 
            component={Link} 
            to="/"
            sx={{ 
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Home
          </Button>
          {user ? (
            <>
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                sx={{ ml: 1 }}
              >
                <Avatar 
                  src={user.photoURL} 
                  sx={{ width: 32, height: 32 }}
                >
                  {(user.displayName || user.email)?.charAt(0)?.toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled>
                  <Typography variant="body2">
                    {user.displayName || user.email?.split('@')[0]}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button 
              color="inherit" 
              variant="outlined" 
              component={Link} 
              to="/signin"
              sx={{ 
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 'bold',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white', 
        py: 3, 
        textAlign: 'center',
        mt: 'auto',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <Typography variant="body2">
        Made with ❤️ by <a href="https://github.com/ajha19" target="_blank" rel="noopener noreferrer" style={{ color: '#ffeb3b', textDecoration: 'none', fontWeight: 'bold' }}>AJ</a>
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