import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Change this to your machine's LAN IP when testing on a physical device ──
// e.g. 'http://192.168.1.42:8000'
const API_BASE_URL = 'http://192.168.0.102:8003';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Attach JWT from storage to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear the stored token so the app re-shows Login
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
    }
    return Promise.reject(error);
  }
);

// ── Auth helpers ──────────────────────────────────────────────────────────────

/**
 * Register a new user. Returns { access_token, token_type }.
 * Backend endpoint: POST /register then POST /login
 */
export async function registerUser({ fullName, email, password }) {
  // Step 1: create account
  await api.post('/register', {
    full_name: fullName,
    email,
    password,
  });
  // Step 2: immediately log in to get a token
  return loginUser({ email, password });
}

/**
 * Log in. Returns { access_token, token_type }.
 * Backend endpoint: POST /login  (OAuth2PasswordRequestForm)
 */
export async function loginUser({ email, password }) {
  // FastAPI OAuth2 form requires application/x-www-form-urlencoded
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);

  const res = await api.post('/login', form.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return res.data; // { access_token, token_type }
}

/**
 * Fetch the current authenticated user's profile.
 * Backend endpoint: GET /me
 */
export async function getMe() {
  const res = await api.get('/me');
  return res.data;
}

export default api;
