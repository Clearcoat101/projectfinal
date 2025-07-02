import React from 'react';
import { Alert, AlertTitle, Collapse } from '@mui/material';

const ErrorAlert = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <Collapse in={!!error}>
      <Alert severity="error" onClose={onClose} sx={{ mb: 2 }}>
        <AlertTitle>Error</AlertTitle>
        {error}
      </Alert>
    </Collapse>
  );
};

export default ErrorAlert;
