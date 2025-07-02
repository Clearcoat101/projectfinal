import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Badge
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  Dashboard as DashboardIcon,
  Assignment as RequestsIcon,
  Inventory as ResourcesIcon,
  Analytics as AnalyticsIcon,
  People as UsersIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    handleMenuClose();
  };

  const navigation = [
    { name: 'Dashboard', path: '/', icon: DashboardIcon },
    { name: 'Requests', path: '/requests', icon: RequestsIcon },
    { name: 'Resources', path: '/resources', icon: ResourcesIcon },
  ];

  if (user?.role === 'admin' || user?.role === 'manager') {
    navigation.push(
      { name: 'Analytics', path: '/analytics', icon: AnalyticsIcon },
      { name: 'Users', path: '/users', icon: UsersIcon }
    );
  }

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Resource Manager
        </Typography>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
          {navigation.map((item) => (
            <Button
              key={item.name}
              color="inherit"
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
              startIcon={<item.icon />}
            >
              {item.name}
            </Button>
          ))}
        </Box>

        <IconButton color="inherit" sx={{ mr: 1 }}>
          <Badge badgeContent={0} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <IconButton
          color="inherit"
          onClick={handleMenuOpen}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
