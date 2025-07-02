import React, { useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button
} from '@mui/material';
import {
  Assignment as RequestIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useRequestStore } from '../store/requestStore';
import { formatDateTime } from '../utils/dateHelpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { requests, fetchRequests, loading } = useRequestStore();

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'info';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <ApprovedIcon />;
      case 'rejected': return <RejectedIcon />;
      default: return <PendingIcon />;
    }
  };

  const recentRequests = requests.slice(0, 5);
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Here's your resource management overview
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Requests
                  </Typography>
                  <Typography variant="h4">
                    {requests.length}
                  </Typography>
                </Box>
                <RequestIcon color="primary" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h4">
                    {pendingCount}
                  </Typography>
                </Box>
                <PendingIcon color="warning" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Approved
                  </Typography>
                  <Typography variant="h4">
                    {approvedCount}
                  </Typography>
                </Box>
                <ApprovedIcon color="success" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/requests/new')}
              >
                New Request
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/requests')}
              >
                View All Requests
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/resources')}
              >
                Browse Resources
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Requests */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Requests
            </Typography>
            {recentRequests.length === 0 ? (
              <Typography color="text.secondary">
                No requests found
              </Typography>
            ) : (
              <List>
                {recentRequests.map((request) => (
                  <ListItem
                    key={request._id}
                    button
                    onClick={() => navigate(`/requests/${request._id}`)}
                    divider
                  >
                    <ListItemIcon>
                      {getStatusIcon(request.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={request.item?.name || 'Unknown Item'}
                      secondary={`${formatDateTime(request.createdAt)} - ${request.reason}`}
                    />
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;