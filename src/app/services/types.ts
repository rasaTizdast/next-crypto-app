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
  username: string;
  email: string;
  is_premium: boolean;
  premium_expires_at: string | null;
  is_staff: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  error?: string;
}

// Crypto-related types
export interface CoinDetails {
  symbol: string;
  name: string;
  price_usd: number;
  change_24h_percent: number;
  last_updated: string;
  market_cap_usd: number;
  volume_24h_usd: number;
  circulating_supply: number;
  total_supply: number;
  ath: number;
  atl: number;
  logo_url: string;
  external_id: string;
  market_cap_rank?: number | null;
  fully_diluted_valuation_usd?: number | null;
  high_24h_usd?: number | null;
  low_24h_usd?: number | null;
  price_change_24h_usd?: number | null;
  price_change_percentage_24h?: number | null;
  max_supply?: number | null;
  ath_change_percentage?: number | null;
  ath_date?: string | null;
  atl_change_percentage?: number | null;
  atl_date?: string | null;
  api_last_updated?: string | null;
}

export interface CoinDetailsResponse {
  count: number;
  current_page: number;
  total_pages: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: CoinDetails[];
}

export interface PriceHistoryPoint {
  timestamp: string;
  price: number;
}

export interface CoinHistoryData {
  symbol: string;
  interval: string;
  points: [string, number][];
}
