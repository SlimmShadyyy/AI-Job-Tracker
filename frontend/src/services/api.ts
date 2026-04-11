import axios from 'axios';

export interface AuthResponse {
  _id: string;
  email: string;
  token: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const API = axios.create({
  baseURL: `${API_URL}/api`, 
});

API.interceptors.request.use((req) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const registerUser = async (userData: { email: string; password: string }) => {
  const response = await API.post<AuthResponse>('/auth/register', userData);
  return response.data;
};

export const loginUser = async (userData: { email: string; password: string }) => {
  const response = await API.post<AuthResponse>('/auth/login', userData);
  return response.data;
};

export interface ParsedJD {
  company: string;
  role: string;
  requiredSkills?: string[];
  niceToHaveSkills?: string[];
  seniority?: string;
  location?: string;
  resumeSuggestions?: string[]; 
}

export const parseJobDescription = async (jdText: string) => {
  const response = await API.post<ParsedJD>('/ai/parse', { jdText });
  return response.data;
};

export const createApplication = async (appData: any) => {
  const response = await API.post('/applications', appData);
  return response.data;
};