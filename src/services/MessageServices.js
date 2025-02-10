import axios from '../components/api';

export const messageHistory = user => {
  return axios.get('/message-history/' + user);
};
