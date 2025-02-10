import axios from '../components/api';

export const login = loginRequest => {
  return axios.post('', loginRequest);
};
