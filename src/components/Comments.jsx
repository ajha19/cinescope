import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
  Button, 
  TextField, 
  Box, 
  Paper, 
  Typography, 
  Avatar, 
  Divider,
  Chip
} from '@mui/material';

function Comments({ movieId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, setUser);
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
    if (movieId) {
      q = query(collection(db, 'comments'), where('movieId', '==', movieId), orderBy('createdAt', 'desc'));
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [movieId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        text: newComment,
        user: user.displayName || user.email,
        userId: user.uid,
        movieId: movieId || null,
        createdAt: serverTimestamp(),
      });
      setNewComment('');
    } catch (err) {
      alert('Failed to post comment');
    }
    setSubmitting(false);
  };

  return (
    <Box mt={4}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
        💬 Comments
      </Typography>
      
      {user ? (
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Share your thoughts about this movie..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              disabled={submitting}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!newComment.trim() || submitting}
              sx={{ borderRadius: 2 }}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </form>
        </Paper>
      ) : (
        <Paper elevation={1} sx={{ p: 2, mb: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
          <Typography color="text.secondary">
            Please sign in to post comments and join the discussion!
          </Typography>
        </Paper>
      )}

      {loading ? (
        <Box>
          {[...Array(3)].map((_, index) => (
            <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
              <Box display="flex" gap={2}>
                <Avatar />
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Loading...
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      ) : (
        comments.length === 0 ? (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center', backgroundColor: '#f9f9f9' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No comments yet
            </Typography>
            <Typography color="text.secondary">
              Be the first to share your thoughts about this movie!
            </Typography>
          </Paper>
        ) : (
          <Box>
            {comments.map((comment, index) => (
              <Paper 
                key={comment.id} 
                elevation={1} 
                sx={{ 
                  p: 3, 
                  mb: 2, 
                  borderRadius: 2,
                  '&:hover': {
                    boxShadow: 2
                  }
                }}
              >
                <Box display="flex" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {comment.user?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {comment.user}
                      </Typography>
                      <Chip 
                        label={comment.createdAt?.toDate ? 
                          new Date(comment.createdAt.toDate()).toLocaleDateString() : 
                          'Just now'
                        } 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                      {comment.text}
                    </Typography>
                  </Box>
                </Box>
                {index < comments.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Paper>
            ))}
          </Box>
        )
      )}
    </Box>
  );
}

export default Comments;