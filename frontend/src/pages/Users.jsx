import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';


const Users = () => {
  const { user } = useAuthStore();
  const { users, fetchUsers, updateUserRole, loading, error, clearError } = useUserStore();

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'manager') {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    await updateUserRole(userId, newRole);
  };

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4">Access Denied</Typography>
        <Typography>You don't have permission to view users.</Typography>
      </Container>
    );
  }

  if (loading && users.length === 0) {
    return <LoadingSpinner text="Loading users..." />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            User Management
          </Typography>
        </Box>

        <ErrorAlert error={error} onClose={clearError} />

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((userItem) => (
                  <TableRow key={userItem._id}>
                    <TableCell>{userItem.name}</TableCell>
                    <TableCell>{userItem.email}</TableCell>
                    <TableCell>
                      {user.role === 'admin' ? (
                        <FormControl size="small" fullWidth>
                          <Select
                            value={userItem.role}
                            onChange={(e) => handleRoleChange(userItem._id, e.target.value)}
                          >
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="technician">Technician</MenuItem>
                            <MenuItem value="manager">Manager</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <Chip label={userItem.role} size="small" />
                      )}
                    </TableCell>
                    <TableCell>{userItem.department || 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => {/* Implement edit functionality */}}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {users.length === 0 && (
            <Box p={3} textAlign="center">
              <Typography color="text.secondary">
                No users found
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Users;