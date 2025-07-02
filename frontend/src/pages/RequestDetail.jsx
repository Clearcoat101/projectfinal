import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useRequestStore } from '../store/requestStore';
import { useAuthStore } from '../store/authStore';
import { formatDateTime, formatTimeRange } from '../utils/dateHelpers';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    currentRequest, 
    fetchRequestById, 
    approveRequest, 
    rejectRequest, 
    loading, 
    error, 
    clearError 
  } = useRequestStore();
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRequestById(id);
    }
  }, [id, fetchRequestById]);

  const handleApprove = async () => {
    setActionLoading(true);
    const result = await approveRequest(id);
    setActionLoading(false);
    if (result.success) {
      // Show success message or navigate
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    
    setActionLoading(true);
    const result = await rejectRequest(id, rejectionReason);
    setActionLoading(false);
    setRejectDialogOpen(false);
    setRejectionReason('');
    if (result.success) {
      // Show success message
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'info';
    }
  };

  const canManageRequest = user && (user.role === 'admin' || user.role === 'manager');

  if (loading) {
    return <LoadingSpinner text="Loading request details..." />;
  }

  if (!currentRequest) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">Request not found</Alert>
      </Container>
    );
  }

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
        
        <ErrorAlert error={error} onClose={clearError} />

        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1">
              Request Details
            </Typography>
            <Chip
              label={currentRequest.status}
              color={getStatusColor(currentRequest.status)}
              size="large"
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Item
                </Typography>
                <Typography variant="body1">
                  {currentRequest.item?.name || 'Unknown Item'}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Requester
                </Typography>
                <Typography variant="body1">
                  {currentRequest.user?.name || 'Unknown User'}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Quantity
                </Typography>
                <Typography variant="body1">
                  {currentRequest.quantity}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Time & Status
              </Typography>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Time Range
                </Typography>
                <Typography variant="body1">
                  {formatTimeRange(currentRequest.startTime, currentRequest.endTime)}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(currentRequest.createdAt)}
                </Typography>
              </Box>
              {currentRequest.approvedAt && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Approved
                  </Typography>
                  <Typography variant="body1">
                    {formatDateTime(currentRequest.approvedAt)}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Reason
              </Typography>
              <Typography variant="body1">
                {currentRequest.reason}
              </Typography>
            </Grid>

            {currentRequest.rejectionReason && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Rejection Reason
                </Typography>
                <Alert severity="error">
                  {currentRequest.rejectionReason}
                </Alert>
              </Grid>
            )}

            {canManageRequest && currentRequest.status === 'pending' && (
              <Grid item xs={12}>
                <Box display="flex" gap={2} mt={3}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ApproveIcon />}
                    onClick={handleApprove}
                    disabled={actionLoading}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={actionLoading}
                  >
                    Reject
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Request</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a reason for rejection..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleReject} 
            color="error" 
            variant="contained"
            disabled={!rejectionReason.trim() || actionLoading}
          >
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RequestDetail;
