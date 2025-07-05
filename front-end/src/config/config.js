
export const API_URL = 'https://latestfitnessethiopia.com/api';
export const IMAGE_URL = 'https://latestfitnessethiopia.com';

// export const API_URL = 'http://localhost:3001/api';
// export const IMAGE_URL = 'http://localhost:3001';
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_URL}/auth/login`,
  REGISTER: `${API_URL}/users/register`,
  FORGOT_PASSWORD: `${API_URL}/auth/forgot-password`,
  VERIFY_EMAIL: `${API_URL}/auth/verify-email`,
};


export const TOKEN_ENDPOINTS = (token) => {
   return `${API_URL}/auth/token-refresh/${token}`
};

export const API_ENDPOINT_FUNCTION = (path) => {
  return API_URL + path
}

const isTokenExpired = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    if (!payload.exp) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

const logoutUser = () => {
  localStorage.removeItem('auth');
  
  import('notistack').then(({ enqueueSnackbar }) => {
    enqueueSnackbar('Your session has expired. Please log in again.', { 
      variant: 'warning',
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
      }
    });
  }).catch(err => {
    console.error('Failed to load notistack:', err);
  });
  
  setTimeout(() => {
    window.location.href = '/login';
  }, 1500);
};

export const GET_HEADER = async (options = {}) => {
  const authData = await localStorage.getItem("auth");
  const headers = new Headers();
  
  if (options.isJson) {
    headers.append('Content-Type', 'application/json');
  }

  if (authData) {
    try {
      const parsedAuth = JSON.parse(authData);
      if (parsedAuth.token) {
        if (isTokenExpired(parsedAuth.token)) {
          logoutUser();
          return { headers, ...options };
        }
        headers.append('Authorization', `Bearer ${parsedAuth.token}`);
      }
    } catch (error) {
      console.error('Error parsing auth data:', error);
    }
  }

  return { headers, ...options };
};


export default {
  API_URL,
  AUTH_ENDPOINTS,
  TOKEN_ENDPOINTS,
  API_ENDPOINT_FUNCTION,
  GET_HEADER
};
