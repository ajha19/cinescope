import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box, 
  Grid, 
  Avatar, 
  Container,
  Paper,
  Chip,
  Rating,
  Button,
  Divider,
  Skeleton,
  Fade,
  CircularProgress,
  Backdrop
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Comments from '../components/Comments';

// TODO: Use the same API keys as Home.jsx
const TMDB_API_KEY = 'afb177316dc7ac5e0d16febd780683d3';
const OMDB_API_KEY = '697a954c';

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [imdbRating, setImdbRating] = useState(null);
  const [cast, setCast] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      setLoading(true);
      setInitialLoad(true);
      
      // Small delay to prevent black screen flash
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        // Fetch movie details from TMDB
        const res = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`
        );
        setMovie(res.data);
        
        // Fetch additional data in parallel
        const [omdbRes, castRes, videosRes] = await Promise.allSettled([
          res.data.imdb_id ? axios.get(
            `https://www.omdbapi.com/?i=${res.data.imdb_id}&apikey=${OMDB_API_KEY}`
          ) : Promise.resolve({ data: { imdbRating: null } }),
          axios.get(
            `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${TMDB_API_KEY}`
          ),
          axios.get(
            `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${TMDB_API_KEY}`
          )
        ]);

        // Set IMDB rating
        if (omdbRes.status === 'fulfilled') {
          setImdbRating(omdbRes.value.data.imdbRating || null);
        }

        // Set cast
        if (castRes.status === 'fulfilled') {
          setCast(castRes.value.data.cast.slice(0, 8));
        }

        // Set trailer
        if (videosRes.status === 'fulfilled') {
          const ytTrailer = videosRes.value.data.results.find(
            v => v.site === 'YouTube' && v.type === 'Trailer'
          );
          setTrailer(ytTrailer ? `https://www.youtube.com/embed/${ytTrailer.key}` : null);
        }
      } catch (err) {
        console.error('Error fetching movie:', err);
        setMovie(null);
      }
      
      setLoading(false);
      setInitialLoad(false);
    }
    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ width: '100%', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/')}
            sx={{ mb: 3 }}
            variant="outlined"
          >
            Back to Movies
          </Button>
          
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Box textAlign="center">
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Loading movie details...
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }
  
  if (!movie) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Movie not found</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Fade in timeout={500}>
      <Box sx={{ width: '100%', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/')}
            sx={{ mb: 3 }}
            variant="outlined"
          >
            Back to Movies
          </Button>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
            <Fade in timeout={700}>
              <Card sx={{ minWidth: 300, maxWidth: 350 }}>
                <CardMedia
                  component="img"
                  height="500"
                  image={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : ''}
                  alt={movie.title}
                  sx={{ borderRadius: 1 }}
                />
              </Card>
            </Fade>
            
            <Fade in timeout={900}>
              <Box flex={1}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {movie.title}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`📅 ${new Date(movie.release_date).getFullYear()}`} 
                    color="primary" 
                    variant="outlined" 
                  />
                  {imdbRating && (
                    <Chip 
                      label={`⭐ ${imdbRating}/10`} 
                      color="secondary" 
                      variant="outlined" 
                    />
                  )}
                  {movie.revenue && (
                    <Chip 
                      label={`💰 $${movie.revenue.toLocaleString()}`} 
                      color="success" 
                      variant="outlined" 
                    />
                  )}
                </Box>

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Overview
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
                  {movie.overview}
                </Typography>

                {imdbRating && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      IMDB Rating:
                    </Typography>
                    <Rating 
                      value={parseFloat(imdbRating) / 2} 
                      precision={0.1} 
                      size="large" 
                      readOnly 
                    />
                    <Typography variant="h6" color="text.secondary">
                      {imdbRating}/10
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Top Cast
                </Typography>
                <Grid container spacing={2}>
                  {cast.map((actor, index) => (
                    <Grid item xs={6} sm={4} md={3} key={actor.cast_id || actor.credit_id}>
                      <Fade in timeout={1000 + index * 100}>
                        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                          <Avatar
                            src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : ''}
                            alt={actor.name}
                            sx={{ width: 80, height: 80, mb: 1 }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {actor.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {actor.character}
                          </Typography>
                        </Box>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>

                {trailer && (
                  <Fade in timeout={1200}>
                    <Box mt={4}>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Trailer
                      </Typography>
                      <Box 
                        sx={{ 
                          position: 'relative',
                          width: '100%',
                          height: 0,
                          paddingBottom: '56.25%', // 16:9 aspect ratio
                          '& iframe': {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            borderRadius: 1
                          }
                        }}
                      >
                        <iframe
                          src={trailer}
                          title="YouTube trailer"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </Box>
                    </Box>
                  </Fade>
                )}
              </Box>
            </Fade>
          </Box>
        </Paper>

          <Fade in timeout={1400}>
            <Box mt={4}>
              <Comments movieId={id} />
            </Box>
          </Fade>
        </Container>
      </Box>
    </Fade>
  );
}

export default MovieDetail;