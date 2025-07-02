import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useRequestStore } from '../store/requestStore';
import { useResourceStore } from '../store/resourceStore';
import ErrorAlert from '../components/Common/ErrorAlert';

const CreateRequest = () => {
  const navigate = useNavigate();
  const { createRequest, loading, error, clearError } = useRequestStore();
  const { resources, fetchResources } = useResourceStore();
  
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: 1,
    startTime: '',
    endTime: '',
    reason: ''
  });
  const [availabilityCheck, setAvailabilityCheck] = useState(null);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await createRequest({
      ...formData,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime)
    });
    if (result.success) {
      navigate('/requests');
    }
  };

  const selectedResource = resources.find(r => r._id === formData.itemId);

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/requests')}
          sx={{ mb: 2 }}
        >
          Back to Requests
        </Button>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create New Request
          </Typography>

          <ErrorAlert error={error} onClose={clearError} />

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Resource</InputLabel>
                  <Select
                    name="itemId"
                    value={formData.itemId}
                    label="Resource"
                    onChange={handleChange}
                  >
                    {resources.map((resource) => (
                      <MenuItem key={resource._id} value={resource._id}>
                        {resource.name} - {resource.category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  inputProps={{ min: 1, max: selectedResource?.quantity || 999 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                {selectedResource && (
                  <Alert severity="info">
                    Available: {selectedResource.quantity}
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="startTime"
                  label="Start Time"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="endTime"
                  label="End Time"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="reason"
                  label="Reason for Request"
                  multiline
                  rows={4}
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Please provide a detailed reason for your request..."
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Submit Request'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/requests')}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateRequest;