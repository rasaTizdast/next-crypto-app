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
