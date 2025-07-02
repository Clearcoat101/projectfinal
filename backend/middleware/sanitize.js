export const mongoSanitize = (req, res, next) => {
  const sanitize = obj => {
    if (typeof obj !== 'object' || obj === null) return;

    for (const key in obj) {
      if (/^\$/.test(key) || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };

  sanitize(req.body);
  sanitize(req.params);
  // Do not sanitize req.query to avoid read-only crash
  next();
};
