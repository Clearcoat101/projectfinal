import React, { useState, useEffect } from 'react';
import { IconButton, Badge, Menu, MenuItem, Box, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotificationStore } from '../../store/notificationStore';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { notifications, fetchNotifications, markAsRead } = useNotificationStore();
  
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography>No notifications</Typography>
          </MenuItem>
        ) : (
          notifications.slice(0, 5).map(notification => (
            <MenuItem 
              key={notification._id} 
              onClick={() => {
                handleMarkAsRead(notification._id);
                handleClose();
                // Navigate to notification link
              }}
              sx={{
                backgroundColor: notification.read ? 'inherit' : 'action.selected',
                maxWidth: 300
              }}
            >
              <Box>
                <Typography variant="body2">{notification.message}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notification.createdAt).toLocaleTimeString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
        <MenuItem onClick={() => {/* Navigate to notifications page */}}>
          <Typography variant="body2" color="primary">
            View all notifications
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default NotificationBell;