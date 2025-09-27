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
  CircularProgress,
  CardActions,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import { PlayArrow, Favorite, Share, Star, TrendingUp, LocalMovies, Language } from '@mui/icons-material';
import axios from 'axios';

// TODO: Replace with your actual API keys
const TMDB_API_KEY = 'afb177316dc7ac5e0d16febd780683d3';
const OMDB_API_KEY = '697a954c';

function Home({ searchQuery }) {
  const [movies, setMovies] = useState([]);
  const [bollywoodMovies, setBollywoodMovies] = useState([]);
  const [southMovies, setSouthMovies] = useState([]);
  const [hollywoodMovies, setHollywoodMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
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
        // Fetch more movie categories in parallel for better performance
        const [trendingRes, bollywoodRes, southRes, hollywoodRes, upcomingRes, topRatedRes] = await Promise.allSettled([
          axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`),
          axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_origin_country=IN&sort_by=popularity.desc&page=1`),
          axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_origin_country=IN&with_original_language=ta&sort_by=popularity.desc&page=1`),
          axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_origin_country=US&sort_by=popularity.desc&page=1`),
          axios.get(`https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}&page=1`),
          axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&page=1`)
        ]);

        // Process each category independently
        const processCategory = async (res, fallback = []) => {
          if (res.status === 'fulfilled') {
            return await processMovies(res.value.data.results.slice(0, 20));
          }
          return fallback;
        };

        const [trendingMovies, bollywoodMovies, southMovies, hollywoodMovies, upcomingMovies, topRatedMovies] = await Promise.all([
          processCategory(trendingRes),
          processCategory(bollywoodRes),
          processCategory(southRes),
          processCategory(hollywoodRes),
          processCategory(upcomingRes),
          processCategory(topRatedRes)
        ]);

        setMovies(trendingMovies);
        setBollywoodMovies(bollywoodMovies);
        setSouthMovies(southMovies);
        setHollywoodMovies(hollywoodMovies);
        setUpcomingMovies(upcomingMovies);
        setTopRatedMovies(topRatedMovies);
      } catch (err) {
        console.error('Error fetching movies:', err);
        // Set empty arrays as fallback
        setMovies([]);
        setBollywoodMovies([]);
        setSouthMovies([]);
        setHollywoodMovies([]);
        setUpcomingMovies([]);
        setTopRatedMovies([]);
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
    <Fade in timeout={500}>
      <Card
        sx={{ 
          transition: 'all 0.3s ease-in-out',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          '&:hover': {
            transform: 'translateY(-12px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            '& .movie-poster': {
              transform: 'scale(1.05)'
            }
          }
        }}
      >
        <Box sx={{ position: 'relative', flexGrow: 1, overflow: 'hidden' }}>
          <CardMedia
            className="movie-poster"
            component="img"
            height="360"
            image={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : ''}
            alt={movie.title}
            sx={{ 
              objectFit: 'cover',
              transition: 'transform 0.3s ease-in-out',
              cursor: 'pointer'
            }}
            onClick={() => navigate(`/movie/${movie.id}`)}
          />
          
          {/* Rating Badge */}
          {movie.imdbRating && (
            <Badge
              badgeContent={movie.imdbRating}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                '& .MuiBadge-badge': {
                  backgroundColor: 'rgba(255,193,7,0.9)',
                  color: 'black',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  minWidth: '40px',
                  height: '24px',
                  borderRadius: '12px'
                }
              }}
            />
          )}
          
          {/* Play Button Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0,
              transition: 'opacity 0.3s ease-in-out',
              '&:hover': { opacity: 1 },
              '.MuiCard-root:hover &': { opacity: 1 }
            }}
          >
            <IconButton
              onClick={() => navigate(`/movie/${movie.id}`)}
              sx={{
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                width: 60,
                height: 60,
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <PlayArrow sx={{ fontSize: '2rem' }} />
            </IconButton>
          </Box>
        </Box>
        
        <CardContent sx={{ flexGrow: 0, p: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ 
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '1.1rem',
            cursor: 'pointer',
            '&:hover': { color: 'primary.main' }
          }}>
            <span onClick={() => navigate(`/movie/${movie.id}`)}>
              {movie.title}
            </span>
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip 
              label={new Date(movie.release_date).getFullYear()} 
              size="small" 
              variant="outlined"
              color="primary"
            />
            {movie.vote_average > 0 && (
              <Chip 
                icon={<Star sx={{ fontSize: '16px !important' }} />}
                label={movie.vote_average.toFixed(1)} 
                size="small" 
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
            height: '2.8em'
          }}>
            {movie.overview || 'No description available'}
          </Typography>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Box>
            <Tooltip title="Add to Favorites">
              <IconButton size="small" color="error">
                <Favorite />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton size="small" color="primary">
                <Share />
              </IconButton>
            </Tooltip>
          </Box>
          
          {movie.imdbRating && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating 
                value={parseFloat(movie.imdbRating) / 2} 
                precision={0.1} 
                size="small" 
                readOnly 
              />
              <Typography variant="caption" color="text.secondary">
                ({movie.imdbRating})
              </Typography>
            </Box>
          )}
        </CardActions>
      </Card>
    </Fade>
  );

  const MovieGrid = ({ movies, loading }) => {
    if (loading) {
      return (
        <Grid container spacing={3}>
          {[...Array(20)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card sx={{ borderRadius: '16px' }}>
                <Skeleton variant="rectangular" height={360} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
                <CardActions>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton variant="circular" width={32} height={32} />
                </CardActions>
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
      case 3: return hollywoodMovies;
      case 4: return upcomingMovies;
      case 5: return topRatedMovies;
      default: return movies;
    }
  };

  const getCurrentTitle = () => {
    if (searchQuery) return `🔍 Search Results for "${searchQuery}"`;
    switch (activeTab) {
      case 0: return 'Trending This Week';
      case 1: return 'Bollywood Movies';
      case 2: return 'South Indian Movies';
      case 3: return 'Hollywood Movies';
      case 4: return 'Coming Soon';
      case 5: return 'Top Rated Movies';
      default: return 'Trending This Week';
    }
  };

  const getTabIcon = (index) => {
    switch (index) {
      case 0: return <TrendingUp sx={{ mr: 1 }} />;
      case 1: return <LocalMovies sx={{ mr: 1 }} />;
      case 2: return <Language sx={{ mr: 1 }} />;
      case 3: return <Star sx={{ mr: 1 }} />;
      case 4: return <PlayArrow sx={{ mr: 1 }} />;
      case 5: return <Favorite sx={{ mr: 1 }} />;
      default: return null;
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
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
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
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ 
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              🎬 Welcome to CineHub
            </Typography>
            <Typography variant="h6" sx={{ 
              opacity: 0.95,
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              Discover the latest movies, read reviews, and share your thoughts with the community
            </Typography>
          </Box>
        </Paper>

      {/* Category Tabs */}
      {!searchQuery && (
        <Box sx={{ mb: 4 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              '& .MuiTabs-scrollButtons': {
                color: 'primary.main'
              },
              '& .MuiTab-root': { 
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textTransform: 'none',
                minHeight: '60px',
                borderRadius: '12px',
                margin: '0 4px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)'
                }
              },
              '& .MuiTab-root.Mui-selected': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                color: 'primary.main'
              }
            }}
          >
            <Tab icon={getTabIcon(0)} label="Trending" iconPosition="start" />
            <Tab icon={getTabIcon(1)} label="Bollywood" iconPosition="start" />
            <Tab icon={getTabIcon(2)} label="South Indian" iconPosition="start" />
            <Tab icon={getTabIcon(3)} label="Hollywood" iconPosition="start" />
            <Tab icon={getTabIcon(4)} label="Coming Soon" iconPosition="start" />
            <Tab icon={getTabIcon(5)} label="Top Rated" iconPosition="start" />
          </Tabs>
        </Box>
      )}

      {/* Movies Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          {!searchQuery && getTabIcon(activeTab)}
          <Typography variant="h4" component="h2" sx={{ 
            fontWeight: 'bold',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {getCurrentTitle()}
          </Typography>
        </Box>
        
        {/* Movie Count */}
        {!loading && !searchLoading && getCurrentMovies().length > 0 && (
          <Typography variant="body1" color="text.secondary" sx={{ 
            textAlign: 'center', 
            mb: 3,
          fontWeight: 'bold', 
            fontSize: '1.1rem'
        }}>
            Showing {getCurrentMovies().length} movies
          </Typography>
        )}
        
        {searchLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <Box textAlign="center">
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Searching movies...
              </Typography>
            </Box>
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
