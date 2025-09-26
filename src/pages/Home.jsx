import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Comments from '../components/Comments';
import { 
  Button, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Container,
  Box,
  Chip,
  Skeleton,
  Paper,
  Rating,
  Tabs,
  Tab,
  Fade,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

// TODO: Replace with your actual API keys
const TMDB_API_KEY = 'afb177316dc7ac5e0d16febd780683d3';
const OMDB_API_KEY = '697a954c';

function Home({ searchQuery }) {
  const [movies, setMovies] = useState([]);
  const [bollywoodMovies, setBollywoodMovies] = useState([]);
  const [southMovies, setSouthMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const navigate = useNavigate();

  // Fetch all movie categories
  useEffect(() => {
    async function fetchAllMovies() {
      setLoading(true);
      
      try {
        // Fetch all movie categories in parallel for better performance
        const [trendingRes, bollywoodRes, southRes] = await Promise.allSettled([
          axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`),
          axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_origin_country=IN&sort_by=popularity.desc&page=1`),
          axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_origin_country=IN&with_original_language=ta&sort_by=popularity.desc&page=1`)
        ]);

        // Process each category independently
        const processCategory = async (res, fallback = []) => {
          if (res.status === 'fulfilled') {
            return await processMovies(res.value.data.results.slice(0, 20));
          }
          return fallback;
        };

        const [trendingMovies, bollywoodMovies, southMovies] = await Promise.all([
          processCategory(trendingRes),
          processCategory(bollywoodRes),
          processCategory(southRes)
        ]);

        setMovies(trendingMovies);
        setBollywoodMovies(bollywoodMovies);
        setSouthMovies(southMovies);
      } catch (err) {
        console.error('Error fetching movies:', err);
        // Set empty arrays as fallback
        setMovies([]);
        setBollywoodMovies([]);
        setSouthMovies([]);
      }
      setLoading(false);
      setInitialLoad(false);
    }

    async function processMovies(moviesData) {
      return await Promise.all(
        moviesData.map(async (movie) => {
          let imdbRating = null;
          if (movie.id) {
            try {
              const detailsRes = await axios.get(
                `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}`
              );
              const imdbId = detailsRes.data.imdb_id;
              if (imdbId) {
                const omdbRes = await axios.get(
                  `https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`
                );
                imdbRating = omdbRes.data.imdbRating || null;
              }
            } catch (err) {
              // Skip IMDB rating if not available
            }
          }
          return { ...movie, imdbRating };
        })
      );
    }

    fetchAllMovies();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery) {
      searchMovies(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchMovies = async (query) => {
    setSearchLoading(true);
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`
      );
      const searchData = await processMovies(res.data.results.slice(0, 20));
      setSearchResults(searchData);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    }
    setSearchLoading(false);
  };

  const processMovies = async (moviesData) => {
    if (!moviesData || moviesData.length === 0) return [];
    
    return await Promise.allSettled(
      moviesData.map(async (movie) => {
        let imdbRating = null;
        if (movie.id) {
          try {
            const detailsRes = await axios.get(
              `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}`
            );
            const imdbId = detailsRes.data.imdb_id;
            if (imdbId) {
              const omdbRes = await axios.get(
                `https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`
              );
              imdbRating = omdbRes.data.imdbRating || null;
            }
          } catch (err) {
            // Skip IMDB rating if not available
            console.warn(`Could not fetch IMDB rating for movie ${movie.id}:`, err.message);
          }
        }
        return { ...movie, imdbRating };
      })
    ).then(results => 
      results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value)
    );
  };

  const MovieCard = ({ movie }) => (
    <Fade in timeout={300}>
      <Card
        onClick={() => navigate(`/movie/${movie.id}`)}
        sx={{ 
          cursor: 'pointer',
          transition: 'all 0.3s ease-in-out',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
          }
        }}
      >
        <Box sx={{ position: 'relative', flexGrow: 1 }}>
          <CardMedia
            component="img"
            height="320"
            image={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : ''}
            alt={movie.title}
            sx={{ objectFit: 'cover' }}
          />
          {movie.imdbRating && (
            <Chip
              label={`⭐ ${movie.imdbRating}`}
              color="primary"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          )}
        </Box>
        <CardContent sx={{ flexGrow: 0 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ 
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '1.1rem'
          }}>
            {movie.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            📅 {new Date(movie.release_date).getFullYear()}
          </Typography>
          {movie.imdbRating && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating 
                value={parseFloat(movie.imdbRating) / 2} 
                precision={0.1} 
                size="small" 
                readOnly 
              />
              <Typography variant="body2" color="text.secondary">
                {movie.imdbRating}/10
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Fade>
  );

  const MovieGrid = ({ movies, loading }) => {
    if (loading) {
      return (
        <Grid container spacing={3}>
          {[...Array(12)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={320} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    if (!movies || movies.length === 0) {
      return (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No movies found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try refreshing the page or check your internet connection
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {movies.map((movie) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
            <MovieCard movie={movie} />
          </Grid>
        ))}
      </Grid>
    );
  };

  const getCurrentMovies = () => {
    if (searchQuery) return searchResults;
    switch (activeTab) {
      case 0: return movies;
      case 1: return bollywoodMovies;
      case 2: return southMovies;
      default: return movies;
    }
  };

  const getCurrentTitle = () => {
    if (searchQuery) return `🔍 Search Results for "${searchQuery}"`;
    switch (activeTab) {
      case 0: return '🔥 Trending Movies This Week';
      case 1: return '🎬 Bollywood Movies';
      case 2: return '🎭 South Indian Movies';
      default: return '🔥 Trending Movies This Week';
    }
  };

  // Show initial loading screen to prevent black flash
  if (initialLoad) {
    return (
      <Box sx={{ width: '100%', backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading Cinehub...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            🎬 Welcome to Cinehub
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Discover the latest movies, read reviews, and share your thoughts with the community
          </Typography>
        </Paper>

      {/* Category Tabs */}
      {!searchQuery && (
        <Box sx={{ mb: 4 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            centered
            sx={{ 
              '& .MuiTab-root': { 
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textTransform: 'none'
              }
            }}
          >
            <Tab label="🔥 Trending" />
            <Tab label="🎬 Bollywood" />
            <Tab label="🎭 South Indian" />
          </Tabs>
        </Box>
      )}

      {/* Movies Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ 
          fontWeight: 'bold', 
          mb: 3,
          textAlign: 'center'
        }}>
          {getCurrentTitle()}
        </Typography>
        
        {searchLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <MovieGrid movies={getCurrentMovies()} loading={loading && !searchQuery} />
        )}
      </Box>

        <Comments />
      </Container>
    </Box>
  );
}

export default Home;
