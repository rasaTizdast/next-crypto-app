export interface AuthResponse {
  success: boolean;
  error?: string;
  [key: string]: any; // For additional fields returned by the server
}

export interface HttpResponse {
  data?: any;
  success: boolean;
  error?: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_premium: boolean;
  premium_expires_at: string | null;
  date_joined: string;
  last_login: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  error?: string;
}
