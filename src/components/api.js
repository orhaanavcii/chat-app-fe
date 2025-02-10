import axios from 'axios';
import { url, tokenName } from './config';

let accessToken = sessionStorage.getItem(tokenName);

let axiosInstance = axios.create({
  baseURL: url,
  headers: {
    Authorization: accessToken,
    'Access-Control-Allow-Origin': '*',
  },
});

axiosInstance.interceptors.response.use(
  response => {
    return response;
  },

  error => {
    if (error.request.status === 403) {
      let responseData = JSON.parse(error.request.response);
      if (responseData.exception.errorDescription) {
        //alert(responseData.exception.errorDescription)
      }
    }
    if (error.request.status === 0) {
      // sessionStorage.removeItem('token');
      // window.location.reload();
    }
    return error;
  },
);

export default axiosInstance;
