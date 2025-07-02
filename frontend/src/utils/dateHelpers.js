import moment from 'moment';

export const formatDate = (date) => {
  return moment(date).format('MMM DD, YYYY');
};

export const formatDateTime = (date) => {
  return moment(date).format('MMM DD, YYYY HH:mm');
};

export const formatTimeRange = (startTime, endTime) => {
  const start = moment(startTime);
  const end = moment(endTime);
  
  if (start.isSame(end, 'day')) {
    return `${start.format('MMM DD, YYYY')} ${start.format('HH:mm')} - ${end.format('HH:mm')}`;
  } else {
    return `${start.format('MMM DD, HH:mm')} - ${end.format('MMM DD, HH:mm')}`;
  }
};

export const isValidTimeRange = (startTime, endTime) => {
  return moment(startTime).isBefore(moment(endTime));
};
