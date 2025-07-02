import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Inventory as ResourceIcon
} from '@mui/icons-material';
import { useResourceStore } from '../store/resourceStore';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';

const Resources = () => {
  const { user } = useAuthStore();
  const { resources, fetchResources, createResource, loading, error, clearError } = useResourceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    description: '',
    category: '',
    quantity: 1,
    location: ''
  });

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const categories = [...new Set(resources.map(r => r.category))];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || resource.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateResource = async () => {
    const result = await createResource(newResource);
    if (result.success) {
      setCreateDialogOpen(false);
      setNewResource({
        name: '',
        description: '',
        category: '',
        quantity: 1,
        location: ''
      });
    }
  };

  const getAvailabilityColor = (quantity) => {
    if (quantity === 0) return 'error';
    if (quantity < 5) return 'warning';
    return 'success';
  };

  if (loading && resources.length === 0) {
    return <LoadingSpinner text="Loading resources..." />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Resources
          </Typography>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Add Resource
            </Button>
          )}
        </Box>

        <ErrorAlert error={error} onClose={clearError} />

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Resources Grid */}
        <Grid container spacing={3}>
          {filteredResources.map((resource) => (
            <Grid item xs={12} sm={6} md={4} key={resource._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <ResourceIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h2">
                      {resource.name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {resource.description}
                  </Typography>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Chip label={resource.category} size="small" />
                    <Chip
                      label={`${resource.quantity} available`}
                      color={getAvailabilityColor(resource.quantity)}
                      size="small"
                    />
                  </Box>
                  
                  {resource.location && (
                    <Typography variant="body2" color="text.secondary">
                      Location: {resource.location}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredResources.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              No resources found
            </Typography>
          </Box>
        )}
      </Box>

      {/* Create Resource Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Resource</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={newResource.name}
                onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newResource.description}
                onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                value={newResource.category}
                onChange={(e) => setNewResource(prev => ({ ...prev, category: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={newResource.quantity}
                onChange={(e) => setNewResource(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={newResource.location}
                onChange={(e) => setNewResource(prev => ({ ...prev, location: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateResource} 
            variant="contained"
            disabled={!newResource.name || !newResource.category || loading}
          >
            Add Resource
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Resources;
