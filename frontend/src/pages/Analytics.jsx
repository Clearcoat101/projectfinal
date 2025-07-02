import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useAuthStore } from '../store/authStore';
import { useRequestStore } from '../store/requestStore';
import { useResourceStore } from '../store/resourceStore';

const Analytics = () => {
  const { user } = useAuthStore();
  const { requests, fetchRequests } = useRequestStore();
  const { resources, fetchResources } = useResourceStore();

  useEffect(() => {
    fetchRequests();
    fetchResources();
  }, [fetchRequests, fetchResources]);

  // Analytics data processing
  const statusData = [
    { name: 'Pending', value: requests.filter(r => r.status === 'pending').length, color: '#ff9800' },
    { name: 'Approved', value: requests.filter(r => r.status === 'approved').length, color: '#4caf50' },
    { name: 'Rejected', value: requests.filter(r => r.status === 'rejected').length, color: '#f44336' }
  ];

  const categoryData = resources.reduce((acc, resource) => {
    const existing = acc.find(item => item.name === resource.category);
    if (existing) {
      existing.value += resource.quantity;
    } else {
      acc.push({ name: resource.category, value: resource.quantity });
    }
    return acc;
  }, []);

  const monthlyRequests = requests.reduce((acc, request) => {
    const month = new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.requests += 1;
    } else {
      acc.push({ month, requests: 1 });
    }
    return acc;
  }, []).slice(-6); // Last 6 months

  const approvalRate = requests.length > 0 
    ? Math.round((requests.filter(r => r.status === 'approved').length / requests.length) * 100)
    : 0;

  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4">Access Denied</Typography>
        <Typography>You don't have permission to view analytics.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Requests
              </Typography>
              <Typography variant="h4">
                {requests.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Resources
              </Typography>
              <Typography variant="h4">
                {resources.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Requests
              </Typography>
              <Typography variant="h4">
                {requests.filter(r => r.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Approval Rate
              </Typography>
              <Typography variant="h4">
                {approvalRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Request Status Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Request Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Resource Categories Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resources by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2196f3" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Monthly Requests Trend */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Request Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRequests}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="requests" stroke="#4caf50" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
