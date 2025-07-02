import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
      <Box textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Resource Manager
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 4 }}>
          Please sign in to manage resources or register for an account.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button variant="contained" onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button variant="outlined" onClick={() => navigate('/register')}>
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;

